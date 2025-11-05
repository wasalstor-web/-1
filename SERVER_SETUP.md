# 🚀 دليل ربط السكربت بسيرفرك

## 📌 المفهوم:
- ✅ **التطوير يبقى على Replit** (هذه المنصة)
- ✅ **السكربت يشتغل على سيرفرك** (VPS/Hostinger)
- ✅ **المنصة تتواصل مع السكربت** عبر API

---

## 📦 الملف المطلوب:

فقط ملف واحد: **`ai-agent-simple.js`**

---

## 🛠️ خطوات التثبيت السريعة:

### 1️⃣ على VPS (مثل DigitalOcean, AWS, Azure):

```bash
# 1. سجل دخول للسيرفر
ssh root@your-server-ip

# 2. انسخ الملف (استخدم scp أو رفع مباشر)
# أو انسخ محتوى ai-agent-simple.js وألصقه:
nano ai-agent-simple.js
# (الصق المحتوى، اضغط Ctrl+X ثم Y ثم Enter)

# 3. شغّل السكربت
node ai-agent-simple.js

# 4. احفظ المفتاح الذي سيظهر!
```

**النتيجة:**
```
🔑 API Key: abc123def456...
🌐 المنفذ: 3000
✅ السيرفر يعمل!
```

---

### 2️⃣ على Hostinger:

```bash
# 1. افتح SSH Terminal من hPanel
# 2. ارفع الملف ai-agent-simple.js
# 3. شغّله:
node ai-agent-simple.js

# أو استخدم PM2 للتشغيل الدائم:
pm2 start ai-agent-simple.js --name "ai-agent"
pm2 save
```

---

## 🔗 كيف تتواصل المنصة معه؟

بعد تشغيل السكربت، المنصة الرئيسية هنا على Replit يمكنها إرسال أوامر:

```javascript
// من المنصة الرئيسية (Replit)
const response = await fetch('http://your-server-ip:3000/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    command: 'ls -la'
  })
});

const result = await response.json();
console.log(result.output);
```

---

## 🧪 اختبار السكربت:

### طريقة 1: من Terminal السيرفر نفسه

```bash
# اختبار Health
curl http://localhost:3000/health

# اختبار تنفيذ أمر
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"command": "ls -la"}'
```

### طريقة 2: استخدم السكربت الجاهز

```bash
# عدّل المفتاح في test-agent.sh
nano test-agent.sh
# (غيّر API_KEY)

# شغّل الاختبار
chmod +x test-agent.sh
./test-agent.sh
```

---

## 🔐 الأمان:

السكربت **آمن** لأنه:
- ✅ يحتاج API Key لكل طلب
- ✅ يسمح بأوامر محددة فقط (ls, pwd, etc)
- ✅ يرفض الأوامر الخطرة (rm, sudo, etc)
- ✅ فيه timeout protection
- ✅ محدود بحجم output

---

## 💡 الأوامر المسموح بها:

```
ls, ls -la, ls -lh
pwd, whoami, date, uptime
df -h, free -m, top -bn1
ps aux, netstat -tulpn
pm2 list, pm2 status
node --version, npm --version
```

**أي أمر آخر = رفض تلقائي** ⛔

---

## 🔄 التشغيل الدائم (مهم!):

### باستخدام PM2:

```bash
# تثبيت PM2
npm install -g pm2

# تشغيل السكربت
pm2 start ai-agent-simple.js --name "ai-agent"

# حفظ للتشغيل التلقائي عند إعادة التشغيل
pm2 save
pm2 startup
```

### باستخدام systemd:

```bash
# إنشاء ملف service
sudo nano /etc/systemd/system/ai-agent.service

# المحتوى:
[Unit]
Description=AI Agent
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root
ExecStart=/usr/bin/node /root/ai-agent-simple.js
Restart=always

[Install]
WantedBy=multi-user.target

# تفعيل السيرفس
sudo systemctl enable ai-agent
sudo systemctl start ai-agent
```

---

## 📊 المراقبة:

```bash
# مع PM2
pm2 status
pm2 logs ai-agent
pm2 monit

# مع systemd
sudo systemctl status ai-agent
sudo journalctl -u ai-agent -f
```

---

## 🌐 فتح المنفذ (إذا لزم):

```bash
# على Ubuntu/Debian
sudo ufw allow 3000

# على CentOS/RHEL
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --reload
```

---

## ✅ الخلاصة:

1. **ارفع** `ai-agent-simple.js` على سيرفرك
2. **شغّله** بـ `node ai-agent-simple.js`
3. **احفظ** API Key الذي سيظهر
4. **استخدمه** من المنصة الرئيسية على Replit

**التطوير يبقى هنا، السكربت يشتغل هناك!** 🎯
