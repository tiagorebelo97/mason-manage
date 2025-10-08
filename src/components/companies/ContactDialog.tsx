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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type Contact = {
  id: string;
  person_id: string | null;
  company_id: string | null;
  email: string | null;
  country_code: string | null;
  website: string | null;
  mobile: string | null;
  fax: string | null;
  address: string | null;
  created_at: string | null;
  people?: {
    first_name: string;
    last_name: string | null;
    company_id: string | null;
  } | null;
};

const contactSchema = z.object({
  owner_type: z.enum(["person", "company"]),
  person_id: z.string().optional(),
  company_id: z.string().optional(),
  // Person creation fields
  person_first_name: z.string().optional(),
  person_last_name: z.string().optional(),
  person_company_id: z.string().optional(),
  // Contact fields
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  country_code: z.string().max(10).optional(),
  website: z.string().max(500).optional(),
  mobile: z.string().max(50).optional(),
  fax: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
}).refine((data) => {
  if (data.owner_type === "person") {
    // Either select existing person or create new one
    if (!data.person_id && !data.person_first_name) {
      return false;
    }
  }
  if (data.owner_type === "company" && !data.company_id) return false;
  return true;
}, {
  message: "Please select or create a person, or select a company",
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
  readOnly?: boolean;
}

export const ContactDialog = ({ open, onOpenChange, contact, readOnly = false }: ContactDialogProps) => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [ownerType, setOwnerType] = useState<"person" | "company">("person");
  const [createNewPerson, setCreateNewPerson] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      owner_type: "person",
      person_id: "",
      company_id: "",
      person_first_name: "",
      person_last_name: "",
      person_company_id: "",
      email: "",
      country_code: "+351",
      website: "",
      mobile: "",
      fax: "",
      address: "",
    },
  });

  const { data: people } = useQuery({
    queryKey: ["people", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("people")
        .select("id, first_name, last_name")
        .order("first_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: companies } = useQuery({
    queryKey: ["companies", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (contact) {
      const type = contact.person_id ? "person" : "company";
      setOwnerType(type);
      setCreateNewPerson(false);
      form.reset({
        owner_type: type,
        person_id: contact.person_id || "",
        company_id: contact.company_id || "",
        person_first_name: "",
        person_last_name: "",
        person_company_id: contact.people?.company_id || "",
        email: contact.email || "",
        country_code: contact.country_code || "+351",
        website: contact.website || "",
        mobile: contact.mobile || "",
        fax: contact.fax || "",
        address: contact.address || "",
      });
    } else {
      setCreateNewPerson(false);
      form.reset({
        owner_type: "person",
        person_id: "",
        company_id: "",
        person_first_name: "",
        person_last_name: "",
        person_company_id: "",
        email: "",
        country_code: "+351",
        website: "",
        mobile: "",
        fax: "",
        address: "",
      });
    }
  }, [contact, form]);

  const mutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      let personId = data.person_id;

      // If creating a new person, insert person first
      if (data.owner_type === "person" && !data.person_id && data.person_first_name) {
        const { data: newPerson, error: personError } = await supabase
          .from("people")
          .insert([{
            first_name: data.person_first_name,
            last_name: data.person_last_name || null,
            company_id: data.person_company_id === "none" ? null : (data.person_company_id || null),
          }])
          .select()
          .single();
        
        if (personError) throw personError;
        personId = newPerson.id;
        
        // Invalidate people cache
        queryClient.invalidateQueries({ queryKey: ["people", import.meta.env.VITE_SUPABASE_URL] });
      }

      // If editing a person contact, update the person's company
      if (contact && data.owner_type === "person" && data.person_id && data.person_company_id !== undefined) {
        const { error: personUpdateError } = await supabase
          .from("people")
          .update({
            company_id: data.person_company_id === "none" ? null : (data.person_company_id || null),
          })
          .eq("id", data.person_id);
        
        if (personUpdateError) throw personUpdateError;
        
        // Invalidate people cache
        queryClient.invalidateQueries({ queryKey: ["people", import.meta.env.VITE_SUPABASE_URL] });
      }

      const contactData = {
        person_id: data.owner_type === "person" ? personId || null : null,
        company_id: data.owner_type === "company" ? data.company_id || null : null,
        email: data.email || null,
        country_code: data.country_code || null,
        website: data.website || null,
        mobile: data.mobile || null,
        fax: data.fax || null,
        address: data.address || null,
      };

      if (contact) {
        const { error } = await supabase
          .from("contacts")
          .update(contactData)
          .eq("id", contact.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("contacts")
          .insert([contactData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", import.meta.env.VITE_SUPABASE_URL] });
      toast.success(contact ? t('contact.updateSuccess') || 'Contact updated' : t('contact.addSuccess') || 'Contact added');
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast.error(t('contact.saveError') || 'Failed to save contact');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {readOnly ? t('contact.viewContact') || 'View Contact' : (contact ? t('contact.editContact') || 'Edit Contact' : t('contact.addContact') || 'Add Contact')}
          </DialogTitle>
          <DialogDescription>
            {readOnly ? t('contact.viewContactDesc') || 'Contact details' : (contact ? t('contact.updateContact') || 'Update contact information' : t('contact.addContactDesc') || 'Add a new contact')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="owner_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('contact.ownerType') || 'Contact belongs to'}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        setOwnerType(value as "person" | "company");
                      }}
                      value={field.value}
                      disabled={readOnly || !!contact}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="person" id="person" />
                        <Label htmlFor="person">{t('contact.person') || 'Person'}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="company" id="company" />
                        <Label htmlFor="company">{t('contact.company') || 'Company'}</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {ownerType === "person" && !contact && !readOnly && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    type="button"
                    variant={!createNewPerson ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setCreateNewPerson(false);
                      form.setValue("person_first_name", "");
                      form.setValue("person_last_name", "");
                      form.setValue("person_company_id", "");
                    }}
                  >
                    {t('contact.selectExistingPerson') || 'Select Existing'}
                  </Button>
                  <Button
                    type="button"
                    variant={createNewPerson ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setCreateNewPerson(true);
                      form.setValue("person_id", "");
                    }}
                  >
                    {t('contact.createNewPerson') || 'Create New'}
                  </Button>
                </div>

                {!createNewPerson ? (
                  <FormField
                    control={form.control}
                    name="person_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contact.selectPerson') || 'Select Person'}</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('contact.selectPersonPlaceholder') || 'Select a person...'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {people?.map((person) => (
                              <SelectItem key={person.id} value={person.id}>
                                {person.first_name} {person.last_name || ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name="person_first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('person.firstName') || 'First Name'} *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="person_last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('person.lastName') || 'Last Name'}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="person_company_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('person.company') || 'Company'}</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('person.selectCompany') || 'Select a company...'} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">{t('person.noCompany') || 'No company'}</SelectItem>
                              {companies?.map((company) => (
                                <SelectItem key={company.id} value={company.id}>
                                  {company.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </>
            )}

            {ownerType === "person" && (contact || readOnly) && (
              <>
                <FormField
                  control={form.control}
                  name="person_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contact.selectPerson') || 'Select Person'}</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={readOnly || !!contact}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('contact.selectPersonPlaceholder') || 'Select a person...'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {people?.map((person) => (
                            <SelectItem key={person.id} value={person.id}>
                              {person.first_name} {person.last_name || ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {contact && !readOnly && (
                  <FormField
                    control={form.control}
                    name="person_company_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('person.company') || 'Company'}</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={readOnly}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('person.selectCompany') || 'Select a company...'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">{t('person.noCompany') || 'No company'}</SelectItem>
                            {companies?.map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            {ownerType === "company" && (
              <FormField
                control={form.control}
                name="company_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contact.selectCompany') || 'Select Company'}</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={readOnly || !!contact}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('contact.selectCompanyPlaceholder') || 'Select a company...'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies?.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('contact.email') || 'Email'}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <div className="grid grid-cols-[1fr_120px] gap-2">
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contact.mobile') || 'Mobile'}</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contact.countryCode') || 'Code'}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+351" disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="fax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('contact.fax') || 'Fax'}</FormLabel>
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
                  <FormLabel>{t('contact.address') || 'Address'}</FormLabel>
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
                  {mutation.isPending ? "..." : contact ? t('dialog.save') || 'Save' : t('dialog.create') || 'Create'}
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
