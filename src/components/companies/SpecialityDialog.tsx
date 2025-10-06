import { useEffect } from "react";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const createSpecialitySchema = (language: 'en' | 'pt') => {
  return z.object({
    name_en: z.string().min(1, language === 'en' ? "English name is required" : "Nome em inglês é obrigatório").max(100),
    name_pt: z.string().min(1, language === 'en' ? "Portuguese name is required" : "Nome em português é obrigatório").max(100),
  });
};

type SpecialityFormData = {
  name_en: string;
  name_pt: string;
};

interface SpecialityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  speciality?: { id: string; name_en: string; name_pt: string } | null;
}

export const SpecialityDialog = ({ open, onOpenChange, speciality }: SpecialityDialogProps) => {
  const queryClient = useQueryClient();
  const { language, t } = useLanguage();

  const form = useForm<SpecialityFormData>({
    resolver: zodResolver(createSpecialitySchema(language)),
    defaultValues: {
      name_en: "",
      name_pt: "",
    },
  });

  useEffect(() => {
    if (speciality) {
      form.reset({ 
        name_en: speciality.name_en,
        name_pt: speciality.name_pt
      });
    } else {
      form.reset({ name_en: "", name_pt: "" });
    }
  }, [speciality, form]);

  const mutation = useMutation({
    mutationFn: async (data: SpecialityFormData) => {
      if (speciality) {
        const { error } = await supabase
          .from("specialities")
          .update({ 
            name_en: data.name_en, 
            name_pt: data.name_pt, 
            name: data.name_en 
          })
          .eq("id", speciality.id);
        if (error) throw error;
      } else {
        const insertData = { 
          name: data.name_en, 
          name_en: data.name_en, 
          name_pt: data.name_pt 
        };
        const { error } = await supabase.from("specialities").insert([insertData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialities", import.meta.env.VITE_SUPABASE_URL] });
      toast.success(speciality ? t('company.editSpeciality') + ' successfully' : t('dialog.addSpeciality') + ' successfully');
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      if (error?.code === '23505') {
        toast.error("This speciality already exists");
      } else {
        toast.error(error.message || "Failed to save speciality");
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{speciality ? t('company.editSpeciality') : t('dialog.addSpeciality')}</DialogTitle>
          <DialogDescription>{t('dialog.addSpecialityDesc')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {language === 'en' ? 'English Name' : 'Nome em Inglês'}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={language === 'en' ? "e.g., Electrical, Plumbing, HVAC" : "ex: Electrical, Plumbing, HVAC"}
                      {...field}
                      disabled={mutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name_pt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {language === 'en' ? 'Portuguese Name' : 'Nome em Português'}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={language === 'en' ? "e.g., Elétrica, Encanamento, HVAC" : "ex: Elétrica, Encanamento, HVAC"}
                      {...field}
                      disabled={mutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('dialog.cancel')}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "..." : (speciality ? t('dialog.save') : t('dialog.create'))}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
