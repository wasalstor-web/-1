import { FolderOpen, MessageSquare, Sparkles, TrendingUp, Plus, Download, Brain } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

//todo: remove mock functionality
const mockProjects = [
  { id: '1', name: 'تطبيق الويب الذكي', status: 'in-progress' as const, progress: 65, lastModified: 'منذ ساعتين' },
  { id: '2', name: 'نظام إدارة المحتوى', status: 'completed' as const, progress: 100, lastModified: 'أمس' },
  { id: '3', name: 'تطبيق الهاتف المحمول', status: 'draft' as const, progress: 25, lastModified: 'منذ 3 أيام' },
];

const mockActivities = [
  { id: '1', action: 'تم إنشاء مشروع جديد', project: 'تطبيق الويب الذكي', time: 'منذ ساعتين' },
  { id: '2', action: 'تم إكمال المشروع', project: 'نظام إدارة المحتوى', time: 'أمس' },
  { id: '3', action: 'تم بدء محادثة AI', project: 'تطبيق الهاتف المحمول', time: 'منذ 3 أيام' },
];

export default function Dashboard() {
  const [, setLocation] = useLocation();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" data-testid="page-dashboard">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
          مرحباً بك في منصة AI
        </h1>
        <p className="text-muted-foreground mt-2">لوحة التحكم الرئيسية - تتبع مشاريعك ونشاطاتك</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="إجمالي المشاريع"
          value={24}
          icon={FolderOpen}
          trend="+12% هذا الشهر"
        />
        <StatsCard
          title="المحادثات"
          value={156}
          icon={MessageSquare}
          trend="+23% هذا الشهر"
        />
        <StatsCard
          title="استخدام AI"
          value="8.5k"
          icon={Sparkles}
          trend="+45% هذا الشهر"
        />
        <StatsCard
          title="معدل الإنجاز"
          value="92%"
          icon={TrendingUp}
          trend="+5% هذا الشهر"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">المشاريع الأخيرة</h2>
            <Button
              onClick={() => setLocation('/projects')}
              variant="outline"
              data-testid="button-view-all-projects"
            >
              عرض الكل
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockProjects.map((project) => (
              <ProjectCard
                key={project.id}
                {...project}
                onOpen={() => setLocation(`/project/${project.id}`)}
                onEdit={() => console.log('Edit', project.id)}
                onShare={() => console.log('Share', project.id)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>النشاط الأخير</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockActivities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.project}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => setLocation('/workspace')}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                data-testid="button-new-project"
              >
                <Plus className="w-5 h-5 ml-2" />
                إنشاء مشروع جديد
              </Button>
              <Button variant="outline" className="w-full" data-testid="button-export-data">
                <Download className="w-5 h-5 ml-2" />
                تصدير البيانات
              </Button>
              <Button variant="outline" className="w-full" data-testid="button-run-analysis">
                <Brain className="w-5 h-5 ml-2" />
                تشغيل تحليل AI
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
