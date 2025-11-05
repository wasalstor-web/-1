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
  type InsertOrderItem
} from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private conversations: Map<string, Conversation>;
  private categories: Map<string, Category>;
  private products: Map<string, Product>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.conversations = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
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
    const user: User = { ...insertUser, id };
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
}

export const storage = new MemStorage();
