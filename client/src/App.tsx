import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import Workspace from "@/pages/Workspace";
import ProjectDetails from "@/pages/ProjectDetails";
import ProductDetails from "@/pages/ProductDetails";
import Settings from "@/pages/Settings";
import Marketplace from "@/pages/Marketplace";
import AiChat from "@/pages/AiChat";
import ImageGenerator from "@/pages/ImageGenerator";
import IntelligentAssistant from "@/pages/IntelligentAssistant";
import ServerManager from "@/pages/ServerManager";
import BotRegistry from "@/pages/BotRegistry";
import AIBrainDashboard from "@/pages/AIBrainDashboard";
import ClientHome from "@/pages/ClientHome";
import QuickSSH from "@/pages/QuickSSH";
import NotFound from "@/pages/not-found";

function AdminLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 overflow-auto">
          <header className="flex items-center gap-4 p-4 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex-1" />
          </header>
          <main className="flex-1">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Switch>
            {/* Client Interface - No Sidebar */}
            <Route path="/" component={ClientHome} />
            
            {/* Quick SSH Test - Full Screen */}
            <Route path="/ssh-test" component={QuickSSH} />
            
            {/* AI Chat - Full Screen (No Sidebar) */}
            <Route path="/admin/ai-chat" component={AiChat} />
            
            {/* Admin Panel - With Sidebar */}
            <Route path="/admin">
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </Route>
            
            <Route path="/admin/marketplace">
              <AdminLayout>
                <Marketplace />
              </AdminLayout>
            </Route>
            
            <Route path="/admin/products/:slug">
              {(params) => (
                <AdminLayout>
                  <ProductDetails {...params} />
                </AdminLayout>
              )}
            </Route>
            
            <Route path="/admin/image-generator">
              <AdminLayout>
                <ImageGenerator />
              </AdminLayout>
            </Route>
            
            <Route path="/admin/intelligent-assistant">
              <AdminLayout>
                <IntelligentAssistant />
              </AdminLayout>
            </Route>
            
            <Route path="/admin/server-manager">
              <AdminLayout>
                <ServerManager />
              </AdminLayout>
            </Route>
            
            <Route path="/admin/bot-registry">
              <AdminLayout>
                <BotRegistry />
              </AdminLayout>
            </Route>
            
            <Route path="/admin/ai-brain">
              <AdminLayout>
                <AIBrainDashboard />
              </AdminLayout>
            </Route>
            
            <Route path="/admin/projects">
              <AdminLayout>
                <Projects />
              </AdminLayout>
            </Route>
            
            <Route path="/admin/workspace">
              <AdminLayout>
                <Workspace />
              </AdminLayout>
            </Route>
            
            <Route path="/admin/project/:id">
              {(params) => (
                <AdminLayout>
                  <ProjectDetails {...params} />
                </AdminLayout>
              )}
            </Route>
            
            <Route path="/admin/settings">
              <AdminLayout>
                <Settings />
              </AdminLayout>
            </Route>
            
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
