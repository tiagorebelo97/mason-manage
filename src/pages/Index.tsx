import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CompaniesTable } from "@/components/companies/CompaniesTable";
import { CompanyDialog } from "@/components/companies/CompanyDialog";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('company.title')}
          </h1>
          <Button onClick={() => setIsCompanyDialogOpen(true)} size="lg" className="shadow-lg">
            <Plus className="mr-2 h-5 w-5" />
            {t('company.addCompany')}
          </Button>
        </div>
        <p className="text-base text-muted-foreground">{t('company.subtitle')}</p>
      </div>

      <CompaniesTable />

      <CompanyDialog 
        open={isCompanyDialogOpen} 
        onOpenChange={setIsCompanyDialogOpen}
      />
    </div>
  );
};

export default Index;
