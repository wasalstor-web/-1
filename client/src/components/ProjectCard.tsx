import { FolderOpen, Edit, Share2, MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ProjectCardProps {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'draft';
  progress: number;
  lastModified: string;
  onOpen?: () => void;
  onEdit?: () => void;
  onShare?: () => void;
}

const statusMap = {
  'completed': { label: 'مكتمل', class: 'bg-green-500/20 text-green-400' },
  'in-progress': { label: 'قيد التطوير', class: 'bg-cyan-500/20 text-cyan-400' },
  'draft': { label: 'مسودة', class: 'bg-muted text-muted-foreground' },
};

export function ProjectCard({
  id,
  name,
  status,
  progress,
  lastModified,
  onOpen,
  onEdit,
  onShare,
}: ProjectCardProps) {
  const statusInfo = statusMap[status];

  return (
    <Card className="hover-elevate transition-all" data-testid={`card-project-${id}`}>
      <CardContent className="p-6">
        <div className="aspect-video bg-gradient-to-br from-cyan-500/10 to-purple-600/10 rounded-lg mb-4 flex items-center justify-center">
          <FolderOpen className="w-12 h-12 text-muted-foreground" />
        </div>
        
        <h3 className="text-lg font-bold mb-2" data-testid={`text-project-name-${id}`}>{name}</h3>
        
        <Badge className={statusInfo.class} data-testid={`badge-status-${id}`}>
          {statusInfo.label}
        </Badge>
        
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">التقدم</span>
            <span className="text-cyan-400 font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="text-xs text-muted-foreground">آخر تعديل: {lastModified}</div>
        </div>
        
        <div className="flex items-center gap-2 mt-4">
          <Button
            onClick={onOpen}
            className="flex-1"
            variant="secondary"
            data-testid={`button-open-${id}`}
          >
            فتح
          </Button>
          <Button
            onClick={onEdit}
            size="icon"
            variant="ghost"
            data-testid={`button-edit-${id}`}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            onClick={onShare}
            size="icon"
            variant="ghost"
            data-testid={`button-share-${id}`}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
