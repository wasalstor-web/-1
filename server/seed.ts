import { PostgresStorage } from './postgres-storage';

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not configured');
    process.exit(1);
  }

  const storage = new PostgresStorage(process.env.DATABASE_URL);
  
  console.log('🌱 Seeding database...');

  // Seed Categories
  const categoriesData = [
    { name: 'بوتات المحادثة', slug: 'chatbots', description: 'بوتات ذكية للمحادثة وخدمة العملاء', icon: 'MessageSquare' },
    { name: 'توليد المحتوى', slug: 'content-generation', description: 'أدوات لإنشاء المحتوى النصي والمرئي', icon: 'FileText' },
    { name: 'تحليل البيانات', slug: 'data-analysis', description: 'أنظمة تحليل ذكية للبيانات', icon: 'BarChart' },
    { name: 'التصميم والإبداع', slug: 'design-creativity', description: 'أدوات توليد الصور والتصاميم', icon: 'Palette' },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const existing = await storage.getCategoryBySlug(cat.slug);
    if (!existing) {
      const created = await storage.createCategory(cat);
      categories.push(created);
      console.log(`✅ Created category: ${cat.name}`);
    } else {
      categories.push(existing);
      console.log(`⏭️  Category already exists: ${cat.name}`);
    }
  }

  // Seed Products
  const productsData = [
    {
      name: 'ChatBot Pro - بوت خدمة العملاء الذكي',
      slug: 'chatbot-pro',
      description: 'بوت محادثة ذكي متقدم يعمل بتقنية GPT-4، يدعم اللغة العربية بشكل كامل ويمكن دمجه مع WhatsApp وTelegram وموقعك الإلكتروني.',
      shortDescription: 'بوت محادثة ذكي بتقنية GPT-4 يدعم العربية والإنجليزية',
      price: '299.00',
      categoryId: categories[0].id,
      image: '/api/placeholder/400/300',
      features: [
        'دعم كامل للغة العربية والإنجليزية',
        'تكامل مع WhatsApp, Telegram, وWebsite',
        'لوحة تحكم شاملة لإدارة المحادثات',
        'تحليلات متقدمة لأداء البوت',
        'تدريب مخصص على بياناتك',
        'دعم فني 24/7'
      ],
      sourceType: 'github',
      isFeatured: true,
    },
    {
      name: 'AI Content Writer - كاتب المحتوى الذكي',
      slug: 'ai-content-writer',
      description: 'أداة متقدمة لتوليد المحتوى باستخدام GPT-4، مثالية للمدونات، مواقع التواصل، والمقالات التسويقية.',
      shortDescription: 'توليد محتوى احترافي بالذكاء الاصطناعي',
      price: '199.00',
      categoryId: categories[1].id,
      image: '/api/placeholder/400/300',
      features: [
        'توليد مقالات كاملة بالعربية',
        'SEO optimization تلقائي',
        'تحرير وتنسيق ذكي',
        '50+ قالب جاهز',
        'فحص الانتحال المدمج'
      ],
      sourceType: 'download',
      isFeatured: true,
    },
    {
      name: 'Smart Analytics AI - محلل البيانات الذكي',
      slug: 'smart-analytics-ai',
      description: 'نظام تحليل بيانات متقدم يستخدم الذكاء الاصطناعي لاستخراج insights قيمة من بياناتك.',
      shortDescription: 'تحليل بيانات ذكي مع تقارير تفاعلية',
      price: '249.00',
      categoryId: categories[2].id,
      image: '/api/placeholder/400/300',
      features: [
        'تحليل تلقائي للبيانات',
        'تقارير مرئية تفاعلية',
        'توقعات مستقبلية بالـ ML',
        'دعم CSV, Excel, SQL',
        'لوحات تحكم قابلة للتخصيص'
      ],
      sourceType: 'api',
      isFeatured: true,
    },
    {
      name: 'AI Image Generator Pro',
      slug: 'ai-image-generator-pro',
      description: 'أداة توليد صور احترافية باستخدام DALL-E 3 و Midjourney، مثالية للمصممين والمسوقين.',
      shortDescription: 'توليد صور فريدة بالذكاء الاصطناعي',
      price: '179.00',
      categoryId: categories[3].id,
      image: '/api/placeholder/400/300',
      features: [
        'توليد صور عالية الجودة',
        'تحرير ذكي للصور',
        '100+ أسلوب فني',
        'واجهة سهلة الاستخدام',
        'تصدير بجودة 4K'
      ],
      sourceType: 'api',
      isFeatured: true,
    },
    {
      name: 'LangChain Agent Builder',
      slug: 'langchain-agent',
      description: 'بناء وتشغيل AI agents متقدمة باستخدام LangChain، مفتوح المصدر وقابل للتخصيص بالكامل.',
      shortDescription: 'بناء AI agents مخصصة باستخدام LangChain',
      price: '149.00',
      categoryId: categories[0].id,
      image: '/api/placeholder/400/300',
      features: [
        'مفتوح المصدر 100%',
        'دعم multiple LLMs',
        'Memory وContext management',
        'Tools وFunction calling',
        'أمثلة جاهزة للاستخدام'
      ],
      sourceType: 'github',
      isFeatured: true,
    },
    {
      name: 'RAG Document Chat Bot',
      slug: 'rag-document-bot',
      description: 'بوت محادثة ذكي يفهم مستنداتك ويجيب على الأسئلة بدقة باستخدام تقنية RAG.',
      shortDescription: 'محادثة ذكية مع مستنداتك بتقنية RAG',
      price: '129.00',
      categoryId: categories[0].id,
      image: '/api/placeholder/400/300',
      features: [
        'فهم PDF, Word, Excel',
        'بحث دلالي متقدم',
        'إجابات دقيقة مع المصادر',
        'دعم ملفات متعددة',
        'مفتوح المصدر'
      ],
      sourceType: 'github',
      isFeatured: true,
    },
  ];

  for (const product of productsData) {
    const existing = await storage.getProductBySlug(product.slug);
    if (!existing) {
      await storage.createProduct(product);
      console.log(`✅ Created product: ${product.name}`);
    } else {
      console.log(`⏭️  Product already exists: ${product.name}`);
    }
  }

  console.log('🎉 Seeding completed successfully!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
