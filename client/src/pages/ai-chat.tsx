import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { Send, Sparkles, Loader2, CheckCircle2, Brain } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🌟 **مرحباً بك في واجهة AI الموحدة!**\n\nجميع النماذج المتصلة جاهزة للرد عليك في نفس الوقت:\n\n✅ **النماذج المتاحة:**\n🤖 GPT-4, GPT-4 Mini (OpenAI)\n🧠 Claude 3.5 Sonnet (Anthropic)  \n✨ Gemini 2.0 Flash (Google)\n🚀 Qwen 2.5, LLaMA 3.3, Mistral, DeepSeek (Hugging Face)\n\n💡 **كيف يعمل:**\nاكتب سؤالك أو طلبك، وكل النماذج المتصلة ستعطيك الإجابة!\nكل رد سيظهر مع اسم النموذج الذي أجاب.\n\nما الذي تريد أن تسأل عنه؟',
      timestamp: new Date(),
      model: 'system'
    }
  ]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get available models
  const { data: modelsData } = useQuery({
    queryKey: ['/api/ai-brain/models'],
  });

  // Send message to ALL connected models
  const sendMessage = useMutation({
    mutationFn: async (userInput: string) => {
      const response = await apiRequest('POST', '/api/ai-brain/process-all', {
        input: userInput,
        sessionId,
        userId: 'user-1',
        context: {
          previousMessages: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      console.log('Multi-Model Response:', data);
      
      // إضافة رد من كل نموذج
      if (data.responses && data.responses.length > 0) {
        const newMessages: Message[] = data.responses.map((response: any, index: number) => ({
          id: `msg-${Date.now()}-${index}`,
          role: 'assistant' as const,
          content: response.status === 'success' 
            ? response.output 
            : `⚠️ ${response.error || 'فشل في الحصول على رد'}`,
          timestamp: new Date(),
          model: response.model
        }));
        
        setMessages(prev => [...prev, ...newMessages]);
      } else {
        // في حالة عدم وجود نماذج متصلة
        const errorMessage: Message = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ لا توجد نماذج متصلة حالياً. تحقق من إعدادات API Keys.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    },
    onError: (error: any) => {
      const errorMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `❌ خطأ في الاتصال: ${error.message || 'فشل الاتصال بالخادم'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  // Handle send
  const handleSend = () => {
    if (!input.trim() || sendMessage.isPending) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    sendMessage.mutate(input);
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const connectedModels = (modelsData as any)?.connected || 0;
  const totalModels = (modelsData as any)?.total || 8;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  🌟 محادثة AI الموحدة
                  <Sparkles className="w-5 h-5 text-primary" />
                </h1>
                <p className="text-sm text-muted-foreground">
                  جميع النماذج ترد عليك في نفس الوقت - واجهة واحدة، ردود متعددة
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                {connectedModels}/{totalModels} نموذج نشط
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="container mx-auto max-w-4xl space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card'
              }`}>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {message.role === 'assistant' && (
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {/* Model Badge */}
                      {message.model && message.model !== 'system' && (
                        <Badge variant="secondary" className="mb-2 text-xs">
                          {message.model === 'executive-agent' && '⚡ Executive Agent'}
                          {message.model === 'smart-agent' && '🧠 Smart Agent'}
                          {message.model === 'gpt-4' && '🤖 GPT-4'}
                          {message.model === 'gpt-4o-mini' && '🤖 GPT-4 Mini'}
                          {message.model === 'claude-3.5-sonnet' && '🧠 Claude 3.5'}
                          {message.model === 'gemini-2.0-flash' && '✨ Gemini 2.0'}
                          {message.model === 'qwen-2.5-coder' && '🚀 Qwen 2.5'}
                          {message.model === 'llama-3.3' && '🚀 LLaMA 3.3'}
                          {message.model === 'mistral-large' && '🚀 Mistral'}
                          {message.model === 'deepseek-r1' && '🚀 DeepSeek'}
                        </Badge>
                      )}
                      <p className="whitespace-pre-wrap break-words" dir="auto">
                        {message.content}
                      </p>
                      <p className={`text-xs mt-2 ${
                        message.role === 'user' 
                          ? 'text-primary-foreground/60' 
                          : 'text-muted-foreground'
                      }`}>
                        {message.timestamp.toLocaleTimeString('ar-SA', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
          
          {sendMessage.isPending && (
            <div className="flex justify-start">
              <Card className="bg-card">
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <p className="text-muted-foreground">جاري التفكير...</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك أو أمرك هنا... (Shift+Enter للسطر الجديد)"
              className="resize-none min-h-[60px] max-h-[200px]"
              dir="auto"
              data-testid="input-chat-message"
              disabled={sendMessage.isPending}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || sendMessage.isPending}
              size="icon"
              className="h-[60px] w-[60px]"
              data-testid="button-send-message"
            >
              {sendMessage.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          
          {/* Models Status */}
          {modelsData && (modelsData as any).models && (
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <span>النماذج المتصلة:</span>
              {(modelsData as any).models
                ?.filter((m: any) => m.status === 'connected')
                .map((m: any) => (
                  <Badge key={m.id} variant="secondary" className="text-xs">
                    {m.name}
                  </Badge>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
