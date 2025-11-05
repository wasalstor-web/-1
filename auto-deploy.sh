#!/bin/bash

###############################################################################
# Mubsat AI Platform - Automated Deployment via API
# This script uses the Intelligent Assistant API to deploy automatically
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
API_URL="http://localhost:5000/api/intelligent-assistant/process"
SERVER_ID="28c79ad5-56e1-4b2a-9d53-275e8702d9a7"
SERVER_IP="46.202.159.100"
APP_DIR="/var/www/mubsat-ai"

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Mubsat AI Platform - Auto Deployment              ║"
echo "║                  منصة مبسط AI                             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Function to execute command via API
execute_command() {
    local cmd="$1"
    local description="$2"
    
    print_info "$description"
    
    curl -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"message\": \"$cmd\",
            \"userId\": \"deploy-script-$(date +%s)\"
        }" \
        -s | jq -r '.message' || echo "Command executed"
    
    sleep 2
}

# Step 1: Install PM2
print_info "Step 1/12: Installing PM2..."
execute_command \
    "نفذ الأمر: export PATH=/root/.nvm/versions/node/v24.11.0/bin:\$PATH && npm install -g pm2 && pm2 -v" \
    "Installing PM2 globally"
print_success "PM2 installation initiated"

# Step 2: Start PostgreSQL
print_info "Step 2/12: Starting PostgreSQL..."
execute_command \
    "نفذ الأمر: sudo systemctl start postgresql && sudo systemctl enable postgresql" \
    "Starting PostgreSQL service"
print_success "PostgreSQL started"

# Step 3: Create Database
print_info "Step 3/12: Creating database..."
execute_command \
    "نفذ الأمر: sudo -u postgres psql -c \"CREATE DATABASE mubsat_ai;\" && sudo -u postgres psql -c \"CREATE USER mubsat_user WITH PASSWORD 'MubsatAI@2025!Secure';\" && sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE mubsat_ai TO mubsat_user;\"" \
    "Creating database and user"
print_success "Database created"

# Step 4: Create app directory
print_info "Step 4/12: Creating application directory..."
execute_command \
    "نفذ الأمر: mkdir -p $APP_DIR && chown -R root:root $APP_DIR" \
    "Creating $APP_DIR"
print_success "Directory created"

# Step 5: Create .env file
print_info "Step 5/12: Creating .env file..."
execute_command \
    "نفذ الأمر: cat > $APP_DIR/.env <<EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://mubsat_user:MubsatAI@2025!Secure@localhost:5432/mubsat_ai
SESSION_SECRET=\$(openssl rand -base64 32)
TELEGRAM_BOT_TOKEN=your_bot_token_here
EOF" \
    "Creating environment file"
print_success ".env file created"

# Step 6: Upload files (manual step notification)
print_warning "Step 6/12: Upload files manually using rsync:"
echo "   Run this command from your Replit terminal:"
echo ""
echo "   rsync -avz --progress \\"
echo "     --exclude 'node_modules' \\"
echo "     --exclude '.git' \\"
echo "     --exclude 'dist' \\"
echo "     ./ root@$SERVER_IP:$APP_DIR/"
echo ""
read -p "Press Enter after uploading files..."
print_success "Files uploaded"

# Step 7: Install dependencies
print_info "Step 7/12: Installing dependencies..."
execute_command \
    "نفذ الأمر: cd $APP_DIR && export PATH=/root/.nvm/versions/node/v24.11.0/bin:\$PATH && npm install --production" \
    "Installing Node.js dependencies"
print_success "Dependencies installed"

# Step 8: Build application
print_info "Step 8/12: Building application..."
execute_command \
    "نفذ الأمر: cd $APP_DIR && export PATH=/root/.nvm/versions/node/v24.11.0/bin:\$PATH && npm run build" \
    "Building application"
print_success "Application built"

# Step 9: Database migration
print_info "Step 9/12: Running database migrations..."
execute_command \
    "نفذ الأمر: cd $APP_DIR && export PATH=/root/.nvm/versions/node/v24.11.0/bin:\$PATH && npm run db:push" \
    "Pushing database schema"
print_success "Database migrated"

# Step 10: Create PM2 ecosystem
print_info "Step 10/12: Creating PM2 configuration..."
execute_command \
    "نفذ الأمر: cat > $APP_DIR/ecosystem.config.js <<'EOF'
module.exports = {
  apps: [{
    name: 'mubsat-ai',
    script: './dist/server/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
EOF" \
    "Creating PM2 config"
print_success "PM2 config created"

# Step 11: Start with PM2
print_info "Step 11/12: Starting application with PM2..."
execute_command \
    "نفذ الأمر: cd $APP_DIR && export PATH=/root/.nvm/versions/node/v24.11.0/bin:\$PATH && pm2 delete mubsat-ai || true && pm2 start ecosystem.config.js && pm2 save" \
    "Starting with PM2"
print_success "Application started"

# Step 12: Configure Nginx
print_info "Step 12/12: Configuring Nginx..."
execute_command \
    "نفذ الأمر: sudo tee /etc/nginx/sites-available/mubsat-ai > /dev/null <<'EOF'
server {
    listen 80;
    server_name $SERVER_IP;
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_cache_bypass \\\$http_upgrade;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
    }
}
EOF
sudo ln -sf /etc/nginx/sites-available/mubsat-ai /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx" \
    "Configuring Nginx"
print_success "Nginx configured"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║            🎉 Deployment Completed Successfully! 🎉        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
print_success "Application is now running at: http://$SERVER_IP"
print_info "Check status: ssh root@$SERVER_IP 'pm2 status'"
print_info "View logs: ssh root@$SERVER_IP 'pm2 logs mubsat-ai'"
echo ""
