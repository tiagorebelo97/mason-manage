import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { ContactDialog } from "./ContactDialog";
import { toast } from "sonner";
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
    middle_name: string | null;
  } | null;
  companies?: {
    name: string;
  } | null;
};

export const ContactsTable = () => {
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["contacts", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*, people(first_name, middle_name), companies(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", import.meta.env.VITE_SUPABASE_URL] });
      toast.success(t('contact.deleteSuccess') || 'Contact deleted successfully');
    },
    onError: () => {
      toast.error(t('contact.deleteError') || 'Failed to delete contact');
    },
  });

  const filteredContacts = contacts?.filter((contact) => {
    const searchLower = searchTerm.toLowerCase();
    const personName = contact.people ? `${contact.people.first_name} ${contact.people.middle_name || ''}`.toLowerCase() : '';
    const companyName = contact.companies?.name?.toLowerCase() || '';
    const email = contact.email?.toLowerCase() || '';
    return personName.includes(searchLower) || companyName.includes(searchLower) || email.includes(searchLower);
  });

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading') || 'Loading...'}</div>;
  }

  return (
    <>
      <div className="mb-4">
        <Input
          placeholder={t('contact.searchPlaceholder') || 'Search contacts...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('contact.owner') || 'Owner'}</TableHead>
              <TableHead>{t('contact.email') || 'Email'}</TableHead>
              <TableHead>{t('contact.mobile') || 'Mobile'}</TableHead>
              <TableHead>{t('contact.website') || 'Website'}</TableHead>
              <TableHead className="text-right">{t('company.actions') || 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  {searchTerm ? t('contact.noResults') || 'No contacts match your search.' : t('contact.noContacts') || 'No contacts found. Add your first contact!'}
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts?.map((contact) => (
                <TableRow 
                  key={contact.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setViewingContact(contact)}
                >
                  <TableCell className="font-medium">
                    {contact.people 
                      ? `${contact.people.first_name} ${contact.people.middle_name || ''} (Person)`
                      : contact.companies?.name ? `${contact.companies.name} (Company)` : "—"}
                  </TableCell>
                  <TableCell>{contact.email || "—"}</TableCell>
                  <TableCell>{contact.mobile ? `${contact.country_code || ''} ${contact.mobile}` : "—"}</TableCell>
                  <TableCell>{contact.website || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingContact(contact);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(contact.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ContactDialog 
        open={!!editingContact} 
        onOpenChange={(open) => !open && setEditingContact(null)}
        contact={editingContact}
      />

      <ContactDialog 
        open={!!viewingContact} 
        onOpenChange={(open) => !open && setViewingContact(null)}
        contact={viewingContact}
        readOnly={true}
      />
    </>
  );
};
