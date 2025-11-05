import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Save } from "lucide-react";
import { AIModelSelector } from "@/components/AIModelSelector";
import { CreativitySlider } from "@/components/CreativitySlider";
import { ChatMessage } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { chatApi, type ChatMessage as ChatMessageType, conversationsApi } from "@/lib/api";
import { useLocation } from "wouter";

type AIModel = 'gpt-4' | 'claude' | 'gemini';

interface Message extends ChatMessageType {
  id: string;
  timestamp: string;
}

export default function Workspace() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4');
  const [creativity, setCreativity] = useState(50);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'مرحباً! أنا مساعدك الذكي المدعوم بأحدث نماذج الذكاء الاصطناعي. اختر النموذج الذي تفضله وابدأ المحادثة!',
      timestamp: 'الآن',
    },
  ]);
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamedMessageRef = useRef('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentAssistantMessage]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: 'الآن',
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setCurrentAssistantMessage('');
    streamedMessageRef.current = '';

    const chatHistory: ChatMessageType[] = [
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: input },
    ];

    const temperature = creativity / 100;

    await chatApi.stream(
      { model: selectedModel, messages: chatHistory, temperature },
      (content) => {
        streamedMessageRef.current += content;
        setCurrentAssistantMessage(streamedMessageRef.current);
      },
      () => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: streamedMessageRef.current,
          timestamp: 'الآن',
        }]);
        setCurrentAssistantMessage('');
        streamedMessageRef.current = '';
        setIsLoading(false);
      },
      (error) => {
        console.error('Chat error:', error);
        toast({
          title: "خطأ في المحادثة",
          description: "حدث خطأ أثناء التواصل مع النموذج. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
        setIsLoading(false);
        setCurrentAssistantMessage('');
        streamedMessageRef.current = '';
      }
    );
  };

  const handleSaveConversation = async () => {
    try {
      const messagesJson = JSON.stringify(messages.map(m => ({
        role: m.role,
        content: m.content
      })));

      await conversationsApi.create({
        projectId: null,
        aiModel: selectedModel,
        messages: messagesJson,
      });

      toast({
        title: "تم حفظ المحادثة",
        description: "تم حفظ المحادثة بنجاح",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ المحادثة",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col max-w-7xl mx-auto" data-testid="page-workspace">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              مساحة العمل AI
            </h1>
            <p className="text-muted-foreground">تفاعل مع أقوى نماذج الذكاء الاصطناعي</p>
          </div>
          <Button
            onClick={handleSaveConversation}
            variant="outline"
            disabled={messages.length <= 1}
            data-testid="button-save-conversation"
          >
            <Save className="w-5 h-5 ml-2" />
            حفظ المحادثة
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto pb-6 space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} {...message} />
            ))}
            {currentAssistantMessage && (
              <ChatMessage
                role="assistant"
                content={currentAssistantMessage}
                timestamp="جاري الكتابة..."
              />
            )}
            {isLoading && !currentAssistantMessage && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري التفكير...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="space-y-3 pt-4 border-t">
            <Textarea
              placeholder="اكتب رسالتك هنا..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="min-h-24 resize-none"
              disabled={isLoading}
              data-testid="textarea-message-input"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                اضغط Enter للإرسال، Shift+Enter لسطر جديد
              </span>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                data-testid="button-send-message"
              >
                <Send className="w-5 h-5 ml-2" />
                {isLoading ? 'جاري الإرسال...' : 'إرسال'}
              </Button>
            </div>
          </div>
        </div>

        <div className="w-80 space-y-6 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle>اختر النموذج</CardTitle>
            </CardHeader>
            <CardContent>
              <AIModelSelector value={selectedModel} onChange={setSelectedModel} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الإعدادات</CardTitle>
            </CardHeader>
            <CardContent>
              <CreativitySlider value={creativity} onChange={setCreativity} />
              <p className="text-xs text-muted-foreground mt-3">
                {creativity < 33 && 'نموذج دقيق ومحدد في الإجابات'}
                {creativity >= 33 && creativity < 66 && 'نموذج متوازن بين الدقة والإبداع'}
                {creativity >= 66 && 'نموذج إبداعي ومتنوع في الإجابات'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>معلومات الجلسة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">النموذج الحالي:</span>
                <span className="font-medium">{selectedModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">عدد الرسائل:</span>
                <span className="font-medium">{messages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">مستوى الإبداع:</span>
                <span className="font-medium">{creativity}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
