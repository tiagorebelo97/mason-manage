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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  created_at: string;
};

const companySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email").max(255),
  speciality_id: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
}

export const CompanyDialog = ({ open, onOpenChange, company }: CompanyDialogProps) => {
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      email: "",
      speciality_id: "",
    },
  });

  const { data: specialities } = useQuery({
    queryKey: ["specialities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specialities")
        .select("*")
        .order("name_en");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name,
        email: company.email,
        speciality_id: company.speciality_id,
      });
    } else {
      form.reset({
        name: "",
        email: "",
        speciality_id: "",
      });
    }
  }, [company, form]);

  const mutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      if (company) {
        const { error } = await supabase
          .from("companies")
          .update(data)
          .eq("id", company.id);
        if (error) throw error;
      } else {
        const insertData = {
          name: data.name,
          email: data.email,
          speciality_id: data.speciality_id || null,
        };
        const { error } = await supabase.from("companies").insert([insertData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
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
          <DialogTitle>{company ? t('company.editCompany') : t('dialog.addCompany')}</DialogTitle>
          <DialogDescription>
            {company ? t('dialog.updateCompany') : t('dialog.addCompanyDesc')}
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
                    <Input {...field} />
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
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="speciality_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('company.speciality')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a speciality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {specialities?.map((speciality) => (
                        <SelectItem key={speciality.id} value={speciality.id}>
                          {language === 'pt' ? speciality.name_pt : speciality.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('dialog.cancel')}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "..." : company ? t('dialog.save') : t('dialog.create')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
