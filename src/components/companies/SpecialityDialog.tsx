import { useEffect, useState } from "react";
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
import { translateText } from "@/services/translationService";

const createSpecialitySchema = (language: 'en' | 'pt') => {
  return z.object({
    name: z.string().min(1, language === 'en' ? "Name is required" : "Nome é obrigatório").max(100),
  });
};

type SpecialityFormData = {
  name: string;
};

interface SpecialityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  speciality?: { id: string; name_en: string; name_pt: string } | null;
}

export const SpecialityDialog = ({ open, onOpenChange, speciality }: SpecialityDialogProps) => {
  const queryClient = useQueryClient();
  const { language, t } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);

  const form = useForm<SpecialityFormData>({
    resolver: zodResolver(createSpecialitySchema(language)),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (speciality) {
      // When editing, show the name in the current language
      const nameToShow = language === 'en' ? speciality.name_en : speciality.name_pt;
      form.reset({ 
        name: nameToShow
      });
    } else {
      form.reset({ name: "" });
    }
  }, [speciality, form, language]);

  const mutation = useMutation({
    mutationFn: async (data: SpecialityFormData) => {
      setIsTranslating(true);
      
      try {
        // Translate the name to both languages
        const sourceLang = language;
        const targetLang = language === 'en' ? 'pt' : 'en';
        
        const translatedName = await translateText(data.name, sourceLang, targetLang);
        
        const name_en = language === 'en' ? data.name : translatedName;
        const name_pt = language === 'pt' ? data.name : translatedName;

        if (speciality) {
          const { error } = await supabase
            .from("specialities")
            .update({ 
              name_en, 
              name_pt, 
              name: name_en 
            })
            .eq("id", speciality.id);
          if (error) throw error;
        } else {
          const insertData = { 
            name: name_en, 
            name_en, 
            name_pt 
          };
          const { error } = await supabase.from("specialities").insert([insertData]);
          if (error) throw error;
        }
      } finally {
        setIsTranslating(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialities"] });
      toast.success(speciality ? t('company.editSpeciality') + ' successfully' : t('dialog.addSpeciality') + ' successfully');
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      // Check if error has a code property (Supabase errors)
      const hasCode = 'code' in error && typeof (error as { code?: string }).code === 'string';
      if (hasCode && (error as { code: string }).code === '23505') {
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {language === 'en' ? 'Name' : 'Nome'}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={language === 'en' ? "e.g., Electrical, Plumbing, HVAC" : "ex: Elétrica, Encanamento, HVAC"}
                      {...field}
                      disabled={mutation.isPending || isTranslating}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending || isTranslating}>
                {t('dialog.cancel')}
              </Button>
              <Button type="submit" disabled={mutation.isPending || isTranslating}>
                {(mutation.isPending || isTranslating) ? "..." : (speciality ? t('dialog.save') : t('dialog.create'))}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
