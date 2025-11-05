# دليل تثبيت واستخدام ABI الموحد
## Agent Binary Interface - Unified AI Agent

---

## 📋 نظرة عامة

**ABI (Agent Binary Interface)** هو نظام موحد يمكنك تثبيته على أي VPS أو Hostinger ليعمل كـ AI Agent ذكي يستقبل الأوامر وينفذها تلقائياً.

### المزايا الرئيسية:
- ✅ **موحد**: نفس الكود يعمل على أي سيرفر
- ✅ **ذكي**: يفهم النوايا ويحلل الأوامر
- ✅ **سهل التثبيت**: خطوات بسيطة للتشغيل
- ✅ **مستقل**: لا يحتاج اتصال دائم بالمنصة الأساسية
- ✅ **آمن**: يعمل في بيئة معزولة

---

## 🚀 طريقة الحصول على ABI

### الطريقة 1: من خلال الواجهة الرسومية

1. افتح المنصة وانتقل إلى **"المساعد الذكي"**
2. انقر على زر **"إنشاء ABI"** في أعلى الصفحة
3. أدخل المعلومات التالية:
   - **اسم السيرفر**: مثل `VPS-1` أو `HOSTINGER-MAIN`
   - **نوع السيرفر**: اختر من القائمة (VPS, Hostinger, Shared Hosting)
4. انقر **"إنشاء ABI"**
5. ستحصل على ملفين:
   - `ai-agent.js` - الكود الرئيسي
   - `package.json` - ملف الإعدادات

### الطريقة 2: من خلال المحادثة

أرسل رسالة في المحادثة:
```
اعطني ABI لسيرفر VPS-1
```

أو بالإنجليزية:
```
generate ABI for server HOSTINGER-1
```

---

## 📦 تثبيت ABI على Hostinger

### الخطوات التفصيلية:

