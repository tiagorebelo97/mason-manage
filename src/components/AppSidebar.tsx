import { Building2, List, Layers, Package, Globe, LogOut, LayoutDashboard, Users, Phone, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: 'nav.dashboard', url: "/", icon: LayoutDashboard },
  { title: 'nav.companies', url: "/companies", icon: Building2 },
  { title: 'nav.specialities', url: "/specialities", icon: List },
  { title: 'nav.mainSpecialties', url: "/main-specialties", icon: Layers },
  { title: 'nav.brands', url: "/brands", icon: Package },
  { title: 'nav.contacts', url: "/contacts", icon: Phone },
  { title: 'nav.orcamentos', url: "/orcamentos", icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { toast } = await import("sonner");
    await supabase.auth.signOut();
    toast.success(t('auth.logoutSuccess'));
    navigate('/auth');
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg" 
      : "hover:bg-sidebar-accent/50 transition-all duration-200";

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-2"
    >
      <SidebarContent>
        <SidebarGroup>
          <div className="px-3 py-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-white">M</span>
              </div>
              <div className="group-data-[collapsible=icon]:hidden">
                <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Mason</h2>
                <p className="text-xs text-sidebar-foreground/60">Management</p>
              </div>
            </div>
          </div>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="transition-all duration-200">
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="transition-transform duration-200 group-hover:scale-110" />
                      <span className="font-medium">{t(item.title)}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t-2 border-sidebar-border">
        <div className="p-3 space-y-3 group-data-[collapsible=icon]:hidden">
          <div className="flex gap-2">
            <Button
              variant={language === 'en' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setLanguage('en')}
              className={`flex-1 transition-all duration-200 ${language === 'en' ? 'bg-gradient-to-r from-primary to-accent shadow-md' : ''}`}
            >
              <Globe className="h-4 w-4 mr-1" />
              EN
            </Button>
            <Button
              variant={language === 'pt' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setLanguage('pt')}
              className={`flex-1 transition-all duration-200 ${language === 'pt' ? 'bg-gradient-to-r from-primary to-accent shadow-md' : ''}`}
            >
              <Globe className="h-4 w-4 mr-1" />
              PT
            </Button>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLogout}
            className="w-full hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t('auth.logout')}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
