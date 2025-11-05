import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Bot,
  Rocket,
  FileCode,
  Download,
  Upload,
  Check,
  X,
  Play,
  Copy,
  Trash2,
  Edit,
  Package
} from "lucide-react";

export default function BotRegistry() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("templates");

  // Queries
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/bot-templates"],
  });

  const { data: instances, isLoading: instancesLoading } = useQuery({
    queryKey: ["/api/bot-instances"],
  });

  const { data: deployments, isLoading: deploymentsLoading } = useQuery({
    queryKey: ["/api/bot-deployments"],
  });

  // Mutations
  const loadDefaultsMutation = useMutation({
    mutationFn: () => apiRequest("/api/bot-templates/load-defaults", {
      method: "POST",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot-templates"] });
      toast({
        title: "✅ تم تحميل القوالب",
        description: "تم تحميل القوالب الافتراضية بنجاح",
      });
    },
  });

  const createInstanceMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/bot-instances", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot-instances"] });
      toast({
        title: "✅ تم إنشاء البوت",
        description: "تم إنشاء نسخة جديدة من القالب",
      });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/bot-templates/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot-templates"] });
      toast({
        title: "✅ تم الحذف",
        description: "تم حذف القالب بنجاح",
      });
    },
  });

  const createInstanceFromTemplate = (template: any) => {
    const instanceData = {
      templateId: template.id,
      name: `${template.name}_instance`,
      displayName: `نسخة من ${template.displayName}`,
      manifest: template.manifest,
      status: "draft",
      deploymentStage: "sandbox",
      version: "1.0.0",
      channels: ["web"],
    };

    createInstanceMutation.mutate(instanceData);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              مكتبة النماذج والبوتات
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI Orchestrator - Model Registry & Bot Generator
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadDefaultsMutation.mutate()}
              disabled={loadDefaultsMutation.isPending}
              data-testid="button-load-defaults"
            >
              <Download className="h-4 w-4 mr-2" />
              تحميل القوالب الافتراضية
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="w-full justify-start px-4 pt-4 bg-transparent">
            <TabsTrigger value="templates" className="gap-2" data-testid="tab-templates">
              <Bot className="h-4 w-4" />
              القوالب ({templates?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="instances" className="gap-2" data-testid="tab-instances">
              <Copy className="h-4 w-4" />
              النماذج المنشأة ({instances?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="deployments" className="gap-2" data-testid="tab-deployments">
              <Rocket className="h-4 w-4" />
              النشر ({deployments?.length || 0})
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden px-4 pb-4">
            {/* Templates Tab */}
            <TabsContent value="templates" className="h-full mt-4">
              <ScrollArea className="h-full">
                {templatesLoading ? (
                  <div className="text-center p-8">جاري التحميل...</div>
                ) : templates && templates.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template: any) => (
                      <Card key={template.id} className="hover-elevate">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-3xl">{template.icon || '🤖'}</span>
                              <div>
                                <CardTitle className="text-lg">{template.displayName}</CardTitle>
                                <CardDescription className="text-xs mt-1">
                                  v{template.version}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant="outline">{template.category}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            {template.description}
                          </p>
                          <div className="flex gap-2 flex-wrap mb-3">
                            {template.tags?.map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Separator className="my-3" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                            <span>الاستخدام: {template.usageCount || 0}</span>
                            <Badge variant={template.isActive ? "default" : "secondary"} className="text-xs">
                              {template.isActive ? "نشط" : "معطل"}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => createInstanceFromTemplate(template)}
                              disabled={createInstanceMutation.isPending}
                              data-testid={`button-create-instance-${template.id}`}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              إنشاء نسخة
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedTemplate(template)}
                              data-testid={`button-view-${template.id}`}
                            >
                              <FileCode className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteTemplateMutation.mutate(template.id)}
                              disabled={deleteTemplateMutation.isPending}
                              data-testid={`button-delete-${template.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">لا توجد قوالب متاحة</p>
                      <Button
                        onClick={() => loadDefaultsMutation.mutate()}
                        disabled={loadDefaultsMutation.isPending}
                        data-testid="button-load-defaults-empty"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        تحميل القوالب الافتراضية
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Instances Tab */}
            <TabsContent value="instances" className="h-full mt-4">
              <ScrollArea className="h-full">
                {instancesLoading ? (
                  <div className="text-center p-8">جاري التحميل...</div>
                ) : instances && instances.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {instances.map((instance: any) => (
                      <Card key={instance.id} className="hover-elevate">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">{instance.displayName}</CardTitle>
                            <Badge variant={instance.status === 'active' ? 'default' : 'secondary'}>
                              {instance.status}
                            </Badge>
                          </div>
                          <CardDescription>{instance.name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">المرحلة:</span>
                              <Badge variant="outline">{instance.deploymentStage || 'sandbox'}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">الإصدار:</span>
                              <span>{instance.version}</span>
                            </div>
                            {instance.channels && (
                              <div className="flex gap-1 flex-wrap mt-2">
                                {instance.channels.map((channel: string) => (
                                  <Badge key={channel} variant="secondary" className="text-xs">
                                    {channel}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <Separator className="my-3" />
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1" data-testid={`button-test-${instance.id}`}>
                              <Play className="h-4 w-4 mr-1" />
                              اختبار
                            </Button>
                            <Button size="sm" variant="outline" data-testid={`button-edit-${instance.id}`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" data-testid={`button-deploy-${instance.id}`}>
                              <Rocket className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Copy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">لم يتم إنشاء أي نماذج بعد</p>
                    </CardContent>
                  </Card>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Deployments Tab */}
            <TabsContent value="deployments" className="h-full mt-4">
              <ScrollArea className="h-full">
                {deploymentsLoading ? (
                  <div className="text-center p-8">جاري التحميل...</div>
                ) : deployments && deployments.length > 0 ? (
                  <div className="space-y-3">
                    {deployments.map((deployment: any) => (
                      <Card key={deployment.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                deployment.status === 'completed' ? 'bg-green-500' :
                                deployment.status === 'failed' ? 'bg-red-500' :
                                'bg-yellow-500'
                              }`} />
                              <div>
                                <div className="font-medium">النسخة {deployment.version}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(deployment.deployedAt).toLocaleString('ar-SA')}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{deployment.stage}</Badge>
                              <Badge variant={deployment.status === 'completed' ? 'default' : 'secondary'}>
                                {deployment.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Rocket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">لا توجد عمليات نشر</p>
                    </CardContent>
                  </Card>
                )}
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Template Manifest Viewer Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedTemplate(null)}>
          <Card className="max-w-2xl w-full max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Manifest - {selectedTemplate.displayName}</CardTitle>
              <CardDescription>Bot Configuration Schema</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
                  {JSON.stringify(JSON.parse(selectedTemplate.manifest || '{}'), null, 2)}
                </pre>
              </ScrollArea>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => setSelectedTemplate(null)}>إغلاق</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
