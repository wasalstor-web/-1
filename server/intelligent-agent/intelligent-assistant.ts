import { IntentAnalyzer, IntentAnalysisResult, Intent } from './intent-analyzer';
import { VPSExecutor, CommandResult } from './vps-executor';

export interface AssistantResponse {
  message: string;
  intent: Intent;
  executed: boolean;
  results?: CommandResult | CommandResult[];
  needsMoreInfo: boolean;
  suggestions?: string[];
  executionPlan?: string[];
}

const ASSISTANT_SYSTEM_PROMPT = `أنت مساعد ذكي جداً، مهمتك إدارة وتنفيذ أوامر المستخدم بشكل ذكي ومتعدد الطبقات.

قواعد العمل:
1. استقبل أي رسالة من المستخدم وحلل النية بدقة.
2. إذا فهمت النية، حوّلها إلى أمر أو إجراء قابل للتنفيذ.
3. إذا لم تفهم الرسالة تمامًا، استدعِ فورًا نموذجًا آخر أكثر قدرة (GPT-4 أو النموذج المخصص لفهم النوايا) لتفسير الرسالة.
4. اربط كل أمر يمكن تنفيذه بنظام خارجي (VPS أو سيرفر محدد) بحيث تختار VPS المناسب تلقائيًا بناءً على محتوى الرسالة أو نوع المهمة.
5. عند إرسال أي أمر إلى VPS:
   • أرسل فقط البيانات الضرورية لتنفيذ المهمة.
   • تحقق من نجاح الاستلام أو أظهر رسالة حالة مختصرة للمستخدم.
6. إذا احتاج الأمر معلومات إضافية قبل التنفيذ، اطلبها بشكل ذكي وواضح.
7. تعامل مع كل الرسائل كأنك مساعد شخصي ذكي جدًا قادر على:
   • التحليل الفوري للنية.
   • التفويض الذكي لنماذج أخرى عند الحاجة.
   • اختيار VPS المناسب لإرسال الأمر.
   • تقديم تحديثات مختصرة للمستخدم عن حالة التنفيذ فقط عند الطلب.
8. كل تواصل مع المستخدم يكون بلغة واضحة، مختصر، ومباشر، بدون تفاصيل تقنية معقدة، مع التركيز على تنفيذ المهمة بدقة وسرعة.`;

export class IntelligentAssistant {
  private intentAnalyzer: IntentAnalyzer;
  private vpsExecutor: VPSExecutor;
  private conversationHistory: Map<string, string[]> = new Map();

  constructor() {
    this.intentAnalyzer = new IntentAnalyzer();
    this.vpsExecutor = new VPSExecutor();
  }

  async processMessage(
    userId: string,
    message: string
  ): Promise<AssistantResponse> {
    try {
      // الحصول على سجل المحادثة
      const history = this.conversationHistory.get(userId) || [];
      
      // تحليل النية
      console.log(`🔍 تحليل النية للرسالة: "${message}"`);
      const analysis = await this.intentAnalyzer.analyzeIntent(message, history);

      // تحديث السجل
      history.push(message);
      this.conversationHistory.set(userId, history.slice(-10)); // آخر 10 رسائل

      // معالجة النية
      const response = await this.handleIntent(analysis);

      return response;
    } catch (error: any) {
      console.error('خطأ في معالجة الرسالة:', error);
      
      return {
        message: 'عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى.',
        intent: {
          type: 'unclear',
          confidence: 0,
          needsMoreInfo: false,
        },
        executed: false,
        needsMoreInfo: false,
      };
    }
  }

  private async handleIntent(
    analysis: IntentAnalysisResult
  ): Promise<AssistantResponse> {
    const { intent, suggestedModel, executionPlan } = analysis;

    // إذا كانت النية غير واضحة وتحتاج نموذج أقوى
    if (intent.requiresExternalModel && suggestedModel) {
      console.log(`🤖 استدعاء النموذج المتقدم: ${suggestedModel}`);
      
      try {
        const advancedResponse = await this.intentAnalyzer.delegateToModel(
          analysis.processedMessage,
          suggestedModel,
          ASSISTANT_SYSTEM_PROMPT
        );

        return {
          message: advancedResponse,
          intent,
          executed: false,
          needsMoreInfo: false,
          executionPlan,
        };
      } catch (error) {
        console.error('فشل استدعاء النموذج المتقدم:', error);
      }
    }

    // إذا كانت النية تحتاج معلومات إضافية
    if (intent.needsMoreInfo) {
      const missingInfoMessage = this.formatMissingInfoRequest(intent);
      
      return {
        message: missingInfoMessage,
        intent,
        executed: false,
        needsMoreInfo: true,
        suggestions: intent.missingInfo,
        executionPlan,
      };
    }

    // تنفيذ الأمر
    if (intent.type === 'command' && intent.action) {
      return await this.executeCommand(intent, executionPlan);
    }

    // معالجة المهام
    if (intent.type === 'task') {
      return await this.executeTask(intent, executionPlan);
    }

    // الرد على الأسئلة
    if (intent.type === 'question') {
      return {
        message: await this.answerQuestion(intent),
        intent,
        executed: false,
        needsMoreInfo: false,
        executionPlan,
      };
    }

    // افتراضي
    return {
      message: 'فهمت رسالتك، لكن لست متأكداً من كيفية المساعدة. هل يمكنك توضيح أكثر؟',
      intent,
      executed: false,
      needsMoreInfo: true,
      executionPlan,
    };
  }

