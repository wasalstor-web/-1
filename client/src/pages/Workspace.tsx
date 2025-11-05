import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { AIModelSelector } from "@/components/AIModelSelector";
import { CreativitySlider } from "@/components/CreativitySlider";
import { ChatMessage } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AIModel = 'gpt-4' | 'claude' | 'gemini';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function Workspace() {
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4');
  const [creativity, setCreativity] = useState(50);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  //todo: remove mock functionality
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟',
      timestamp: 'الآن',
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: 'الآن',
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    //todo: remove mock functionality - replace with actual AI API call
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `تم استلام رسالتك! أنا أستخدم نموذج ${selectedModel} مع مستوى إبداع ${creativity}%. سأساعدك في ${input}`,
        timestamp: 'الآن',
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col max-w-7xl mx-auto" data-testid="page-workspace">
      <div className="p-6 border-b">
        <h1 className="text-3xl font-bold">مساحة العمل AI</h1>
        <p className="text-muted-foreground">تفاعل مع نماذج الذكاء الاصطناعي المتقدمة</p>
      </div>

      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto pb-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} {...message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري الكتابة...</span>
              </div>
            )}
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
                إرسال
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>معلومات النموذج</CardTitle>
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
