import { Building2, List, Globe, LogOut } from "lucide-react";
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
  { title: 'nav.companies', url: "/", icon: Building2 },
  { title: 'nav.specialities', url: "/specialities", icon: List },
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
    isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon />
                      <span>{t(item.title)}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2 space-y-2">
          <div className="flex gap-2">
            <Button
              variant={language === 'en' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setLanguage('en')}
              className="flex-1"
            >
              <Globe className="h-4 w-4 mr-1" />
              EN
            </Button>
            <Button
              variant={language === 'pt' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setLanguage('pt')}
              className="flex-1"
            >
              <Globe className="h-4 w-4 mr-1" />
              PT
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t('auth.logout')}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