  private async executeCommand(
    intent: Intent,
    executionPlan?: string[]
  ): Promise<AssistantResponse> {
    try {
      // اختيار VPS المناسب
      const vps = intent.vpsTarget 
        ? this.vpsExecutor.selectVPS(intent.action!, [intent.vpsTarget])
        : this.vpsExecutor.selectVPS(intent.action!);

      if (!vps) {
        return {
          message: 'لم أتمكن من العثور على سيرفر مناسب لتنفيذ هذا الأمر.',
          intent,
          executed: false,
          needsMoreInfo: false,
          executionPlan,
        };
      }

      console.log(`⚙️ تنفيذ الأمر "${intent.action}" على VPS: ${vps.name}`);

      // تحويل النية إلى أمر قابل للتنفيذ
      const command = this.intentToCommand(intent);
      
      if (!command) {
        return {
          message: 'الأمر غير مدعوم أو غير آمن للتنفيذ.',
          intent,
          executed: false,
          needsMoreInfo: false,
          executionPlan,
        };
      }

      // تنفيذ الأمر
      const result = await this.vpsExecutor.executeCommand(vps.id, command);

      const successMessage = result.success
        ? `✅ تم التنفيذ بنجاح!\n\n${result.output || 'اكتمل التنفيذ'}`
        : `❌ فشل التنفيذ: ${result.error}`;

      return {
        message: successMessage,
        intent,
        executed: result.success,
        results: result,
        needsMoreInfo: false,
        executionPlan,
      };
    } catch (error: any) {
      return {
        message: `حدث خطأ أثناء التنفيذ: ${error.message}`,
        intent,
        executed: false,
        needsMoreInfo: false,
        executionPlan,
      };
    }
  }

  private async executeTask(
    intent: Intent,
    executionPlan?: string[]
  ): Promise<AssistantResponse> {
    // المهام المعقدة تحتاج تجزئة وتنفيذ متعدد الخطوات
    const message = `فهمت أنك تريد ${intent.action}. سأبدأ العمل على هذا...\n\nخطة التنفيذ:\n${executionPlan?.map((step, i) => `${i + 1}. ${step}`).join('\n')}`;

    return {
      message,
      intent,
      executed: false,
      needsMoreInfo: false,
      executionPlan,
      suggestions: ['هل تريد البدء الآن؟', 'هل تحتاج تعديلات على الخطة؟'],
    };
  }

  private async answerQuestion(intent: Intent): Promise<string> {
    // الرد على الأسئلة باستخدام نموذج AI
    try {
      const response = await this.intentAnalyzer.delegateToModel(
        `أجب على هذا السؤال بشكل مختصر ومفيد: ${intent.action}`,
        'gpt-4-turbo-preview'
      );
      return response;
    } catch {
      return 'عذراً، لم أتمكن من الإجابة على سؤالك الآن.';
    }
  }

  private intentToCommand(intent: Intent): string | null {
    // تحويل النية إلى أمر shell حقيقي
    const commandMap: Record<string, string> = {
      'check_status': 'ps aux | grep node',
      'list_files': 'ls -la',
      'show_disk': 'df -h',
      'show_memory': 'free -h',
      'current_time': 'date',
      'uptime': 'uptime',
    };

    return commandMap[intent.action || ''] || null;
  }

  private formatMissingInfoRequest(intent: Intent): string {
    const missingInfo = intent.missingInfo || [];
    
    if (missingInfo.length === 0) {
      return 'أحتاج بعض المعلومات الإضافية لإكمال المهمة.';
    }

    const formatted = missingInfo.map((info, i) => `${i + 1}. ${info}`).join('\n');
    
    return `لإكمال المهمة، أحتاج المعلومات التالية:\n\n${formatted}`;
  }

  clearHistory(userId: string): void {
    this.conversationHistory.delete(userId);
  }

  getSystemPrompt(): string {
    return ASSISTANT_SYSTEM_PROMPT;
  }
}
