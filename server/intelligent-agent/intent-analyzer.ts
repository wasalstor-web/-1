import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export interface Intent {
  type: 'command' | 'question' | 'task' | 'unclear';
  action?: string;
  target?: string;
  parameters?: Record<string, any>;
  confidence: number;
  needsMoreInfo: boolean;
  missingInfo?: string[];
  vpsTarget?: string;
  requiresExternalModel?: boolean;
}

export interface IntentAnalysisResult {
  intent: Intent;
  processedMessage: string;
  suggestedModel?: string;
  executionPlan?: string[];
}

const INTENT_ANALYSIS_PROMPT = `أنت محلل نوايا ذكي متخصص في تحليل أوامر السيرفر والأنظمة.

قواعد التحليل:
1. حدد نوع النية: أمر (command)، سؤال (question)، مهمة (task)، أو غير واضح (unclear)
2. استخرج الإجراء المطلوب (action) والهدف (target)
3. حدد المعلومات الناقصة إن وجدت
4. قيّم مستوى الثقة من 0 إلى 1
5. حدد إذا كانت المهمة تحتاج VPS معين أو نموذج AI أقوى

أوامر السيرفر المدعومة:
- "hostname" أو "ما اسم السيرفر" → action: hostname
- "uptime" أو "مدة التشغيل" → action: uptime  
- "df" أو "مساحة القرص" أو "المساحة" → action: show_disk
- "free" أو "الذاكرة" أو "الرام" → action: show_memory
- "date" أو "التاريخ" أو "الوقت" → action: current_time
- "uname" أو "معلومات النظام" → action: system_info
- "ps" أو "العمليات" → action: check_processes
- "ip addr" أو "الشبكة" → action: network_info
- "who" أو "المستخدمين" → action: who_logged_in
- "ls" أو "الملفات" → action: list_files

إذا كان الأمر مباشر (مثل: hostname, uptime, df -h) ضعه في parameters.raw_command

أمثلة:
- "hostname" → command: hostname, confidence: 1.0
- "اعرض مساحة القرص" → command: show_disk, confidence: 0.95
- "شو وضع الذاكرة" → command: show_memory, confidence: 0.9
- "df -h" → command: show_disk, parameters: {raw_command: "df -h"}, confidence: 1.0
- "ابني لي موقع" → task: build_website, confidence: 0.8, needsMoreInfo: true

الرد بصيغة JSON فقط.`;

export class IntentAnalyzer {
  async analyzeIntent(message: string, conversationHistory: string[] = []): Promise<IntentAnalysisResult> {
    try {
      // استخدام GPT-4 لتحليل النية
      if (!openai) {
        throw new Error('OpenAI API غير متاح');
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: 'system', content: INTENT_ANALYSIS_PROMPT },
          ...conversationHistory.map(msg => ({ role: 'user' as const, content: msg })),
          { role: 'user', content: `حلل هذه الرسالة: "${message}"` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const analysis = JSON.parse(completion.choices[0].message.content || '{}');
      
      const intent: Intent = {
        type: analysis.type || 'unclear',
        action: analysis.action,
        target: analysis.target,
        parameters: analysis.parameters || {},
        confidence: analysis.confidence || 0.5,
        needsMoreInfo: analysis.needsMoreInfo || false,
        missingInfo: analysis.missingInfo || [],
        vpsTarget: analysis.vpsTarget,
        requiresExternalModel: analysis.requiresExternalModel || false,
      };

      // إذا كانت الثقة منخفضة، استدعِ نموذج أقوى
      if (intent.confidence < 0.7 && intent.type === 'unclear') {
        intent.requiresExternalModel = true;
      }

      const result: IntentAnalysisResult = {
        intent,
        processedMessage: message,
        executionPlan: this.createExecutionPlan(intent),
      };

      // تحديد النموذج المناسب
      if (intent.requiresExternalModel) {
        result.suggestedModel = this.selectBestModel(intent);
      }

      return result;
    } catch (error) {
      console.error('خطأ في تحليل النية:', error);
      
      // في حالة الفشل، نرجع نية افتراضية
      return {
        intent: {
          type: 'unclear',
          confidence: 0,
          needsMoreInfo: true,
          missingInfo: ['لم أتمكن من فهم الرسالة بشكل كامل'],
          requiresExternalModel: true,
        },
        processedMessage: message,
        suggestedModel: 'gpt-4',
      };
    }
  }

  private createExecutionPlan(intent: Intent): string[] {
    const plan: string[] = [];

    if (intent.needsMoreInfo) {
      plan.push('طلب المعلومات الناقصة من المستخدم');
      return plan;
    }

    switch (intent.type) {
      case 'command':
        plan.push('تحليل الأمر والمعاملات');
        if (intent.vpsTarget) {
          plan.push(`الاتصال بـ VPS: ${intent.vpsTarget}`);
          plan.push('تنفيذ الأمر على VPS');
          plan.push('استلام النتيجة وإرسالها للمستخدم');
        } else {
          plan.push('تنفيذ الأمر محلياً');
        }
        break;

      case 'task':
        plan.push('تجزئة المهمة إلى خطوات');
        plan.push('تحديد الموارد المطلوبة');
        if (intent.requiresExternalModel) {
          plan.push('استدعاء نموذج AI متقدم');
        }
        plan.push('بدء التنفيذ التدريجي');
        break;

      case 'question':
        plan.push('البحث عن الإجابة');
        plan.push('تقديم إجابة شاملة');
        break;

      default:
        plan.push('تحليل أعمق للرسالة');
        plan.push('استدعاء نموذج AI أكثر قدرة');
    }

    return plan;
  }

  private selectBestModel(intent: Intent): string {
    // اختيار النموذج الأنسب بناءً على نوع المهمة
    if (intent.type === 'command' && intent.action?.includes('code')) {
      return 'claude-3-5-sonnet'; // الأفضل للبرمجة
    }

    if (intent.type === 'task' && intent.confidence < 0.6) {
      return 'gpt-4'; // للمهام المعقدة
    }

    if (intent.type === 'question') {
      return 'gemini-2.0-flash-exp'; // سريع للأسئلة
    }

    return 'gpt-4-turbo-preview'; // الافتراضي
  }

  async delegateToModel(message: string, model: string, context?: string): Promise<string> {
    try {
      switch (model) {
        case 'gpt-4':
        case 'gpt-4-turbo-preview':
          if (!openai) throw new Error('OpenAI غير متاح');
          const gptResponse = await openai.chat.completions.create({
            model: model,
            messages: [
              { role: 'system', content: context || 'أنت مساعد ذكي متقدم' },
              { role: 'user', content: message }
            ],
            temperature: 0.7,
          });
          return gptResponse.choices[0].message.content || '';

        case 'claude-3-5-sonnet':
          if (!anthropic) throw new Error('Anthropic غير متاح');
          const claudeResponse = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2048,
            system: context || 'أنت مساعد ذكي متقدم',
            messages: [{ role: 'user', content: message }],
          });
          const content = claudeResponse.content[0];
          return content.type === 'text' ? content.text : '';

        case 'gemini-2.0-flash-exp':
          if (!genAI) throw new Error('Gemini غير متاح');
          const geminiModel = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            systemInstruction: context || 'أنت مساعد ذكي متقدم'
          });
          const geminiResult = await geminiModel.generateContent(message);
          return geminiResult.response.text() || '';

        default:
          throw new Error(`نموذج غير مدعوم: ${model}`);
      }
    } catch (error) {
      console.error(`خطأ في استدعاء النموذج ${model}:`, error);
      throw error;
    }
  }
}
