import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

type Company = {
  id: string;
  name: string;
  email: string;
  speciality_id: string | null;
  created_at: string;
  company_specialities?: Array<{ specialities: { name: string; name_en: string; name_pt: string } }>;
};

interface CompanyViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
}

export const CompanyViewDialog = ({ open, onOpenChange, company }: CompanyViewDialogProps) => {
  const { t, language } = useLanguage();

  // Fetch company specialities for the viewed company
  const { data: companySpecialities } = useQuery({
    queryKey: ["company-specialities", company?.id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      if (!company?.id) return [];
      const { data, error } = await supabase
        .from("company_specialities")
        .select("speciality_id, specialities(name_en, name_pt)")
        .eq("company_id", company.id);
      if (error) throw error;
      return data;
    },
    enabled: !!company?.id && open,
  });

  if (!company) return null;

  const specialityNames = companySpecialities
    ?.map(cs => language === 'pt' ? cs.specialities.name_pt : cs.specialities.name_en)
    .join(", ") || "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('company.viewCompany') || 'Company Details'}</DialogTitle>
          <DialogDescription>
            {t('company.viewCompanyDesc') || 'View company information'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">{t('company.name')}</div>
            <div className="text-base">{company.name}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">{t('company.email')}</div>
            <div className="text-base">{company.email}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">{t('company.speciality')}</div>
            <div className="text-base">{specialityNames}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
