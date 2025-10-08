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

type Person = {
  id: string;
  first_name: string;
  last_name: string | null;
  company_id: string | null;
  created_at: string | null;
};

const personSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().max(100).optional(),
  company_id: z.string().optional(),
});

type PersonFormData = z.infer<typeof personSchema>;

interface PersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person?: Person | null;
  readOnly?: boolean;
  preselectedCompanyId?: string;
}

export const PersonDialog = ({ open, onOpenChange, person, readOnly = false, preselectedCompanyId }: PersonDialogProps) => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const form = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      company_id: preselectedCompanyId || "none",
    },
  });

  const { data: companies } = useQuery({
    queryKey: ["companies", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (person) {
      form.reset({
        first_name: person.first_name,
        last_name: person.last_name || "",
        company_id: person.company_id || "none",
      });
    } else {
      form.reset({
        first_name: "",
        last_name: "",
        company_id: preselectedCompanyId || "none",
      });
    }
  }, [person, form, preselectedCompanyId]);

  const mutation = useMutation({
    mutationFn: async (data: PersonFormData) => {
      const companyId = data.company_id === "none" ? null : (data.company_id || null);
      
      if (person) {
        const { error } = await supabase
          .from("people")
          .update({
            first_name: data.first_name,
            last_name: data.last_name || null,
            company_id: companyId,
          })
          .eq("id", person.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("people")
          .insert([{
            first_name: data.first_name,
            last_name: data.last_name || null,
            company_id: companyId,
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people", import.meta.env.VITE_SUPABASE_URL] });
      queryClient.invalidateQueries({ queryKey: ["company-people"] });
      toast.success(person ? t('person.updateSuccess') || 'Person updated' : t('person.addSuccess') || 'Person added');
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast.error(t('person.saveError') || 'Failed to save person');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {readOnly ? t('person.viewPerson') || 'View Person' : (person ? t('person.editPerson') || 'Edit Person' : t('person.addPerson') || 'Add Person')}
          </DialogTitle>
          <DialogDescription>
            {readOnly ? t('person.viewPersonDesc') || 'Person details' : (person ? t('person.updatePerson') || 'Update person information' : t('person.addPersonDesc') || 'Add a new person')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('person.firstName') || 'First Name'}</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('person.lastName') || 'Last Name'}</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('person.company') || 'Company'}</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={readOnly}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('person.selectCompany') || 'Select a company...'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">{t('person.noCompany') || 'No company'}</SelectItem>
                      {companies?.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!readOnly && (
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {t('dialog.cancel') || 'Cancel'}
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "..." : person ? t('dialog.save') || 'Save' : t('dialog.create') || 'Create'}
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
