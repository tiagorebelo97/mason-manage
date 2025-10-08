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
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type Location = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  postal_code: string | null;
  created_at: string | null;
};

const locationSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: Location | null;
  readOnly?: boolean;
}

export const LocationDialog = ({ open, onOpenChange, location, readOnly = false }: LocationDialogProps) => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      country: "",
      postal_code: "",
    },
  });

  useEffect(() => {
    if (location) {
      form.reset({
        name: location.name,
        address: location.address || "",
        city: location.city || "",
        country: location.country || "",
        postal_code: location.postal_code || "",
      });
    } else {
      form.reset({
        name: "",
        address: "",
        city: "",
        country: "",
        postal_code: "",
      });
    }
  }, [location, form]);

  const mutation = useMutation({
    mutationFn: async (data: LocationFormData) => {
      if (location) {
        const { error } = await supabase
          .from("locations")
          .update({
            name: data.name,
            address: data.address || null,
            city: data.city || null,
            country: data.country || null,
            postal_code: data.postal_code || null,
          })
          .eq("id", location.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("locations")
          .insert([{
            name: data.name,
            address: data.address || null,
            city: data.city || null,
            country: data.country || null,
            postal_code: data.postal_code || null,
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations", import.meta.env.VITE_SUPABASE_URL] });
      toast.success(location ? t('location.updateSuccess') || 'Location updated' : t('location.addSuccess') || 'Location added');
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast.error(t('location.saveError') || 'Failed to save location');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {readOnly ? t('location.viewLocation') || 'View Location' : (location ? t('location.editLocation') || 'Edit Location' : t('location.addLocation') || 'Add Location')}
          </DialogTitle>
          <DialogDescription>
            {readOnly ? t('location.viewLocationDesc') || 'Location details' : (location ? t('location.updateLocation') || 'Update location information' : t('location.addLocationDesc') || 'Add a new location')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('location.name') || 'Name'}</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('location.address') || 'Address'}</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('location.city') || 'City'}</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('location.country') || 'Country'}</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('location.postalCode') || 'Postal Code'}</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={readOnly} />
                  </FormControl>
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
                  {mutation.isPending ? "..." : location ? t('dialog.save') || 'Save' : t('dialog.create') || 'Create'}
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
