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
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Eye, Download, User, Building2 } from "lucide-react";
import { useState, useMemo } from "react";
import { ContactDialog } from "./ContactDialog";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import * as XLSX from "xlsx-js-style";

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
  companies?: {
    name: string;
  } | null;
};

type ContactFilter = "all" | "person" | "company";

export const ContactsTable = () => {
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [contactFilter, setContactFilter] = useState<ContactFilter>("all");
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["contacts", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*, people(first_name, last_name, company_id), companies(name)")
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

  const filteredContacts = useMemo(() => {
    if (!contacts) return [];

    const filtered = contacts.filter((contact) => {
      // Apply type filter
      if (contactFilter === "person" && !contact.person_id) return false;
      if (contactFilter === "company" && !contact.company_id) return false;

      // Apply search filter
      const searchLower = searchTerm.toLowerCase();
      const personName = contact.people ? `${contact.people.first_name} ${contact.people.last_name || ''}`.toLowerCase() : '';
      const companyName = contact.companies?.name?.toLowerCase() || '';
      const email = contact.email?.toLowerCase() || '';
      return personName.includes(searchLower) || companyName.includes(searchLower) || email.includes(searchLower);
    });

    return filtered;
  }, [contacts, contactFilter, searchTerm]);

  const exportToExcel = () => {
    if (!filteredContacts || filteredContacts.length === 0) {
      toast.error(t('contact.exportError') || 'No data to export');
      return;
    }

    const headers = ["Name", "Type", "Company", "Email", "Mobile", "Website"];
    const rows: string[][] = [];
    
    filteredContacts.forEach((contact) => {
      const name = contact.people 
        ? `${contact.people.first_name} ${contact.people.last_name || ''}`
        : contact.companies?.name || "—";
      const type = contact.person_id ? "Person" : "Company";
      const company = contact.companies?.name || "—";
      const email = contact.email || "";
      const mobile = contact.mobile ? `${contact.country_code || ''} ${contact.mobile}` : "";
      const website = contact.website || "";
      
      rows.push([name, type, company, email, mobile, website]);
    });

    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    worksheet['!cols'] = [
      { wch: 30 }, // Name
      { wch: 15 }, // Type
      { wch: 30 }, // Company
      { wch: 30 }, // Email
      { wch: 20 }, // Mobile
      { wch: 30 }, // Website
    ];

    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: "000000" } },
        bottom: { style: 'thin', color: { rgb: "000000" } },
        left: { style: 'thin', color: { rgb: "000000" } },
        right: { style: 'thin', color: { rgb: "000000" } }
      }
    };

    const evenRowStyle = {
      fill: { fgColor: { rgb: "D9E1F2" } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: "000000" } },
        bottom: { style: 'thin', color: { rgb: "000000" } },
        left: { style: 'thin', color: { rgb: "000000" } },
        right: { style: 'thin', color: { rgb: "000000" } }
      }
    };

    const oddRowStyle = {
      fill: { fgColor: { rgb: "FFFFFF" } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: "000000" } },
        bottom: { style: 'thin', color: { rgb: "000000" } },
        left: { style: 'thin', color: { rgb: "000000" } },
        right: { style: 'thin', color: { rgb: "000000" } }
      }
    };

    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:F1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = headerStyle;
    }

    for (let row = 1; row <= headerRange.e.r; row++) {
      const isEvenRow = row % 2 === 0;
      const rowStyle = isEvenRow ? evenRowStyle : oddRowStyle;
      
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellAddress]) {
          worksheet[cellAddress] = { t: 's', v: '' };
        }
        worksheet[cellAddress].s = rowStyle;
      }
    }

    worksheet['!autofilter'] = { ref: XLSX.utils.encode_range(headerRange) };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');

    XLSX.writeFile(workbook, `contacts_${new Date().toISOString().split("T")[0]}.xlsx`);
    
    toast.success(t('contact.exportSuccess') || 'Contacts exported successfully');
  };

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading') || 'Loading...'}</div>;
  }

  return (
    <>
      <div className="mb-4 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder={t('contact.searchPlaceholder') || 'Search contacts...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            {t('contact.exportCSV') || 'Export Excel'}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant={contactFilter === "all" ? "default" : "outline"}
            onClick={() => setContactFilter("all")}
            size="sm"
          >
            {t('contact.filterAll') || 'All'}
          </Button>
          <Button
            variant={contactFilter === "person" ? "default" : "outline"}
            onClick={() => setContactFilter("person")}
            size="sm"
          >
            {t('contact.filterPerson') || 'Person'}
          </Button>
          <Button
            variant={contactFilter === "company" ? "default" : "outline"}
            onClick={() => setContactFilter("company")}
            size="sm"
          >
            {t('contact.filterCompany') || 'Company'}
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('contact.name') || 'Name'}</TableHead>
              <TableHead>{t('contact.company') || 'Company'}</TableHead>
              <TableHead>{t('contact.email') || 'Email'}</TableHead>
              <TableHead>{t('contact.mobile') || 'Mobile'}</TableHead>
              <TableHead>{t('contact.website') || 'Website'}</TableHead>
              <TableHead className="text-right">{t('company.actions') || 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {searchTerm ? t('contact.noResults') || 'No contacts match your search.' : t('contact.noContacts') || 'No contacts found. Add your first contact!'}
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts?.map((contact) => (
                <TableRow 
                  key={contact.id}
                  className="hover:bg-muted/50"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {contact.person_id ? (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {t('contact.person') || 'Person'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {t('contact.company') || 'Company'}
                        </Badge>
                      )}
                      <span>
                        {contact.people 
                          ? `${contact.people.first_name} ${contact.people.last_name || ''}`
                          : contact.companies?.name || "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{contact.companies?.name || "—"}</TableCell>
                  <TableCell>{contact.email || "—"}</TableCell>
                  <TableCell>{contact.mobile ? `${contact.country_code || ''} ${contact.mobile}` : "—"}</TableCell>
                  <TableCell>{contact.website || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewingContact(contact)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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
