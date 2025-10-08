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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plus, Mail, Phone, User, Pencil, Trash2 } from "lucide-react";
import { PersonDialog } from "./PersonDialog";

type Company = {
  id: string;
  name: string;
  comments: string | null;
  speciality_id: string | null;
  speciality_ids?: string[];
  created_at: string;
};

type PersonWithContact = {
  id: string;
  first_name: string;
  last_name: string | null;
  company_id: string | null;
  created_at: string;
  contacts?: {
    email: string | null;
    mobile: string | null;
    country_code: string | null;
  }[];
};

const companySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  comments: z.string().max(1000).optional(),
  speciality_ids: z.array(z.string()).optional(),
  brand_ids: z.array(z.string()).optional(),
  location_ids: z.array(z.string()).optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
  readOnly?: boolean;
}

export const CompanyDialog = ({ open, onOpenChange, company, readOnly = false }: CompanyDialogProps) => {
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();
  const [isPersonDialogOpen, setIsPersonDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<PersonWithContact | null>(null);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      comments: "",
      speciality_ids: [],
      brand_ids: [],
      location_ids: [],
    },
  });

  const { data: specialities } = useQuery({
    queryKey: ["specialities", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specialities")
        .select("*")
        .order("name_en");
      if (error) throw error;
      return data;
    },
  });

  const { data: brands } = useQuery({
    queryKey: ["brands", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: locations } = useQuery({
    queryKey: ["locations", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch existing company specialities when editing
  const { data: companySpecialities } = useQuery({
    queryKey: ["company-specialities", company?.id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      if (!company?.id) return [];
      const { data, error } = await supabase
        .from("company_specialities")
        .select("speciality_id")
        .eq("company_id", company.id);
      if (error) throw error;
      return data.map(item => item.speciality_id);
    },
    enabled: !!company?.id,
  });

  // Fetch existing company brands when editing
  const { data: companyBrands } = useQuery({
    queryKey: ["company-brands", company?.id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      if (!company?.id) return [];
      const { data, error } = await supabase
        .from("brand_companies")
        .select("brand_id")
        .eq("company_id", company.id);
      if (error) throw error;
      return data.map(item => item.brand_id);
    },
    enabled: !!company?.id,
  });

  // Fetch existing company locations when editing
  const { data: companyLocations } = useQuery({
    queryKey: ["company-locations", company?.id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      if (!company?.id) return [];
      const { data, error } = await supabase
        .from("company_locations")
        .select("location_id")
        .eq("company_id", company.id);
      if (error) throw error;
      return data.map(item => item.location_id);
    },
    enabled: !!company?.id,
  });

  // Fetch people related to this company with their contact information
  const { data: companyPeople } = useQuery({
    queryKey: ["company-people", company?.id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      if (!company?.id) return [];
      const { data, error } = await supabase
        .from("people")
        .select("id, first_name, last_name, company_id, created_at, contacts(email, mobile, country_code)")
        .eq("company_id", company.id)
        .order("first_name");
      if (error) throw error;
      return data as PersonWithContact[];
    },
    enabled: !!company?.id,
  });

  const deletePerson = useMutation({
    mutationFn: async (personId: string) => {
      const { error } = await supabase.from("people").delete().eq("id", personId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-people", company?.id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success(t('person.deleteSuccess') || 'Person deleted successfully');
    },
    onError: () => {
      toast.error(t('person.deleteError') || 'Failed to delete person');
    },
  });

  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name,
        comments: company.comments || "",
        speciality_ids: companySpecialities || [],
        brand_ids: companyBrands || [],
        location_ids: companyLocations || [],
      });
    } else {
      form.reset({
        name: "",
        comments: "",
        speciality_ids: [],
        brand_ids: [],
        location_ids: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, companySpecialities, companyBrands, companyLocations]);

  const mutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      if (company) {
        // Update company basic info
        const { error: updateError } = await supabase
          .from("companies")
          .update({ name: data.name, comments: data.comments || null })
          .eq("id", company.id);
        if (updateError) throw updateError;

        // Delete existing specialities
        const { error: deleteError } = await supabase
          .from("company_specialities")
          .delete()
          .eq("company_id", company.id);
        if (deleteError) throw deleteError;

        // Insert new specialities
        if (data.speciality_ids && data.speciality_ids.length > 0) {
          const specialityInserts = data.speciality_ids.map(speciality_id => ({
            company_id: company.id,
            speciality_id,
          }));
          const { error: insertError } = await supabase
            .from("company_specialities")
            .insert(specialityInserts);
          if (insertError) throw insertError;
        }

        // Delete existing brands
        const { error: deleteBrandsError } = await supabase
          .from("brand_companies")
          .delete()
          .eq("company_id", company.id);
        if (deleteBrandsError) throw deleteBrandsError;

        // Insert new brands
        if (data.brand_ids && data.brand_ids.length > 0) {
          const brandInserts = data.brand_ids.map(brand_id => ({
            company_id: company.id,
            brand_id,
          }));
          const { error: insertBrandsError } = await supabase
            .from("brand_companies")
            .insert(brandInserts);
          if (insertBrandsError) throw insertBrandsError;
        }

        // Delete existing locations
        const { error: deleteLocationsError } = await supabase
          .from("company_locations")
          .delete()
          .eq("company_id", company.id);
        if (deleteLocationsError) throw deleteLocationsError;

        // Insert new locations
        if (data.location_ids && data.location_ids.length > 0) {
          const locationInserts = data.location_ids.map(location_id => ({
            company_id: company.id,
            location_id,
          }));
          const { error: insertLocationsError } = await supabase
            .from("company_locations")
            .insert(locationInserts);
          if (insertLocationsError) throw insertLocationsError;
        }
      } else {
        // Create new company
        const { data: newCompany, error: insertError } = await supabase
          .from("companies")
          .insert([{ name: data.name, comments: data.comments || null }])
          .select()
          .single();
        if (insertError) throw insertError;

        // Insert specialities
        if (data.speciality_ids && data.speciality_ids.length > 0) {
          const specialityInserts = data.speciality_ids.map(speciality_id => ({
            company_id: newCompany.id,
            speciality_id,
          }));
          const { error: specialityError } = await supabase
            .from("company_specialities")
            .insert(specialityInserts);
          if (specialityError) throw specialityError;
        }

        // Insert brands
        if (data.brand_ids && data.brand_ids.length > 0) {
          const brandInserts = data.brand_ids.map(brand_id => ({
            company_id: newCompany.id,
            brand_id,
          }));
          const { error: brandsError } = await supabase
            .from("brand_companies")
            .insert(brandInserts);
          if (brandsError) throw brandsError;
        }

        // Insert locations
        if (data.location_ids && data.location_ids.length > 0) {
          const locationInserts = data.location_ids.map(location_id => ({
            company_id: newCompany.id,
            location_id,
          }));
          const { error: locationsError } = await supabase
            .from("company_locations")
            .insert(locationInserts);
          if (locationsError) throw locationsError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies", import.meta.env.VITE_SUPABASE_URL] });
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {readOnly ? t('company.viewCompany') || 'View Company' : (company ? t('company.editCompany') : t('dialog.addCompany'))}
          </DialogTitle>
          <DialogDescription>
            {readOnly ? t('company.viewCompanyDesc') || 'Company details' : (company ? t('dialog.updateCompany') : t('dialog.addCompanyDesc'))}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">{t('company.details') || 'Details'}</TabsTrigger>
            <TabsTrigger value="people" disabled={!company}>
              {t('company.people') || 'People'} {company && companyPeople ? `(${companyPeople.length})` : ''}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('company.name')}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={readOnly} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('company.comments') || 'Comments'}</FormLabel>
                        <FormControl>
                          <Textarea {...field} disabled={readOnly} placeholder={t('company.commentsPlaceholder') || 'Add any comments about this company...'} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="speciality_ids"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('company.speciality')}</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={
                              specialities?.map((speciality) => ({
                                label: language === 'pt' ? speciality.name_pt : speciality.name_en,
                                value: speciality.id,
                              })) || []
                            }
                            selected={field.value || []}
                            onChange={field.onChange}
                            placeholder={t('company.selectSpeciality') || "Select specialities..."}
                            emptyText={t('company.noSpeciality') || "No specialities found."}
                            disabled={readOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brand_ids"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('company.brands') || 'Brands'}</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={
                              brands?.map((brand) => ({
                                label: brand.name,
                                value: brand.id,
                              })) || []
                            }
                            selected={field.value || []}
                            onChange={field.onChange}
                            placeholder={t('company.selectBrands') || "Select brands..."}
                            emptyText={t('company.noBrands') || "No brands found."}
                            disabled={readOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location_ids"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('company.locations') || 'Locations'}</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={
                              locations?.map((location) => ({
                                label: location.name,
                                value: location.id,
                              })) || []
                            }
                            selected={field.value || []}
                            onChange={field.onChange}
                            placeholder={t('company.selectLocations') || "Select locations..."}
                            emptyText={t('company.noLocations') || "No locations found."}
                            disabled={readOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {!readOnly && (
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                      {t('dialog.cancel')}
                    </Button>
                    <Button type="submit" disabled={mutation.isPending}>
                      {mutation.isPending ? "..." : company ? t('dialog.save') : t('dialog.create')}
                    </Button>
                  </div>
                )}
                {readOnly && (
                  <div className="flex justify-end pt-4">
                    <Button type="button" onClick={() => onOpenChange(false)}>
                      {t('dialog.close') || 'Close'}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="people" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('company.relatedPeople') || 'Related People'}</CardTitle>
                    <CardDescription>{t('company.relatedPeopleDesc') || 'People associated with this company'}</CardDescription>
                  </div>
                  {!readOnly && (
                    <Button 
                      size="sm" 
                      onClick={() => setIsPersonDialogOpen(true)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      {t('person.addPerson') || 'Add Person'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {companyPeople && companyPeople.length > 0 ? (
                  <div className="space-y-3">
                    {companyPeople.map((person: PersonWithContact) => {
                      const contact = person.contacts?.[0];
                      return (
                        <div 
                          key={person.id} 
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">
                                {person.first_name} {person.last_name || ''}
                              </p>
                              <div className="flex flex-col gap-1 mt-1">
                                {contact?.email && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    <span className="truncate">{contact.email}</span>
                                  </div>
                                )}
                                {contact?.mobile && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    <span>{contact.country_code || ''} {contact.mobile}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {!readOnly && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingPerson(person)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deletePerson.mutate(person.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>{t('company.noPeople') || 'No people associated with this company'}</p>
                    {!readOnly && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => setIsPersonDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('person.addFirstPerson') || 'Add first person'}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {readOnly && (
              <div className="flex justify-end pt-4">
                <Button type="button" onClick={() => onOpenChange(false)}>
                  {t('dialog.close') || 'Close'}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <PersonDialog 
          open={isPersonDialogOpen || !!editingPerson} 
          onOpenChange={(open) => {
            if (!open) {
              setIsPersonDialogOpen(false);
              setEditingPerson(null);
            }
          }}
          person={editingPerson}
          preselectedCompanyId={company?.id}
        />
      </DialogContent>
    </Dialog>
  );
};
