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
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { countryCodes } from "@/lib/countryCodes";
import { Plus, X } from "lucide-react";

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

const personContactSchema = z.object({
  // Person fields
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().max(100).optional(),
  company_id: z.string().optional(),
  // Contact fields - these are managed by arrays and joined on save, so no validation needed
  email: z.string().optional(),
  country_code: z.string().max(10).optional(),
  mobile: z.string().optional(),
  fax: z.string().optional(),
});

type PersonContactFormData = z.infer<typeof personContactSchema>;

interface PersonContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: PersonWithContact | null;
  preselectedCompanyId?: string;
}

export const PersonContactDialog = ({ open, onOpenChange, person, preselectedCompanyId }: PersonContactDialogProps) => {
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();
  const [emails, setEmails] = useState<string[]>([""]);
  const [mobiles, setMobiles] = useState<string[]>([""]);
  const [faxes, setFaxes] = useState<string[]>([""]);

  const form = useForm<PersonContactFormData>({
    resolver: zodResolver(personContactSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      company_id: preselectedCompanyId || "none",
      email: "",
      country_code: "+351",
      mobile: "",
      fax: "",
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
    if (person) {
      const contact = person.contacts?.[0];
      
      // Parse comma-separated values
      setEmails(contact?.email ? contact.email.split(',').map(e => e.trim()) : [""]);
      setMobiles(contact?.mobile ? contact.mobile.split(',').map(m => m.trim()) : [""]);
      setFaxes(contact?.fax ? contact.fax.split(',').map(f => f.trim()) : [""]);
      
      form.reset({
        first_name: person.first_name,
        last_name: person.last_name || "",
        company_id: person.company_id || "none",
        email: contact?.email || "",
        country_code: contact?.country_code || "+351",
        mobile: contact?.mobile || "",
        fax: contact?.fax || "",
      });
    } else {
      setEmails([""]);
      setMobiles([""]);
      setFaxes([""]);
      form.reset({
        first_name: "",
        last_name: "",
        company_id: preselectedCompanyId || "none",
        email: "",
        country_code: "+351",
        mobile: "",
        fax: "",
      });
    }
  }, [person, form, preselectedCompanyId]);

  const mutation = useMutation({
    mutationFn: async (data: PersonContactFormData) => {
      if (person) {
        // Update existing person
        const companyId = data.company_id === "none" ? null : (data.company_id || null);
        const { error: personError } = await supabase
          .from("people")
          .update({
            first_name: data.first_name,
            last_name: data.last_name || null,
            company_id: companyId,
          })
          .eq("id", person.id);
        if (personError) throw personError;

        // Update or create contact info
        const contactData = {
          person_id: person.id,
          email: emails.filter(e => e.trim()).join(', ') || null,
          country_code: data.country_code || null,
          mobile: mobiles.filter(m => m.trim()).join(', ') || null,
          fax: faxes.filter(f => f.trim()).join(', ') || null,
        };

        const existingContact = person.contacts?.[0];
        
        if (existingContact?.id) {
          // Update existing contact
          const { error: contactError } = await supabase
            .from("contacts")
            .update(contactData)
            .eq("id", existingContact.id);
          if (contactError) throw contactError;
        } else {
          // Create new contact if person has no contact
          const { error: contactError } = await supabase
            .from("contacts")
            .insert([contactData]);
          if (contactError) throw contactError;
        }
      } else {
        // Create new person
        const companyId = data.company_id === "none" ? null : (data.company_id || null);
        const { data: newPerson, error: personError } = await supabase
          .from("people")
          .insert([{
            first_name: data.first_name,
            last_name: data.last_name || null,
            company_id: companyId,
          }])
          .select()
          .single();
        if (personError) throw personError;

        // Create contact info for new person
        const contactData = {
          person_id: newPerson.id,
          email: emails.filter(e => e.trim()).join(', ') || null,
          country_code: data.country_code || null,
          mobile: mobiles.filter(m => m.trim()).join(', ') || null,
          fax: faxes.filter(f => f.trim()).join(', ') || null,
        };

        const { error: contactError } = await supabase
          .from("contacts")
          .insert([contactData]);
        if (contactError) throw contactError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people", import.meta.env.VITE_SUPABASE_URL] });
      queryClient.invalidateQueries({ queryKey: ["company-people"] });
      queryClient.invalidateQueries({ queryKey: ["contacts", import.meta.env.VITE_SUPABASE_URL] });
      toast.success(person 
        ? (t('person.updateSuccess') || 'Person and contact updated successfully')
        : (t('person.addSuccess') || 'Person and contact added successfully')
      );
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast.error(t('person.saveError') || 'Failed to save person and contact');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {person ? (t('person.editPersonAndContact') || 'Edit Person & Contact') : (t('person.addPerson') || 'Add Person')}
          </DialogTitle>
          <DialogDescription>
            {person 
              ? (t('person.editPersonAndContactDesc') || 'Update person information and contact details')
              : (t('person.addPersonDesc') || 'Add a new person with contact information')
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            {/* Person Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{t('person.personalDetails') || 'Personal Details'}</h3>
              
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('person.firstName') || 'First Name'}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="last_name"
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
                name="company_id"
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
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold">{t('person.contactDetails') || 'Contact Details'}</h3>

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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('dialog.cancel') || 'Cancel'}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "..." : person ? (t('dialog.save') || 'Save') : (t('dialog.create') || 'Create')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
