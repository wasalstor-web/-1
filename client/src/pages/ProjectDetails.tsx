import { ArrowRight, Download, Share2, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useParams } from "wouter";

//todo: remove mock functionality
const mockProject = {
  id: '1',
  name: 'تطبيق الويب الذكي',
  description: 'تطبيق ويب متقدم يستخدم تقنيات الذكاء الاصطناعي لتحسين تجربة المستخدم',
  status: 'in-progress',
  progress: 65,
  aiModel: 'GPT-4',
  createdAt: '2024-01-15',
  updatedAt: 'منذ ساعتين',
};

const mockActivities = [
  { id: '1', action: 'تم تحديث المشروع', user: 'النظام', time: 'منذ ساعتين' },
  { id: '2', action: 'تم إضافة ميزة جديدة', user: 'النظام', time: 'منذ 5 ساعات' },
  { id: '3', action: 'تم إنشاء المشروع', user: 'النظام', time: 'منذ 3 أيام' },
];

export default function ProjectDetails() {
  const [, setLocation] = useLocation();
  const params = useParams();

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
          <h1 className="text-3xl font-bold">{mockProject.name}</h1>
          <p className="text-muted-foreground">{mockProject.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" data-testid="button-edit-project">
            <Edit className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" data-testid="button-share-project">
            <Share2 className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" data-testid="button-download-project">
            <Download className="w-5 h-5" />
          </Button>
          <Button variant="destructive" size="icon" data-testid="button-delete-project">
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
              <TabsTrigger value="activity" className="flex-1" data-testid="tab-activity">
                النشاط
              </TabsTrigger>
              <TabsTrigger value="files" className="flex-1" data-testid="tab-files">
                الملفات
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>الوصف</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {mockProject.description}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>التقدم</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">إجمالي التقدم</span>
                    <span className="text-2xl font-bold text-cyan-400">{mockProject.progress}%</span>
                  </div>
                  <Progress value={mockProject.progress} className="h-3" />
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">8</p>
                      <p className="text-xs text-muted-foreground">المهام المكتملة</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">4</p>
                      <p className="text-xs text-muted-foreground">قيد التنفيذ</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">2</p>
                      <p className="text-xs text-muted-foreground">متبقية</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>سجل النشاط</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockActivities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 pb-4 border-b last:border-0">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.user}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>الملفات المرفقة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    لا توجد ملفات مرفقة بعد
                  </p>
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
                <Badge className="bg-cyan-500/20 text-cyan-400 mt-1">
                  قيد التطوير
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">نموذج AI</p>
                <p className="font-medium mt-1">{mockProject.aiModel}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
                <p className="font-medium mt-1">{mockProject.createdAt}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">آخر تحديث</p>
                <p className="font-medium mt-1">{mockProject.updatedAt}</p>
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
