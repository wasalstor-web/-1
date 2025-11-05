# 📤 رفع وتنفيذ التطبيق - دليل سريع

## 🎯 الطريقة الأسرع (3 خطوات فقط!)

### الخطوة 1️⃣: افتح Terminal جديد في Replit

اضغط على **Terminal** (الشريط الجانبي) → افتح shell جديد

---

### الخطوة 2️⃣: انسخ والصق هذا الأمر كاملاً:

```bash
ssh root@46.202.159.100 << 'REMOTE_DEPLOY'
set -e
export PATH=/root/.nvm/versions/node/v24.11.0/bin:$PATH

# Generate secure password
DB_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔐 كلمة سر قاعدة البيانات المولدة (احفظها!):"
echo "   $DB_PASS"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Install PM2
echo "📦 تثبيت PM2..."
npm install -g pm2 2>/dev/null || echo "PM2 already installed"

# Start PostgreSQL
echo "🗄️  تشغيل PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
echo "🔧 إنشاء قاعدة البيانات..."
sudo -u postgres psql << EOF
CREATE DATABASE mubsat_ai;
CREATE USER mubsat_user WITH PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE mubsat_ai TO mubsat_user;
\q
EOF

# Create directory
echo "📁 إنشاء مجلد التطبيق..."
mkdir -p /var/www/mubsat-ai
cd /var/www/mubsat-ai

# Create .env
echo "⚙️  إنشاء ملف .env..."
cat > .env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://mubsat_user:$DB_PASS@localhost:5432/mubsat_ai
SESSION_SECRET=$(openssl rand -base64 32)
TELEGRAM_BOT_TOKEN=your_bot_token_here
EOF

echo ""
echo "✅ إعداد البنية التحتية اكتمل!"
echo ""
echo "📋 الآن: ارفع ملفات التطبيق إلى /var/www/mubsat-ai"
echo ""

REMOTE_DEPLOY
```

**اضغط Enter** وانتظر حتى ينتهي!

---

### الخطوة 3️⃣: ارفع ملفات التطبيق

#### الطريقة أ: باستخدام wget (الأسهل!)

في نفس Terminal السابق أو terminal جديد على Replit:

```bash
# احفظ الملفات في مكان يمكن تحميله
cd /home/runner/workspace
python3 -m http.server 8080 &
```

ثم في terminal السيرفر (SSH):

```bash
cd /var/www/mubsat-ai
wget http://YOUR_REPLIT_URL:8080/archive.tar.gz
tar -xzf archive.tar.gz
```

#### الطريقة ب: استخدم SCP من جهازك المحلي

إذا كنت تعمل من جهازك (ليس Replit):

```bash
scp -r \
  --exclude 'node_modules' \
  --exclude '.git' \
  /path/to/project root@46.202.159.100:/var/www/mubsat-ai/
```

#### الطريقة ج: نسخ ولصق يدوي

1. من Replit، اضغط على كل ملف مهم (package.json, server/, client/, shared/, etc)
2. انسخ المحتوى
3. في السيرفر SSH، أنشئ نفس الملف والصق المحتوى

---

### الخطوة 4️⃣: بناء وتشغيل التطبيق

بعد رفع الملفات، في terminal السيرفر:

```bash
cd /var/www/mubsat-ai
export PATH=/root/.nvm/versions/node/v24.11.0/bin:$PATH

# Install dependencies
npm install

# Build
npm run build

# Database migration
npm run db:push --force

# Start with PM2
pm2 delete mubsat-ai 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure Nginx
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
    }
}
EOF

sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "🎉 التطبيق يعمل الآن!"
echo "🌐 http://46.202.159.100"
```

---

## 🚀 الطريقة الأسرع الكاملة (كل شيء دفعة واحدة)

افتح Terminal على Replit واكتب:

```bash
ssh root@46.202.159.100 'bash -s' < deploy-on-server.sh
```

**لكن** ستحتاج لرفع الملفات يدوياً عندما يطلب منك!

---

## 📝 ملاحظات مهمة

1. **كلمة السر**: ستظهر لك في البداية - احفظها!
2. **Node.js**: موجود في `/root/.nvm/versions/node/v24.11.0/bin`
3. **Logs**: `pm2 logs mubsat-ai`
4. **Status**: `pm2 status`
5. **Restart**: `pm2 restart mubsat-ai`

---

## 🆘 مشاكل شائعة

### "npm command not found"
```bash
export PATH=/root/.nvm/versions/node/v24.11.0/bin:$PATH
```

### "Database already exists"
```bash
sudo -u postgres psql -c "DROP DATABASE mubsat_ai;"
# ثم أعد إنشاءها
```

### "Port 5000 already in use"
```bash
pm2 delete all
```

---

## ✅ التحقق من النجاح

```bash
# تحقق من PM2
pm2 status

# تحقق من Nginx
sudo systemctl status nginx

# تحقق من التطبيق
curl http://localhost:5000

# افتح في المتصفح
# http://46.202.159.100
```

---

🎉 **جاهز! التطبيق سيعمل على http://46.202.159.100**