#### 1. تسجيل الدخول إلى Hostinger
- اذهب إلى [hpanel.hostinger.com](https://hpanel.hostinger.com)
- سجل الدخول بحسابك

#### 2. الدخول إلى File Manager
- من لوحة التحكم، اختر **"File Manager"**
- ستفتح نافذة جديدة تعرض ملفات موقعك

#### 3. إنشاء مجلد للـ Agent
1. انقر **"New Folder"** في شريط الأدوات
2. اكتب اسم المجلد: `ai-agent`
3. انقر **"Create"**

#### 4. رفع الملفات
1. افتح مجلد `ai-agent` الذي أنشأته
2. انقر **"Upload Files"**
3. ارفع الملفين:
   - `ai-agent.js`
   - `package.json`

#### 5. إعداد تطبيق Node.js
1. ارجع إلى لوحة التحكم الرئيسية (hPanel)
2. ابحث عن **"Setup Node.js App"** في القائمة الجانبية
3. انقر **"Create Application"**

#### 6. إعدادات التطبيق
املأ الحقول كالتالي:
- **Node.js version**: 18.x (أو أحدث)
- **Application mode**: Production
- **Application root**: `/home/username/ai-agent`
  (استبدل `username` باسم المستخدم الخاص بك)
- **Application URL**: اختر النطاق أو Subdomain
- **Application startup file**: `ai-agent.js`

#### 7. إضافة المتغيرات البيئية (Environment Variables)
1. في نفس صفحة إعدادات التطبيق
2. ابحث عن قسم **"Environment variables"**
3. أضف المتغيرات التالية:
   ```
   PORT=3000
   NODE_ENV=production
   SERVER_NAME=HOSTINGER-MAIN
   ```

#### 8. تشغيل التطبيق
- انقر **"Create"** أو **"Save Changes"**
- سيقوم Hostinger بتثبيت الحزم وتشغيل التطبيق تلقائياً
- انتظر بضع ثوانٍ حتى يصبح Status: **"Running"** 🟢

---

## 🖥️ تثبيت ABI على VPS

### المتطلبات:
- VPS يعمل بنظام Linux (Ubuntu/Debian/CentOS)
- صلاحيات root أو sudo
- اتصال SSH

### الخطوات:

#### 1. الاتصال بالـ VPS
```bash
ssh user@your-vps-ip
```

#### 2. تثبيت Node.js (إن لم يكن مثبتاً)
```bash
# للأنظمة المبنية على Debian/Ubuntu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# للتحقق من التثبيت
node --version
npm --version
```

#### 3. إنشاء مجلد للـ Agent
```bash
mkdir -p ~/ai-agent
cd ~/ai-agent
```

#### 4. نقل ملفات ABI
يمكنك استخدام إحدى الطرق التالية:

**الطريقة أ: باستخدام nano (للنسخ المباشر)**
```bash
nano ai-agent.js
# الصق محتوى ملف ai-agent.js هنا
# اضغط Ctrl+X ثم Y ثم Enter للحفظ

nano package.json
# الصق محتوى ملف package.json هنا
# اضغط Ctrl+X ثم Y ثم Enter للحفظ
```

**الطريقة ب: باستخدام SCP (من جهازك)**
```bash
# من جهازك المحلي
scp ai-agent.js user@your-vps-ip:~/ai-agent/
scp package.json user@your-vps-ip:~/ai-agent/
```

#### 5. تثبيت الحزم (إن وجدت)
```bash
npm install
```

#### 6. إعطاء صلاحيات التنفيذ
```bash
chmod +x ai-agent.js
```

#### 7. تشغيل الـ Agent

**للتشغيل المؤقت (للاختبار):**
```bash
node ai-agent.js
```

**للتشغيل الدائم (باستخدام PM2):**
```bash
# تثبيت PM2
sudo npm install -g pm2

# تشغيل Agent
pm2 start ai-agent.js --name "ai-agent"

# جعل PM2 يعمل تلقائياً عند إعادة التشغيل
pm2 startup
pm2 save

# للتحقق من الحالة
pm2 status
pm2 logs ai-agent
```

---

## 🔌 استخدام ABI بعد التثبيت

### اختبار الاتصال

```bash
# التحقق من أن Agent يعمل
curl http://localhost:3000/health

# يجب أن ترجع:
# {"status":"healthy","server":"YOUR-SERVER-NAME"}
```

### إرسال أمر للتنفيذ

```bash
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "ls -la"}'
```

### مثال على الرد:
```json
{
  "success": true,
  "output": "total 24\ndrwxr-xr-x 3 user user 4096...",
  "stderr": ""
}
```

---

## 🔗 ربط ABI بالمنصة الرئيسية

بعد تثبيت ABI على السيرفر، يمكنك ربطه بالمنصة الرئيسية:

### في إعدادات VPS Executor:

1. افتح `server/intelligent-agent/vps-executor.ts`
2. أضف السيرفر الجديد:

```typescript
this.servers.set('YOUR-SERVER-NAME', {
  type: 'http',
  config: {
    endpoint: 'http://your-server-ip:3000/execute',
    headers: {
      'Content-Type': 'application/json',
      // يمكن إضافة Authorization header للحماية
    }
  }
});
```

### أو عبر الواجهة الرسومية (قريباً):
- سيتم إضافة صفحة إعدادات لإدارة السيرفرات
- يمكنك إضافة/تعديل/حذف السيرفرات من الواجهة مباشرة

---

## 🛡️ تأمين ABI

### 1. إضافة Authentication

عدّل ملف `ai-agent.js` لإضافة مفتاح API:

```javascript
const API_KEY = process.env.API_KEY || 'your-secret-key';

// في معالج الطلبات
if (req.headers['authorization'] !== `Bearer ${API_KEY}`) {
  res.writeHead(401);
  res.end(JSON.stringify({ error: 'Unauthorized' }));
  return;
}
```

### 2. استخدام HTTPS

```bash
# تثبيت Certbot للحصول على شهادة SSL مجانية
sudo apt-get install certbot

# الحصول على شهادة
sudo certbot certonly --standalone -d your-domain.com
```

### 3. جدار الحماية (Firewall)

```bash
# السماح فقط بالمنافذ المطلوبة
sudo ufw allow 22    # SSH
sudo ufw allow 3000  # Agent port
sudo ufw enable
```

---

## 🔧 استكشاف الأخطاء وحلها

### Agent لا يعمل:

```bash
# التحقق من اللوجات
pm2 logs ai-agent

# إعادة تشغيل
pm2 restart ai-agent

# إيقاف وبدء جديد
pm2 delete ai-agent
pm2 start ai-agent.js --name "ai-agent"
```

### خطأ في الاتصال:

```bash
# التحقق من أن المنفذ مفتوح
netstat -tulpn | grep 3000

# التحقق من جدار الحماية
sudo ufw status
```

### أخطاء الأذونات:

```bash
# إعطاء صلاحيات للملفات
chmod 755 ai-agent.js
chown user:user ai-agent.js
```

---

## 📊 المراقبة والصيانة

### مراقبة الأداء:

```bash
# باستخدام PM2
pm2 monit

# عرض معلومات مفصلة
pm2 show ai-agent
```

### تحديث ABI:

```bash
cd ~/ai-agent

# أوقف Agent
pm2 stop ai-agent

# استبدل الملف بالنسخة الجديدة
# (استخدم nano أو scp)

# شغل Agent مرة أخرى
pm2 restart ai-agent
```

### النسخ الاحتياطي:

```bash
# أنشئ نسخة احتياطية
tar -czf ai-agent-backup-$(date +%Y%m%d).tar.gz ~/ai-agent/

# نقل النسخة الاحتياطية لمكان آمن
scp ai-agent-backup-*.tar.gz user@backup-server:/backups/
```

---

## 📝 ملاحظات مهمة

1. **الأمان أولاً**: لا تنسَ تأمين Agent بمفتاح API
2. **المراقبة**: راقب أداء Agent بانتظام
3. **التحديثات**: حدّث ABI عند إصدار نسخ جديدة
4. **اللوجات**: احفظ اللوجات لتحليل المشاكل

---

## 🆘 الدعم والمساعدة

### الموارد:
- **التوثيق الكامل**: انظر `replit.md`
- **الكود المصدري**: `server/intelligent-agent/`
- **أمثلة**: `server/intelligent-agent/abi-generator.ts`

### المشاكل الشائعة:
- **Port already in use**: غيّر المنفذ في متغيرات البيئة
- **Permission denied**: استخدم `sudo` أو عدّل الصلاحيات
- **Module not found**: شغّل `npm install` مرة أخرى

---

## 🎯 الخلاصة

ABI هو نظام قوي ومرن يمكّنك من تشغيل AI Agent على أي سيرفر بسهولة. اتبع الخطوات أعلاه للتثبيت والتشغيل، ولا تتردد في تخصيص الكود حسب احتياجاتك.

**نتمنى لك تجربة ممتعة! 🚀**
