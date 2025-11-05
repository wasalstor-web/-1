import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Server,
  Terminal,
  Zap,
  Activity,
  HardDrive,
  Cpu,
  Network,
  RefreshCw,
  Play,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function ServerManager() {
  const { toast } = useToast();
  const [command, setCommand] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);

  const { data: servers, isLoading } = useQuery<any[]>({
    queryKey: ['/api/servers'],
  });

  const activeServer = servers?.find(s => s.sshEnabled);

  const executeCommandMutation = useMutation({
    mutationFn: async (cmd: string) => {
      if (!activeServer) throw new Error("No server available");
      const response = await apiRequest("POST", `/api/servers/${activeServer.id}/execute`, { command: cmd });
      return await response.json();
    },
    onSuccess: (data, cmd) => {
      const output = `$ ${cmd}\n${data.output || data.error || 'No output'}`;
      setTerminalHistory(prev => [...prev, output]);
      setCommand("");
      
      if (data.success) {
        toast({
          title: "✅ تم التنفيذ",
          description: "نجح تنفيذ الأمر",
        });
      } else {
        toast({
          title: "❌ خطأ",
          description: data.error || "فشل التنفيذ",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "❌ خطأ",
        description: error.message || "فشل الاتصال بالسيرفر",
        variant: "destructive",
      });
    },
  });

  const quickCommands = [
    { label: "معلومات النظام", cmd: "uname -a", icon: Cpu },
    { label: "وقت التشغيل", cmd: "uptime", icon: Activity },
    { label: "مساحة التخزين", cmd: "df -h", icon: HardDrive },
    { label: "الذاكرة", cmd: "free -h", icon: Cpu },
    { label: "العمليات", cmd: "ps aux | head -10", icon: Terminal },
    { label: "الشبكة", cmd: "ip addr show", icon: Network },
  ];

  const handleExecute = () => {
    if (!command.trim()) return;
    executeCommandMutation.mutate(command);
  };

  const handleQuickCommand = (cmd: string) => {
    executeCommandMutation.mutate(cmd);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6" dir="rtl">
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      </div>
    );
  }

  if (!activeServer) {
    return (
      <div className="container mx-auto p-6" dir="rtl">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-red-400" />
              لا يوجد سيرفر متصل
            </CardTitle>
            <CardDescription>
              لا يوجد سيرفر مفعل بـ SSH. يرجى إضافة سيرفر من صفحة المساعد الذكي.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            إدارة السيرفر
          </h1>
          <p className="text-muted-foreground text-lg">
            تحكم كامل بالسيرفر عبر SSH - نفذ الأوامر واعرض الموارد
          </p>
        </div>

        {/* Server Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              معلومات السيرفر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">الاسم</p>
                <p className="font-semibold">{activeServer.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">العنوان</p>
                <p className="font-mono text-sm">{activeServer.sshHost}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">المنفذ</p>
                <p className="font-mono">{activeServer.sshPort}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">الحالة</p>
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                  <CheckCircle2 className="w-3 h-3 ml-1" />
                  متصل
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Terminal */}
          <Card className="lg:col-span-2 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                Terminal
              </CardTitle>
              <CardDescription>
                نفذ أي أمر على السيرفر مباشرة
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
              {/* Command Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="اكتب الأمر هنا..."
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleExecute();
                    }
                  }}
                  className="font-mono flex-1"
                  data-testid="input-command"
                />
                <Button
                  onClick={handleExecute}
                  disabled={!command.trim() || executeCommandMutation.isPending}
                  data-testid="button-execute"
                >
                  {executeCommandMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Terminal Output */}
              <Card className="flex-1 bg-black/50 border-cyan-500/30">
                <CardContent className="p-4">
                  <ScrollArea className="h-96">
                    <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap" dir="ltr">
                      {terminalHistory.length === 0 ? (
                        <span className="text-muted-foreground">$ اكتب أمر لبدء التنفيذ...</span>
                      ) : (
                        terminalHistory.join('\n\n')
                      )}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Quick Commands */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                أوامر سريعة
              </CardTitle>
              <CardDescription>
                أوامر جاهزة للتنفيذ السريع
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickCommands.map((qc, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full justify-start gap-2 hover-elevate"
                    onClick={() => handleQuickCommand(qc.cmd)}
                    disabled={executeCommandMutation.isPending}
                    data-testid={`button-quick-${idx}`}
                  >
                    <qc.icon className="w-4 h-4" />
                    <span className="flex-1">{qc.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
