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
import { Plus, Mail, Phone, User, Pencil, Trash2, X } from "lucide-react";
import { PersonContactDialog } from "./PersonContactDialog";
import { Badge } from "@/components/ui/badge";
import { countryCodes } from "@/lib/countryCodes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    id?: string;
    email: string | null;
    mobile: string | null;
    country_code: string | null;
    website?: string | null;
    fax?: string | null;
    address?: string | null;
  }[];
};

const companySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  comments: z.string().max(1000).optional(),
  speciality_ids: z.array(z.string()).optional(),
  brand_ids: z.array(z.string()).optional(),
  location_ids: z.array(z.string()).optional(),
  // Contact fields
  email: z.string().optional(),
  country_code: z.string().max(10).optional(),
  website: z.string().max(500).optional(),
  mobile: z.string().optional(),
  fax: z.string().optional(),
  address: z.string().max(500).optional(),
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
  const [editingPerson, setEditingPerson] = useState<PersonWithContact | null>(null);
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [emails, setEmails] = useState<string[]>([""]);
  const [mobiles, setMobiles] = useState<string[]>([""]);
  const [faxes, setFaxes] = useState<string[]>([""]);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      comments: "",
      speciality_ids: [],
      brand_ids: [],
      location_ids: [],
      email: "",
      country_code: "+351",
      website: "",
      mobile: "",
      fax: "",
      address: "",
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
        .select("id, first_name, last_name, company_id, created_at, contacts(id, email, mobile, country_code, website, fax, address)")
        .eq("company_id", company.id)
        .order("first_name");
      if (error) throw error;
      return data as PersonWithContact[];
    },
    enabled: !!company?.id,
  });

  // Fetch contact information for the company itself
  const { data: companyContact } = useQuery({
    queryKey: ["company-contact", company?.id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      if (!company?.id) return null;
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("company_id", company.id)
        .maybeSingle();
      if (error) throw error;
      return data;
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
      // Parse comma-separated values for contacts
      if (companyContact) {
        setEmails(companyContact.email ? companyContact.email.split(',').map((e: string) => e.trim()) : [""]);
        setMobiles(companyContact.mobile ? companyContact.mobile.split(',').map((m: string) => m.trim()) : [""]);
        setFaxes(companyContact.fax ? companyContact.fax.split(',').map((f: string) => f.trim()) : [""]);
      } else {
        setEmails([""]);
        setMobiles([""]);
        setFaxes([""]);
      }
      
      form.reset({
        name: company.name,
        comments: company.comments || "",
        speciality_ids: companySpecialities || [],
        brand_ids: companyBrands || [],
        location_ids: companyLocations || [],
        email: companyContact?.email || "",
        country_code: companyContact?.country_code || "+351",
        website: companyContact?.website || "",
        mobile: companyContact?.mobile || "",
        fax: companyContact?.fax || "",
        address: companyContact?.address || "",
      });
    } else {
      setEmails([""]);
      setMobiles([""]);
      setFaxes([""]);
      form.reset({
        name: "",
        comments: "",
        speciality_ids: [],
        brand_ids: [],
        location_ids: [],
        email: "",
        country_code: "+351",
        website: "",
        mobile: "",
        fax: "",
        address: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, companySpecialities, companyBrands, companyLocations, companyContact]);

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

        // Update or create contact info for company
        const contactData = {
          company_id: company.id,
          email: emails.filter(e => e.trim()).join(', ') || null,
          country_code: data.country_code || null,
          website: data.website || null,
          mobile: mobiles.filter(m => m.trim()).join(', ') || null,
          fax: faxes.filter(f => f.trim()).join(', ') || null,
          address: data.address || null,
        };

        if (companyContact?.id) {
          // Update existing contact
          const { error: contactError } = await supabase
            .from("contacts")
            .update(contactData)
            .eq("id", companyContact.id);
          if (contactError) throw contactError;
        } else if (emails.some(e => e.trim()) || mobiles.some(m => m.trim()) || data.website || data.address) {
          // Create new contact if there's any contact data
          const { error: contactError } = await supabase
            .from("contacts")
            .insert([contactData]);
          if (contactError) throw contactError;
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

        // Create contact info for new company if there's any contact data
        if (emails.some(e => e.trim()) || mobiles.some(m => m.trim()) || data.website || data.address) {
          const contactData = {
            company_id: newCompany.id,
            email: emails.filter(e => e.trim()).join(', ') || null,
            country_code: data.country_code || null,
            website: data.website || null,
            mobile: mobiles.filter(m => m.trim()).join(', ') || null,
            fax: faxes.filter(f => f.trim()).join(', ') || null,
            address: data.address || null,
          };

          const { error: contactError } = await supabase
            .from("contacts")
            .insert([contactData]);
          if (contactError) throw contactError;
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
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        // Reset form when dialog closes
        form.reset();
        // Invalidate queries to refresh table data
        queryClient.invalidateQueries({ queryKey: ["companies", import.meta.env.VITE_SUPABASE_URL] });
      }
      onOpenChange(isOpen);
    }}>
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
            <TabsTrigger value="details">{t('company.companyDetails')}</TabsTrigger>
            <TabsTrigger value="people" disabled={!company}>
              {t('company.associatedPeople')} {company && companyPeople ? `(${companyPeople.length})` : ''}
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

                {/* Contact Information Section */}
                <div className="space-y-4 border-t pt-4 mt-4">
                  <h3 className="text-sm font-semibold">{t('contact.contactInfo') || 'Contact Information'}</h3>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={() => (
                      <FormItem>
                        <FormLabel>{t('contact.email') || 'Email'}</FormLabel>
                        {readOnly ? (
                          <div className="flex flex-wrap gap-2">
                            {emails.filter(e => e.trim()).length > 0 ? (
                              emails.filter(e => e.trim()).map((email, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {email}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {emails.map((email, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  type="email"
                                  value={email}
                                  onChange={(e) => {
                                    const newEmails = [...emails];
                                    newEmails[index] = e.target.value;
                                    setEmails(newEmails);
                                  }}
                                  placeholder={t('contact.email') || 'Email'}
                                />
                                {emails.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                      const newEmails = emails.filter((_, i) => i !== index);
                                      setEmails(newEmails);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEmails([...emails, ""])}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {t('contact.addEmail') || 'Add Email'}
                            </Button>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mobile"
                    render={() => (
                      <FormItem>
                        <FormLabel>{t('contact.mobile') || 'Mobile'}</FormLabel>
                        {readOnly ? (
                          <div className="flex flex-wrap gap-2">
                            {mobiles.filter(m => m.trim()).length > 0 ? (
                              mobiles.filter(m => m.trim()).map((mobile, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {form.getValues('country_code') || '+351'} {mobile}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {mobiles.map((mobile, index) => (
                              <div key={index} className="flex gap-2">
                                <div className="grid grid-cols-[1fr_150px] gap-2 flex-1">
                                  <Input
                                    value={mobile}
                                    onChange={(e) => {
                                      const newMobiles = [...mobiles];
                                      newMobiles[index] = e.target.value;
                                      setMobiles(newMobiles);
                                    }}
                                    placeholder={t('contact.mobile') || 'Mobile'}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="country_code"
                                    render={({ field }) => (
                                      <Select 
                                        onValueChange={field.onChange} 
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="+351" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="max-h-[300px]">
                                          {countryCodes.map((country) => (
                                            <SelectItem key={country.code} value={country.code}>
                                              <div className="flex items-center gap-2">
                                                <span className="text-lg">{country.flag}</span>
                                                <span>{country.code}</span>
                                                <span className="text-xs text-muted-foreground">
                                                  {language === 'pt' ? country.countryPt : country.country}
                                                </span>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  />
                                </div>
                                {mobiles.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                      const newMobiles = mobiles.filter((_, i) => i !== index);
                                      setMobiles(newMobiles);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setMobiles([...mobiles, ""])}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {t('contact.addMobile') || 'Add Mobile'}
                          </Button>
                        </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fax"
                    render={() => (
                      <FormItem>
                        <FormLabel>{t('contact.fax') || 'Fax'}</FormLabel>
                        {readOnly ? (
                          <div className="flex flex-wrap gap-2">
                            {faxes.filter(f => f.trim()).length > 0 ? (
                              faxes.filter(f => f.trim()).map((fax, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {fax}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {faxes.map((fax, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  value={fax}
                                  onChange={(e) => {
                                    const newFaxes = [...faxes];
                                    newFaxes[index] = e.target.value;
                                    setFaxes(newFaxes);
                                  }}
                                  placeholder={t('contact.fax') || 'Fax'}
                                />
                                {faxes.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                      const newFaxes = faxes.filter((_, i) => i !== index);
                                      setFaxes(newFaxes);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setFaxes([...faxes, ""])}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {t('contact.addFax') || 'Add Fax'}
                            </Button>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contact.website') || 'Website'}</FormLabel>
                        {readOnly ? (
                          <div>
                            {field.value ? (
                              <Badge variant="secondary" className="text-xs">
                                {field.value}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </div>
                        ) : (
                          <FormControl>
                            <Input {...field} placeholder="https://example.com" />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contact.address') || 'Address'}</FormLabel>
                        {readOnly ? (
                          <div>
                            {field.value ? (
                              <Badge variant="secondary" className="text-xs">
                                {field.value}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </div>
                        ) : (
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        )}
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
                    <CardTitle>{t('company.peopleInCompany')}</CardTitle>
                    <CardDescription>{t('company.peopleInCompanyDesc')}</CardDescription>
                  </div>
                  {!readOnly && (
                    <Button 
                      size="sm" 
                      onClick={() => setIsAddingPerson(true)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      {t('person.addPerson')}
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
                          className="flex flex-col p-3 border rounded-lg hover:bg-muted/50 transition-colors gap-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">
                                  {person.first_name} {person.last_name || ''}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {contact?.email && contact.email.split(',').map((email, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {email.trim()}
                                    </Badge>
                                  ))}
                                  {contact?.mobile && contact.mobile.split(',').map((mobile, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {contact.country_code || ''} {mobile.trim()}
                                    </Badge>
                                  ))}
                                  {!contact && (
                                    <span className="text-xs text-muted-foreground italic">{t('person.noContact')}</span>
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
                                  title={t('person.editPerson')}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deletePerson.mutate(person.id)}
                                  title={t('person.deletePerson')}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>{t('company.noPeople')}</p>
                    {!readOnly && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => setIsAddingPerson(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('person.addFirstPerson')}
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

        <PersonContactDialog 
          open={isAddingPerson || !!editingPerson} 
          onOpenChange={(open) => {
            if (!open) {
              setIsAddingPerson(false);
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
