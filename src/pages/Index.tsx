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
    return <div className="min-h-screen bg-background flex items-center justify-center">{t('common.loading')}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-foreground">{t('company.title')}</h1>
          <Button onClick={() => setIsCompanyDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('company.addCompany')}
          </Button>
        </div>
        <p className="text-muted-foreground">{t('company.subtitle')}</p>
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
