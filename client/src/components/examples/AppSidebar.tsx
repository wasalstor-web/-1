import { AppSidebar } from '../AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '../ThemeProvider';

export default function AppSidebarExample() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
