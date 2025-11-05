import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Send, Brain, Zap, Server, Trash2, CheckCircle2, XCircle, Info, Download, Code, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showABIDialog, setShowABIDialog] = useState(false);
  const [abiServerName, setAbiServerName] = useState("");
  const [abiServerType, setAbiServerType] = useState<'vps' | 'hostinger' | 'shared'>('vps');
  const [abiFiles, setAbiFiles] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
    },
    onError: (error: any) => {
      toast({
        title: "❌ خطأ",
        description: error.message || "فشل في معالجة الرسالة",
        variant: "destructive",
      });
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/intelligent-assistant/clear-history", {
        userId,
      });
      return await response.json();
    },
    onSuccess: () => {
      setMessages([]);
      toast({
        title: "✅ تم المسح",
        description: "تم مسح سجل المحادثة بنجاح",
      });
    },
  });

  const generateABIMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/intelligent-assistant/generate-abi", {
        serverName: abiServerName,
        serverType: abiServerType,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setAbiFiles(data);
      toast({
        title: "✅ تم إنشاء ABI",
        description: `تم إنشاء ABI للسيرفر ${data.serverName} بنجاح`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ خطأ",
        description: error.message || "فشل في إنشاء ABI",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
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
    <div className="container mx-auto p-6 h-full flex flex-col" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            المساعد الذكي المتقدم
          </h1>
          <p className="text-muted-foreground text-lg">
            مساعد AI متعدد الطبقات - يفهم النوايا، ينفذ الأوامر، ويتصل بـ VPS تلقائياً
          </p>
        </div>
        
        <Dialog open={showABIDialog} onOpenChange={setShowABIDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2" data-testid="button-abi-generator">
              <Package className="w-4 h-4" />
              إنشاء ABI
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>إنشاء ABI موحد للسيرفر</DialogTitle>
              <DialogDescription>
                قم بإنشاء Agent Binary Interface يمكن تثبيته على أي VPS أو Hostinger
              </DialogDescription>
            </DialogHeader>
            
            {!abiFiles ? (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="server-name">اسم السيرفر</Label>
                  <Input
                    id="server-name"
                    placeholder="مثال: VPS-1, HOSTINGER-MAIN"
                    value={abiServerName}
                    onChange={(e) => setAbiServerName(e.target.value)}
                    data-testid="input-server-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="server-type">نوع السيرفر</Label>
                  <Select value={abiServerType} onValueChange={(value: any) => setAbiServerType(value)}>
                    <SelectTrigger data-testid="select-server-type">
                      <SelectValue placeholder="اختر نوع السيرفر" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vps">VPS</SelectItem>
                      <SelectItem value="hostinger">Hostinger</SelectItem>
                      <SelectItem value="shared">Shared Hosting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => generateABIMutation.mutate()}
                  disabled={!abiServerName || generateABIMutation.isPending}
                  className="w-full"
                  data-testid="button-generate"
                >
                  {generateABIMutation.isPending ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Code className="ml-2 h-4 w-4" />
                      إنشاء ABI
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <h3 className="font-semibold text-green-400 mb-2">✅ تم إنشاء ABI بنجاح!</h3>
                  <p className="text-sm text-muted-foreground">
                    السيرفر: <span className="font-mono">{abiFiles.serverName}</span> | 
                    النوع: <span className="font-mono">{abiFiles.serverType}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">الملفات المتاحة:</h4>
                  <div className="space-y-2">
                    {Object.keys(abiFiles.files).map((filename) => (
                      <div key={filename} className="flex items-center justify-between p-3 bg-card border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-cyan-400" />
                          <span className="font-mono text-sm">{filename}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const blob = new Blob([abiFiles.files[filename]], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = filename;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                        >
                          <Download className="w-4 h-4 ml-1" />
                          تنزيل
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">خطوات التثبيت:</h4>
                  <ScrollArea className="h-[200px] rounded-lg border p-4">
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      {abiFiles.instructions.steps.map((step: string, idx: number) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </ScrollArea>
                </div>

                <Button
                  onClick={() => {
                    setAbiFiles(null);
                    setAbiServerName("");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  إنشاء ABI جديد
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Chat Area */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-cyan-400" />
                المحادثة
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearHistoryMutation.mutate()}
                disabled={messages.length === 0 || clearHistoryMutation.isPending}
                data-testid="button-clear-history"
              >
                <Trash2 className="w-4 h-4 ml-2" />
                مسح السجل
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-12">
                    <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">ابدأ محادثة مع المساعد الذكي</p>
                    <p className="text-sm mt-2">يمكنك طلب أي شيء - سأحلل النية وأنفذها تلقائياً</p>
                  </div>
                )}

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
                        <p className="whitespace-pre-wrap">{msg.content}</p>

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

                {processMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-card border rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">جاري التحليل والمعالجة...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="pt-4 space-y-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك هنا... (Shift+Enter للسطر الجديد، Enter للإرسال)"
                className="resize-none"
                rows={3}
                data-testid="input-message"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || processMutation.isPending}
                className="w-full"
                data-testid="button-send"
              >
                {processMutation.isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <Send className="ml-2 h-4 w-4" />
                    إرسال
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">القدرات</CardTitle>
            <CardDescription>ما يمكن للمساعد فعله</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">تحليل النوايا</p>
                  <p className="text-xs text-muted-foreground">فهم عميق لما تريده بالضبط</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">تنفيذ الأوامر</p>
                  <p className="text-xs text-muted-foreground">تحويل الأوامر لإجراءات فعلية</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Server className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">اتصال VPS</p>
                  <p className="text-xs text-muted-foreground">تنفيذ الأوامر على السيرفرات</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">تفويض ذكي</p>
                  <p className="text-xs text-muted-foreground">استدعاء نماذج AI أقوى عند الحاجة</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">أمثلة على الأوامر:</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• "تحقق من حالة السيرفر"</p>
                <p>• "أنشئ موقع جديد"</p>
                <p>• "طور نفسك"</p>
                <p>• "اعطني ABI لسيرفر VPS-1"</p>
                <p>• "اعرض المساحة المتاحة"</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
