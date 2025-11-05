import { ArrowRight, Download, Share2, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { projectsApi, conversationsApi, exportApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ProjectDetails() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();

  const { data: project, isLoading } = useQuery({
    queryKey: ['/api/projects', params.id],
    queryFn: () => projectsApi.getById(params.id!),
    enabled: !!params.id,
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/projects', params.id, 'conversations'],
    queryFn: () => conversationsApi.getByProject(params.id!),
    enabled: !!params.id,
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => projectsApi.delete(params.id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "تم حذف المشروع",
        description: "تم حذف المشروع بنجاح",
      });
      setLocation('/projects');
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">المشروع غير موجود</p>
      </div>
    );
  }

  const statusMap: any = {
    'completed': { label: 'مكتمل', class: 'bg-green-500/20 text-green-400' },
    'in-progress': { label: 'قيد التطوير', class: 'bg-cyan-500/20 text-cyan-400' },
    'draft': { label: 'مسودة', class: 'bg-muted text-muted-foreground' },
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" data-testid="page-project-details">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/projects')}
          data-testid="button-back"
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" data-testid="button-edit-project">
            <Edit className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => exportApi.exportProject(project, conversations)}
            data-testid="button-download-project"
          >
            <Download className="w-5 h-5" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => deleteProjectMutation.mutate()}
            disabled={deleteProjectMutation.isPending}
            data-testid="button-delete-project"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1" data-testid="tab-overview">
                نظرة عامة
              </TabsTrigger>
              <TabsTrigger value="conversations" className="flex-1" data-testid="tab-conversations">
                المحادثات ({conversations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-6">
              {project.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>الوصف</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {project.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>التقدم</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">إجمالي التقدم</span>
                    <span className="text-2xl font-bold text-cyan-400">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-3" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conversations" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>المحادثات المحفوظة</CardTitle>
                </CardHeader>
                <CardContent>
                  {conversations.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      لا توجد محادثات محفوظة بعد
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {conversations.map((conv: any) => (
                        <div
                          key={conv.id}
                          className="p-4 rounded-lg border hover-elevate transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge>{conv.aiModel}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(conv.createdAt).toLocaleDateString('ar')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {JSON.parse(conv.messages).length} رسالة
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => exportApi.exportConversation(conv)}
                            className="mt-2"
                          >
                            <Download className="w-4 h-4 ml-2" />
                            تصدير
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معلومات المشروع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">الحالة</p>
                <Badge className={statusMap[project.status]?.class || 'bg-muted'}>
                  {statusMap[project.status]?.label || project.status}
                </Badge>
              </div>
              {project.aiModel && (
                <div>
                  <p className="text-sm text-muted-foreground">نموذج AI</p>
                  <p className="font-medium mt-1">{project.aiModel}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
                <p className="font-medium mt-1">
                  {new Date(project.createdAt).toLocaleDateString('ar')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">آخر تحديث</p>
                <p className="font-medium mt-1">
                  {new Date(project.updatedAt).toLocaleDateString('ar')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setLocation('/workspace')}
                data-testid="button-open-workspace"
              >
                فتح في مساحة العمل
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => exportApi.exportProject(project, conversations)}
                data-testid="button-export-project"
              >
                <Download className="w-4 h-4 ml-2" />
                تصدير المشروع
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
