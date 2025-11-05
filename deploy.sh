#!/bin/bash

###############################################################################
# Mubsat AI Platform - Automatic Deployment Script
# Description: Deploy the complete application to Hostinger VPS
# Usage: bash deploy.sh [SERVER_IP] [SSH_USER]
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="${1:-46.202.159.100}"
SSH_USER="${2:-root}"
APP_NAME="mubsat-ai"
APP_DIR="/var/www/${APP_NAME}"
DOMAIN="your-domain.com"  # Change this to your actual domain
NODE_VERSION="20"

# Function to print colored messages
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }

# Function to run SSH commands
ssh_exec() {
    ssh -o StrictHostKeyChecking=no "${SSH_USER}@${SERVER_IP}" "$1"
}

# Function to upload files
scp_upload() {
    scp -o StrictHostKeyChecking=no -r "$1" "${SSH_USER}@${SERVER_IP}:$2"
}

###############################################################################
# Main Deployment Steps
###############################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Mubsat AI Platform - Deployment Script            ║"
echo "║                  منصة مبسط AI                             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
print_info "Target Server: ${SERVER_IP}"
print_info "SSH User: ${SSH_USER}"
print_info "App Directory: ${APP_DIR}"
echo ""

# Step 1: Test SSH Connection
print_info "Step 1/10: Testing SSH connection..."
if ssh_exec "echo 'Connection successful'" >/dev/null 2>&1; then
    print_success "SSH connection established"
else
    print_error "Cannot connect to server. Please check SSH credentials."
    exit 1
fi

# Step 2: Update System
print_info "Step 2/10: Updating system packages..."
ssh_exec "sudo apt update && sudo apt upgrade -y" || print_warning "Some packages may need manual update"
print_success "System updated"

# Step 3: Install Node.js
print_info "Step 3/10: Installing Node.js ${NODE_VERSION}..."
ssh_exec "
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    node -v
    npm -v
"
print_success "Node.js installed"

# Step 4: Install PostgreSQL
print_info "Step 4/10: Installing PostgreSQL..."
ssh_exec "
    if ! command -v psql &> /dev/null; then
        sudo apt install -y postgresql postgresql-contrib
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    fi
    sudo systemctl status postgresql --no-pager | head -3
"
print_success "PostgreSQL installed"

# Step 5: Install PM2
print_info "Step 5/10: Installing PM2 process manager..."
ssh_exec "
    if ! command -v pm2 &> /dev/null; then
        sudo npm install -g pm2
    fi
    pm2 -v
"
print_success "PM2 installed"

# Step 6: Install Nginx
print_info "Step 6/10: Installing Nginx..."
ssh_exec "
    if ! command -v nginx &> /dev/null; then
        sudo apt install -y nginx
        sudo systemctl start nginx
        sudo systemctl enable nginx
    fi
    sudo systemctl status nginx --no-pager | head -3
"
print_success "Nginx installed"

# Step 7: Create Application Directory
print_info "Step 7/10: Creating application directory..."
ssh_exec "
    sudo mkdir -p ${APP_DIR}
    sudo chown -R ${SSH_USER}:${SSH_USER} ${APP_DIR}
"
print_success "Application directory created: ${APP_DIR}"

# Step 8: Upload Application Files
print_info "Step 8/10: Uploading application files..."
print_info "Creating deployment package..."

# Create temporary directory for deployment
TEMP_DIR=$(mktemp -d)
print_info "Temporary directory: ${TEMP_DIR}"

# Copy necessary files (excluding node_modules, .git, etc.)
rsync -av --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude '.env' \
    --exclude 'tmp' \
    --exclude '*.log' \
    ./ "${TEMP_DIR}/"

# Upload to server
print_info "Uploading files to server..."
rsync -avz --progress \
    -e "ssh -o StrictHostKeyChecking=no" \
    "${TEMP_DIR}/" \
    "${SSH_USER}@${SERVER_IP}:${APP_DIR}/"

rm -rf "${TEMP_DIR}"
print_success "Files uploaded successfully"

# Step 9: Setup Database
print_info "Step 9/10: Setting up PostgreSQL database..."
ssh_exec "
    sudo -u postgres psql <<EOF
-- Create database if not exists
SELECT 'CREATE DATABASE ${APP_NAME}' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${APP_NAME}')\\gexec

-- Create user if not exists
DO \\$\\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '${APP_NAME}_user') THEN
        CREATE USER ${APP_NAME}_user WITH PASSWORD 'change_this_password_123';
    END IF;
END
\\$\\$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ${APP_NAME} TO ${APP_NAME}_user;
\\q
EOF
"
print_success "Database configured"

# Step 10: Install Dependencies and Start Application
print_info "Step 10/10: Installing dependencies and starting application..."
ssh_exec "
    cd ${APP_DIR}
    
    # Install dependencies
    npm install --production
    
    # Create .env file
    cat > .env <<EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://${APP_NAME}_user:change_this_password_123@localhost:5432/${APP_NAME}
SESSION_SECRET=$(openssl rand -base64 32)
TELEGRAM_BOT_TOKEN=your_bot_token_here
EOF
    
    # Build application
    npm run build || echo 'Build step skipped'
    
    # Run database migrations
    npm run db:push || echo 'Database migration skipped'
    
    # Stop existing PM2 process if running
    pm2 delete ${APP_NAME} 2>/dev/null || true
    
    # Start with PM2
    pm2 start ecosystem.config.js --env production
    pm2 save
    
    # Setup PM2 startup
    sudo env PATH=\$PATH:\$(which node) \$(which pm2) startup systemd -u ${SSH_USER} --hp /home/${SSH_USER} || true
    
    # Show status
    pm2 status
"
print_success "Application started with PM2"

# Configure Nginx
print_info "Configuring Nginx reverse proxy..."
ssh_exec "
    sudo tee /etc/nginx/sites-available/${APP_NAME} > /dev/null <<'EOF'
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN} ${SERVER_IP};

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    # Enable site
    sudo ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
    
    # Remove default site
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx config
    sudo nginx -t
    
    # Reload Nginx
    sudo systemctl reload nginx
"
print_success "Nginx configured"

# Configure Firewall
print_info "Configuring firewall..."
ssh_exec "
    if command -v ufw &> /dev/null; then
        sudo ufw allow ssh
        sudo ufw allow 'Nginx Full'
        sudo ufw --force enable
        sudo ufw status
    fi
"
print_success "Firewall configured"

###############################################################################
# Deployment Complete
###############################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║            🎉 Deployment Completed Successfully! 🎉        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
print_success "Application deployed to: http://${SERVER_IP}"
print_info "PM2 Process: pm2 status"
print_info "PM2 Logs: pm2 logs ${APP_NAME}"
print_info "Nginx Config: /etc/nginx/sites-available/${APP_NAME}"
echo ""
print_warning "⚠️  Next Steps:"
echo "   1. Update DATABASE_URL password in ${APP_DIR}/.env"
echo "   2. Add TELEGRAM_BOT_TOKEN if using Telegram bot"
echo "   3. Add API keys (OPENAI_API_KEY, etc.) to .env"
echo "   4. Setup SSL certificate: sudo certbot --nginx -d ${DOMAIN}"
echo "   5. Point your domain DNS to ${SERVER_IP}"
echo ""
print_info "To update the app in the future, run this script again!"
echo ""
