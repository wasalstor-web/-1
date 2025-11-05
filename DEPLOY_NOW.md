# 🚀 دليل النشر السريع - Mubsat AI Platform

## ✅ معلومات السيرفر
- **IP:** 46.202.159.100
- **Hostname:** srv973932.hstgr.cloud
- **User:** root
- **Node.js:** v24.11.0 ✅
- **Nginx:** Installed ✅
- **RAM:** 15GB (12GB متاحة) ✅
- **Storage:** 199GB (102GB متاحة) ✅

---

## 🎯 طريقة النشر - اختر واحدة

### الطريقة 1️⃣: عبر واجهة المساعد الذكي (الأسهل! ⚡)

1. افتح المتصفح واذهب إلى:
   ```
   http://localhost:5000/admin/intelligent-assistant
   ```

2. انزل للأسفل حتى تجد قسم **"نشر التطبيق على Hostinger"**

3. اضغط على زر **"نشر كامل تلقائي"** 🚀

4. انتظر حتى ينتهي النشر (حوالي 5-10 دقائق)

5. افتح المتصفح على:
   ```
   http://46.202.159.100
   ```

**هذا كل شيء! ✅**

---

### الطريقة 2️⃣: عبر SSH يدوياً (للمحترفين 🛠️)

#### الخطوة 1: الاتصال بالسيرفر
```bash
ssh root@46.202.159.100
```

#### الخطوة 2: تثبيت PM2
```bash
export PATH=/root/.nvm/versions/node/v24.11.0/bin:$PATH
npm install -g pm2
pm2 -v
```

#### الخطوة 3: تشغيل PostgreSQL
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl status postgresql
```

#### الخطوة 4: إنشاء قاعدة البيانات
```bash
# Generate a secure password first
DB_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
echo "Generated DB Password (SAVE THIS!): $DB_PASS"

sudo -u postgres psql <<EOF
CREATE DATABASE mubsat_ai;
CREATE USER mubsat_user WITH PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE mubsat_ai TO mubsat_user;
\q
EOF
```

#### الخطوة 5: إنشاء مجلد التطبيق
```bash
mkdir -p /var/www/mubsat-ai
cd /var/www/mubsat-ai
```

#### الخطوة 6: إنشاء ملف .env
```bash
# Use the DB_PASS variable from step 4
cat > .env <<EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://mubsat_user:${DB_PASS}@localhost:5432/mubsat_ai
SESSION_SECRET=$(openssl rand -base64 32)
TELEGRAM_BOT_TOKEN=your_bot_token_here
EOF
```

#### الخطوة 7: رفع ملفات التطبيق
من جهازك المحلي (Replit):
```bash
# في terminal آخر على Replit
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  ./ root@46.202.159.100:/var/www/mubsat-ai/
```

#### الخطوة 8: تثبيت Dependencies على السيرفر
```bash
cd /var/www/mubsat-ai
export PATH=/root/.nvm/versions/node/v24.11.0/bin:$PATH
# Install ALL dependencies (including devDependencies needed for build)
npm install
```

#### الخطوة 9: بناء التطبيق
```bash
npm run build
```

#### الخطوة 10: إعداد قاعدة البيانات
```bash
npm run db:push
```

#### الخطوة 11: تشغيل التطبيق بـ PM2
```bash
cat > ecosystem.config.js <<'EOF'
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

pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### الخطوة 12: تكوين Nginx
```bash
sudo tee /etc/nginx/sites-available/mubsat-ai > /dev/null <<'EOF'
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
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/mubsat-ai /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

#### الخطوة 13: تفعيل Firewall
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status
```

---

## ✅ التحقق من النشر

### 1. تحقق من PM2
```bash
pm2 status
pm2 logs mubsat-ai
```

### 2. تحقق من Nginx
```bash
sudo systemctl status nginx
```

### 3. افتح المتصفح
```
http://46.202.159.100
```

يجب أن ترى منصة مبسط AI تعمل! 🎉

---

## 🔧 أوامر مفيدة للصيانة

### إعادة تشغيل التطبيق
```bash
pm2 restart mubsat-ai
```

### تحديث التطبيق (بعد رفع ملفات جديدة)
```bash
cd /var/www/mubsat-ai
npm run build
pm2 restart mubsat-ai
```

### عرض اللوقات
```bash
pm2 logs mubsat-ai --lines 100
```

### إيقاف التطبيق
```bash
pm2 stop mubsat-ai
```

### حذف التطبيق من PM2
```bash
pm2 delete mubsat-ai
```

---

## 🆘 استكشاف الأخطاء

### التطبيق لا يعمل؟
```bash
# تحقق من اللوقات
pm2 logs mubsat-ai

# تحقق من المنافذ المستخدمة
sudo netstat -tulpn | grep :5000

# تحقق من PostgreSQL
sudo systemctl status postgresql
```

### Nginx يعطي خطأ؟
```bash
# تحقق من التكوين
sudo nginx -t

# عرض اللوقات
sudo tail -f /var/log/nginx/error.log
```

### قاعدة البيانات لا تعمل؟
```bash
# تحقق من PostgreSQL
sudo systemctl status postgresql

# اختبر الاتصال
psql -U mubsat_user -d mubsat_ai -h localhost
```

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. تحقق من اللوقات في PM2: `pm2 logs mubsat-ai`
2. تحقق من Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. تحقق من اتصال قاعدة البيانات في `.env`

---

## 🎉 تم بنجاح!

بعد اتباع أي من الطريقتين أعلاه، ستكون منصة مبسط AI جاهزة على:

🌐 **http://46.202.159.100**

تهانينا! 🚀🎊
