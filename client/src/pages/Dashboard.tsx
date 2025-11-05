import { FolderOpen, MessageSquare, Sparkles, TrendingUp, Plus, Download, Brain } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ['/api/projects'],
  });

  const recentProjects = projects.slice(0, 3);
  const completedCount = projects.filter(p => p.status === 'completed').length;
  const inProgressCount = projects.filter(p => p.status === 'in-progress').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" data-testid="page-dashboard">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
          مرحباً بك في منصة AI
        </h1>
        <p className="text-muted-foreground mt-2">تفاعل مع أقوى نماذج الذكاء الاصطناعي في العالم</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="إجمالي المشاريع"
          value={projects.length}
          icon={FolderOpen}
          trend={projects.length > 0 ? `${projects.length} مشروع نشط` : 'ابدأ أول مشروع'}
        />
        <StatsCard
          title="المشاريع المكتملة"
          value={completedCount}
          icon={TrendingUp}
          trend={completedCount > 0 ? `${completedCount} مكتمل` : 'لا توجد مشاريع مكتملة'}
        />
        <StatsCard
          title="قيد التطوير"
          value={inProgressCount}
          icon={Sparkles}
          trend={inProgressCount > 0 ? `${inProgressCount} نشط` : 'ابدأ العمل'}
        />
        <StatsCard
          title="نماذج AI متاحة"
          value={3}
          icon={MessageSquare}
          trend="GPT-4, Claude, Gemini"
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
          
          {recentProjects.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد مشاريع بعد</h3>
                <p className="text-muted-foreground mb-4">ابدأ أول مشروع لك باستخدام الذكاء الاصطناعي</p>
                <Button
                  onClick={() => setLocation('/workspace')}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                >
                  <Plus className="w-5 h-5 ml-2" />
                  ابدأ الآن
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentProjects.map((project: any) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  status={project.status}
                  progress={project.progress}
                  lastModified={new Date(project.updatedAt).toLocaleDateString('ar')}
                  onOpen={() => setLocation(`/project/${project.id}`)}
                  onEdit={() => console.log('Edit', project.id)}
                  onShare={() => console.log('Share', project.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
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
                محادثة جديدة مع AI
              </Button>
              <Button
                onClick={() => setLocation('/projects')}
                variant="outline"
                className="w-full"
                data-testid="button-view-projects"
              >
                <FolderOpen className="w-5 h-5 ml-2" />
                استعرض المشاريع
              </Button>
              <Button
                onClick={() => setLocation('/settings')}
                variant="outline"
                className="w-full"
                data-testid="button-settings"
              >
                <Brain className="w-5 h-5 ml-2" />
                الإعدادات
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>النماذج المتاحة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/20">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-medium">GPT-4</p>
                  <p className="text-xs text-muted-foreground">OpenAI</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-amber-600/10 border border-orange-500/20">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="font-medium">Claude</p>
                  <p className="text-xs text-muted-foreground">Anthropic</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-600/10 border border-blue-500/20">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">Gemini</p>
                  <p className="text-xs text-muted-foreground">Google</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
