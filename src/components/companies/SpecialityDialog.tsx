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

const specialitySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

type SpecialityFormData = z.infer<typeof specialitySchema>;

interface SpecialityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SpecialityDialog = ({ open, onOpenChange }: SpecialityDialogProps) => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const form = useForm<SpecialityFormData>({
    resolver: zodResolver(specialitySchema),
    defaultValues: {
      name: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: SpecialityFormData) => {
      const insertData = { name: data.name };
      const { error } = await supabase.from("specialities").insert([insertData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialities"] });
      toast.success("Speciality added successfully");
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      if (error?.code === '23505') {
        toast.error("This speciality already exists");
      } else {
        toast.error("Failed to add speciality");
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dialog.addSpeciality')}</DialogTitle>
          <DialogDescription>{t('dialog.addSpecialityDesc')}</DialogDescription>
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
                    <Input placeholder="e.g., Electrical, Plumbing, HVAC" {...field} />
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
                {mutation.isPending ? "..." : t('dialog.create')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
