#!/bin/bash
###############################################################################
# 🚀 Mubsat AI - Complete Deployment Script
# Copy and paste this ENTIRE script into your SSH session
# ssh root@46.202.159.100
# Then paste this complete script
###############################################################################

bash << 'END_OF_DEPLOYMENT'
set -e
export PATH=/root/.nvm/versions/node/v24.11.0/bin:$PATH

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║      🚀 Mubsat AI Platform - Complete Auto-Deploy         ║"
echo "║               منصة مبسط AI - النشر التلقائي               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Generate secure passwords
DB_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
SESSION_SECRET=$(openssl rand -base64 32)

echo "═══════════════════════════════════════════════════════════"
echo "🔐 كلمات السر المولدة (احفظها!):"
echo "   Database Password: $DB_PASS"
echo "═══════════════════════════════════════════════════════════"
echo ""
sleep 2

# Step 1: Install PM2
echo "📦 1/10: Installing PM2..."
npm install -g pm2 2>/dev/null || echo "   ✅ PM2 already installed"

# Step 2: Start PostgreSQL
echo "🗄️  2/10: Starting PostgreSQL..."
sudo systemctl start postgresql 2>/dev/null || true
sudo systemctl enable postgresql 2>/dev/null || true

# Step 3: Create database
echo "🔧 3/10: Creating database..."
sudo -u postgres psql << EOF 2>/dev/null || true
CREATE DATABASE mubsat_ai;
CREATE USER mubsat_user WITH PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE mubsat_ai TO mubsat_user;
\\q
EOF
echo "   ✅ Database ready"

# Step 4: Create directories
echo "📁 4/10: Creating directories..."
mkdir -p /var/www/mubsat-ai
mkdir -p /var/www/mubsat-ai/logs
cd /var/www/mubsat-ai

# Step 5: Create .env file
echo "⚙️  5/10: Creating .env file..."
cat > .env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://mubsat_user:$DB_PASS@localhost:5432/mubsat_ai
SESSION_SECRET=$SESSION_SECRET
TELEGRAM_BOT_TOKEN=your_bot_token_here
EOF
echo "   ✅ .env created"

# Step 6: Create PM2 ecosystem config
echo "📝 6/10: Creating PM2 config..."
cat > ecosystem.config.js << 'EOF'
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
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
EOF
echo "   ✅ PM2 config created"

# Step 7: Configure Nginx
echo "🌐 7/10: Configuring Nginx..."
sudo tee /etc/nginx/conf.d/mubsat-ai.conf > /dev/null << 'EOF'
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
    }
}
EOF

sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
sudo rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true
sudo nginx -t && sudo systemctl reload nginx
echo "   ✅ Nginx configured"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║            ✅ Server Infrastructure Ready!                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next Steps:"
echo "   8. Upload application files to /var/www/mubsat-ai"
echo "   9. Run: npm install && npm run build"
echo "   10. Run: pm2 start ecosystem.config.js"
echo ""
echo "🔐 Database Password (احفظها!): $DB_PASS"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📤 To upload files from Replit, run this command:"
echo ""
echo "tar czf - --exclude=node_modules --exclude=.git --exclude=dist . | \\"
echo "  ssh root@46.202.159.100 'cd /var/www/mubsat-ai && tar xzf -'"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

END_OF_DEPLOYMENT
