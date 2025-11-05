import Dashboard from '../../pages/Dashboard';
import { ThemeProvider } from '../ThemeProvider';

export default function DashboardExample() {
  return (
    <ThemeProvider>
      <div className="bg-background min-h-screen">
        <Dashboard />
      </div>
    </ThemeProvider>
  );
}
