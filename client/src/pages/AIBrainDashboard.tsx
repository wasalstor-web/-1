import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Brain,
  Activity,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";

export default function AIBrainDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Queries
  const { data: analytics } = useQuery({
    queryKey: ["/api/ai-brain/analytics"],
    refetchInterval: 30000, // كل 30 ثانية
  });

  const { data: health } = useQuery({
    queryKey: ["/api/doctor-ai/health"],
    refetchInterval: 60000, // كل دقيقة
  });

  const { data: report } = useQuery({
    queryKey: ["/api/doctor-ai/report"],
    refetchInterval: 60000,
  });

  const { data: recommendations } = useQuery({
    queryKey: ["/api/doctor-ai/recommendations"],
    refetchInterval: 30000,
  });

  // Mutations
  const selfImproveMutation = useMutation({
    mutationFn: () => apiRequest("/api/doctor-ai/self-improve", "POST"),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctor-ai/recommendations"] });
      toast({
        title: "✅ التحسين الذاتي مكتمل",
        description: `تم تنفيذ ${data.improvements?.length || 0} تحسينات`,
      });
    },
  });

  const healthStatus = (health as any)?.overall || 'healthy';
  const healthColor = {
    healthy: 'text-green-500',
    degraded: 'text-yellow-500',
    critical: 'text-red-500',
  }[healthStatus as 'healthy' | 'degraded' | 'critical'];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              AI Brain Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              مركز التحكم الذكي والمراقبة الذاتية
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.invalidateQueries()}
              data-testid="button-refresh"
            >
              <Activity className="h-4 w-4 mr-2" />
              تحديث
            </Button>
            <Button
              size="sm"
              onClick={() => selfImproveMutation.mutate()}
              disabled={selfImproveMutation.isPending}
              data-testid="button-self-improve"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              تحسين ذاتي
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="w-full justify-start px-4 pt-4 bg-transparent">
            <TabsTrigger value="overview" className="gap-2" data-testid="tab-overview">
              <TrendingUp className="h-4 w-4" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-2" data-testid="tab-health">
              <Activity className="h-4 w-4" />
              الصحة
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="gap-2" data-testid="tab-recommendations">
              <Zap className="h-4 w-4" />
              التوصيات
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden px-4 pb-4">
            {/* Overview Tab */}
            <TabsContent value="overview" className="h-full mt-4">
              <ScrollArea className="h-full">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                  {/* System Health */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">حالة النظام</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {healthStatus === 'healthy' ? (
                          <CheckCircle2 className={`h-8 w-8 ${healthColor}`} />
                        ) : healthStatus === 'degraded' ? (
                          <AlertTriangle className={`h-8 w-8 ${healthColor}`} />
                        ) : (
                          <XCircle className={`h-8 w-8 ${healthColor}`} />
                        )}
                        <div>
                          <div className={`text-2xl font-bold ${healthColor}`}>
                            {healthStatus === 'healthy' ? 'سليم' : healthStatus === 'degraded' ? 'متدهور' : 'حرج'}
                          </div>
                          <p className="text-xs text-muted-foreground">الحالة العامة</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Requests */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{(analytics as any)?.totalRequests || 0}</div>
                      <p className="text-xs text-muted-foreground">طلبات AI معالجة</p>
                    </CardContent>
                  </Card>

                  {/* Total Cost */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">التكلفة الإجمالية</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${((analytics as any)?.totalCost || 0).toFixed(4)}
                      </div>
                      <p className="text-xs text-muted-foreground">استخدام API</p>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">التوصيات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(report as any)?.recommendations?.pending || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">قيد الانتظار</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts & Details */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* By Model */}
                  <Card>
                    <CardHeader>
                      <CardTitle>الاستخدام حسب النموذج</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(analytics as any)?.byModel && Object.keys((analytics as any).byModel).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries((analytics as any).byModel).map(([model, count]: any) => (
                            <div key={model} className="flex justify-between items-center">
                              <span className="text-sm">{model}</span>
                              <Badge variant="outline">{count}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">لا توجد بيانات</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* By Intent */}
                  <Card>
                    <CardHeader>
                      <CardTitle>الاستخدام حسب النية</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(analytics as any)?.byIntent && Object.keys((analytics as any).byIntent).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries((analytics as any).byIntent).map(([intent, count]: any) => (
                            <div key={intent} className="flex justify-between items-center">
                              <span className="text-sm">{intent}</span>
                              <Badge variant="outline">{count}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">لا توجد بيانات</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Health Tab */}
            <TabsContent value="health" className="h-full mt-4">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  {/* Components Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle>حالة المكونات</CardTitle>
                      <CardDescription>جميع المكونات الأساسية للنظام</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(health as any)?.components && Object.entries((health as any).components).map(([component, status]: any) => (
                          <div key={component} className="flex justify-between items-center">
                            <span className="text-sm font-medium">{component}</span>
                            <Badge variant={status === 'up' ? 'default' : 'destructive'}>
                              {status === 'up' ? 'يعمل' : 'معطل'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>المقاييس</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">متوسط وقت الاستجابة</span>
                          <span className="text-sm font-medium">
                            {((health as any)?.metrics?.avgResponseTime || 0).toFixed(0)}ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">معدل الأخطاء</span>
                          <span className="text-sm font-medium">
                            {(((health as any)?.metrics?.errorRate || 0) * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">الطلبات/دقيقة</span>
                          <span className="text-sm font-medium">
                            {((health as any)?.metrics?.requestsPerMinute || 0).toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">استخدام الذاكرة</span>
                          <span className="text-sm font-medium">
                            {((health as any)?.metrics?.memoryUsage || 0).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="h-full mt-4">
              <ScrollArea className="h-full">
                {(recommendations as any)?.length > 0 ? (
                  <div className="space-y-3">
                    {(recommendations as any[]).map((rec: any) => (
                      <Card key={rec.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">{rec.title}</CardTitle>
                            <Badge variant={
                              rec.priority === 'critical' ? 'destructive' :
                              rec.priority === 'high' ? 'default' : 'secondary'
                            }>
                              {rec.priority}
                            </Badge>
                          </div>
                          <CardDescription>{rec.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm space-y-2">
                            <div><strong>التأثير:</strong> {rec.impact}</div>
                            <div><strong>الجهد المقدر:</strong> {rec.estimatedEffort}</div>
                            <div className="flex items-center gap-2">
                              <strong>الحالة:</strong>
                              <Badge variant="outline">{rec.status}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p className="text-muted-foreground">لا توجد توصيات - النظام يعمل بشكل مثالي! ✨</p>
                    </CardContent>
                  </Card>
                )}
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
