import { ProjectCard } from '../ProjectCard';

export default function ProjectCardExample() {
  return (
    <div className="p-6 bg-background max-w-sm">
      <ProjectCard
        id="1"
        name="تطبيق الويب الذكي"
        status="in-progress"
        progress={65}
        lastModified="منذ ساعتين"
        onOpen={() => console.log('Open project')}
        onEdit={() => console.log('Edit project')}
        onShare={() => console.log('Share project')}
      />
    </div>
  );
}
