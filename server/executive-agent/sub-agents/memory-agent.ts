/**
 * Memory Agent
 * مسؤول عن: الذاكرة طويلة المدى، السياق، التعلم، الشخصيات
 */

export interface MemoryEntry {
  id: string;
  user_id: string;
  type: 'conversation' | 'preference' | 'fact' | 'decision' | 'learning';
  content: string;
  metadata: Record<string, any>;
  importance: number; // 1-10
  timestamp: Date;
  embedding?: number[]; // Vector embedding for similarity search
}

export interface UserContext {
  user_id: string;
  preferences: Record<string, any>;
  conversation_history: ConversationSummary[];
  learned_patterns: LearnedPattern[];
  persona: UserPersona;
}

export interface ConversationSummary {
  id: string;
  timestamp: Date;
  topic: string;
  key_points: string[];
  decisions_made: string[];
}

export interface LearnedPattern {
  pattern: string;
  frequency: number;
  last_seen: Date;
  confidence: number; // 0-1
}

export interface UserPersona {
  communication_style: 'formal' | 'casual' | 'technical';
  preferred_language: 'ar' | 'en' | 'mixed';
  expertise_level: 'beginner' | 'intermediate' | 'expert';
  interests: string[];
  goals: string[];
}

/**
 * Memory Agent - وكيل الذاكرة
 */
export class MemoryAgent {
  private systemPrompt = `أنت Memory Agent - وكيل الذاكرة لمنصة Mubsat AI.

مهامك:
1. حفظ واسترجاع السياق طويل المدى
2. تعلم تفضيلات المستخدم
3. تتبع القرارات والمحادثات
4. بناء شخصية المستخدم (Persona)
5. تقديم السياق المناسب للوكلاء الآخرين

معايير الذاكرة:
- دقة عالية في الاسترجاع
- حفظ المعلومات المهمة فقط
- احترام الخصوصية
- السياق الزمني
- الأهمية النسبية

عند الحفظ:
- صنف المعلومة
- حدد مستوى الأهمية
- اربطها بالسياق
- احفظ الوقت والمصدر`;

  private memory: Map<string, MemoryEntry[]> = new Map();
  private userContexts: Map<string, UserContext> = new Map();
  
  /**
   * حفظ ذاكرة جديدة
   */
  async storeMemory(entry: Omit<MemoryEntry, 'id' | 'timestamp'>): Promise<string> {
    const memoryEntry: MemoryEntry = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...entry,
    };
    
    // Get or create user memory
    if (!this.memory.has(entry.user_id)) {
      this.memory.set(entry.user_id, []);
    }
    
    const userMemory = this.memory.get(entry.user_id)!;
    userMemory.push(memoryEntry);
    
    // Keep only recent and important memories (max 1000 per user)
    if (userMemory.length > 1000) {
      // Sort by importance and recency, keep top 1000
      userMemory.sort((a, b) => {
        const scoreA = a.importance * 0.7 + (Date.now() - a.timestamp.getTime()) / 1000000 * 0.3;
        const scoreB = b.importance * 0.7 + (Date.now() - b.timestamp.getTime()) / 1000000 * 0.3;
        return scoreB - scoreA;
      });
      userMemory.splice(1000);
    }
    
