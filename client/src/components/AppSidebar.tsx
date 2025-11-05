import { Home, FolderOpen, Sparkles, Settings, Moon, Sun, ShoppingBag, Bot } from "lucide-react";
import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "الرئيسية",
    url: "/",
    icon: Home,
  },
  {
    title: "المتجر",
    url: "/marketplace",
    icon: ShoppingBag,
  },
  {
    title: "AI Developer",
    url: "/ai-chat",
    icon: Bot,
  },
  {
    title: "المشاريع",
    url: "/projects",
    icon: FolderOpen,
  },
  {
    title: "مساحة العمل",
    url: "/workspace",
    icon: Sparkles,
  },
  {
    title: "الإعدادات",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            منصة AI
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => setLocation(item.url)}
                    isActive={location === item.url}
                    data-testid={`link-${item.title}`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          data-testid="button-theme-toggle"
          className="w-full justify-start gap-2"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span>{theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
