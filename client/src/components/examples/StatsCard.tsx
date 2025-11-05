import { StatsCard } from '../StatsCard';
import { FolderOpen } from 'lucide-react';

export default function StatsCardExample() {
  return (
    <div className="p-6 bg-background">
      <StatsCard
        title="إجمالي المشاريع"
        value={24}
        icon={FolderOpen}
        trend="+12% هذا الشهر"
      />
    </div>
  );
}