    console.log(`🧠 Memory Agent: Stored memory ${memoryEntry.id} for user ${entry.user_id}`);
    return memoryEntry.id;
  }
  
  /**
   * استرجاع الذكريات ذات الصلة
   */
  async retrieveRelevantMemories(
    user_id: string,
    query: string,
    limit: number = 10
  ): Promise<MemoryEntry[]> {
    const userMemory = this.memory.get(user_id);
    
    if (!userMemory || userMemory.length === 0) {
      return [];
    }
    
    // Simple relevance scoring (in production, use vector embeddings)
    const scoredMemories = userMemory.map(mem => {
      let score = 0;
      
      // Query term matching
      const queryTerms = query.toLowerCase().split(' ');
      const contentLower = mem.content.toLowerCase();
      queryTerms.forEach(term => {
        if (contentLower.includes(term)) {
          score += 2;
        }
      });
      
      // Importance
      score += mem.importance;
      
      // Recency (decay over time)
      const daysSince = (Date.now() - mem.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 5 - daysSince / 7); // Decay over weeks
      
      return { memory: mem, score };
    });
    
    // Sort by score and return top N
    scoredMemories.sort((a, b) => b.score - a.score);
    return scoredMemories.slice(0, limit).map(sm => sm.memory);
  }
  
  /**
   * الحصول على سياق المستخدم
   */
  async getUserContext(user_id: string): Promise<UserContext> {
    let context = this.userContexts.get(user_id);
    
    if (!context) {
      // Create new context
      context = {
        user_id,
        preferences: {},
        conversation_history: [],
        learned_patterns: [],
        persona: {
          communication_style: 'casual',
          preferred_language: 'ar',
          expertise_level: 'intermediate',
          interests: [],
          goals: [],
        },
      };
      this.userContexts.set(user_id, context);
    }
    
    return context;
  }
  
  /**
   * تحديث تفضيلات المستخدم
   */
  async updateUserPreference(
    user_id: string,
    key: string,
    value: any
  ): Promise<void> {
    const context = await this.getUserContext(user_id);
    context.preferences[key] = value;
    
    // Store as memory
    await this.storeMemory({
      user_id,
      type: 'preference',
      content: `User preference: ${key} = ${JSON.stringify(value)}`,
      metadata: { key, value },
      importance: 7,
    });
    
    console.log(`🧠 Memory Agent: Updated preference ${key} for user ${user_id}`);
  }
  
  /**
   * تعلم نمط جديد
   */
  async learnPattern(
    user_id: string,
    pattern: string,
    confidence: number = 0.5
  ): Promise<void> {
    const context = await this.getUserContext(user_id);
    
    // Find existing pattern
    const existing = context.learned_patterns.find(p => p.pattern === pattern);
    
    if (existing) {
      // Update frequency and confidence
      existing.frequency++;
      existing.last_seen = new Date();
      existing.confidence = Math.min(1, existing.confidence + 0.1);
    } else {
      // Add new pattern
      context.learned_patterns.push({
        pattern,
        frequency: 1,
        last_seen: new Date(),
        confidence,
      });
    }
    
    console.log(`🧠 Memory Agent: Learned pattern "${pattern}" for user ${user_id}`);
  }
  
  /**
   * ملخص المحادثة
   */
  async summarizeConversation(
    user_id: string,
    messages: Array<{ role: string; content: string }>
  ): Promise<ConversationSummary> {
    // Simple summarization (in production, use AI)
    const keyPoints: string[] = [];
    const decisions: string[] = [];
    
    // Extract key points (messages with commands or important info)
    messages.forEach(msg => {
      if (msg.content.includes('deploy') || msg.content.includes('نشر')) {
        decisions.push('Deployment discussed');
      }
      if (msg.content.includes('create') || msg.content.includes('إنشاء')) {
        decisions.push('Creation task identified');
      }
      // Add more pattern matching...
    });
    
    const summary: ConversationSummary = {
      id: `conv-${Date.now()}`,
      timestamp: new Date(),
      topic: 'General conversation', // In production, use AI to detect topic
      key_points: keyPoints,
      decisions_made: decisions,
    };
    
    // Store in context
    const context = await this.getUserContext(user_id);
    context.conversation_history.push(summary);
    
    // Keep only recent 50 conversations
    if (context.conversation_history.length > 50) {
      context.conversation_history = context.conversation_history.slice(-50);
    }
    
    // Store as memory
    await this.storeMemory({
      user_id,
      type: 'conversation',
      content: `Conversation: ${summary.topic}`,
      metadata: summary,
      importance: decisions.length > 0 ? 8 : 5,
    });
    
    return summary;
  }
  
  /**
   * الحصول على جميع الذكريات للمستخدم
   */
  getAllMemories(user_id: string): MemoryEntry[] {
    return this.memory.get(user_id) || [];
  }
  
  /**
   * مسح الذاكرة
   */
  clearMemory(user_id: string): void {
    this.memory.delete(user_id);
    this.userContexts.delete(user_id);
    console.log(`🧠 Memory Agent: Cleared all memory for user ${user_id}`);
  }
}
