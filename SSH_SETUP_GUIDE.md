# 🔐 دليل إعداد SSH للتحكم بالسيرفرات

## ✅ ما تم إنجازه

تم تطوير نظام كامل للتحكم بالسيرفرات عبر SSH:

### 1. **قاعدة البيانات** ✓
- إضافة حقول SSH للسيرفرات: `ssh_enabled`, `ssh_host`, `ssh_port`, `ssh_username`, `ssh_password`, `ssh_private_key`
- جدول `server_commands` لتتبع الأوامر المنفذة
- تم تحديث السيرفر الحالي (ID: `28c79ad5-56e1-4b2a-9d53-275e8702d9a7`)

### 2. **Backend** ✓
- `server/ssh-executor.ts` - محرك تنفيذ SSH كامل
- API Endpoints جديدة:
  - `POST /api/servers/:id/execute` - تنفيذ أوامر عبر SSH
  - `POST /api/servers/:id/test` - اختبار اتصال SSH
  - `GET /api/servers` - عرض جميع السيرفرات
  - `POST /api/servers` - إضافة سيرفر جديد

### 3. **Telegram Bot** ✓
- أمر `/execute` لتنفيذ أوامر مباشرة على VPS
- دعم كامل لـ SSH
- رسائل توضيحية بالعربية

---

## 🚀 طرق الإعداد (اختر واحدة)

### **الطريقة الأولى: استخدام كلمة مرور SSH**

**الخطوات:**

1. **على Replit** - أضف كلمة مرور السيرفر:
```sql
UPDATE servers 
SET ssh_password = 'YOUR_ROOT_PASSWORD_HERE'
WHERE id = '28c79ad5-56e1-4b2a-9d53-275e8702d9a7';
```

2. **جرب الأمر في Telegram:**
```
/execute hostname
```

**✅ المميزات:**
- سريع وسهل
- لا يحتاج إعدادات إضافية

**⚠️ العيوب:**
- أقل أماناً من المفاتيح
- كلمة المرور مخزنة في قاعدة البيانات

---

### **الطريقة الثانية: استخدام مفتاح SSH (الأكثر أماناً) ⭐**

#### **الخيار 2A: إنشاء مفتاح جديد من Replit**

**الخطوات:**

1. **على Replit** - أنشئ مفتاح SSH:
```bash
ssh-keygen -t rsa -b 4096 -f /tmp/replit_vps_key -N ""
cat /tmp/replit_vps_key.pub
```

2. **انسخ المفتاح العام** الذي ظهر

3. **على VPS** - أضف المفتاح العام:
```bash
mkdir -p ~/.ssh
echo "المفتاح_العام_من_الخطوة_السابقة" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

4. **على Replit** - احفظ المفتاح الخاص في قاعدة البيانات:
```bash
cat /tmp/replit_vps_key
```

انسخ كل المحتوى (من `-----BEGIN` إلى `-----END`)

```sql
UPDATE servers 
SET ssh_private_key = '-----BEGIN OPENSSH PRIVATE KEY-----
...المحتوى_الكامل_للمفتاح_الخاص...
-----END OPENSSH PRIVATE KEY-----'
WHERE id = '28c79ad5-56e1-4b2a-9d53-275e8702d9a7';
```

5. **جرب الأمر:**
```
/execute hostname
```

---

#### **الخيار 2B: استخدام مفتاح SSH موجود**

إذا كان لديك مفتاح SSH خاص بالفعل:

1. **افتح المفتاح الخاص:**
```bash
cat ~/.ssh/id_rsa
# أو
cat /path/to/your/private/key
```

2. **احفظه في قاعدة البيانات:**
```sql
UPDATE servers 
SET ssh_private_key = '-----BEGIN OPENSSH PRIVATE KEY-----
...المحتوى_الكامل_للمفتاح_الخاص...
-----END OPENSSH PRIVATE KEY-----'
WHERE id = '28c79ad5-56e1-4b2a-9d53-275e8702d9a7';
```

3. **تأكد أن المفتاح العام موجود على VPS:**
```bash
# على VPS
cat ~/.ssh/authorized_keys
```

يجب أن تجد المفتاح العام المطابق للمفتاح الخاص

---

### **الطريقة الثالثة: SSH بدون كلمة مرور من Replit Shell**

إذا أردت تنفيذ أوامر مباشرة من Replit بدون حفظ كلمة المرور:

1. **على Replit Shell:**
```bash
ssh root@46.202.159.100 'hostname && uname -a && uptime'
```

2. **عند السؤال عن كلمة المرور** - أدخلها مرة واحدة

**⚠️ ملاحظة:** هذه الطريقة تتطلب إدخال كلمة المرور في كل مرة

---

## 🎯 اختبار النظام

### **1. عبر Telegram Bot:**
```
/execute hostname
/execute uname -a
/execute uptime
/execute df -h
/execute free -m
```

### **2. عبر API:**
```bash
curl -X POST "http://localhost:5000/api/servers/28c79ad5-56e1-4b2a-9d53-275e8702d9a7/execute" \
  -H "Content-Type: application/json" \
  -d '{"command": "hostname"}'
