# 🚀 دليل النشر الكامل - منصة مبسط AI
# Mubsat AI Platform - Complete Deployment Guide

## 📋 المتطلبات | Requirements

### على السيرفر (Hostinger VPS)
- Ubuntu 20.04+ or similar Linux distribution
- 2GB RAM minimum (4GB recommended)
- 20GB disk space
- Root or sudo access
- SSH access enabled

### على جهازك المحلي (Replit)
- SSH access to your server
- rsync installed (for file upload)

---

## 🎯 طريقة النشر السريعة | Quick Deployment

### الخطوة 1: تحضير السيرفر

تأكد من امتلاكك:
- عنوان IP السيرفر: `46.202.159.100`
- اسم المستخدم SSH: `root` (أو اسم آخر)
- كلمة المرور أو SSH Key

### الخطوة 2: تشغيل سكريبت النشر التلقائي

```bash
# من Replit، شغل السكريبت التلقائي
bash deploy.sh 46.202.159.100 root
```

**هذا السكريبت سيقوم بـ:**
1. ✅ تحديث النظام
2. ✅ تثبيت Node.js 20
3. ✅ تثبيت PostgreSQL
4. ✅ تثبيت PM2
5. ✅ تثبيت Nginx
6. ✅ رفع ملفات التطبيق
7. ✅ إعداد قاعدة البيانات
8. ✅ تشغيل التطبيق
9. ✅ تكوين Nginx
10. ✅ تكوين Firewall

**المدة المتوقعة:** 5-10 دقائق

---

## 🔧 النشر اليدوي | Manual Deployment

إذا فضلت النشر خطوة بخطوة:

### 1. الاتصال بالسيرفر

```bash
ssh root@46.202.159.100
```

### 2. تحديث النظام

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. تثبيت Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v
```

### 4. تثبيت PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 5. إنشاء قاعدة البيانات

```bash
sudo -u postgres psql
```

داخل PostgreSQL:
```sql
CREATE DATABASE mubsat_ai;
CREATE USER mubsat_ai_user WITH PASSWORD 'your_strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE mubsat_ai TO mubsat_ai_user;
\q
```

### 6. تثبيت PM2

```bash
sudo npm install -g pm2
```

### 7. إنشاء مجلد التطبيق

```bash
sudo mkdir -p /var/www/mubsat-ai
sudo chown -R $USER:$USER /var/www/mubsat-ai
cd /var/www/mubsat-ai
```

### 8. رفع الملفات

من جهازك المحلي (Replit):
```bash
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    ./ root@46.202.159.100:/var/www/mubsat-ai/
```

### 9. تثبيت المكتبات

على السيرفر:
```bash
cd /var/www/mubsat-ai
npm install --production
```

### 10. إنشاء ملف .env

```bash
nano /var/www/mubsat-ai/.env
```

أضف:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://mubsat_ai_user:your_password@localhost:5432/mubsat_ai
SESSION_SECRET=$(openssl rand -base64 32)
TELEGRAM_BOT_TOKEN=your_bot_token_if_needed
```

### 11. تشغيل قاعدة البيانات

```bash
npm run db:push
```

### 12. تشغيل التطبيق بـ PM2

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 13. تثبيت Nginx

```bash
sudo apt install -y nginx
```

### 14. تكوين Nginx

```bash
sudo nano /etc/nginx/sites-available/mubsat-ai
```

الصق محتوى ملف `nginx.conf` من المشروع

```bash
sudo ln -s /etc/nginx/sites-available/mubsat-ai /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 15. تكوين Firewall

```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 🔐 إعداد SSL (اختياري لكن موصى به)

```bash
# تثبيت Certbot
sudo apt install -y certbot python3-certbot-nginx

# الحصول على شهادة SSL
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# التجديد التلقائي
sudo certbot renew --dry-run
```

---

## 📊 إدارة التطبيق بعد النشر

### أوامر PM2 المهمة

```bash
# عرض حالة التطبيق
pm2 status

# عرض السجلات
pm2 logs mubsat-ai

# إعادة تشغيل
pm2 restart mubsat-ai

# إيقاف
pm2 stop mubsat-ai

# حذف
pm2 delete mubsat-ai

# مراقبة الموارد
pm2 monit
```

### أوامر Nginx المهمة

```bash
# اختبار التكوين
sudo nginx -t

# إعادة تحميل التكوين
sudo systemctl reload nginx

# إعادة تشغيل Nginx
sudo systemctl restart nginx

# عرض السجلات
sudo tail -f /var/log/nginx/mubsat-ai-access.log
sudo tail -f /var/log/nginx/mubsat-ai-error.log
```

