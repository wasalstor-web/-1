# 🌟 منصة مبسط AI - Mubsat AI Platform

<div dir="rtl">

**منصة B2B SaaS متكاملة للذكاء الاصطناعي** - الجيل القادم من أدوات AI للأعمال

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)

</div>

---

## 🚀 المميزات الرئيسية

### 🧠 **Advanced Smart Agent**
وكيل ذكي متقدم يشبه Replit Agent - يفكر، يخطط، ينفذ، ويتطور ذاتياً
- **التفكير المتقدم**: تحليل عميق للمهام قبل التنفيذ
- **التخطيط الاستراتيجي**: تخطيط متعدد الخطوات
- **التنفيذ الذاتي**: تنفيذ المهام بشكل مستقل
- **التعلم الذاتي**: يتعلم من التجارب ويحسن نفسه
- **الذاكرة الطويلة**: يحفظ السياق والتاريخ

### 💬 **Unified AI Chat Interface**
واجهة محادثة موحدة تجمع **8 نماذج AI** في مكان واحد
- **ردود متعددة متزامنة**: أرسل رسالة واحدة واحصل على ردود من جميع النماذج
- **معالجة متوازية**: جميع النماذج تعمل في نفس الوقت
- **عرض واضح**: كل رد يعرض اسم النموذج مع أيقونة مميزة

**النماذج المدعومة:**
- 🤖 **OpenAI**: GPT-4, GPT-4 Mini
- 🧠 **Anthropic**: Claude 3.5 Sonnet
- ✨ **Google**: Gemini 2.0 Flash
- 🚀 **Hugging Face**: Qwen 2.5 Coder, LLaMA 3.3, Mistral Large, DeepSeek R1

### ⚡ **AI Executive Agent vMax**
نظام تنسيق شامل مع وكلاء فرعيين متخصصين
- **Orchestrator**: منسق مركزي يدير جميع الوكلاء
- **Architect Agent**: تحليل البنية والتوصيات
- **Builder Agent**: تنفيذ الكود والبناء
- **Guardian Agent**: فحص الأمان ومنع الثغرات
- **Doctor AI**: مراقبة النظام والإصلاح الذاتي
- **Memory Agent**: ذاكرة طويلة المدى وتعلم الأنماط

---

## 🛠️ البنية التقنية

### Frontend
- **React 18+** مع TypeScript
- **Vite** للبناء السريع
- **Wouter** للتوجيه
- **TanStack Query** لإدارة البيانات
- **shadcn/ui** + **Radix UI** للمكونات
- **Tailwind CSS** مع دعم RTL والعربية

### Backend
- **Express.js** مع TypeScript
- **Drizzle ORM** + **PostgreSQL** (Neon)
- **REST API** مع دعم Streaming
- نظام Session و Authentication

### AI Integration
- **OpenAI SDK**: GPT-4, DALL-E 3, Whisper
- **Anthropic SDK**: Claude 3.5 Sonnet
- **Google Generative AI**: Gemini 2.0 Flash
- **Hugging Face Inference**: نماذج مفتوحة المصدر

---

## 📦 التثبيت والتشغيل

### المتطلبات
- **Node.js** 20+ (يُفضل 20.11.0+)
- **PostgreSQL** (أو حساب Neon)
- **API Keys** للنماذج المطلوبة

### خطوات التثبيت

```bash
# 1. استنساخ المشروع
git clone https://github.com/YOUR_USERNAME/mubsat-ai-platform.git
cd mubsat-ai-platform

# 2. تثبيت الحزم
npm install

# 3. إعداد البيئة
cp .env.example .env
# قم بتحرير .env وإضافة API Keys

# 4. إعداد قاعدة البيانات
npm run db:push

# 5. تشغيل التطبيق
npm run dev
```

التطبيق سيعمل على: **http://localhost:5000**

---

## 🔑 متغيرات البيئة المطلوبة

أنشئ ملف `.env` في المجلد الرئيسي:

```env
# قاعدة البيانات (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database

# مفاتيح نماذج AI (اختياري حسب النماذج المستخدمة)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
HUGGINGFACE_API_KEY=hf_...

# Session Secret
SESSION_SECRET=your-secret-key-here

# Telegram Bot (اختياري)
TELEGRAM_BOT_TOKEN=...
```

---

## 📚 الاستخدام

### 1. **واجهة المحادثة الموحدة**
انتقل إلى `/chat` وابدأ المحادثة مع جميع النماذج

```typescript
// مثال API Call
POST /api/ai-brain/process-all
{
  "input": "ما هو 2+2؟",
  "sessionId": "session-123",
  "userId": "user-1"
}
```

### 2. **Smart Agent**
استخدم الوكيل الذكي المتقدم للمهام المعقدة

```typescript
POST /api/smart-agent/execute
{
  "task": "حلل هذا الكود وأعطني اقتراحات للتحسين",
  "context": {}
}
```

### 3. **Executive Agent vMax**
للمهام التي تحتاج تنسيق بين وكلاء متعددين

```typescript
POST /api/executive/command
{
  "command": "deploy new feature to production",
  "userId": "user-1"
}
```

---

## 🗂️ هيكل المشروع

```
mubsat-ai-platform/
├── client/                 # تطبيق React Frontend
│   ├── src/
│   │   ├── pages/         # صفحات التطبيق
│   │   ├── components/    # مكونات UI
│   │   └── lib/           # مكتبات مساعدة
│   └── index.html
├── server/                # Express Backend
│   ├── ai-brain/          # AI Brain Core
│   ├── smart-agent/       # Advanced Smart Agent
│   ├── executive-agent/   # Executive Agent vMax
│   ├── intelligent-agent/ # Intelligent Assistant
│   └── routes.ts          # API Routes
├── shared/                # أنواع وschemas مشتركة
│   └── schema.ts
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🧪 الاختبار

```bash
# تشغيل جميع الاختبارات
npm test

# اختبارات E2E
npm run test:e2e
```

---

## 🚀 النشر

### النشر على Replit
1. افتح المشروع في Replit
2. اضبط Environment Secrets (API Keys)
3. اضغط "Run"

### النشر على Vercel/Railway/Render
```bash
# Build للإنتاج
npm run build

# التشغيل في production mode
NODE_ENV=production npm start
```

---

## 🤝 المساهمة

نرحب بالمساهمات! يرجى اتباع الخطوات التالية:

1. Fork المشروع
2. أنشئ فرع للميزة الجديدة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للفرع (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

---

## 📄 الترخيص

هذا المشروع مرخص بموجب **MIT License** - انظر ملف [LICENSE](LICENSE) للتفاصيل.

---

## 🌐 الروابط

- **المشروع الحي**: [https://mbst.space](https://mbst.space)
- **التوثيق**: [docs/](docs/)
- **المدونة**: [blog.mbst.space](https://blog.mbst.space)

---

## 👥 الفريق

تم البناء بواسطة فريق Mubsat AI Platform

---

## 📞 التواصل

- **Email**: support@mbst.space
- **Twitter**: [@MubsatAI](https://twitter.com/MubsatAI)
- **Discord**: [Join our community](https://discord.gg/mubsat-ai)

---

<div align="center">

**صُنع بـ ❤️ في السعودية**

[الموقع الرسمي](https://mbst.space) • [التوثيق](docs/) • [المدونة](https://blog.mbst.space)

</div>
