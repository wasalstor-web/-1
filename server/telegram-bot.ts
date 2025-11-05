import TelegramBot from 'node-telegram-bot-api';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { storage } from './storage';
import { PLATFORM_SYSTEM_PROMPT } from './ai-system-prompt';
import { IntelligentAssistant } from './intelligent-agent/intelligent-assistant';

// AI Model configurations
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const MODELS = {
  'gpt-4o-mini': { name: 'GPT-4 Mini', provider: 'openai' as const },
  'gpt-4o': { name: 'GPT-4', provider: 'openai' as const },
  'claude-3-5-sonnet-latest': { name: 'Claude 3.5 Sonnet', provider: 'anthropic' as const },
  'gemini-2.0-flash-exp': { name: 'Gemini 2.0 Flash', provider: 'gemini' as const },
};

type ModelKey = keyof typeof MODELS;

export class TelegramAIBot {
  private bot: TelegramBot | null = null;
  private useWebhook: boolean = false;
  private intelligentAssistant: IntelligentAssistant;

  constructor(token?: string, webhookUrl?: string) {
    this.intelligentAssistant = new IntelligentAssistant();
    if (!token) {
      console.log('⚠️ TELEGRAM_BOT_TOKEN not provided. Telegram bot is disabled.');
      return;
    }

    // Use webhook in production, polling in development
    this.useWebhook = !!webhookUrl;

    if (this.useWebhook && webhookUrl) {
      // Webhook mode (Production)
      this.bot = new TelegramBot(token, { webHook: true });
      this.bot.setWebHook(`${webhookUrl}/api/telegram-webhook`);
      console.log(`🤖 Telegram Bot started in webhook mode: ${webhookUrl}/api/telegram-webhook`);
    } else {
      // Polling mode (Development)
      this.bot = new TelegramBot(token, { polling: true });
      console.log('🤖 Telegram Bot started in polling mode (development)');
    }

    this.setupCommands();
    this.setupMessageHandler();
  }

  getBot() {
    return this.bot;
  }

