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
import { useLanguage } from "@/contexts/LanguageContext";
import { translateText } from "@/services/translationService";

const createSpecialitySchema = (language: 'en' | 'pt') => {
  return z.object({
    name: z.string().min(1, language === 'en' ? "Name is required" : "Nome é obrigatório").max(100),
    inputLanguage: z.enum(['en', 'pt']),
    main_specialty_id: z.string().optional(),
  });
};

type SpecialityFormData = {
  name: string;
  inputLanguage: 'en' | 'pt';
  main_specialty_id?: string;
};

interface SpecialityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  speciality?: { id: string; name_en: string; name_pt: string; main_specialty_id?: string | null } | null;
}

export const SpecialityDialog = ({ open, onOpenChange, speciality }: SpecialityDialogProps) => {
  const queryClient = useQueryClient();
  const { language, t } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);

  const form = useForm<SpecialityFormData>({
    resolver: zodResolver(createSpecialitySchema(language)),
    defaultValues: {
      name: "",
      inputLanguage: language,
      main_specialty_id: "none",
    },
  });

  const { data: mainSpecialties } = useQuery({
    queryKey: ["main_specialities", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("main_specialties")
        .select("*")
        .order("type");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (open) {
      if (speciality) {
        // When editing, show the name in the current language
        const nameToShow = language === 'en' ? speciality.name_en : speciality.name_pt;
        form.reset({ 
          name: nameToShow,
          inputLanguage: language,
          main_specialty_id: speciality.main_specialty_id || "none",
        });
      } else {
        form.reset({ 
          name: "",
          inputLanguage: language,
          main_specialty_id: "none",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, speciality, language]);

  const mutation = useMutation({
    mutationFn: async (data: SpecialityFormData) => {
      setIsTranslating(true);
      
      try {
        // Translate the name to both languages
        const sourceLang = data.inputLanguage;
        const targetLang = data.inputLanguage === 'en' ? 'pt' : 'en';
        
        const translatedName = await translateText(data.name, sourceLang, targetLang);
        
        const name_en = data.inputLanguage === 'en' ? data.name : translatedName;
        const name_pt = data.inputLanguage === 'pt' ? data.name : translatedName;

        if (speciality) {
          const { error } = await supabase
            .from("specialities")
            .update({ 
              name_en, 
              name_pt, 
              name: name_en,
              main_specialty_id: data.main_specialty_id === "none" ? null : data.main_specialty_id,
            })
            .eq("id", speciality.id);
          if (error) throw error;
        } else {
          const insertData = { 
            name: name_en, 
            name_en, 
            name_pt,
            main_specialty_id: data.main_specialty_id === "none" ? null : data.main_specialty_id,
          };
          const { error } = await supabase.from("specialities").insert([insertData]);
          if (error) throw error;
        }
      } finally {
        setIsTranslating(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialities", import.meta.env.VITE_SUPABASE_URL] });
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
              name="main_specialty_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('speciality.mainSpecialty')}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={mutation.isPending || isTranslating}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('speciality.selectMainSpecialty')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">
                        {language === 'en' ? 'None' : 'Nenhum'}
                      </SelectItem>
                      {mainSpecialties?.map((ms) => (
                        <SelectItem key={ms.id} value={ms.id}>
                          {language === 'pt' ? ms.main_specialty_pt : ms.main_specialty_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="inputLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {language === 'en' ? 'Input Language' : 'Idioma de Entrada'}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={mutation.isPending || isTranslating}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'en' ? "Select language" : "Selecione o idioma"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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

