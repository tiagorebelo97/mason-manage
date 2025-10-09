import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

const createOrcamentoSchema = (language: 'en' | 'pt') => {
  return z.object({
    name: z.string().min(1, language === 'en' ? "Name is required" : "Nome é obrigatório"),
    state: z.enum(['open', 'closed']),
    delivery_date: z.string().optional(),
  });
};

type OrcamentoFormData = {
  name: string;
  state: 'open' | 'closed';
  delivery_date?: string;
};

interface OrcamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orcamento?: { id: string; name: string; state: 'open' | 'closed'; delivery_date: string | null } | null;
  viewMode?: boolean;
}

export const OrcamentoDialog = ({ open, onOpenChange, orcamento, viewMode = false }: OrcamentoDialogProps) => {
  const queryClient = useQueryClient();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const form = useForm<OrcamentoFormData>({
    resolver: zodResolver(createOrcamentoSchema(language)),
    defaultValues: {
      name: "",
      state: "open",
      delivery_date: "",
    },
  });

  useEffect(() => {
    if (orcamento) {
      form.reset({
        name: orcamento.name,
        state: orcamento.state,
        delivery_date: orcamento.delivery_date ? new Date(orcamento.delivery_date).toISOString().split('T')[0] : "",
      });
    } else {
      form.reset({
        name: "",
        state: "open",
        delivery_date: "",
      });
    }
  }, [orcamento, form]);

  const mutation = useMutation({
    mutationFn: async (data: OrcamentoFormData) => {
      const orcamentoData = {
        name: data.name,
        state: data.state,
        delivery_date: data.delivery_date || null,
      };

      if (orcamento) {
        const { error } = await supabase
          .from("orcamentos")
          .update(orcamentoData)
          .eq("id", orcamento.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("orcamentos")
          .insert([orcamentoData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos", import.meta.env.VITE_SUPABASE_URL] });
      toast.success(orcamento ? t('orcamento.updateSuccess') : t('orcamento.addSuccess'));
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast.error(t('orcamento.saveError'));
    },
  });

  const handleMapaQuantidades = () => {
    if (orcamento) {
      navigate(`/orcamentos/${orcamento.id}/mapa-quantidades`);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {viewMode 
              ? t('orcamento.viewOrcamento')
              : orcamento 
                ? t('orcamento.editOrcamento')
                : t('orcamento.addOrcamento')}
          </DialogTitle>
          {viewMode && (
            <DialogDescription>
              {orcamento?.name}
            </DialogDescription>
          )}
        </DialogHeader>
        
        {viewMode ? (
          <div className="py-4">
            <Button 
              onClick={handleMapaQuantidades}
              className="w-full"
            >
              {t('orcamento.mapaQuantidades')}
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('orcamento.name')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('orcamento.state')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={mutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="open">{t('orcamento.stateOpen')}</SelectItem>
                        <SelectItem value="closed">{t('orcamento.stateClosed')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="delivery_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('orcamento.deliveryDate')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {t('dialog.cancel')}
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {t('dialog.save')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
