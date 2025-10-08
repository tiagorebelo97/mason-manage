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
import { countryCodes } from "@/lib/countryCodes";
import { Plus, X } from "lucide-react";

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
  const { t, language } = useLanguage();
  const [ownerType, setOwnerType] = useState<"person" | "company">("person");
  const [createNewPerson, setCreateNewPerson] = useState(false);
  const [emails, setEmails] = useState<string[]>([""]);
  const [mobiles, setMobiles] = useState<string[]>([""]);
  const [faxes, setFaxes] = useState<string[]>([""]);

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
      
      // Parse comma-separated values
      setEmails(contact.email ? contact.email.split(',').map(e => e.trim()) : [""]);
      setMobiles(contact.mobile ? contact.mobile.split(',').map(m => m.trim()) : [""]);
      setFaxes(contact.fax ? contact.fax.split(',').map(f => f.trim()) : [""]);
      
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
      setEmails([""]);
      setMobiles([""]);
      setFaxes([""]);
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
        email: emails.filter(e => e.trim()).join(', ') || null,
        country_code: data.country_code || null,
        website: data.website || null,
        mobile: mobiles.filter(m => m.trim()).join(', ') || null,
        fax: faxes.filter(f => f.trim()).join(', ') || null,
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
              render={() => (
                <FormItem>
                  <FormLabel>{t('contact.email') || 'Email'}</FormLabel>
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
                          disabled={readOnly}
                          placeholder={t('contact.email') || 'Email'}
                        />
                        {!readOnly && emails.length > 1 && (
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
                    {!readOnly && (
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
                    )}
                  </div>
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
                            disabled={readOnly}
                            placeholder={t('contact.mobile') || 'Mobile'}
                          />
                          {index === 0 && (
                            <FormField
                              control={form.control}
                              name="country_code"
                              render={({ field }) => (
                                <Select 
                                  onValueChange={field.onChange} 
                                  value={field.value}
                                  disabled={readOnly}
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
                          )}
                        </div>
                        {!readOnly && mobiles.length > 1 && (
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
                    {!readOnly && (
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
                    )}
                  </div>
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
                          disabled={readOnly}
                          placeholder={t('contact.fax') || 'Fax'}
                        />
                        {!readOnly && faxes.length > 1 && (
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
                    {!readOnly && (
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
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {ownerType === "company" && (
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
            )}

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
