import { 
  type User, 
  type InsertUser,
  type Project,
  type InsertProject,
  type Conversation,
  type InsertConversation,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type AiConversation,
  type InsertAiConversation,
  type AiMessage,
  type InsertAiMessage,
  type TelegramUser,
  type InsertTelegramUser,
  type Server,
  type InsertServer,
  type ServerCommand,
  type InsertServerCommand
} from "@shared/schema";
import { randomUUID } from "crypto";
import { hashPassword } from "./utils/auth";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project methods
  getAllProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  
  // Conversation methods
  getConversationsByProject(projectId: string): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  deleteConversation(id: string): Promise<boolean>;

  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  
  // Order methods
  getOrdersByUser(userId: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;

  // AI Conversation methods
  getAllAiConversations(userId?: string): Promise<AiConversation[]>;
  getAiConversation(id: string): Promise<AiConversation | undefined>;
  createAiConversation(conversation: InsertAiConversation): Promise<AiConversation>;
  updateAiConversation(id: string, updates: Partial<InsertAiConversation>): Promise<AiConversation | undefined>;
  deleteAiConversation(id: string): Promise<boolean>;
  
  // AI Message methods
  getMessagesByConversation(conversationId: string): Promise<AiMessage[]>;
  createAiMessage(message: InsertAiMessage): Promise<AiMessage>;

  // Telegram User methods
  getTelegramUser(telegramUserId: number): Promise<TelegramUser | undefined>;
  createTelegramUser(user: InsertTelegramUser): Promise<TelegramUser>;
  updateTelegramUser(telegramUserId: number, updates: Partial<InsertTelegramUser>): Promise<TelegramUser | undefined>;

  // Server methods
  getAllServers(): Promise<Server[]>;
  getServer(id: string): Promise<Server | undefined>;
  createServer(server: InsertServer): Promise<Server>;
  updateServerPing(id: string): Promise<void>;
  deleteServer(id: string): Promise<boolean>;
  
  // Server Command methods
  createServerCommand(command: InsertServerCommand): Promise<ServerCommand>;
  getPendingCommands(serverId: string): Promise<ServerCommand[]>;
  completeServerCommand(commandId: string, result: string, exitCode: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private conversations: Map<string, Conversation>;
  private categories: Map<string, Category>;
  private products: Map<string, Product>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;
  private aiConversations: Map<string, AiConversation>;
  private aiMessages: Map<string, AiMessage>;
  private telegramUsers: Map<number, TelegramUser>;
  private servers: Map<string, Server>;
  private serverCommands: Map<string, ServerCommand>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.conversations = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.aiConversations = new Map();
    this.aiMessages = new Map();
    this.telegramUsers = new Map();
    this.servers = new Map();
    this.serverCommands = new Map();
    this.seedData();
  }

  private seedData() {
    // Seed Categories
    const categories = [
      { id: randomUUID(), name: 'بوتات المحادثة', slug: 'chatbots', description: 'بوتات ذكية للمحادثة وخدمة العملاء', icon: 'MessageSquare', createdAt: new Date() },
      { id: randomUUID(), name: 'توليد المحتوى', slug: 'content-generation', description: 'أدوات لإنشاء المحتوى النصي والمرئي', icon: 'FileText', createdAt: new Date() },
      { id: randomUUID(), name: 'تحليل البيانات', slug: 'data-analysis', description: 'أنظمة تحليل ذكية للبيانات', icon: 'BarChart', createdAt: new Date() },
      { id: randomUUID(), name: 'التصميم والإبداع', slug: 'design-creativity', description: 'أدوات توليد الصور والتصاميم', icon: 'Palette', createdAt: new Date() },
    ];

    categories.forEach(cat => this.categories.set(cat.id, cat as Category));

    // Seed Products
    const products = [
      {
        id: randomUUID(),
        name: 'ChatBot Pro - بوت خدمة العملاء الذكي',
        slug: 'chatbot-pro',
        description: 'بوت محادثة ذكي متقدم يعمل بتقنية GPT-4، يدعم اللغة العربية بشكل كامل ويمكن دمجه مع WhatsApp وTelegram وموقعك الإلكتروني. يتعلم من محادثات عملائك ويحسن أداءه تلقائياً.',
        shortDescription: 'بوت محادثة ذكي بتقنية GPT-4 يدعم العربية والإنجليزية',
        price: '299.00',
        categoryId: categories[0].id,
        image: '/api/placeholder/400/300',
        features: [
          'دعم كامل للغة العربية والإنجليزية',
          'تكامل مع WhatsApp, Telegram, وWebsite',
          'لوحة تحكم شاملة لإدارة المحادثات',
          'تحليلات ذكية لسلوك العملاء',
          'قاعدة معرفية قابلة للتخصيص',
          'ردود تلقائية ذكية',
          'دعم الملفات والصور',
          'تحديثات مجانية لمدة سنة'
        ],
        demoUrl: '/demo/chatbot-pro',
        sourceType: 'download',
        rating: '4.8',
        totalSales: 142,
        isFeatured: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: 'AI Content Writer - كاتب المحتوى الذكي',
        slug: 'ai-content-writer',
        description: 'نظام متكامل لكتابة المحتوى بالذكاء الاصطناعي. يولد مقالات، منشورات سوشيال ميديا، أوصاف منتجات، ومحتوى تسويقي احترافي بدقة عالية. يدعم أكثر من 50 قالب جاهز.',
        shortDescription: 'اكتب محتوى احترافي بسرعة فائقة باستخدام الذكاء الاصطناعي',
        price: '199.00',
        categoryId: categories[1].id,
        image: '/api/placeholder/400/300',
        features: [
          'أكثر من 50 قالب محتوى جاهز',
          'كتابة مقالات طويلة (حتى 5000 كلمة)',
          'تحسين SEO تلقائي',
          'كتابة محتوى سوشيال ميديا',
          'توليد عناوين جذابة',
          'تدقيق لغوي ذكي',
          'دعم العربية والإنجليزية',
          'API مفتوح للتكامل'
        ],
        demoUrl: '/demo/content-writer',
        sourceType: 'download',
        rating: '4.9',
        totalSales: 218,
        isFeatured: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: 'AI Image Generator - مولد الصور الذكي',
        slug: 'ai-image-generator',
        description: 'أداة قوية لتوليد الصور باستخدام Stable Diffusion و DALL-E. أنشئ صور احترافية من نص عربي أو إنجليزي، مع إمكانية التحكم الكامل في الأنماط والأحجام.',
        shortDescription: 'ولّد صور احترافية من النص باستخدام أحدث تقنيات AI',
        price: '249.00',
        categoryId: categories[3].id,
        image: '/api/placeholder/400/300',
        features: [
          'دعم Stable Diffusion و DALL-E',
          'توليد صور عالية الدقة',
          'أكثر من 30 نمط فني',
          'تحرير الصور بالذكاء الاصطناعي',
          'إزالة الخلفية تلقائياً',
          'تكبير الصور بدقة AI',
          'معرض صور مدمج',
          'API سهل الاستخدام'
        ],
        demoUrl: '/demo/image-generator',
        sourceType: 'api',
        rating: '4.7',
        totalSales: 186,
        isFeatured: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: 'Data Analyzer Pro - محلل البيانات الذكي',
        slug: 'data-analyzer-pro',
        description: 'نظام تحليل بيانات متقدم يستخدم الذكاء الاصطناعي لفهم بياناتك وتقديم رؤى قيمة. يدعم CSV, Excel, JSON، ويولد تقارير تفاعلية وتنبؤات ذكية.',
        shortDescription: 'حلل بياناتك واحصل على رؤى ذكية تلقائياً',
        price: '349.00',
        categoryId: categories[2].id,
        image: '/api/placeholder/400/300',
        features: [
          'استيراد من CSV, Excel, JSON',
          'تحليل إحصائي متقدم',
          'رسوم بيانية تفاعلية',
          'كشف الأنماط والاتجاهات',
          'تنبؤات ذكية',
          'تقارير قابلة للتصدير',
          'لوحة تحكم قابلة للتخصيص',
          'تكامل مع Google Sheets'
        ],
        demoUrl: '/demo/data-analyzer',
        sourceType: 'hosted',
        rating: '4.6',
        totalSales: 94,
        isFeatured: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: 'Voice Assistant AI - المساعد الصوتي الذكي',
        slug: 'voice-assistant-ai',
        description: 'مساعد صوتي ذكي يفهم الأوامر باللغة العربية والإنجليزية. يمكن دمجه في تطبيقات الجوال والويب، مع دعم التعرف على الصوت وتحويل النص إلى كلام.',
        shortDescription: 'مساعد صوتي ذكي يفهم العربية ويتفاعل بطبيعية',
        price: '399.00',
        categoryId: categories[0].id,
        image: '/api/placeholder/400/300',
        features: [
          'تعرف على الصوت بدقة عالية',
          'تحويل نص لكلام طبيعي',
          'دعم العربية والإنجليزية',
          'تكامل مع Alexa و Google Home',
          'أوامر صوتية قابلة للتخصيص',
          'معالجة اللغة الطبيعية',
          'SDK للجوال والويب',
          'تحديثات دورية'
        ],
        sourceType: 'api',
        rating: '4.5',
        totalSales: 67,
        isFeatured: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: 'Smart Email Assistant - مساعد البريد الذكي',
        slug: 'smart-email-assistant',
        description: 'نظام ذكي لإدارة البريد الإلكتروني يصنف رسائلك، يولد ردود تلقائية، ويساعدك في كتابة رسائل احترافية. يوفر ساعات من وقتك اليومي.',
        shortDescription: 'اجعل بريدك الإلكتروني أكثر ذكاءً وكفاءة',
        price: '149.00',
        categoryId: categories[1].id,
        image: '/api/placeholder/400/300',
        features: [
          'تصنيف تلقائي للرسائل',
          'كشف البريد المزعج المتقدم',
          'اقتراحات ردود ذكية',
          'كتابة رسائل احترافية',
          'جدولة إرسال الرسائل',
          'تلخيص الرسائل الطويلة',
          'تكامل مع Gmail و Outlook',
          'تنبيهات ذكية'
        ],
        sourceType: 'download',
        rating: '4.4',
        totalSales: 123,
        isFeatured: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: 'LangChain Agent - وكيل متعدد الأدوات',
        slug: 'langchain-agent',
        description: 'وكيل ذكي مبني على LangChain مفتوح المصدر. يستطيع استخدام أدوات متعددة مثل البحث في الويب، الحسابات الرياضية، قراءة الملفات، والتفاعل مع APIs. مثالي لأتمتة المهام المعقدة.',
        shortDescription: 'وكيل ذكي يستخدم أدوات متعددة لإنجاز المهام تلقائياً',
        price: '99.00',
        categoryId: categories[0].id,
        image: '/api/placeholder/400/300',
        features: [
          'مبني على LangChain مفتوح المصدر',
          'دعم أكثر من 20 أداة جاهزة',
          'البحث في الويب وGoogle',
          'تنفيذ أكواد Python',
          'قراءة ومعالجة الملفات',
          'تكامل مع APIs خارجية',
          'ذاكرة محادثة طويلة المدى',
          'كود مفتوح 100% - GitHub'
        ],
        sourceType: 'download',
        rating: '4.7',
        totalSales: 156,
        isFeatured: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: 'AutoGPT Clone - الوكيل الذاتي',
        slug: 'autogpt-clone',
        description: 'نسخة مطورة من AutoGPT الشهير. وكيل ذكي ذاتي التشغيل يحلل الأهداف، يخطط، وينفذ المهام تلقائياً دون تدخل بشري. يمكنه البحث، الكتابة، البرمجة، وإدارة الملفات.',
        shortDescription: 'وكيل ذاتي ينفذ المهام المعقدة بشكل مستقل',
        price: '179.00',
        categoryId: categories[0].id,
        image: '/api/placeholder/400/300',
        features: [
          'وكيل ذاتي التشغيل والتفكير',
          'تخطيط تلقائي للمهام',
          'تنفيذ متعدد الخطوات',
          'ذاكرة طويلة المدى',
          'بحث ذكي في الإنترنت',
          'كتابة وتنفيذ أكواد',
          'إدارة ملفات تلقائية',
          'مفتوح المصدر - قابل للتخصيص'
        ],
        sourceType: 'download',
        rating: '4.6',
        totalSales: 89,
        isFeatured: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: 'RAG Document Bot - بوت المستندات الذكي',
        slug: 'rag-document-bot',
        description: 'نظام RAG (Retrieval Augmented Generation) متقدم. حمّل مستنداتك (PDF, Word, TXT) واطرح أسئلة عليها بالعربية أو الإنجليزية. يستخدم ChromaDB وLangChain للبحث الدقيق.',
        shortDescription: 'اسأل مستنداتك أسئلة واحصل على إجابات دقيقة فوراً',
        price: '129.00',
        categoryId: categories[2].id,
        image: '/api/placeholder/400/300',
        features: [
          'تقنية RAG المتقدمة',
          'دعم PDF, Word, Excel, TXT',
          'بحث دلالي (Semantic Search)',
          'ChromaDB للتخزين المتجه',
          'استخراج معلومات دقيقة',
          'دعم مستندات عربية',
          'API بسيط للتكامل',
          'كود مفتوح على GitHub'
        ],
        sourceType: 'download',
        rating: '4.8',
        totalSales: 201,
        isFeatured: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: 'Code Interpreter - مفسر الأكواد الذكي',
        slug: 'code-interpreter',
        description: 'مفسر أكواد Python ذكي يشبه ChatGPT Code Interpreter. ينفذ أكواد، يحلل بيانات، يرسم رسوم بيانية، ويعالج الملفات. مثالي لتحليل البيانات والأتمتة.',
        shortDescription: 'نفذ أكواد Python وحلل البيانات بذكاء اصطناعي',
        price: '169.00',
        categoryId: categories[2].id,
        image: '/api/placeholder/400/300',
        features: [
          'تنفيذ أكواد Python آمن',
          'تحليل ملفات CSV, Excel',
          'رسوم بيانية تفاعلية',
          'معالجة صور وفيديو',
          'حسابات رياضية معقدة',
          'مكتبات علمية (Pandas, NumPy)',
          'بيئة معزولة آمنة',
          'مفتوح المصدر بالكامل'
        ],
        sourceType: 'download',
        rating: '4.9',
        totalSales: 167,
        isFeatured: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: 'CrewAI Team - فريق الوكلاء التعاوني',
        slug: 'crewai-team',
        description: 'نظام وكلاء متعددين يعملون كفريق. مبني على CrewAI مفتوح المصدر. كل وكيل له دور محدد (باحث، كاتب، مبرمج، محلل) ويتعاونون لإنجاز مهام معقدة.',
        shortDescription: 'فريق وكلاء ذكيين يتعاونون لإنجاز المهام المعقدة',
        price: '279.00',
        categoryId: categories[0].id,
        image: '/api/placeholder/400/300',
        features: [
          'مبني على CrewAI Framework',
          'وكلاء متعددين متخصصين',
          'تعاون ذكي بين الوكلاء',
          'أدوار قابلة للتخصيص',
          'إدارة مهام معقدة',
          'تخطيط تعاوني',
          'نتائج احترافية',
          'كود مفتوح - GitHub'
        ],
        sourceType: 'download',
        rating: '4.7',
        totalSales: 78,
        isFeatured: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: 'LlamaIndex Search - محرك البحث الذكي',
        slug: 'llamaindex-search',
        description: 'محرك بحث ذكي مبني على LlamaIndex. يفهرس بياناتك (مستندات، مواقع، قواعد بيانات) ويتيح البحث الدلالي المتقدم. يدعم العربية بشكل كامل.',
        shortDescription: 'ابحث في بياناتك بذكاء باستخدام البحث الدلالي',
        price: '139.00',
        categoryId: categories[2].id,
        image: '/api/placeholder/400/300',
        features: [
          'مبني على LlamaIndex',
          'بحث دلالي متقدم',
          'فهرسة تلقائية للبيانات',
          'دعم مصادر متعددة',
          'استعلامات باللغة الطبيعية',
          'نتائج دقيقة وسريعة',
          'تكامل سهل',
          'مفتوح المصدر'
        ],
        sourceType: 'download',
        rating: '4.6',
        totalSales: 112,
        isFeatured: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: 'Ollama Local LLM - نموذج لغوي محلي',
        slug: 'ollama-local-llm',
        description: 'نظام كامل لتشغيل نماذج لغوية محلياً باستخدام Ollama. شغّل Llama 3, Mistral, CodeLlama وغيرها على جهازك دون الحاجة لإنترنت. خصوصية 100%.',
        shortDescription: 'شغّل نماذج AI قوية على جهازك دون إنترنت',
        price: '0.00',
        categoryId: categories[0].id,
        image: '/api/placeholder/400/300',
        features: [
          'تشغيل محلي بدون إنترنت',
          'دعم Llama 3, Mistral, Phi',
          'خصوصية كاملة - بياناتك آمنة',
          'واجهة سهلة الاستخدام',
          'API متوافق مع OpenAI',
          'نماذج متعددة الأحجام',
          'مجاني بالكامل',
          'مفتوح المصدر - Ollama'
        ],
        sourceType: 'download',
        rating: '4.9',
        totalSales: 423,
        isFeatured: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: 'Zapier Alternative - موصل التطبيقات',
        slug: 'zapier-alternative',
        description: 'بديل مفتوح لـ Zapier. وصّل تطبيقاتك وأتمت المهام بين مئات الخدمات. مبني على n8n مفتوح المصدر. صمم workflows بصرياً واربط APIs بسهولة.',
        shortDescription: 'أتمت المهام بين التطبيقات بدون كود',
        price: '89.00',
        categoryId: categories[1].id,
        image: '/api/placeholder/400/300',
        features: [
          'مبني على n8n مفتوح المصدر',
          'واجهة بصرية سهلة',
          '+300 تكامل جاهز',
          'Webhooks ومجدولات',
          'معالجة بيانات متقدمة',
          'شروط ومنطق ذكي',
          'تشغيل محلي أو سحابي',
          'بديل مجاني لـ Zapier'
        ],
        sourceType: 'download',
        rating: '4.8',
        totalSales: 194,
        isFeatured: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    products.forEach(prod => this.products.set(prod.id, prod as Product));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await hashPassword(insertUser.password);
    const user: User = { 
      ...insertUser, 
      id,
      password: hashedPassword,
    };
    this.users.set(id, user);
    return user;
  }

  // Project methods
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const now = new Date();
    const project: Project = {
      id,
      name: insertProject.name,
      description: insertProject.description ?? null,
      status: insertProject.status ?? 'draft',
      progress: insertProject.progress ?? 0,
      aiModel: insertProject.aiModel ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updated: Project = {
      ...project,
      ...updates,
      updatedAt: new Date(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    // Also delete associated conversations
    const conversations = Array.from(this.conversations.values())
      .filter(c => c.projectId === id);
    conversations.forEach(c => this.conversations.delete(c.id));
    
    return this.projects.delete(id);
  }

  // Conversation methods
  async getConversationsByProject(projectId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(c => c.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = {
      id,
      projectId: insertConversation.projectId ?? null,
      aiModel: insertConversation.aiModel,
      messages: insertConversation.messages,
      createdAt: new Date(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async deleteConversation(id: string): Promise<boolean> {
    return this.conversations.delete(id);
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(c => c.slug === slug);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      id,
      name: insertCategory.name,
      slug: insertCategory.slug,
      description: insertCategory.description ?? null,
      icon: insertCategory.icon ?? null,
      createdAt: new Date(),
    };
    this.categories.set(id, category);
    return category;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(p => p.isActive)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(p => p.categoryId === categoryId && p.isActive);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(p => p.isFeatured && p.isActive)
      .slice(0, 6);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(p => p.slug === slug);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const now = new Date();
    const product: Product = {
      id,
      name: insertProduct.name,
      slug: insertProduct.slug,
      description: insertProduct.description,
      shortDescription: insertProduct.shortDescription ?? null,
      price: insertProduct.price,
      categoryId: insertProduct.categoryId ?? null,
      image: insertProduct.image ?? null,
      images: insertProduct.images ?? null,
      features: insertProduct.features ?? null,
      demoUrl: insertProduct.demoUrl ?? null,
      downloadUrl: insertProduct.downloadUrl ?? null,
      apiDocUrl: insertProduct.apiDocUrl ?? null,
      sourceType: insertProduct.sourceType ?? 'download',
      rating: insertProduct.rating ?? '0',
      totalSales: 0,
      isFeatured: insertProduct.isFeatured ?? false,
      isActive: insertProduct.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updated: Product = {
      ...product,
      ...updates,
      updatedAt: new Date(),
    };
    this.products.set(id, updated);
    return updated;
  }

  // Order methods
  async getOrdersByUser(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const now = new Date();
    const order: Order = {
      id,
      userId: insertOrder.userId ?? null,
      totalAmount: insertOrder.totalAmount,
      status: insertOrder.status ?? 'pending',
      paymentMethod: insertOrder.paymentMethod ?? null,
      paymentStatus: insertOrder.paymentStatus ?? 'pending',
      createdAt: now,
      updatedAt: now,
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values())
      .filter(item => item.orderId === orderId);
  }

  async createOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const item: OrderItem = {
      id,
      orderId: insertItem.orderId ?? null,
      productId: insertItem.productId ?? null,
      price: insertItem.price,
      quantity: insertItem.quantity ?? 1,
      createdAt: new Date(),
    };
    this.orderItems.set(id, item);
    return item;
  }

  // AI Conversation methods
  async getAllAiConversations(userId?: string): Promise<AiConversation[]> {
    let convs = Array.from(this.aiConversations.values());
    if (userId) {
      convs = convs.filter(c => c.userId === userId);
    }
    return convs.sort((a, b) => 
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }

  async getAiConversation(id: string): Promise<AiConversation | undefined> {
    return this.aiConversations.get(id);
  }

  async createAiConversation(insertConv: InsertAiConversation): Promise<AiConversation> {
    const id = randomUUID();
    const now = new Date();
    const conversation: AiConversation = {
      id,
      userId: insertConv.userId ?? null,
      title: insertConv.title,
      context: insertConv.context ?? 'general',
      lastMessageAt: now,
      createdAt: now,
    };
    this.aiConversations.set(id, conversation);
    return conversation;
  }

  async updateAiConversation(id: string, updates: Partial<InsertAiConversation>): Promise<AiConversation | undefined> {
    const conv = this.aiConversations.get(id);
    if (!conv) return undefined;
    
    const updated: AiConversation = {
      ...conv,
      ...updates,
      lastMessageAt: new Date(),
    };
    this.aiConversations.set(id, updated);
    return updated;
  }

  async deleteAiConversation(id: string): Promise<boolean> {
    const deleted = this.aiConversations.delete(id);
    if (deleted) {
      Array.from(this.aiMessages.values())
        .filter(msg => msg.conversationId === id)
        .forEach(msg => this.aiMessages.delete(msg.id));
    }
    return deleted;
  }

  // AI Message methods
  async getMessagesByConversation(conversationId: string): Promise<AiMessage[]> {
    return Array.from(this.aiMessages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createAiMessage(insertMsg: InsertAiMessage): Promise<AiMessage> {
    const id = randomUUID();
    const message: AiMessage = {
      id,
      conversationId: insertMsg.conversationId,
      role: insertMsg.role,
      content: insertMsg.content,
      codeSnippets: insertMsg.codeSnippets ?? null,
      interactiveOptions: insertMsg.interactiveOptions ?? null,
      status: insertMsg.status ?? 'sent',
      createdAt: new Date(),
    };
    this.aiMessages.set(id, message);
    
    await this.updateAiConversation(insertMsg.conversationId, {});
    
    return message;
  }

  // Telegram User methods
  async getTelegramUser(telegramUserId: number): Promise<TelegramUser | undefined> {
    return this.telegramUsers.get(telegramUserId);
  }

  async createTelegramUser(insertUser: InsertTelegramUser): Promise<TelegramUser> {
    const id = randomUUID();
    const user: TelegramUser = {
      id,
      telegramUserId: insertUser.telegramUserId,
      username: insertUser.username ?? null,
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      selectedModel: insertUser.selectedModel ?? 'gpt-4o-mini',
      conversationHistory: insertUser.conversationHistory ?? '[]',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.telegramUsers.set(insertUser.telegramUserId, user);
    return user;
  }

  async updateTelegramUser(telegramUserId: number, updates: Partial<InsertTelegramUser>): Promise<TelegramUser | undefined> {
    const existing = this.telegramUsers.get(telegramUserId);
    if (!existing) return undefined;

    const updated: TelegramUser = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.telegramUsers.set(telegramUserId, updated);
    return updated;
  }

  // Server methods
  async getAllServers(): Promise<Server[]> {
    return Array.from(this.servers.values());
  }

  async getServer(id: string): Promise<Server | undefined> {
    return this.servers.get(id);
  }

  async createServer(server: InsertServer): Promise<Server> {
    const newServer: Server = {
      id: randomUUID(),
      ...server,
      isActive: server.isActive ?? true,
      port: server.port ?? 45000,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastPing: null,
    };
    this.servers.set(newServer.id, newServer);
    return newServer;
  }

  async updateServerPing(id: string): Promise<void> {
    const server = this.servers.get(id);
    if (server) {
      server.lastPing = new Date();
      server.updatedAt = new Date();
      this.servers.set(id, server);
    }
  }

  async deleteServer(id: string): Promise<boolean> {
    return this.servers.delete(id);
  }
  
  async createServerCommand(command: InsertServerCommand): Promise<ServerCommand> {
    const cmd: ServerCommand = {
      id: randomUUID(),
      ...command,
      status: 'pending',
      result: null,
      exitCode: null,
      createdAt: new Date(),
      executedAt: null
    };
    this.serverCommands.set(cmd.id, cmd);
    return cmd;
  }
  
  async getPendingCommands(serverId: string): Promise<ServerCommand[]> {
    return Array.from(this.serverCommands.values())
      .filter(cmd => cmd.serverId === serverId && cmd.status === 'pending')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async completeServerCommand(commandId: string, result: string, exitCode: number): Promise<void> {
    const cmd = this.serverCommands.get(commandId);
    if (cmd) {
      cmd.status = 'completed';
      cmd.result = result;
      cmd.exitCode = exitCode;
      cmd.executedAt = new Date();
      this.serverCommands.set(commandId, cmd);
    }
  }
}

// Choose storage based on DATABASE_URL
import { PostgresStorage } from './postgres-storage';

export const storage = process.env.DATABASE_URL
  ? new PostgresStorage(process.env.DATABASE_URL)
  : new MemStorage();