  private setupCommands() {
    if (!this.bot) return;

    // /start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const user = msg.from;
      
      if (!user) return;

      // Get or create Telegram user
      let telegramUser = await storage.getTelegramUser(user.id);
      
      if (!telegramUser) {
        telegramUser = await storage.createTelegramUser({
          telegramUserId: user.id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          selectedModel: 'gpt-4o-mini',
          conversationHistory: '[]',
        });
      }

      const welcomeMessage = `
🤖 *مرحباً بك في بوت الذكاء الاصطناعي!*

أنا بوت متقدم يستخدم أحدث نماذج الذكاء الاصطناعي لمساعدتك:
• GPT-4 و GPT-4 Mini من OpenAI
• Claude 3.5 Sonnet من Anthropic
• Gemini 2.0 Flash من Google

🎯 *الأوامر الأساسية:*
/start - بدء المحادثة
/help - عرض المساعدة
/model - اختيار نموذج AI
/clear - مسح سجل المحادثة

🎨 *أوامر التصميم:*
/image - توليد صورة من وصف
/logo - توليد شعار لمشروعك

🧠 *المساعد الذكي:*
/smart - تفعيل المساعد الذكي المتقدم

🖥️ *إدارة السيرفرات:*
/execute - تنفيذ أوامر على السيرفر

النموذج الحالي: *${MODELS[telegramUser.selectedModel as ModelKey].name}*

أرسل أي رسالة وسأساعدك! 💬
      `;

      this.bot?.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
    });

    // /help command
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;
      
      const helpMessage = `
📚 *دليل الاستخدام*

*الأوامر الأساسية:*
/start - بدء محادثة جديدة
/model - تغيير نموذج AI
/clear - مسح سجل المحادثة
/help - عرض هذه المساعدة

*أوامر التصميم:* 🎨
/image - توليد صورة من وصف
/logo - توليد شعار احترافي

*إدارة السيرفرات:* 🖥️
/execute - تنفيذ أوامر على السيرفر (مثال: /execute hostname)

*المساعد الذكي:* 🧠
/smart - تفعيل المساعد الذكي (فهم النوايا، تنفيذ الأوامر، VPS)

*النماذج المتاحة:*
• GPT-4 Mini - سريع واقتصادي ✨
• GPT-4 - قوي ودقيق 🚀
• Claude 3.5 Sonnet - متوازن ومتطور 🎯
• Gemini 2.0 Flash - سريع ومبتكر ⚡

*كيفية الاستخدام:*
فقط أرسل رسالتك وسأجيبك مباشرة! أنا أحتفظ بسياق المحادثة لتجربة أفضل.

*أمثلة:*
\`اكتب لي كود Python لحساب الفيبوناتشي\`
\`/image قطة لطيفة تلعب بالكرة\`
\`/logo شركة تقنية حديثة\`
      `;

      this.bot?.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    });

    // /model command
    this.bot.onText(/\/model/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id;
      
      if (!userId) return;

      const keyboard = {
        inline_keyboard: [
          [{ text: '✨ GPT-4 Mini', callback_data: 'model:gpt-4o-mini' }],
          [{ text: '🚀 GPT-4', callback_data: 'model:gpt-4o' }],
          [{ text: '🎯 Claude 3.5 Sonnet', callback_data: 'model:claude-3-5-sonnet-latest' }],
          [{ text: '⚡ Gemini 2.0 Flash', callback_data: 'model:gemini-2.0-flash-exp' }],
        ]
      };

      this.bot?.sendMessage(chatId, '🤖 *اختر نموذج AI:*', {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    });

    // /clear command
    this.bot.onText(/\/clear/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id;
      
      if (!userId) return;

      await storage.updateTelegramUser(userId, {
        conversationHistory: '[]'
      });

      this.bot?.sendMessage(chatId, '✅ تم مسح سجل المحادثة بنجاح!');
    });

    // /image command - Generate image
    this.bot.onText(/\/image (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const prompt = match?.[1];

      if (!prompt) {
        this.bot?.sendMessage(chatId, '❌ يرجى إدخال وصف للصورة.\n\nمثال: `/image قطة لطيفة تلعب بالكرة`', { parse_mode: 'Markdown' });
        return;
      }

      if (!openai) {
        this.bot?.sendMessage(chatId, '⚠️ خدمة توليد الصور غير متاحة حالياً.');
        return;
      }

      try {
        this.bot?.sendChatAction(chatId, 'upload_photo');
        this.bot?.sendMessage(chatId, '🎨 جاري توليد الصورة... قد يستغرق ذلك دقيقة واحدة...');

        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          style: "vivid",
        });

        const imageUrl = response.data?.[0]?.url;
        const revisedPrompt = response.data?.[0]?.revised_prompt;

        if (imageUrl) {
          await this.bot?.sendPhoto(chatId, imageUrl, {
            caption: `✅ *تم توليد الصورة بنجاح!*\n\n📝 الوصف المحسّن:\n${revisedPrompt || prompt}`,
            parse_mode: 'Markdown'
          });
        } else {
          this.bot?.sendMessage(chatId, '❌ فشل في توليد الصورة. حاول مرة أخرى.');
        }
      } catch (error: any) {
        console.error('Error generating image:', error);
        this.bot?.sendMessage(chatId, `❌ حدث خطأ أثناء توليد الصورة: ${error.message || 'خطأ غير معروف'}`);
      }
    });

    // /logo command - Generate logo
    this.bot.onText(/\/logo (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const businessName = match?.[1];

      if (!businessName) {
        this.bot?.sendMessage(chatId, '❌ يرجى إدخال اسم المشروع أو الشركة.\n\nمثال: `/logo شركة تقنية حديثة`', { parse_mode: 'Markdown' });
        return;
      }

      if (!openai) {
        this.bot?.sendMessage(chatId, '⚠️ خدمة توليد الشعارات غير متاحة حالياً.');
        return;
      }

      try {
        this.bot?.sendChatAction(chatId, 'upload_photo');
        this.bot?.sendMessage(chatId, '🏷️ جاري توليد الشعار... قد يستغرق ذلك دقيقة واحدة...');

        const logoPrompt = `Create a professional, modern logo for "${businessName}". 
The logo should be:
- Clean and minimalist
- Professional and memorable
- Suitable for digital and print
- Vector-style illustration
- On white background
- Modern design`;

        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: logoPrompt,
          n: 1,
          size: "1024x1024",
          quality: "hd",
          style: "natural",
        });

        const imageUrl = response.data?.[0]?.url;

        if (imageUrl) {
          await this.bot?.sendPhoto(chatId, imageUrl, {
            caption: `✅ *تم توليد الشعار بنجاح!*\n\n🏢 الشركة: *${businessName}*\n\n💡 يمكنك طلب تعديلات أو توليد شعار جديد باستخدام /logo`,
            parse_mode: 'Markdown'
          });
        } else {
          this.bot?.sendMessage(chatId, '❌ فشل في توليد الشعار. حاول مرة أخرى.');
        }
      } catch (error: any) {
        console.error('Error generating logo:', error);
        this.bot?.sendMessage(chatId, `❌ حدث خطأ أثناء توليد الشعار: ${error.message || 'خطأ غير معروف'}`);
      }
    });

    // /smart command - Intelligent Assistant
    this.bot.onText(/\/smart (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id;
      const userMessage = match?.[1];

      if (!userId || !userMessage) {
        this.bot?.sendMessage(chatId, '❌ يرجى إدخال رسالتك بعد الأمر /smart\n\nمثال: `/smart تحقق من حالة السيرفر`', { parse_mode: 'Markdown' });
        return;
      }

      try {
        this.bot?.sendChatAction(chatId, 'typing');
        this.bot?.sendMessage(chatId, '🧠 المساعد الذكي يحلل رسالتك...');

        const response = await this.intelligentAssistant.processMessage(userId.toString(), userMessage);

        let replyMessage = `🤖 *${response.message}*\n\n`;

        // إضافة معلومات النية
        if (response.intent) {
          replyMessage += `📊 *تحليل النية:*\n`;
          replyMessage += `• النوع: ${response.intent.type}\n`;
          if (response.intent.action) {
            replyMessage += `• الإجراء: ${response.intent.action}\n`;
          }
          replyMessage += `• الثقة: ${(response.intent.confidence * 100).toFixed(0)}%\n`;
          if (response.intent.vpsTarget) {
            replyMessage += `• VPS: ${response.intent.vpsTarget}\n`;
          }
          replyMessage += `\n`;
        }

        // إضافة خطة التنفيذ
        if (response.executionPlan && response.executionPlan.length > 0) {
          replyMessage += `📋 *خطة التنفيذ:*\n`;
          response.executionPlan.forEach((step, idx) => {
            replyMessage += `${idx + 1}. ${step}\n`;
          });
          replyMessage += `\n`;
        }

        // حالة التنفيذ
        if (response.executed !== undefined) {
          replyMessage += response.executed ? `✅ *تم التنفيذ بنجاح*` : `❌ *لم يتم التنفيذ*`;
        }

        this.bot?.sendMessage(chatId, replyMessage, { parse_mode: 'Markdown' });

        // إضافة اقتراحات
        if (response.suggestions && response.suggestions.length > 0) {
          const suggestionsMsg = `💡 *اقتراحات:*\n${response.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
          this.bot?.sendMessage(chatId, suggestionsMsg, { parse_mode: 'Markdown' });
        }

      } catch (error: any) {
        console.error('Error in smart command:', error);
        this.bot?.sendMessage(chatId, `❌ حدث خطأ: ${error.message || 'خطأ غير معروف'}`);
      }
    });

    // /execute command - Execute commands on VPS servers via SSH
    this.bot.onText(/\/execute (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const command = match?.[1];

      if (!command) {
        this.bot?.sendMessage(chatId, '❌ يرجى إدخال الأمر المطلوب تنفيذه\n\nمثال: /execute hostname', { parse_mode: 'Markdown' });
        return;
      }

      try {
        const servers = await storage.getAllServers();
        const activeServer = servers.find(s => s.isActive && s.sshEnabled);

        if (!activeServer) {
          this.bot?.sendMessage(chatId, '❌ لا يوجد سيرفرات نشطة مع SSH مفعّل');
          return;
        }

        this.bot?.sendMessage(chatId, `🔄 *جاري التنفيذ عبر SSH...*\n\n🖥️ السيرفر: ${activeServer.name}\n⚡ الأمر: \`${command}\``, { parse_mode: 'Markdown' });

        const { sshExecutor } = await import('./ssh-executor');
        const result = await sshExecutor.executeCommand(activeServer, command.trim());

        await storage.createServerCommand({
          serverId: activeServer.id,
          command: command.trim()
        });

        if (result.success) {
          const output = result.output.substring(0, 3000);
          const resultMsg = `✅ *تم التنفيذ بنجاح!*\n\n📤 النتيجة:\n\`\`\`\n${output}\n\`\`\`\n\n🔢 Exit Code: ${result.exitCode}`;
          this.bot?.sendMessage(chatId, resultMsg, { parse_mode: 'Markdown' });
        } else {
          const errorMsg = `❌ *فشل التنفيذ*\n\n⚠️ الخطأ: ${result.error || result.output}\n\n🔢 Exit Code: ${result.exitCode}`;
          this.bot?.sendMessage(chatId, errorMsg, { parse_mode: 'Markdown' });
        }

      } catch (error: any) {
        console.error('Error in /execute command:', error);
        this.bot?.sendMessage(chatId, `❌ حدث خطأ: ${error.message}`);
      }
    });

    // Handle model selection callbacks
    this.bot.on('callback_query', async (query) => {
      const chatId = query.message?.chat.id;
      const userId = query.from.id;
      const data = query.data;

      if (!chatId || !data) return;

      if (data.startsWith('model:')) {
        const modelKey = data.replace('model:', '') as ModelKey;
        
        await storage.updateTelegramUser(userId, {
          selectedModel: modelKey
        });

        this.bot?.answerCallbackQuery(query.id);
        this.bot?.sendMessage(chatId, `✅ تم تغيير النموذج إلى: *${MODELS[modelKey].name}*`, {
          parse_mode: 'Markdown'
        });
      }
    });
  }

  private setupMessageHandler() {
    if (!this.bot) return;

    this.bot.on('message', async (msg) => {
      // Skip if it's a command
      if (msg.text?.startsWith('/')) return;

      const chatId = msg.chat.id;
      const userId = msg.from?.id;
      const text = msg.text;

      if (!userId || !text) return;

      // Get user data
      const telegramUser = await storage.getTelegramUser(userId);
      if (!telegramUser) {
        this.bot?.sendMessage(chatId, '⚠️ الرجاء البدء بكتابة /start أولاً');
        return;
      }

      // Show typing indicator
      this.bot?.sendChatAction(chatId, 'typing');

      try {
        // Get conversation history
        const history = JSON.parse(telegramUser.conversationHistory || '[]') as Array<{role: string, content: string}>;
        
        // Add user message to history
        history.push({ role: 'user', content: text });

        // Get AI response
        const response = await this.getAIResponse(
          telegramUser.selectedModel as ModelKey,
          history
        );

        // Add AI response to history
        history.push({ role: 'assistant', content: response });

        // Keep only last 20 messages (10 exchanges)
        const trimmedHistory = history.slice(-20);

        // Update user history
        await storage.updateTelegramUser(userId, {
          conversationHistory: JSON.stringify(trimmedHistory)
        });

        // Send response (split if too long)
        if (response.length > 4096) {
          const chunks = this.splitMessage(response, 4096);
          for (const chunk of chunks) {
            await this.bot?.sendMessage(chatId, chunk, { parse_mode: 'Markdown' });
          }
        } else {
          this.bot?.sendMessage(chatId, response, { parse_mode: 'Markdown' });
        }

      } catch (error) {
        console.error('❌ Error handling message:', error);
        this.bot?.sendMessage(chatId, '⚠️ عذراً، حدث خطأ أثناء معالجة رسالتك. الرجاء المحاولة مرة أخرى.');
      }
    });
  }

  private async getAIResponse(model: ModelKey, history: Array<{role: string, content: string}>): Promise<string> {
    const modelConfig = MODELS[model];

    try {
      if (modelConfig.provider === 'openai') {
        if (!openai) {
          return '⚠️ نموذج GPT غير متاح حالياً. يرجى تحديد نموذج آخر باستخدام /model أو التواصل مع المسؤول لإضافة OPENAI_API_KEY.';
        }
        
        // Add system prompt at the beginning
        const messages = [
          { role: 'system', content: PLATFORM_SYSTEM_PROMPT },
          ...history
        ];
        
        const completion = await openai.chat.completions.create({
          model: model,
          messages: messages as any,
          temperature: 0.7,
        });

        return completion.choices[0].message.content || 'لم أتمكن من إنشاء رد.';
      }

      if (modelConfig.provider === 'anthropic') {
        if (!anthropic) {
          return '⚠️ نموذج Claude غير متاح حالياً. يرجى تحديد نموذج آخر باستخدام /model أو التواصل مع المسؤول لإضافة ANTHROPIC_API_KEY.';
        }

        // Convert history to Anthropic format (exclude system messages)
        const messages = history.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }));

        const message = await anthropic.messages.create({
          model: model,
          max_tokens: 2048,
          system: PLATFORM_SYSTEM_PROMPT,
          messages: messages as any,
        });

        const content = message.content[0];
        return content.type === 'text' ? content.text : 'لم أتمكن من إنشاء رد.';
      }

      if (modelConfig.provider === 'gemini') {
        if (!genAI) {
          return '⚠️ نموذج Gemini غير متاح حالياً. يرجى تحديد نموذج آخر باستخدام /model أو التواصل مع المسؤول لإضافة GEMINI_API_KEY.';
        }

        const geminiModel = genAI.getGenerativeModel({ 
          model: 'gemini-2.0-flash-exp',
          systemInstruction: PLATFORM_SYSTEM_PROMPT
        });
        
        // Build conversation context
        const conversationContext = history.map(msg => 
          `${msg.role === 'user' ? 'المستخدم' : 'المساعد'}: ${msg.content}`
        ).join('\n\n');
        
        const result = await geminiModel.generateContent(conversationContext);
        
        return result.response.text() || 'لم أتمكن من إنشاء رد.';
      }

      return '⚠️ نموذج غير مدعوم. يرجى اختيار نموذج آخر باستخدام /model';
    } catch (error) {
      console.error(`❌ Error getting response from ${modelConfig.name}:`, error);
      
      // Return user-friendly error instead of throwing
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          return '⚠️ خطأ في مفتاح API. يرجى التواصل مع المسؤول.';
        }
        if (error.message.includes('rate limit')) {
          return '⚠️ تم تجاوز حد الاستخدام. يرجى المحاولة لاحقاً.';
        }
      }
      return '⚠️ حدث خطأ أثناء الاتصال بنموذج الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.';
    }
  }

  private splitMessage(text: string, maxLength: number): string[] {
    const chunks: string[] = [];
    let currentChunk = '';

    const lines = text.split('\n');

    for (const line of lines) {
      if ((currentChunk + line + '\n').length > maxLength) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = line + '\n';
      } else {
        currentChunk += line + '\n';
      }
    }

    if (currentChunk) chunks.push(currentChunk.trim());

    return chunks;
  }

  public stop() {
    if (this.bot) {
      this.bot.stopPolling();
      console.log('🛑 Telegram Bot stopped');
    }
  }
}
