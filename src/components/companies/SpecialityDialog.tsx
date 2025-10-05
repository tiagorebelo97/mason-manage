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
import { Loader2 } from "lucide-react";

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
  const [translating, setTranslating] = useState(false);

  const form = useForm<SpecialityFormData>({
    resolver: zodResolver(createSpecialitySchema(language)),
    defaultValues: {
      name: "",
    },
  });

  const translateText = async (text: string, targetLang: 'en' | 'pt') => {
    try {
      setTranslating(true);
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { text, targetLanguage: targetLang }
      });
      
      if (error) throw error;
      return data.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed');
      return '';
    } finally {
      setTranslating(false);
    }
  };

  useEffect(() => {
    if (speciality) {
      const name = language === 'en' ? speciality.name_en : speciality.name_pt;
      form.reset({ name });
    } else {
      form.reset({ name: "" });
    }
  }, [speciality, language, form]);

  const mutation = useMutation({
    mutationFn: async (data: SpecialityFormData) => {
      let name_en = '';
      let name_pt = '';

      if (speciality) {
        // Editing: update the field based on current language
        if (language === 'en') {
          name_en = data.name;
          name_pt = speciality.name_pt; // keep existing
        } else {
          name_pt = data.name;
          name_en = speciality.name_en; // keep existing
        }
        const { error } = await supabase
          .from("specialities")
          .update({ name_en, name_pt, name: name_en })
          .eq("id", speciality.id);
        if (error) throw error;
      } else {
        // Creating: translate the other language
        if (language === 'en') {
          name_en = data.name;
          name_pt = await translateText(data.name, 'pt');
        } else {
          name_pt = data.name;
          name_en = await translateText(data.name, 'en');
        }
        
        if (!name_en || !name_pt) {
          throw new Error('Translation failed');
        }

        const insertData = { name: name_en, name_en, name_pt };
        const { error } = await supabase.from("specialities").insert([insertData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialities"] });
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    {language === 'en' ? 'Speciality Name' : 'Nome da Especialidade'}
                    {translating && <Loader2 className="h-3 w-3 animate-spin" />}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={language === 'en' ? "e.g., Electrical, Plumbing, HVAC" : "e.g., Elétrica, Encanamento, HVAC"}
                      {...field}
                      disabled={translating || mutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                  {!speciality && (
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' 
                        ? 'The Portuguese translation will be generated automatically' 
                        : 'A tradução em inglês será gerada automaticamente'}
                    </p>
                  )}
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('dialog.cancel')}
              </Button>
              <Button type="submit" disabled={mutation.isPending || translating}>
                {mutation.isPending ? "..." : (speciality ? t('dialog.save') : t('dialog.create'))}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
