import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Download } from "lucide-react";
import { useState } from "react";
import { CompanyDialog } from "./CompanyDialog";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
type Company = {
  id: string;
  name: string;
  email: string;
  speciality_id: string | null;
  created_at: string;
  company_specialities?: Array<{ specialities: { name: string; name_en: string; name_pt: string } }>;
};

export const CompaniesTable = () => {
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  const { data: companies, isLoading } = useQuery({
    queryKey: ["companies", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*, company_specialities(specialities(name, name_en, name_pt))")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("companies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies", import.meta.env.VITE_SUPABASE_URL] });
      toast.success(t('company.deleteSuccess'));
    },
    onError: () => {
      toast.error(t('company.deleteError'));
    },
  });

  const exportToCSV = () => {
    if (!companies || companies.length === 0) {
      toast.error(t('company.exportError'));
      return;
    }

    const headers = ["Name", "Email", "Speciality"];
    const rows: string[][] = [];
    
    companies.forEach((company) => {
      if (company.company_specialities && company.company_specialities.length > 0) {
        // Create one row per speciality
        company.company_specialities.forEach((cs) => {
          const specialityName = language === 'pt' ? cs.specialities.name_pt : cs.specialities.name_en;
          rows.push([
            company.name,
            company.email,
            specialityName,
          ]);
        });
      } else {
        // If no specialities, still add one row for the company
        rows.push([
          company.name,
          company.email,
          "",
        ]);
      }
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `companies_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(t('company.exportSuccess'));
  };

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          {t('company.exportCSV')}
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('company.name')}</TableHead>
              <TableHead>{t('company.email')}</TableHead>
              <TableHead>{t('company.speciality')}</TableHead>
              <TableHead className="text-right">{t('company.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {t('company.noCompanies')}
                </TableCell>
              </TableRow>
            ) : (
              companies?.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.email}</TableCell>
                  <TableCell>
                    {company.company_specialities && company.company_specialities.length > 0
                      ? company.company_specialities
                          .map(cs => language === 'pt' ? cs.specialities.name_pt : cs.specialities.name_en)
                          .join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCompany(company)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(company.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingCompany && (
        <CompanyDialog
          open={!!editingCompany}
          onOpenChange={(open) => !open && setEditingCompany(null)}
          company={editingCompany}
        />
      )}
    </>
  );
};
