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

type Brand = {
  id: string;
  name: string;
  website: string | null;
  official_email: string | null;
  speciality_ids?: string[];
  company_ids?: string[];
  created_at: string | null;
};

const brandSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  official_email: z.string().email("Invalid email").optional().or(z.literal("")),
  speciality_ids: z.array(z.string()).optional(),
  company_ids: z.array(z.string()).optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

interface BrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: Brand | null;
  readOnly?: boolean;
}

export const BrandDialog = ({ open, onOpenChange, brand, readOnly = false }: BrandDialogProps) => {
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      website: "",
      official_email: "",
      speciality_ids: [],
      company_ids: [],
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

  const { data: companies } = useQuery({
    queryKey: ["companies", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: brandSpecialities } = useQuery({
    queryKey: ["brand-specialities", brand?.id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      if (!brand?.id) return [];
      const { data, error } = await supabase
        .from("brand_specialities")
        .select("speciality_id")
        .eq("brand_id", brand.id);
      if (error) throw error;
      return data.map(item => item.speciality_id);
    },
    enabled: !!brand?.id,
  });

  const { data: brandCompanies } = useQuery({
    queryKey: ["brand-companies", brand?.id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      if (!brand?.id) return [];
      const { data, error } = await supabase
        .from("brand_companies")
        .select("company_id")
        .eq("brand_id", brand.id);
      if (error) throw error;
      return data.map(item => item.company_id);
    },
    enabled: !!brand?.id,
  });

  useEffect(() => {
    if (brand) {
      form.reset({
        name: brand.name,
        website: brand.website || "",
        official_email: brand.official_email || "",
        speciality_ids: brandSpecialities || [],
        company_ids: brandCompanies || [],
      });
    } else {
      form.reset({
        name: "",
        website: "",
        official_email: "",
        speciality_ids: [],
        company_ids: [],
      });
    }
  }, [brand, brandSpecialities, brandCompanies, form]);

  const mutation = useMutation({
    mutationFn: async (data: BrandFormData) => {
      if (brand) {
        // Update brand basic info
        const { error: updateError } = await supabase
          .from("brands")
          .update({ 
            name: data.name, 
            website: data.website || null,
            official_email: data.official_email || null,
          })
          .eq("id", brand.id);
        if (updateError) throw updateError;

        // Delete existing specialities
        const { error: deleteSpecialitiesError } = await supabase
          .from("brand_specialities")
          .delete()
          .eq("brand_id", brand.id);
        if (deleteSpecialitiesError) throw deleteSpecialitiesError;

        // Insert new specialities
        if (data.speciality_ids && data.speciality_ids.length > 0) {
          const specialityInserts = data.speciality_ids.map(speciality_id => ({
            brand_id: brand.id,
            speciality_id,
          }));
          const { error: insertSpecialitiesError } = await supabase
            .from("brand_specialities")
            .insert(specialityInserts);
          if (insertSpecialitiesError) throw insertSpecialitiesError;
        }

        // Delete existing companies
        const { error: deleteCompaniesError } = await supabase
          .from("brand_companies")
          .delete()
          .eq("brand_id", brand.id);
        if (deleteCompaniesError) throw deleteCompaniesError;

        // Insert new companies
        if (data.company_ids && data.company_ids.length > 0) {
          const companyInserts = data.company_ids.map(company_id => ({
            brand_id: brand.id,
            company_id,
          }));
          const { error: insertCompaniesError } = await supabase
            .from("brand_companies")
            .insert(companyInserts);
          if (insertCompaniesError) throw insertCompaniesError;
        }
      } else {
        // Create new brand
        const { data: newBrand, error: insertError } = await supabase
          .from("brands")
          .insert({ 
            name: data.name,
            website: data.website || null,
            official_email: data.official_email || null,
          })
          .select()
          .single();
        if (insertError) throw insertError;

        // Insert specialities
        if (data.speciality_ids && data.speciality_ids.length > 0) {
          const specialityInserts = data.speciality_ids.map(speciality_id => ({
            brand_id: newBrand.id,
            speciality_id,
          }));
          const { error: insertSpecialitiesError } = await supabase
            .from("brand_specialities")
            .insert(specialityInserts);
          if (insertSpecialitiesError) throw insertSpecialitiesError;
        }

        // Insert companies
        if (data.company_ids && data.company_ids.length > 0) {
          const companyInserts = data.company_ids.map(company_id => ({
            brand_id: newBrand.id,
            company_id,
          }));
          const { error: insertCompaniesError } = await supabase
            .from("brand_companies")
            .insert(companyInserts);
          if (insertCompaniesError) throw insertCompaniesError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands", import.meta.env.VITE_SUPABASE_URL] });
      toast.success(brand ? t('brand.editBrand') + " successfully" : t('brand.addBrand') + " successfully");
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast.error("Failed to save brand");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {readOnly ? t('brand.viewBrand') : brand ? t('brand.editBrand') : t('brand.addBrand')}
          </DialogTitle>
          <DialogDescription>
            {readOnly ? t('brand.viewBrandDesc') : brand ? 'Update brand information' : 'Add a new brand'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('brand.name')}</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('brand.website')}</FormLabel>
                  <FormControl>
                    <Input type="url" {...field} disabled={readOnly} placeholder="https://example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="official_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('brand.officialEmail')}</FormLabel>
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
                  <FormLabel>{t('brand.specialities')}</FormLabel>
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
                      placeholder={t('brand.selectSpecialities') || "Select specialities..."}
                      emptyText={t('brand.noSpecialities') || "No specialities found."}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('brand.companies')}</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={
                        companies?.map((company) => ({
                          label: company.name,
                          value: company.id,
                        })) || []
                      }
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder={t('brand.selectCompanies') || "Select companies..."}
                      emptyText={t('brand.noCompanies') || "No companies found."}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                {readOnly ? t('dialog.close') : t('dialog.cancel')}
              </Button>
              {!readOnly && (
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "..." : brand ? t('dialog.save') : t('dialog.create')}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
