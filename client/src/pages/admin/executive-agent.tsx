import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Zap,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  FileText,
  Play,
  Pause,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ExecutiveAgentPage() {
  const { toast } = useToast();
  const [command, setCommand] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Get system status
  const { data: systemStatus } = useQuery({
    queryKey: ['/api/executive/status'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Get active executions
  const { data: activeExecutions } = useQuery({
    queryKey: ['/api/executive/active-executions'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Get decision log
  const { data: decisionLog } = useQuery({
    queryKey: ['/api/executive/decision-log'],
    refetchInterval: 10000,
  });

  // Submit command mutation
  const submitCommandMutation = useMutation({
    mutationFn: async (cmd: string) => {
      const res = await apiRequest('POST', '/api/executive/command', {
        command: cmd,
        user_id: 'admin',
        priority: 'medium',
      });
      return await res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "✅ خطة جاهزة",
        description: data.message,
      });
      setSelectedPlanId(data.command_id);
      queryClient.invalidateQueries({ queryKey: ['/api/executive/active-executions'] });
      setCommand("");
    },
    onError: (error: any) => {
      toast({
        title: "❌ خطأ",
        description: error.message || "فشل معالجة الأمر",
        variant: "destructive",
      });
    },
  });

  // Approve and execute mutation
  const approveExecutionMutation = useMutation({
    mutationFn: async (commandId: string) => {
      const res = await apiRequest('POST', '/api/executive/approve', {
        command_id: commandId,
        approved_by: 'admin',
      });
      return await res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: data.success ? "✅ تم التنفيذ بنجاح" : "⚠️ فشل التنفيذ",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/executive/active-executions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/executive/decision-log'] });
      setSelectedPlanId(null);
    },
    onError: (error: any) => {
      toast({
        title: "❌ خطأ في التنفيذ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Direct execute mutation (no approval needed)
  const directExecuteMutation = useMutation({
    mutationFn: async (cmd: string) => {
      const res = await apiRequest('POST', '/api/executive/execute', {
        command: cmd,
        user_id: 'admin',
      });
      return await res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: data.success ? "✅ تم التنفيذ" : "⚠️ يتطلب موافقة",
        description: data.message || `Completed ${data.completed_steps} steps`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/executive/decision-log'] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitCommand = () => {
    if (command.trim()) {
      submitCommandMutation.mutate(command.trim());
    }
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            AI Executive Agent vMax
          </h1>
          <p className="text-muted-foreground mt-1">
            الوكيل التنفيذي الذكي - إدارة ذاتية للمنصة
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={(systemStatus as any)?.status === 'operational' ? 'default' : 'destructive'}>
            {(systemStatus as any)?.status || 'جاري التحميل...'}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="command" className="space-y-4">
        <TabsList>
          <TabsTrigger value="command">
            <Zap className="w-4 h-4 ml-2" />
            الأوامر
          </TabsTrigger>
          <TabsTrigger value="executions">
            <Play className="w-4 h-4 ml-2" />
            التنفيذات النشطة ({(activeExecutions as any)?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="log">
            <FileText className="w-4 h-4 ml-2" />
            سجل القرارات ({(decisionLog as any)?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="status">
            <Shield className="w-4 h-4 ml-2" />
            الحالة
          </TabsTrigger>
        </TabsList>

        {/* Command Tab */}
        <TabsContent value="command" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إرسال أمر جديد</CardTitle>
              <CardDescription>
                أدخل أمرك باللغة الطبيعية (عربي أو إنجليزي)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                data-testid="input-executive-command"
                placeholder="مثال: نشر المنصة على السيرفر، إنشاء بوت ذكي جديد، تحليل الأداء..."
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="flex gap-2">
                <Button
                  data-testid="button-submit-command"
                  onClick={handleSubmitCommand}
                  disabled={!command.trim() || submitCommandMutation.isPending}
                >
                  {submitCommandMutation.isPending ? "جاري التحليل..." : "إنشاء خطة"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => directExecuteMutation.mutate(command)}
                  disabled={!command.trim() || directExecuteMutation.isPending}
                >
                  {directExecuteMutation.isPending ? "جاري التنفيذ..." : "تنفيذ مباشر"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Examples */}
          <Card>
            <CardHeader>
              <CardTitle>أمثلة للأوامر</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {[
                  "نشر المنصة على السيرفر مع اختبار Canary",
                  "إنشاء بوت ذكي لخدمة العملاء",
                  "تحليل أداء النظام وتقديم توصيات",
                  "فحص الأمان والثغرات",
                  "إنشاء تقرير عن التكاليف",
                ].map((example, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    className="justify-start text-right"
                    onClick={() => setCommand(example)}
                  >
                    → {example}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Executions Tab */}
        <TabsContent value="executions" className="space-y-4">
          {(activeExecutions as any)?.executions?.length > 0 ? (
            (activeExecutions as any).executions.map((exec: any) => (
              <Card key={exec.command_id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        أمر #{exec.command_id.slice(-8)}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {exec.steps} خطوات • {exec.estimated_duration_minutes} دقيقة
                      </CardDescription>
                    </div>
                    {exec.requires_approval && (
                      <Badge variant="secondary">يتطلب موافقة</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        التكلفة المقدرة: {exec.estimated_cost_sar} ريال
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">
                        {exec.risks_count} مخاطر محتملة
                      </span>
                    </div>
                  </div>

                  {exec.requires_approval && (
                    <Button
                      data-testid={`button-approve-${exec.command_id}`}
                      onClick={() => approveExecutionMutation.mutate(exec.command_id)}
                      disabled={approveExecutionMutation.isPending}
                      className="w-full"
                    >
                      {approveExecutionMutation.isPending ? "جاري التنفيذ..." : "موافقة وتنفيذ"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                لا توجد عمليات تنفيذ نشطة حالياً
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Decision Log Tab */}
        <TabsContent value="log">
          <Card>
            <CardHeader>
              <CardTitle>سجل القرارات</CardTitle>
              <CardDescription>سجل غير قابل للتعديل لجميع العمليات</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {(decisionLog as any)?.entries?.length > 0 ? (
                  <div className="space-y-3">
                    {(decisionLog as any).entries.map((entry: any) => (
                      <div
                        key={entry.id}
                        className="p-4 border rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                entry.result === 'success' ? 'default' :
                                entry.result === 'failure' ? 'destructive' :
                                'secondary'
                              }>
                                {entry.decision_type}
                              </Badge>
                              {entry.executed && (
                                entry.result === 'success' ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : entry.result === 'failure' ? (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                ) : null
                              )}
                            </div>
                            <p className="text-sm mt-2">{entry.action}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span>المستخدم: {entry.user_id}</span>
                              {entry.approved_by && (
                                <span>• موافقة: {entry.approved_by}</span>
                              )}
                              <span>• {new Date(entry.createdAt).toLocaleString('ar-SA')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد قرارات مسجلة
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status Tab */}
        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* System Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">حالة النظام</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(systemStatus as any)?.status || 'جاري التحميل'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  العمليات النشطة: {(systemStatus as any)?.active_executions || 0}
                </p>
              </CardContent>
            </Card>

            {/* Sub-Agents Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sub-Agents</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  {(systemStatus as any)?.sub_agents && Object.entries((systemStatus as any).sub_agents).map(([name, status]: [string, any]) => (
                    <div key={name} className="flex justify-between">
                      <span className="capitalize">{name}</span>
                      <Badge variant={status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Capabilities */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">القدرات</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-xs">
                  {(systemStatus as any)?.capabilities && Object.entries((systemStatus as any).capabilities).map(([cap, enabled]: [string, any]) => (
                    <div key={cap} className="flex items-center gap-2">
                      {enabled ? (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      ) : (
                        <XCircle className="w-3 h-3 text-gray-400" />
                      )}
                      <span className="capitalize">{cap.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
