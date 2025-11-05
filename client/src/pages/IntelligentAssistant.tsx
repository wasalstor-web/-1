import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Send, Brain, Zap, Server, Info, Terminal, Activity, HardDrive, Cpu, MemoryStick, CheckCircle2, XCircle, Rocket, Database, Package, PlayCircle, Settings } from "lucide-react";

interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: {
    type: string;
    action?: string;
    confidence: number;
    vpsTarget?: string;
  };
  executed?: boolean;
  executionPlan?: string[];
  needsMoreInfo?: boolean;
  suggestions?: string[];
  timestamp: Date;
}

interface ProcessResponse {
  message: string;
  intent: {
    type: string;
    action?: string;
    target?: string;
    confidence: number;
    needsMoreInfo: boolean;
    vpsTarget?: string;
  };
  executed: boolean;
  results?: any;
  needsMoreInfo: boolean;
  suggestions?: string[];
  executionPlan?: string[];
}

export default function IntelligentAssistant() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'مرحباً! أنا المساعد الذكي المتقدم\n\nيمكنني:\n• فهم النوايا وتحليل الأوامر\n• تنفيذ الأوامر على السيرفرات عبر SSH\n• الاتصال تلقائياً بـ VPS\n\nجرب الأزرار السريعة أو اكتب أي أمر تريده!',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const userIdRef = useRef<string>("");
  if (!userIdRef.current) {
    const stored = localStorage.getItem('intelligent-assistant-userId');
    if (stored) {
      userIdRef.current = stored;
    } else {
      const newId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('intelligent-assistant-userId', newId);
      userIdRef.current = newId;
    }
  }
  const userId = userIdRef.current;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentAssistantMessage]);

  const processMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/intelligent-assistant/process", {
        userId,
        message,
      });
      return (await response.json()) as ProcessResponse;
    },
    onSuccess: (data) => {
      const assistantMessage: AssistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        intent: data.intent,
        executed: data.executed,
        executionPlan: data.executionPlan,
        needsMoreInfo: data.needsMoreInfo,
        suggestions: data.suggestions,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCurrentAssistantMessage('');
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في معالجة الرسالة",
        variant: "destructive",
      });
      setCurrentAssistantMessage('');
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim() || processMutation.isPending) return;

    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentAssistantMessage('جاري التحليل...');
    processMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getIntentColor = (type: string) => {
    switch (type) {
      case 'command': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'task': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'question': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getIntentIcon = (type: string) => {
    switch (type) {
      case 'command': return <Zap className="w-3 h-3" />;
      case 'task': return <Brain className="w-3 h-3" />;
      case 'question': return <Info className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col max-w-7xl mx-auto" data-testid="page-intelligent-assistant">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              المساعد الذكي المتعدد الطبقات
            </h1>
            <p className="text-muted-foreground">تحليل النوايا • تنفيذ الأوامر • اتصال VPS</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto pb-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30'
                      : 'bg-card border'
                  }`}
                >
                  <div className="space-y-3">
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                    {msg.intent && msg.role === 'assistant' && (
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className={getIntentColor(msg.intent.type)}>
                            {getIntentIcon(msg.intent.type)}
                            <span className="mr-1">{msg.intent.type}</span>
                          </Badge>

                          {msg.intent.action && (
                            <Badge variant="outline" className="text-xs">
                              {msg.intent.action}
                            </Badge>
                          )}

                          {msg.intent.vpsTarget && (
                            <Badge variant="outline" className="text-xs">
                              <Server className="w-3 h-3 ml-1" />
                              {msg.intent.vpsTarget}
                            </Badge>
                          )}

                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              msg.intent.confidence > 0.7
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-yellow-500/10 text-yellow-400'
                            }`}
                          >
                            {(msg.intent.confidence * 100).toFixed(0)}% ثقة
                          </Badge>

                          {msg.executed !== undefined && (
                            <Badge
                              variant="outline"
                              className={msg.executed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}
                            >
                              {msg.executed ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 ml-1" />
                                  منفذ
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 ml-1" />
                                  غير منفذ
                                </>
                              )}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {msg.executionPlan && msg.executionPlan.length > 0 && (
                      <div className="text-xs space-y-1 pt-2 border-t">
                        <p className="font-semibold text-muted-foreground">خطة التنفيذ:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          {msg.executionPlan.map((step, idx) => (
                            <li key={idx} className="text-muted-foreground">{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {msg.suggestions.map((suggestion, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            onClick={() => setInputMessage(suggestion)}
                            className="text-xs"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      {msg.timestamp.toLocaleTimeString('ar-SA')}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {currentAssistantMessage && (
              <div className="flex justify-start">
                <div className="bg-card border rounded-lg p-4 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">{currentAssistantMessage}</span>
                  </div>
                </div>
              </div>
            )}

            {processMutation.isPending && !currentAssistantMessage && (
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
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="min-h-24 resize-none"
              disabled={processMutation.isPending}
              data-testid="input-message"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                اضغط Enter للإرسال، Shift+Enter لسطر جديد
              </span>
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || processMutation.isPending}
                className="bg-gradient-to-r from-cyan-500 to-purple-600"
                data-testid="button-send"
              >
                <Send className="w-5 h-5 ml-2" />
                {processMutation.isPending ? 'جاري المعالجة...' : 'إرسال'}
              </Button>
            </div>
          </div>
        </div>

        <div className="w-80 space-y-6 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle>أوامر سريعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage("hostname")}
                  className="text-xs justify-start"
                  data-testid="button-quick-hostname"
                >
                  <Terminal className="w-3 h-3 ml-1" />
                  اسم السيرفر
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage("uname -a")}
                  className="text-xs justify-start"
                  data-testid="button-quick-sysinfo"
                >
                  <Info className="w-3 h-3 ml-1" />
                  معلومات النظام
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage("uptime")}
                  className="text-xs justify-start"
                  data-testid="button-quick-uptime"
                >
                  <Activity className="w-3 h-3 ml-1" />
                  وقت التشغيل
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage("df -h")}
                  className="text-xs justify-start"
                  data-testid="button-quick-disk"
                >
                  <HardDrive className="w-3 h-3 ml-1" />
                  مساحة القرص
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage("free -h")}
                  className="text-xs justify-start"
                  data-testid="button-quick-memory"
                >
                  <MemoryStick className="w-3 h-3 ml-1" />
                  الذاكرة
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage("ps aux | head -15")}
                  className="text-xs justify-start"
                  data-testid="button-quick-processes"
                >
                  <Cpu className="w-3 h-3 ml-1" />
                  العمليات
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-cyan-400" />
                نشر التطبيق على Hostinger
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage("انشر منصة مبسط AI على السيرفر الرئيسي بالكامل")}
                  className="w-full justify-start text-xs bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30"
                  data-testid="button-deploy-full"
                >
                  <Rocket className="w-3 h-3 ml-1" />
                  نشر كامل تلقائي
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage("sudo apt update && sudo apt upgrade -y")}
                  className="w-full justify-start text-xs"
                  data-testid="button-deploy-update"
                >
                  <Package className="w-3 h-3 ml-1" />
                  1. تحديث النظام
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage("curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs")}
                  className="w-full justify-start text-xs"
                  data-testid="button-deploy-node"
                >
                  <Settings className="w-3 h-3 ml-1" />
                  2. تثبيت Node.js 20
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage("sudo apt install -y postgresql postgresql-contrib && sudo systemctl start postgresql")}
                  className="w-full justify-start text-xs"
                  data-testid="button-deploy-postgres"
                >
                  <Database className="w-3 h-3 ml-1" />
                  3. تثبيت PostgreSQL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage("sudo npm install -g pm2 && sudo apt install -y nginx")}
                  className="w-full justify-start text-xs"
                  data-testid="button-deploy-services"
                >
                  <Server className="w-3 h-3 ml-1" />
                  4. تثبيت PM2 + Nginx
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage("sudo mkdir -p /var/www/mubsat-ai && sudo chown -R $USER:$USER /var/www/mubsat-ai")}
                  className="w-full justify-start text-xs"
                  data-testid="button-deploy-dir"
                >
                  <Terminal className="w-3 h-3 ml-1" />
                  5. إنشاء المجلد
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage("pm2 status")}
                  className="w-full justify-start text-xs"
                  data-testid="button-deploy-status"
                >
                  <PlayCircle className="w-3 h-3 ml-1" />
                  التحقق من الحالة
                </Button>
              </div>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  💡 نصيحة: استخدم "نشر كامل تلقائي" لتنفيذ جميع الخطوات دفعة واحدة
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>القدرات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">تحليل النوايا</p>
                  <p className="text-xs text-muted-foreground">فهم عميق لما تريده بالضبط</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">تنفيذ الأوامر</p>
                  <p className="text-xs text-muted-foreground">تحويل الأوامر لإجراءات فعلية</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Server className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">اتصال VPS</p>
                  <p className="text-xs text-muted-foreground">تنفيذ مباشر عبر SSH</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>أمثلة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              <p>• اعرض مساحة القرص</p>
              <p>• معلومات النظام</p>
              <p>• hostname</p>
              <p>• تحقق من حالة السيرفر</p>
              <p>• استخدام الذاكرة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>معلومات الجلسة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">عدد الرسائل:</span>
                <span className="font-medium">{messages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">معرف المستخدم:</span>
                <span className="font-mono text-xs">{userId.slice(0, 12)}...</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">الحالة:</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-400">
                  <CheckCircle2 className="w-3 h-3 ml-1" />
                  نشط
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
