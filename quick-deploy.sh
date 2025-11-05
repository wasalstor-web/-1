#!/bin/bash
###############################################################################
# نسخة مبسطة جداً - انسخها والصقها مباشرة في SSH!
# ssh root@46.202.159.100
# ثم الصق هذا Script كاملاً
###############################################################################

set -e
export PATH=/root/.nvm/versions/node/v24.11.0/bin:$PATH

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         🚀 النشر السريع - Mubsat AI Platform              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Generate secure password
DB_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

echo "═══════════════════════════════════════════════════════════"
echo "🔐 كلمة سر قاعدة البيانات (احفظها!):"
echo "   $DB_PASS"
echo "═══════════════════════════════════════════════════════════"
echo ""
sleep 3

# 1. Install PM2
echo "📦 1/8: تثبيت PM2..."
npm install -g pm2 2>/dev/null || echo "   ✅ PM2 موجود بالفعل"

# 2. Start PostgreSQL
echo "🗄️  2/8: تشغيل PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 3. Create database
echo "🔧 3/8: إنشاء قاعدة البيانات..."
sudo -u postgres psql << EOF 2>/dev/null || true
CREATE DATABASE mubsat_ai;
CREATE USER mubsat_user WITH PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE mubsat_ai TO mubsat_user;
\q
EOF
echo "   ✅ تم"

# 4. Create directory
echo "📁 4/8: إنشاء مجلد التطبيق..."
mkdir -p /var/www/mubsat-ai
cd /var/www/mubsat-ai

# 5. Create .env
echo "⚙️  5/8: إنشاء ملف .env..."
cat > .env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://mubsat_user:$DB_PASS@localhost:5432/mubsat_ai
SESSION_SECRET=$(openssl rand -base64 32)
TELEGRAM_BOT_TOKEN=your_bot_token_here
EOF
echo "   ✅ تم"

# 6. Create ecosystem config
echo "📝 6/8: إنشاء PM2 config..."
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
    }
  }]
};
EOF
echo "   ✅ تم"

# 7. Configure Nginx
echo "🌐 7/8: إعداد Nginx..."
sudo tee /etc/nginx/conf.d/mubsat-ai.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name 46.202.159.100;
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
sudo nginx -t && sudo systemctl reload nginx
echo "   ✅ تم"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║            ✅ إعداد السيرفر اكتمل!                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 الخطوة التالية: ارفع ملفات التطبيق"
echo ""
echo "🔹 الطريقة 1: من Replit مباشرة"
echo "   في Replit Terminal شغّل:"
echo "   tar czf - . | ssh root@46.202.159.100 'cd /var/www/mubsat-ai && tar xzf -'"
echo ""
echo "🔹 الطريقة 2: يدوياً"
echo "   - انسخ ملفات: package.json, server/, client/, shared/"
echo "   - الصقها في: /var/www/mubsat-ai/"
echo ""
echo "📌 بعد رفع الملفات، شغّل:"
echo "   cd /var/www/mubsat-ai"
echo "   npm install && npm run build && npm run db:push --force"
echo "   pm2 start ecosystem.config.js && pm2 save"
echo ""
echo "🔐 كلمة سر DB: $DB_PASS"
echo ""
