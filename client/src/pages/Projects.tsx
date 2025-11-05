import { useState } from "react";
import { Plus, Grid3x3, List, Search } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

//todo: remove mock functionality
const mockProjects = [
  { id: '1', name: 'تطبيق الويب الذكي', status: 'in-progress' as const, progress: 65, lastModified: 'منذ ساعتين' },
  { id: '2', name: 'نظام إدارة المحتوى', status: 'completed' as const, progress: 100, lastModified: 'أمس' },
  { id: '3', name: 'تطبيق الهاتف المحمول', status: 'draft' as const, progress: 25, lastModified: 'منذ 3 أيام' },
  { id: '4', name: 'موقع تجارة إلكترونية', status: 'in-progress' as const, progress: 45, lastModified: 'منذ 5 ساعات' },
  { id: '5', name: 'تطبيق إدارة المهام', status: 'completed' as const, progress: 100, lastModified: 'منذ أسبوع' },
  { id: '6', name: 'منصة تعليمية', status: 'draft' as const, progress: 10, lastModified: 'منذ يومين' },
];

export default function Projects() {
  const [, setLocation] = useLocation();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" data-testid="page-projects">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">مشاريعي</h1>
          <p className="text-muted-foreground">جميع مشاريعك في مكان واحد</p>
        </div>
        <Button
          onClick={() => setLocation('/workspace')}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
          data-testid="button-new-project"
        >
          <Plus className="w-5 h-5 ml-2" />
          مشروع جديد
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="البحث عن مشروع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
            data-testid="input-search-projects"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-48" data-testid="select-filter-status">
            <SelectValue placeholder="تصفية حسب الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المشاريع</SelectItem>
            <SelectItem value="in-progress">قيد التطوير</SelectItem>
            <SelectItem value="completed">مكتمل</SelectItem>
            <SelectItem value="draft">مسودة</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setView('grid')}
            data-testid="button-view-grid"
          >
            <Grid3x3 className="w-5 h-5" />
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setView('list')}
            data-testid="button-view-list"
          >
            <List className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            {...project}
            onOpen={() => setLocation(`/project/${project.id}`)}
            onEdit={() => console.log('Edit', project.id)}
            onShare={() => console.log('Share', project.id)}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">لا توجد مشاريع تطابق البحث</p>
        </div>
      )}
    </div>
  );
}
