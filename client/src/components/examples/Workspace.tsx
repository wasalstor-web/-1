import Workspace from '../../pages/Workspace';
import { ThemeProvider } from '../ThemeProvider';

export default function WorkspaceExample() {
  return (
    <ThemeProvider>
      <div className="bg-background">
        <Workspace />
      </div>
    </ThemeProvider>
  );
}
