import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Send, Loader2, Server, CheckCircle, XCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Server as ServerType } from "@shared/schema";

interface CommandResult {
  success: boolean;
  output: string;
  exitCode: number;
  error?: string;
}

export default function QuickSSH() {
  const [command, setCommand] = useState("");
  const { toast } = useToast();

  // Fetch available servers
  const { data: servers, isLoading: serversLoading } = useQuery<ServerType[]>({
    queryKey: ["/api/servers"],
  });

  const activeServer = servers?.find(s => s.isActive && s.sshEnabled);

  // Execute SSH command
  const executeMutation = useMutation({
    mutationFn: async (cmd: string) => {
      if (!activeServer) {
        throw new Error("لا يوجد سيرفر نشط");
      }
      const response = await apiRequest(
        "POST",
        `/api/servers/${activeServer.id}/execute`,
        { command: cmd }
      );
      return response.json();
    },
    onSuccess: (data: CommandResult) => {
      if (data.success) {
        toast({
          title: "✅ تم تنفيذ الأمر بنجاح",
          description: "Exit code: " + data.exitCode,
        });
      } else {
        toast({
          title: "⚠️ فشل تنفيذ الأمر",
          description: data.error || "حدث خطأ",
          variant: "destructive",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/server-commands"] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ خطأ في الاتصال",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch recent commands
  const { data: recentCommands } = useQuery({
    queryKey: ["/api/server-commands"],
  });

  const handleExecute = () => {
    if (!command.trim()) return;
    executeMutation.mutate(command);
  };

  const quickCommands = [
    { label: "التحقق من Node.js", cmd: "node -v && npm -v" },
    { label: "عرض الذاكرة", cmd: "free -h" },
    { label: "عرض المساحة", cmd: "df -h" },
    { label: "العمليات النشطة", cmd: "ps aux | head -10" },
    { label: "تحديث النظام", cmd: "sudo apt update" },
    { label: "إنشاء مجلد", cmd: "mkdir -p /var/www/mubsat-ai" },
  ];

  if (serversLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Terminal className="w-8 h-8" />
          اختبار سريع - SSH Terminal
        </h1>
        <p className="text-muted-foreground mt-2">
          تنفيذ أوامر SSH مباشرة على السيرفر
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Server Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              معلومات السيرفر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeServer ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الاسم:</span>
                  <Badge variant="default">{activeServer.name}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">العنوان:</span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {activeServer.sshHost || activeServer.host}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">SSH Port:</span>
                  <Badge variant="outline">{activeServer.sshPort || 22}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الحالة:</span>
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    متصل
                  </Badge>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <XCircle className="w-12 h-12 text-destructive mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  لا يوجد سيرفر نشط مع SSH
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Commands */}
        <Card>
          <CardHeader>
            <CardTitle>أوامر سريعة</CardTitle>
            <CardDescription>اضغط لتنفيذ أمر جاهز</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {quickCommands.map((qc, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => setCommand(qc.cmd)}
                  disabled={!activeServer || executeMutation.isPending}
                  className="text-xs"
                  data-testid={`button-quick-${idx}`}
                >
                  {qc.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Command Input */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>تنفيذ أمر SSH</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="اكتب الأمر هنا... مثال: ls -la"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="font-mono text-sm min-h-[100px]"
              dir="ltr"
              data-testid="input-ssh-command"
            />
          </div>
          <Button
            onClick={handleExecute}
            disabled={!activeServer || !command.trim() || executeMutation.isPending}
            className="w-full"
            data-testid="button-execute-ssh"
          >
            {executeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                جاري التنفيذ...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 ml-2" />
                تنفيذ الأمر
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Command Results */}
      {executeMutation.data && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>نتيجة الأمر</span>
              <Badge
                variant={executeMutation.data.success ? "default" : "destructive"}
              >
                Exit Code: {executeMutation.data.exitCode}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full">
              <pre className="text-xs bg-black text-green-400 p-4 rounded-lg font-mono overflow-x-auto" dir="ltr">
                {executeMutation.data.output || executeMutation.data.error || "لا توجد نتائج"}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Recent Commands History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>آخر الأوامر المنفذة</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {recentCommands && Array.isArray(recentCommands) && recentCommands.length > 0 ? (
              <div className="space-y-2">
                {recentCommands.slice(0, 10).map((cmd: any) => (
                  <div
                    key={cmd.id}
                    className="flex items-center justify-between p-2 rounded bg-muted hover-elevate"
                  >
                    <code className="text-xs flex-1" dir="ltr">
                      {cmd.command}
                    </code>
                    <Badge
                      variant={cmd.status === "completed" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {cmd.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                لا توجد أوامر سابقة
              </p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
