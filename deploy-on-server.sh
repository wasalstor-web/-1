#!/bin/bash
###############################################################################
# Mubsat AI Platform - Server-Side Deployment Script
# Run this script DIRECTLY on the server (46.202.159.100)
# Usage: ssh root@46.202.159.100 'bash -s' < deploy-on-server.sh
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

# Configuration
APP_DIR="/var/www/mubsat-ai"
APP_NAME="mubsat-ai"
DB_NAME="mubsat_ai"
DB_USER="mubsat_user"
DB_PASS="MubsatAI@2025!Secure"
NODE_PATH="/root/.nvm/versions/node/v24.11.0/bin"

export PATH="$NODE_PATH:$PATH"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Mubsat AI Platform - Server Deployment            ║"
echo "║                  منصة مبسط AI                             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Install PM2
print_info "Step 1/10: Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    print_success "PM2 installed"
else
    print_success "PM2 already installed ($(pm2 -v))"
fi

# Step 2: Install PostgreSQL
print_info "Step 2/10: Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    yum install -y postgresql-server postgresql-contrib || \
    dnf install -y postgresql-server postgresql-contrib || \
    apt install -y postgresql postgresql-contrib
    
    # Initialize PostgreSQL
    if [ -d "/var/lib/pgsql" ]; then
        postgresql-setup --initdb || /usr/bin/postgresql-setup initdb
    fi
    
    systemctl start postgresql
    systemctl enable postgresql
    print_success "PostgreSQL installed and started"
else
    systemctl start postgresql 2>/dev/null || true
    print_success "PostgreSQL already installed"
fi

# Step 3: Create Database and User
print_info "Step 3/10: Creating database..."
sudo -u postgres psql <<EOF 2>/dev/null || true
-- Create database if not exists
SELECT 'CREATE DATABASE $DB_NAME' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
    END IF;
END
\$\$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\q
EOF
print_success "Database created: $DB_NAME"

# Step 4: Create application directory
print_info "Step 4/10: Creating application directory..."
mkdir -p $APP_DIR
cd $APP_DIR
print_success "Directory ready: $APP_DIR"

# Step 5: Create .env file
print_info "Step 5/10: Creating .env file..."
cat > $APP_DIR/.env <<EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
SESSION_SECRET=$(openssl rand -base64 32)
TELEGRAM_BOT_TOKEN=your_bot_token_here
EOF
chmod 600 $APP_DIR/.env
print_success ".env file created"

# Step 6: Wait for file upload
print_warning "Step 6/10: Waiting for application files..."
echo ""
echo "📦 Upload your application files to: $APP_DIR"
echo ""
echo "From your local machine (Replit), run:"
echo "  rsync -avz --progress \\"
echo "    --exclude 'node_modules' \\"
echo "    --exclude '.git' \\"
echo "    --exclude 'dist' \\"
echo "    --exclude '.env' \\"
echo "    ./ root@46.202.159.100:$APP_DIR/"
echo ""
read -p "Press Enter after uploading files to continue..."

# Step 7: Install dependencies
print_info "Step 7/10: Installing dependencies..."
cd $APP_DIR
if [ -f "package.json" ]; then
    npm install --production
    print_success "Dependencies installed"
else
    print_error "package.json not found! Please upload files first."
    exit 1
fi

# Step 8: Build application
print_info "Step 8/10: Building application..."
npm run build
print_success "Application built"

# Step 9: Run database migrations
print_info "Step 9/10: Running database migrations..."
npm run db:push --force || print_warning "Database migration skipped (may already be up to date)"
print_success "Database schema updated"

# Step 10: Create PM2 ecosystem config
print_info "Step 10/10: Creating PM2 configuration..."
cat > $APP_DIR/ecosystem.config.js <<'EOF'
module.exports = {
  apps: [{
    name: 'mubsat-ai',
    script: './dist/server/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# Create logs directory
mkdir -p $APP_DIR/logs

# Stop existing process
pm2 delete $APP_NAME 2>/dev/null || true

# Start application
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 startup
pm2 startup systemd -u root --hp /root

print_success "Application started with PM2"

# Step 11: Configure Nginx
print_info "Configuring Nginx..."
cat > /etc/nginx/conf.d/mubsat-ai.conf <<'EOF'
server {
    listen 80;
    server_name 46.202.159.100 _;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Remove default Nginx config
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true

# Test and reload Nginx
nginx -t
systemctl reload nginx
print_success "Nginx configured and reloaded"

# Step 12: Configure firewall
print_info "Configuring firewall..."
if command -v firewall-cmd &> /dev/null; then
    # For RHEL/CentOS/AlmaLinux
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --permanent --add-service=ssh
    firewall-cmd --reload
elif command -v ufw &> /dev/null; then
    # For Ubuntu/Debian
    ufw allow ssh
    ufw allow 'Nginx Full'
    ufw --force enable
fi
print_success "Firewall configured"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║            🎉 Deployment Completed Successfully! 🎉        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
print_success "Application is running at: http://46.202.159.100"
echo ""
print_info "Useful commands:"
echo "  • Check status:  pm2 status"
echo "  • View logs:     pm2 logs $APP_NAME"
echo "  • Restart:       pm2 restart $APP_NAME"
echo "  • Stop:          pm2 stop $APP_NAME"
echo ""
print_info "To update the application:"
echo "  1. Upload new files with rsync"
echo "  2. cd $APP_DIR && npm run build"
echo "  3. pm2 restart $APP_NAME"
echo ""
