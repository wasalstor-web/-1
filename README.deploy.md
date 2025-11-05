# 🚀 نشر منصة مبسط AI على Hostinger - دليل سريع

## ⚡ النشر السريع (خطوة واحدة)

```bash
bash deploy.sh 46.202.159.100 root
```

**هذا كل شيء!** السكريبت سيقوم بكل شيء تلقائياً ✨

---

## 📝 ما يحدث عند تشغيل السكريبت؟

السكريبت سيقوم بـ **10 خطوات تلقائياً**:

1. ✅ اختبار الاتصال SSH
2. ✅ تحديث نظام Ubuntu
3. ✅ تثبيت Node.js 20
4. ✅ تثبيت PostgreSQL
5. ✅ تثبيت PM2 (Process Manager)
6. ✅ تثبيت Nginx (Web Server)
7. ✅ إنشاء مجلد `/var/www/mubsat-ai`
8. ✅ رفع جميع ملفات المشروع
9. ✅ إعداد قاعدة البيانات PostgreSQL
10. ✅ تشغيل التطبيق + تكوين Nginx + Firewall

**المدة**: 5-10 دقائق فقط! ⏱️

---

## 🎯 بعد النشر

التطبيق سيعمل على:

```
http://46.202.159.100
```

### 📊 أوامر إدارة التطبيق

```bash
# عرض حالة التطبيق
ssh root@46.202.159.100 "pm2 status"

# عرض السجلات المباشرة
ssh root@46.202.159.100 "pm2 logs mubsat-ai"

# إعادة تشغيل التطبيق
ssh root@46.202.159.100 "pm2 restart mubsat-ai"
```

---

## 🔄 تحديث التطبيق لاحقاً

عندما تقوم بتعديلات على المشروع في Replit، ببساطة شغل:

```bash
bash deploy.sh 46.202.159.100 root
```

السكريبت **ذكي** - سيتعرف على التطبيق الموجود ويحدثه بدلاً من التثبيت من الصفر! 🧠

---

## 🔐 خطوات إضافية (اختيارية)

### 1. تحديث كلمة سر قاعدة البيانات

```bash
ssh root@46.202.159.100
nano /var/www/mubsat-ai/.env
```

غير `change_this_password_123` إلى كلمة سر قوية

### 2. إضافة API Keys

أضف مفاتيح API في ملف `.env`:
```env
OPENAI_API_KEY=sk-your-key
ANTHROPIC_API_KEY=sk-ant-your-key
GOOGLE_API_KEY=your-google-key
```

### 3. إعداد SSL (للنطاق)

إذا كان لديك نطاق (domain):

```bash
ssh root@46.202.159.100
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 📚 دليل مفصل

لمزيد من التفاصيل، راجع: **[DEPLOYMENT.md](./DEPLOYMENT.md)**

---

## 🆘 حل المشاكل السريع

### التطبيق لا يعمل؟

```bash
# تحقق من PM2
ssh root@46.202.159.100 "pm2 logs mubsat-ai --lines 50"

# أعد تشغيل التطبيق
ssh root@46.202.159.100 "pm2 restart mubsat-ai"
```

### لا يمكن الوصول من الإنترنت؟

```bash
# تحقق من Nginx
ssh root@46.202.159.100 "sudo systemctl status nginx"

# أعد تشغيل Nginx
ssh root@46.202.159.100 "sudo systemctl restart nginx"
```

---

## 📞 مساعدة إضافية

راجع **[DEPLOYMENT.md](./DEPLOYMENT.md)** للدليل الكامل مع:
- النشر اليدوي خطوة بخطوة
- حل جميع المشاكل الشائعة
- إعداد SSL والنطاق
- النسخ الاحتياطية
- المراقبة والصيانة

---

**🎉 استمتع بمنصة مبسط AI على Hostinger! 🚀**