```

### **3. اختبار الاتصال:**
```bash
curl -X POST "http://localhost:5000/api/servers/28c79ad5-56e1-4b2a-9d53-275e8702d9a7/test"
```

---

## 📋 أوامر مفيدة على VPS

### **معلومات النظام:**
```bash
/execute hostname              # اسم السيرفر
/execute uname -a              # معلومات النظام
/execute uptime                # وقت التشغيل
/execute whoami                # المستخدم الحالي
```

### **الموارد:**
```bash
/execute df -h                 # المساحة المتاحة
/execute free -m               # الذاكرة المتاحة
/execute top -bn1 | head -20   # العمليات النشطة
```

### **الشبكة:**
```bash
/execute ip addr               # عناوين IP
/execute netstat -tulpn        # المنافذ المفتوحة
/execute curl ifconfig.me      # IP الخارجي
```

### **الملفات:**
```bash
/execute ls -la /root          # ملفات /root
/execute cat /etc/os-release   # معلومات نظام التشغيل
/execute ps aux                # جميع العمليات
```

---

## 🔒 الأمان

### **أفضل الممارسات:**

1. ✅ **استخدم مفاتيح SSH** بدلاً من كلمات المرور
2. ✅ **قم بتعطيل المنافذ غير المستخدمة** على الفايروول
3. ✅ **راقب سجلات SSH** بانتظام:
   ```bash
   /execute tail -50 /var/log/auth.log
   ```
4. ✅ **غيّر منفذ SSH الافتراضي** من 22 إلى منفذ آخر
5. ✅ **استخدم fail2ban** لحماية من الهجمات

---

## 🆘 استكشاف الأخطاء

### **خطأ: "Connection refused"**
- تأكد من تشغيل SSH على VPS: `/execute systemctl status sshd`
- تأكد من المنفذ الصحيح (22 افتراضياً)
- تأكد من الفايروول يسمح بالمنفذ 22

### **خطأ: "Permission denied"**
- تأكد من `ssh_username` صحيح (root)
- تأكد من كلمة المرور أو المفتاح الخاص صحيح
- تأكد من صلاحيات `~/.ssh/authorized_keys` هي 600

### **خطأ: "Host key verification failed"**
- أضف السيرفر للـ known_hosts أول مرة:
  ```bash
  ssh root@46.202.159.100
  # اكتب yes
  ```

---

## 📊 معلومات السيرفر الحالي

- **ID:** `28c79ad5-56e1-4b2a-9d53-275e8702d9a7`
- **الاسم:** VPS-1
- **Host:** `46.202.159.100`
- **SSH Port:** `22`
- **Username:** `root`
- **SSH Enabled:** ✅ نعم
- **الحالة:** جاهز للاختبار

---

## 🎉 الخطوات التالية

1. **اختر طريقة إعداد SSH** من الأعلى
2. **نفذ الخطوات**
3. **جرب أمر `/execute hostname`** في Telegram
4. **استمتع بالتحكم الكامل في سيرفرك!** 🚀

---

**تم إنشاء هذا الدليل: 5 نوفمبر 2025**
**النظام جاهز بنسبة 100%** ✅
