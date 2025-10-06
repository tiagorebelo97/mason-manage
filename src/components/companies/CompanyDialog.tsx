import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type Company = {
  id: string;
  name: string;
  email: string;
  speciality_id: string | null;
  speciality_ids?: string[];
  created_at: string;
};

const companySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email").max(255),
  speciality_ids: z.array(z.string()).optional(),
  brand_ids: z.array(z.string()).optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
  readOnly?: boolean;
}

export const CompanyDialog = ({ open, onOpenChange, company, readOnly = false }: CompanyDialogProps) => {
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      email: "",
      speciality_ids: [],
      brand_ids: [],
    },
  });

  const { data: specialities } = useQuery({
    queryKey: ["specialities", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specialities")
        .select("*")
        .order("name_en");
      if (error) throw error;
      return data;
    },
  });

  const { data: brands } = useQuery({
    queryKey: ["brands", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch existing company specialities when editing
  const { data: companySpecialities } = useQuery({
    queryKey: ["company-specialities", company?.id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      if (!company?.id) return [];
      const { data, error } = await supabase
        .from("company_specialities")
        .select("speciality_id")
        .eq("company_id", company.id);
      if (error) throw error;
      return data.map(item => item.speciality_id);
    },
    enabled: !!company?.id,
  });

  // Fetch existing company brands when editing
  const { data: companyBrands } = useQuery({
    queryKey: ["company-brands", company?.id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      if (!company?.id) return [];
      const { data, error } = await supabase
        .from("brand_companies")
        .select("brand_id")
        .eq("company_id", company.id);
      if (error) throw error;
      return data.map(item => item.brand_id);
    },
    enabled: !!company?.id,
  });

  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name,
        email: company.email,
        speciality_ids: companySpecialities || [],
        brand_ids: companyBrands || [],
      });
    } else {
      form.reset({
        name: "",
        email: "",
        speciality_ids: [],
        brand_ids: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, companySpecialities, companyBrands]);

  const mutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      if (company) {
        // Update company basic info
        const { error: updateError } = await supabase
          .from("companies")
          .update({ name: data.name, email: data.email })
          .eq("id", company.id);
        if (updateError) throw updateError;

        // Delete existing specialities
        const { error: deleteError } = await supabase
          .from("company_specialities")
          .delete()
          .eq("company_id", company.id);
        if (deleteError) throw deleteError;

        // Insert new specialities
        if (data.speciality_ids && data.speciality_ids.length > 0) {
          const specialityInserts = data.speciality_ids.map(speciality_id => ({
            company_id: company.id,
            speciality_id,
          }));
          const { error: insertError } = await supabase
            .from("company_specialities")
            .insert(specialityInserts);
          if (insertError) throw insertError;
        }

        // Delete existing brands
        const { error: deleteBrandsError } = await supabase
          .from("brand_companies")
          .delete()
          .eq("company_id", company.id);
        if (deleteBrandsError) throw deleteBrandsError;

        // Insert new brands
        if (data.brand_ids && data.brand_ids.length > 0) {
          const brandInserts = data.brand_ids.map(brand_id => ({
            company_id: company.id,
            brand_id,
          }));
          const { error: insertBrandsError } = await supabase
            .from("brand_companies")
            .insert(brandInserts);
          if (insertBrandsError) throw insertBrandsError;
        }
      } else {
        // Create new company
        const { data: newCompany, error: insertError } = await supabase
          .from("companies")
          .insert([{ name: data.name, email: data.email }])
          .select()
          .single();
        if (insertError) throw insertError;

        // Insert specialities
        if (data.speciality_ids && data.speciality_ids.length > 0) {
          const specialityInserts = data.speciality_ids.map(speciality_id => ({
            company_id: newCompany.id,
            speciality_id,
          }));
          const { error: specialityError } = await supabase
            .from("company_specialities")
            .insert(specialityInserts);
          if (specialityError) throw specialityError;
        }

        // Insert brands
        if (data.brand_ids && data.brand_ids.length > 0) {
          const brandInserts = data.brand_ids.map(brand_id => ({
            company_id: newCompany.id,
            brand_id,
          }));
          const { error: brandsError } = await supabase
            .from("brand_companies")
            .insert(brandInserts);
          if (brandsError) throw brandsError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies", import.meta.env.VITE_SUPABASE_URL] });
      toast.success(company ? "Company updated" : "Company added");
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast.error("Failed to save company");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {readOnly ? t('company.viewCompany') || 'View Company' : (company ? t('company.editCompany') : t('dialog.addCompany'))}
          </DialogTitle>
          <DialogDescription>
            {readOnly ? t('company.viewCompanyDesc') || 'Company details' : (company ? t('dialog.updateCompany') : t('dialog.addCompanyDesc'))}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('company.name')}</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('company.email')}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} disabled={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="speciality_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('company.speciality')}</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={
                        specialities?.map((speciality) => ({
                          label: language === 'pt' ? speciality.name_pt : speciality.name_en,
                          value: speciality.id,
                        })) || []
                      }
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder={t('company.selectSpeciality') || "Select specialities..."}
                      emptyText={t('company.noSpeciality') || "No specialities found."}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brand_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('company.brands') || 'Brands'}</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={
                        brands?.map((brand) => ({
                          label: brand.name,
                          value: brand.id,
                        })) || []
                      }
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder={t('company.selectBrands') || "Select brands..."}
                      emptyText={t('company.noBrands') || "No brands found."}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!readOnly && (
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {t('dialog.cancel')}
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "..." : company ? t('dialog.save') : t('dialog.create')}
                </Button>
              </div>
            )}
            {readOnly && (
              <div className="flex justify-end">
                <Button type="button" onClick={() => onOpenChange(false)}>
                  {t('dialog.close') || 'Close'}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
