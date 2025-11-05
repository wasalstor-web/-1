import ProjectDetails from '../../pages/ProjectDetails';
import { ThemeProvider } from '../ThemeProvider';

export default function ProjectDetailsExample() {
  return (
    <ThemeProvider>
      <div className="bg-background min-h-screen">
        <ProjectDetails />
      </div>
    </ThemeProvider>
  );
}
