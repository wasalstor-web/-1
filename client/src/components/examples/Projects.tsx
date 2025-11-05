import Projects from '../../pages/Projects';
import { ThemeProvider } from '../ThemeProvider';

export default function ProjectsExample() {
  return (
    <ThemeProvider>
      <div className="bg-background min-h-screen">
        <Projects />
      </div>
    </ThemeProvider>
  );
}