### أوامر PostgreSQL المهمة

```bash
# الاتصال بقاعدة البيانات
sudo -u postgres psql -d mubsat_ai

# عمل نسخة احتياطية
sudo -u postgres pg_dump mubsat_ai > backup_$(date +%Y%m%d).sql

# استعادة النسخة الاحتياطية
sudo -u postgres psql mubsat_ai < backup_20250101.sql
```

---

## 🔄 تحديث التطبيق

### طريقة 1: إعادة تشغيل السكريبت التلقائي
```bash
bash deploy.sh 46.202.159.100 root
```

### طريقة 2: التحديث اليدوي

من Replit:
```bash
# رفع الملفات الجديدة
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    ./ root@46.202.159.100:/var/www/mubsat-ai/
```

على السيرفر:
```bash
cd /var/www/mubsat-ai
npm install
npm run db:push
pm2 restart mubsat-ai
```

---

## 🐛 حل المشاكل الشائعة

### التطبيق لا يعمل

```bash
# تحقق من PM2
pm2 status
pm2 logs mubsat-ai

# تحقق من Nginx
sudo systemctl status nginx
sudo nginx -t

# تحقق من قاعدة البيانات
sudo systemctl status postgresql
```

### خطأ في قاعدة البيانات

```bash
# إعادة تشغيل PostgreSQL
sudo systemctl restart postgresql

# التحقق من الاتصال
psql -U mubsat_ai_user -d mubsat_ai -h localhost
```

### المنفذ مستخدم

```bash
# البحث عن العملية
sudo lsof -i :5000

# إيقاف العملية
sudo kill -9 <PID>

# إعادة تشغيل PM2
pm2 restart mubsat-ai
```

### خطأ في الذاكرة

```bash
# زيادة حد ذاكرة PM2
pm2 delete mubsat-ai
pm2 start ecosystem.config.js --max-memory-restart 2G
```

---

## 📈 المراقبة والصيانة

### 1. مراقبة الموارد

```bash
# استخدام الذاكرة
free -h

# استخدام القرص
df -h

# العمليات النشطة
htop
```

### 2. النسخ الاحتياطية التلقائية

إنشاء cron job للنسخ الاحتياطي اليومي:
```bash
crontab -e
```

أضف:
```cron
0 2 * * * sudo -u postgres pg_dump mubsat_ai > /var/backups/mubsat_$(date +\%Y\%m\%d).sql
```

### 3. تنظيف السجلات

```bash
# تنظيف سجلات PM2
pm2 flush

# تنظيف سجلات Nginx القديمة
sudo find /var/log/nginx -name "*.log" -mtime +30 -delete
```

---

## 🌐 ربط النطاق (Domain)

1. **في إعدادات DNS عند مزود النطاق:**
   - أنشئ A Record يشير إلى: `46.202.159.100`
   - أنشئ CNAME Record لـ www يشير إلى: `your-domain.com`

2. **تحديث تكوين Nginx:**
   ```bash
   sudo nano /etc/nginx/sites-available/mubsat-ai
   ```
   
   غير `server_name` إلى نطاقك الفعلي

3. **الحصول على SSL:**
   ```bash
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

---

## ✅ قائمة التحقق النهائية

- [ ] التطبيق يعمل: `pm2 status`
- [ ] Nginx يعمل: `sudo systemctl status nginx`
- [ ] قاعدة البيانات تعمل: `sudo systemctl status postgresql`
- [ ] التطبيق يستجيب: `curl http://localhost:5000`
- [ ] الوصول الخارجي يعمل: `curl http://46.202.159.100`
- [ ] SSL مفعل (إذا كنت تستخدم نطاق)
- [ ] النسخ الاحتياطية مجدولة
- [ ] المتغيرات البيئية محدثة في `.env`
- [ ] API Keys مضافة (OpenAI, etc.)
- [ ] Telegram Bot مكوّن (إذا لزم الأمر)

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. تحقق من سجلات PM2: `pm2 logs mubsat-ai`
2. تحقق من سجلات Nginx: `sudo tail -f /var/log/nginx/mubsat-ai-error.log`
3. تحقق من حالة PostgreSQL: `sudo systemctl status postgresql`

---

## 🎉 تم!

التطبيق الآن يعمل على:
- **HTTP**: `http://46.202.159.100`
- **مع النطاق**: `http://your-domain.com`
- **مع SSL**: `https://your-domain.com`

**استمتع بمنصة مبسط AI! 🚀**
