# 🤖 أمر للمساعد الذكي - رفع مشروع Mubsat AI

## 📋 المهمة: رفع المشروع الكامل للسيرفر

**السيرفر المستهدف:**
- IP: 46.202.159.100
- User: root
- Directory: /var/www/mubsat-ai

---

## 🎯 الأمر الذي يجب إرساله للمساعد الذكي:

```
ارفع هذا المشروع كاملاً للسيرفر 46.202.159.100 في المجلد /var/www/mubsat-ai

خطوات التنفيذ:
1. أنشئ البنية التحتية (PostgreSQL, PM2, Nginx)
2. ارفع كل ملفات المشروع
3. نفذ npm install && npm run build
4. شغّل قاعدة البيانات بـ npm run db:push --force
5. شغّل التطبيق بـ PM2
6. تحقق من أن كل شيء يعمل

معلومات إضافية:
- Node.js موجود في: /root/.nvm/versions/node/v24.11.0/bin
- استخدم PM2 cluster mode بـ 2 instances
- Port التطبيق: 5000
- قاعدة البيانات: mubsat_ai
- مستخدم DB: mubsat_user
- ولّد كلمة سر آمنة للـ database

أرسل لي تقرير كامل بعد الانتهاء.
```

---

## 💡 أو بشكل مختصر:

```
نفّذ deployment كامل لمشروع Mubsat AI على السيرفر 46.202.159.100
- استخدم المجلد /var/www/mubsat-ai
- جهّز PostgreSQL + PM2 + Nginx
- ارفع كل الملفات وشغّل التطبيق
- أعطني تقرير بعد الانتهاء
```

---

## 🔧 التفاصيل التقنية للمساعد:

### البنية التحتية:
```bash
# Database
CREATE DATABASE mubsat_ai;
CREATE USER mubsat_user WITH PASSWORD '<generated>';
GRANT ALL PRIVILEGES ON DATABASE mubsat_ai TO mubsat_user;

# PM2 Config
{
  name: 'mubsat-ai',
  script: './dist/server/index.js',
  instances: 2,
  exec_mode: 'cluster',
  env: { NODE_ENV: 'production', PORT: 5000 }
}

# Nginx Proxy
server {
    listen 80;
    server_name 46.202.159.100;
    location / {
        proxy_pass http://localhost:5000;
    }
}
```

### ملفات يجب رفعها:
- package.json
- server/
- client/
- shared/
- drizzle.config.ts
- vite.config.ts
- tsconfig.json
- tailwind.config.ts
- postcss.config.js

### أوامر البناء:
```bash
export PATH=/root/.nvm/versions/node/v24.11.0/bin:$PATH
npm install
npm run build
npm run db:push --force
pm2 start ecosystem.config.js
pm2 save
```

---

## ✅ معايير النجاح:

1. ✓ PostgreSQL قاعدة البيانات جاهزة
2. ✓ الملفات مرفوعة بالكامل
3. ✓ التطبيق مبني (npm run build)
4. ✓ PM2 يشغّل التطبيق
5. ✓ Nginx يعمل reverse proxy
6. ✓ التطبيق يستجيب على http://46.202.159.100

---

## 📊 التقرير المتوقع:

```
✅ Deployment Report:
- Infrastructure: Ready
- Files uploaded: 234 files
- Build time: 4m 23s
- Database: Migrated successfully
- PM2 Status: Online (2 instances)
- URL: http://46.202.159.100
- Status: LIVE ✓
```

---

**ملاحظة:** المساعد الذكي لديه إمكانيات VPS Executor للتحكم بالسيرفرات عبر SSH!
