import { IntentAnalyzer, IntentAnalysisResult, Intent } from './intent-analyzer';
import { VPSExecutor, CommandResult } from './vps-executor';
import { SelfImprovementEngine } from './self-improvement';
import { ABIGenerator } from './abi-generator';
import { storage } from '../storage';
import { sshExecutor } from '../ssh-executor';

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
  private selfImprovement: SelfImprovementEngine;
  private abiGenerator: ABIGenerator;
  private conversationHistory: Map<string, string[]> = new Map();

  constructor() {
    this.intentAnalyzer = new IntentAnalyzer();
    this.vpsExecutor = new VPSExecutor();
    this.selfImprovement = new SelfImprovementEngine();
    this.abiGenerator = new ABIGenerator();
  }

  async processMessage(
    userId: string,
    message: string
  ): Promise<AssistantResponse> {
    try {
      // الحصول على سجل المحادثة
      const history = this.conversationHistory.get(userId) || [];
      
      // التحقق من طلب التطوير الذاتي
      const improvementRequest = await this.selfImprovement.analyzeImprovementRequest(message);
      if (improvementRequest) {
        return await this.handleSelfImprovement(improvementRequest);
      }

      // التحقق من طلب إنشاء ABI
      if (message.toLowerCase().includes('اعطني abi') || 
          message.toLowerCase().includes('أنشئ abi') ||
          message.toLowerCase().includes('generate abi')) {
        return await this.handleABIGeneration(message);
      }

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
      const servers = await storage.getAllServers();
      const sshServer = servers.find(s => s.sshEnabled);

      if (!sshServer) {
        return {
          message: 'لا يوجد سيرفر متصل حالياً. يرجى التأكد من إعداد الاتصال بالسيرفر.',
          intent,
          executed: false,
          needsMoreInfo: false,
          executionPlan,
        };
      }

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

      console.log(`⚙️ تنفيذ الأمر "${command}" على السيرفر: ${sshServer.name}`);

      const commandRecord = await storage.createServerCommand({
        serverId: sshServer.id,
        command,
        status: 'pending',
      });

      const result = await sshExecutor.executeCommand(sshServer, command);

      await storage.completeServerCommand(
        commandRecord.id,
        result.output,
        result.exitCode
      );

      const successMessage = result.success
        ? `✅ تم التنفيذ بنجاح على ${sshServer.name}!\n\n\`\`\`\n${result.output || 'اكتمل التنفيذ'}\n\`\`\``
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
    const commandMap: Record<string, string> = {
      'check_status': 'ps aux | head -20',
      'list_files': 'ls -lah',
      'show_disk': 'df -h',
      'show_memory': 'free -h',
      'current_time': 'date',
      'uptime': 'uptime',
      'hostname': 'hostname',
      'system_info': 'uname -a',
      'network_info': 'ip addr',
      'check_processes': 'ps aux | head -15',
      'disk_usage': 'du -sh /* 2>/dev/null | sort -h | tail -10',
      'who_logged_in': 'who',
      'last_login': 'last -10',
    };

    if (intent.action && commandMap[intent.action]) {
      return commandMap[intent.action];
    }

    if (intent.parameters?.raw_command) {
      return intent.parameters.raw_command;
    }

    return null;
  }

  private formatMissingInfoRequest(intent: Intent): string {
    const missingInfo = intent.missingInfo || [];
    
    if (missingInfo.length === 0) {
      return 'أحتاج بعض المعلومات الإضافية لإكمال المهمة.';
    }

    const formatted = missingInfo.map((info, i) => `${i + 1}. ${info}`).join('\n');
    
    return `لإكمال المهمة، أحتاج المعلومات التالية:\n\n${formatted}`;
  }

  private async handleSelfImprovement(request: any): Promise<AssistantResponse> {
    const result = await this.selfImprovement.executeSelfImprovement(request);
    
    return {
      message: `🧠 **طلب التطوير الذاتي تم تحليله**\n\n${result.description}\n\n` +
               `نوع التحسين: ${request.type}\n` +
               `الأولوية: ${request.priority}\n\n` +
               `${result.needsUserApproval ? '⚠️ يحتاج موافقتك لتطبيق التحسين.' : ''}`,
      intent: {
        type: 'self_improvement',
        action: request.description,
        confidence: 1.0,
        needsMoreInfo: result.needsUserApproval,
      },
      executed: result.implemented,
      needsMoreInfo: result.needsUserApproval,
      suggestions: [
        'اعرض الكود المقترح',
        'طبق التحسين',
        'إلغاء التحسين',
      ],
    };
  }

  private async handleABIGeneration(message: string): Promise<AssistantResponse> {
    // استخراج اسم السيرفر من الرسالة
    const serverName = this.extractServerName(message) || 'DEFAULT-SERVER';
    const serverType = this.extractServerType(message);

    // إنشاء ABI
    const abiConfig = {
      serverName,
      capabilities: ['command-execution', 'status-check', 'file-management'],
    };

    const abiCode = this.abiGenerator.generateABI(abiConfig);
    const packageJson = this.abiGenerator.generatePackageJson(serverName);
    const instructions = this.abiGenerator.generateDeploymentInstructions(serverType);

    const responseMessage = `🤖 **تم إنشاء ABI الموحد للسيرفر: ${serverName}**\n\n` +
      `📦 **نوع السيرفر:** ${serverType}\n\n` +
      `✅ **القدرات المضمنة:**\n${abiConfig.capabilities.map(c => `  • ${c}`).join('\n')}\n\n` +
      `📋 **خطوات التثبيت:**\n${instructions.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n` +
      `💡 **ملاحظة:** سيتم إرسال الملفات في الرسالة التالية.`;

    return {
      message: responseMessage,
      intent: {
        type: 'abi_generation',
        action: `generate_abi_for_${serverName}`,
        confidence: 1.0,
        needsMoreInfo: false,
      },
      executed: true,
      needsMoreInfo: false,
      executionPlan: instructions.steps,
      suggestions: [
        'أرسل ملف ABI',
        'أرسل package.json',
        'اعرض الأوامر الكاملة',
        `اعرض دليل ${serverType}`,
      ],
    };
  }

  private extractServerName(message: string): string | null {
    // محاولة استخراج اسم السيرفر من الرسالة
    const patterns = [
      /(?:سيرفر|server)\s+(\w+)/i,
      /(?:vps|hostinger)\s*[-_]?\s*(\d+)/i,
      /(?:للسيرفر|for server)\s+(\w+)/i,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].toUpperCase();
      }
    }

    return null;
  }

  private extractServerType(message: string): 'vps' | 'hostinger' | 'shared' {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hostinger')) {
      return 'hostinger';
    } else if (lowerMessage.includes('shared') || lowerMessage.includes('مشترك')) {
      return 'shared';
    } else {
      return 'vps';
    }
  }

  clearHistory(userId: string): void {
    this.conversationHistory.delete(userId);
  }

  getSystemPrompt(): string {
    return ASSISTANT_SYSTEM_PROMPT;
  }

  // واجهة برمجية للحصول على ABI لسيرفر معين
  generateABIForServer(serverName: string, serverType: 'vps' | 'hostinger' | 'shared' = 'vps'): {
    abiCode: string;
    packageJson: string;
    instructions: any;
  } {
    const abiConfig = {
      serverName,
      capabilities: ['command-execution', 'status-check', 'file-management'],
    };

    return {
      abiCode: this.abiGenerator.generateABI(abiConfig),
      packageJson: this.abiGenerator.generatePackageJson(serverName),
      instructions: this.abiGenerator.generateDeploymentInstructions(serverType),
    };
  }
}
