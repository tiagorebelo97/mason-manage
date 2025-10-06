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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateText } from "@/services/translationService";

const createMainSpecialitySchema = (language: 'en' | 'pt') => {
  return z.object({
    type: z.string().min(1, language === 'en' ? "Type is required" : "Tipo é obrigatório").max(100),
    mainSpecialty: z.string().min(1, language === 'en' ? "Main specialty is required" : "Especialidade principal é obrigatória").max(100),
    inputLanguage: z.enum(['en', 'pt']),
  });
};

type MainSpecialityFormData = {
  type: string;
  mainSpecialty: string;
  inputLanguage: 'en' | 'pt';
};

interface MainSpecialityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mainSpeciality?: { id: string; type: string; main_specialty_en: string; main_specialty_pt: string } | null;
}

export const MainSpecialityDialog = ({ open, onOpenChange, mainSpeciality }: MainSpecialityDialogProps) => {
  const queryClient = useQueryClient();
  const { language, t } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);

  const form = useForm<MainSpecialityFormData>({
    resolver: zodResolver(createMainSpecialitySchema(language)),
    defaultValues: {
      type: "",
      mainSpecialty: "",
      inputLanguage: language,
    },
  });

  useEffect(() => {
    if (mainSpeciality) {
      const mainSpecialtyName = language === 'en' ? mainSpeciality.main_specialty_en : mainSpeciality.main_specialty_pt;
      form.reset({ 
        type: mainSpeciality.type,
        mainSpecialty: mainSpecialtyName,
        inputLanguage: language,
      });
    } else {
      form.reset({ 
        type: "",
        mainSpecialty: "",
        inputLanguage: language,
      });
    }
  }, [mainSpeciality, form, language]);

  const mutation = useMutation({
    mutationFn: async (data: MainSpecialityFormData) => {
      setIsTranslating(true);
      
      try {
        const sourceLang = data.inputLanguage;
        const targetLang = data.inputLanguage === 'en' ? 'pt' : 'en';
        
        const translatedName = await translateText(data.mainSpecialty, sourceLang, targetLang);
        
        const main_specialty_en = data.inputLanguage === 'en' ? data.mainSpecialty : translatedName;
        const main_specialty_pt = data.inputLanguage === 'pt' ? data.mainSpecialty : translatedName;

        if (mainSpeciality) {
          const { error } = await supabase
            .from("main_specialties")
            .update({ 
              type: data.type,
              main_specialty_en,
              main_specialty_pt,
            })
            .eq("id", mainSpeciality.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("main_specialties")
            .insert({ 
              type: data.type,
              main_specialty_en,
              main_specialty_pt,
            });
          if (error) throw error;
        }
      } finally {
        setIsTranslating(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["main_specialities", import.meta.env.VITE_SUPABASE_URL] });
      toast.success(mainSpeciality ? t('mainSpecialty.editMainSpecialty') : t('mainSpecialty.addMainSpecialty'));
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast.error("Failed to save main specialty");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mainSpeciality ? t('mainSpecialty.editMainSpecialty') : t('mainSpecialty.addMainSpecialty')}
          </DialogTitle>
          <DialogDescription>
            {language === 'en' 
              ? 'Select the language and enter the main specialty information. The other language will be translated automatically.' 
              : 'Selecione o idioma e insira as informações da especialidade principal. O outro idioma será traduzido automaticamente.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('mainSpecialty.type')}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      disabled={mutation.isPending || isTranslating}
                      placeholder={language === 'en' ? "Enter type" : "Inserir tipo"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mainSpecialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('mainSpecialty.mainSpecialty')}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      disabled={mutation.isPending || isTranslating}
                      placeholder={language === 'en' ? "Enter main specialty name" : "Inserir nome da especialidade principal"}
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
                disabled={mutation.isPending || isTranslating}
              >
                {t('dialog.cancel')}
              </Button>
              <Button type="submit" disabled={mutation.isPending || isTranslating}>
                {isTranslating 
                  ? (language === 'en' ? 'Translating...' : 'A traduzir...') 
                  : mutation.isPending 
                    ? (language === 'en' ? 'Saving...' : 'A guardar...') 
                    : mainSpeciality 
                      ? t('dialog.save') 
                      : t('dialog.create')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
