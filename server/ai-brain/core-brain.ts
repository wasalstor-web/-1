/**
 * AI Brain Core Engine
 * المحرك المركزي لاتخاذ القرارات الذكية وإدارة النماذج
 */

import { OpenAI } from "openai";
import { Anthropic } from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HfInference } from "@huggingface/inference";

export interface BrainRequest {
  userId?: string;
  sessionId: string;
  input: string;
  context?: Record<string, any>;
  intent?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface BrainResponse {
  output: string;
  model: string;
  intent: string;
  confidence: number;
  tokens: number;
  cost: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ModelConfig {
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'huggingface';
  costPerToken: number;
  maxTokens: number;
  capabilities: string[];
  priority: number;
}

export class AIBrainCore {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private gemini: GoogleGenerativeAI | null = null;
  private huggingface: HfInference | null = null;
  
  private models: Map<string, ModelConfig> = new Map();
  private analytics: Map<string, any> = new Map();
  
  constructor() {
    this.initializeModels();
    this.initializeProviders();
  }
  
  private initializeProviders() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      console.log('✅ OpenAI connected');
    }
    
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      console.log('✅ Anthropic connected');
    }
    
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log('✅ Gemini connected');
    }
    
    if (process.env.HUGGINGFACE_API_KEY) {
      this.huggingface = new HfInference(process.env.HUGGINGFACE_API_KEY);
      console.log('✅ Hugging Face connected');
    }
  }
  
  private initializeModels() {
    // GPT Models
    this.models.set('gpt-4', {
      name: 'gpt-4',
      provider: 'openai',
      costPerToken: 0.00003,
      maxTokens: 8000,
      capabilities: ['chat', 'reasoning', 'code', 'analysis'],
      priority: 1,
    });
    
    this.models.set('gpt-4o-mini', {
      name: 'gpt-4o-mini',
      provider: 'openai',
      costPerToken: 0.000001,
      maxTokens: 4000,
      capabilities: ['chat', 'quick-response'],
      priority: 3,
    });
    
    // Claude Models
    this.models.set('claude-3.5-sonnet', {
      name: 'claude-3-5-sonnet-20241022',
      provider: 'anthropic',
      costPerToken: 0.000015,
      maxTokens: 8000,
      capabilities: ['chat', 'reasoning', 'code', 'analysis', 'long-context'],
      priority: 1,
    });
    
    // Gemini Models
    this.models.set('gemini-2.0-flash', {
      name: 'gemini-2.0-flash-exp',
      provider: 'google',
      costPerToken: 0.0000001,
      maxTokens: 1000000,
      capabilities: ['chat', 'multimodal', 'fast'],
      priority: 2,
    });
    
    // Hugging Face Models
    this.models.set('qwen-2.5-coder', {
      name: 'Qwen/Qwen2.5-Coder-32B-Instruct',
      provider: 'huggingface',
      costPerToken: 0.0000001,
      maxTokens: 8000,
      capabilities: ['code', 'reasoning', 'chat'],
      priority: 2,
    });
    
    this.models.set('llama-3.3', {
      name: 'meta-llama/Llama-3.3-70B-Instruct',
      provider: 'huggingface',
      costPerToken: 0.0000001,
      maxTokens: 8000,
      capabilities: ['chat', 'reasoning', 'analysis'],
      priority: 2,
    });
    
    this.models.set('mistral-large', {
      name: 'mistralai/Mistral-Large-Instruct-2411',
      provider: 'huggingface',
      costPerToken: 0.0000001,
      maxTokens: 8000,
      capabilities: ['chat', 'reasoning', 'code'],
      priority: 2,
    });
    
    this.models.set('deepseek-r1', {
      name: 'deepseek-ai/DeepSeek-R1',
      provider: 'huggingface',
      costPerToken: 0.0000001,
      maxTokens: 8000,
      capabilities: ['reasoning', 'analysis', 'code'],
      priority: 2,
    });
  }
  
  /**
   * تحليل النية (Intent) من طلب المستخدم
   */
  async analyzeIntent(input: string): Promise<{intent: string, confidence: number}> {
    const intentPatterns = {
      'code_generation': /كود|برمجة|اكتب|code|write|generate/i,
      'question_answer': /ما هو|كيف|لماذا|what|how|why|explain/i,
      'chat': /مرحبا|السلام|hello|hi|chat/i,
      'analysis': /حلل|analyze|review|تحليل/i,
      'bot_creation': /بوت|bot|مساعد|assistant|انشئ|create/i,
      'product_inquiry': /منتج|product|شراء|buy|سعر|price/i,
    };
    
    let detectedIntent = 'general';
    let maxConfidence = 0.3;
    
    for (const [intent, pattern] of Object.entries(intentPatterns)) {
      if (pattern.test(input)) {
        detectedIntent = intent;
        maxConfidence = 0.8;
        break;
      }
    }
    
    return { intent: detectedIntent, confidence: maxConfidence };
  }
  
  /**
   * اختيار أفضل نموذج بناءً على النية والأولوية
   */
  selectBestModel(intent: string, priority: string): ModelConfig | null {
    const capabilities = this.getRequiredCapabilities(intent);
    const availableModels: ModelConfig[] = [];
    
    for (const [_, model] of Array.from(this.models.entries())) {
      const hasCapabilities = capabilities.every(cap => 
        model.capabilities.includes(cap)
      );
      
      if (hasCapabilities) {
        availableModels.push(model);
      }
    }
    
    if (availableModels.length === 0) {
      return this.models.get('gpt-4o-mini') || null;
    }
    
    // ترتيب حسب الأولوية والتكلفة
    availableModels.sort((a, b) => {
      if (priority === 'critical' || priority === 'high') {
        return a.priority - b.priority;
      }
      return a.costPerToken - b.costPerToken;
    });
    
    return availableModels[0];
  }
  
  private getRequiredCapabilities(intent: string): string[] {
    const capabilityMap: Record<string, string[]> = {
      'code_generation': ['code', 'reasoning'],
      'analysis': ['analysis', 'reasoning'],
      'bot_creation': ['chat', 'reasoning'],
      'chat': ['chat'],
      'general': ['chat'],
    };
    
    return capabilityMap[intent] || ['chat'];
  }
  
  /**
   * معالجة الطلب واستدعاء النموذج المناسب
   */
  async process(request: BrainRequest): Promise<BrainResponse> {
    const startTime = Date.now();
    
    // 1. تحليل النية
    const { intent, confidence } = await this.analyzeIntent(request.input);
    const finalIntent = request.intent || intent;
    
    // 2. اختيار النموذج
    const model = this.selectBestModel(finalIntent, request.priority || 'medium');
    
    if (!model) {
      throw new Error('No suitable model available');
    }
    
    // 3. استدعاء النموذج
    let output = '';
    let tokens = 0;
    
    try {
      if (model.provider === 'openai' && this.openai) {
        const response = await this.openai.chat.completions.create({
          model: model.name,
          messages: [
            { role: 'system', content: this.buildSystemPrompt(finalIntent) },
            { role: 'user', content: request.input }
          ],
          max_tokens: 1000,
        });
        
        output = response.choices[0]?.message?.content || '';
        tokens = response.usage?.total_tokens || 0;
      } 
      else if (model.provider === 'anthropic' && this.anthropic) {
        const response = await this.anthropic.messages.create({
          model: model.name,
          max_tokens: 1000,
          messages: [
            { role: 'user', content: request.input }
          ],
        });
        
        const content = response.content[0];
        output = content.type === 'text' ? content.text : '';
        tokens = response.usage.input_tokens + response.usage.output_tokens;
      }
      else if (model.provider === 'google' && this.gemini) {
        const geminiModel = this.gemini.getGenerativeModel({ model: model.name });
        const result = await geminiModel.generateContent(request.input);
        output = result.response.text();
        tokens = 500; // تقدير
      }
      else if (model.provider === 'huggingface' && this.huggingface) {
        const response = await this.huggingface.chatCompletion({
          model: model.name,
          messages: [
            { role: 'user', content: request.input }
          ],
          max_tokens: 1000,
        });
        
        output = response.choices[0]?.message?.content || '';
        tokens = 500; // تقدير
      }
    } catch (error: any) {
      console.error('Error calling AI model:', error);
      throw error;
    }
    
    const cost = tokens * model.costPerToken;
    const duration = Date.now() - startTime;
    
    // 4. حفظ التحليلات
    this.trackAnalytics({
      sessionId: request.sessionId,
      model: model.name,
      intent: finalIntent,
      tokens,
      cost,
      duration,
      timestamp: new Date(),
    });
    
    return {
      output,
      model: model.name,
      intent: finalIntent,
      confidence,
      tokens,
      cost,
      timestamp: new Date(),
      metadata: {
        duration,
        provider: model.provider,
      }
    };
  }
  
  private buildSystemPrompt(intent: string): string {
    const prompts: Record<string, string> = {
      'code_generation': 'أنت مساعد برمجة خبير. اكتب كود نظيف وموثق.',
      'analysis': 'أنت محلل خبير. قدم تحليلات عميقة ومفصلة.',
      'bot_creation': 'أنت خبير في إنشاء البوتات الذكية. ساعد المستخدم في تصميم بوت مخصص.',
      'chat': 'أنت مساعد ذكي ومفيد.',
      'general': 'أنت مساعد ذكي ومفيد. تحدث بالعربية.',
    };
    
    return prompts[intent] || prompts['general'];
  }
  
  private trackAnalytics(data: any) {
    const key = `${data.sessionId}-${Date.now()}`;
    this.analytics.set(key, data);
    
    // تنظيف البيانات القديمة (أكثر من ساعة)
    const oneHourAgo = Date.now() - 3600000;
    for (const [key, value] of Array.from(this.analytics.entries())) {
      if (value.timestamp.getTime() < oneHourAgo) {
        this.analytics.delete(key);
      }
    }
  }
  
  /**
   * الحصول على إحصائيات الأداء
   */
  getAnalytics() {
    const stats = {
      totalRequests: this.analytics.size,
      byModel: {} as Record<string, number>,
      byIntent: {} as Record<string, number>,
      totalCost: 0,
      totalTokens: 0,
    };
    
    for (const data of Array.from(this.analytics.values())) {
      stats.byModel[data.model] = (stats.byModel[data.model] || 0) + 1;
      stats.byIntent[data.intent] = (stats.byIntent[data.intent] || 0) + 1;
      stats.totalCost += data.cost;
      stats.totalTokens += data.tokens;
    }
    
    return stats;
  }
}

// Singleton instance
let brainInstance: AIBrainCore | null = null;

export function getAIBrain(): AIBrainCore {
  if (!brainInstance) {
    brainInstance = new AIBrainCore();
  }
  return brainInstance;
}
