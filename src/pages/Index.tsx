import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, Globe } from "lucide-react";
import { CompaniesTable } from "@/components/companies/CompaniesTable";
import { CompanyDialog } from "@/components/companies/CompanyDialog";
import { SpecialityDialog } from "@/components/companies/SpecialityDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [isSpecialityDialogOpen, setIsSpecialityDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate('/auth');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success(t('auth.logoutSuccess'));
    navigate('/auth');
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">{t('common.loading')}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-foreground">{t('company.title')}</h1>
            <div className="flex gap-2 items-center">
              <Select value={language} onValueChange={(val) => setLanguage(val as 'en' | 'pt')}>
                <SelectTrigger className="w-[100px]">
                  <Globe className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="pt">PT</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t('auth.logout')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsSpecialityDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('company.addSpeciality')}
              </Button>
              <Button onClick={() => setIsCompanyDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('company.addCompany')}
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">{t('company.subtitle')}</p>
        </div>

        <CompaniesTable />

        <CompanyDialog 
          open={isCompanyDialogOpen} 
          onOpenChange={setIsCompanyDialogOpen}
        />

        <SpecialityDialog 
          open={isSpecialityDialogOpen} 
          onOpenChange={setIsSpecialityDialogOpen}
        />
      </div>
    </div>
  );
};

export default Index;
