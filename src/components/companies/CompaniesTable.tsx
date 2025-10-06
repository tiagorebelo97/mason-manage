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
import { Pencil, Trash2, Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useState, useMemo } from "react";
import { CompanyDialog } from "./CompanyDialog";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import * as XLSX from "xlsx-js-style";
type Company = {
  id: string;
  name: string;
  email: string;
  speciality_id: string | null;
  created_at: string;
  company_specialities?: Array<{ specialities: { name: string; name_en: string; name_pt: string } }>;
};

type SortField = "name" | "email" | "speciality";
type SortDirection = "asc" | "desc" | null;

export const CompaniesTable = () => {
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [specialityFilter, setSpecialityFilter] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  const { data: companies, isLoading } = useQuery({
    queryKey: ["companies", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*, company_specialities(specialities(name, name_en, name_pt))");
      if (error) throw error;
      return data;
    },
  });

  // Filter and sort companies
  const filteredAndSortedCompanies = useMemo(() => {
    if (!companies) return [];

    // Filter by search term (global search)
    let filtered = companies.filter((company) => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = company.name.toLowerCase().includes(searchLower);
      const emailMatch = company.email.toLowerCase().includes(searchLower);
      const specialityMatch = company.company_specialities?.some(cs =>
        (language === 'pt' ? cs.specialities.name_pt : cs.specialities.name_en).toLowerCase().includes(searchLower)
      ) || false;
      
      return nameMatch || emailMatch || specialityMatch;
    });

    // Apply column-specific filters
    if (nameFilter) {
      const nameLower = nameFilter.toLowerCase();
      filtered = filtered.filter((company) => 
        company.name.toLowerCase().includes(nameLower)
      );
    }

    if (emailFilter) {
      const emailLower = emailFilter.toLowerCase();
      filtered = filtered.filter((company) => 
        company.email.toLowerCase().includes(emailLower)
      );
    }

    if (specialityFilter) {
      const specialityLower = specialityFilter.toLowerCase();
      filtered = filtered.filter((company) => 
        company.company_specialities?.some(cs =>
          (language === 'pt' ? cs.specialities.name_pt : cs.specialities.name_en).toLowerCase().includes(specialityLower)
        ) || false
      );
    }

    // Sort by selected field
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string = "";
        let bValue: string = "";

        if (sortField === "name") {
          aValue = a.name;
          bValue = b.name;
        } else if (sortField === "email") {
          aValue = a.email;
          bValue = b.email;
        } else if (sortField === "speciality") {
          aValue = a.company_specialities?.[0]
            ? (language === 'pt' ? a.company_specialities[0].specialities.name_pt : a.company_specialities[0].specialities.name_en)
            : "";
          bValue = b.company_specialities?.[0]
            ? (language === 'pt' ? b.company_specialities[0].specialities.name_pt : b.company_specialities[0].specialities.name_en)
            : "";
        }

        const comparison = aValue.localeCompare(bValue);
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [companies, searchTerm, nameFilter, emailFilter, specialityFilter, sortField, sortDirection, language]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort direction
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      // New field, start with ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("companies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies", import.meta.env.VITE_SUPABASE_URL] });
      toast.success(t('company.deleteSuccess'));
    },
    onError: () => {
      toast.error(t('company.deleteError'));
    },
  });

  const exportToCSV = () => {
    if (!filteredAndSortedCompanies || filteredAndSortedCompanies.length === 0) {
      toast.error(t('company.exportError'));
      return;
    }

    const headers = ["Name", "Email", "Speciality"];
    const rows: string[][] = [];
    
    filteredAndSortedCompanies.forEach((company) => {
      if (company.company_specialities && company.company_specialities.length > 0) {
        // Create one row per speciality
        company.company_specialities.forEach((cs) => {
          const specialityName = language === 'pt' ? cs.specialities.name_pt : cs.specialities.name_en;
          rows.push([
            company.name,
            company.email,
            specialityName,
          ]);
        });
      } else {
        // Company with no specialities
        rows.push([
          company.name,
          company.email,
          "",
        ]);
      }
    });

    // Create worksheet data with headers
    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 30 }, // Name column
      { wch: 30 }, // Email column
      { wch: 30 }, // Speciality column
    ];

    // Define styles for proper Excel table appearance
    const headerStyle = {
      font: { 
        bold: true, 
        color: { rgb: "FFFFFF" },
        sz: 12
      },
      fill: { 
        fgColor: { rgb: "4472C4" } // Professional blue color
      },
      alignment: { 
        horizontal: 'center', 
        vertical: 'center' 
      },
      border: {
        top: { style: 'thin', color: { rgb: "000000" } },
        bottom: { style: 'thin', color: { rgb: "000000" } },
        left: { style: 'thin', color: { rgb: "000000" } },
        right: { style: 'thin', color: { rgb: "000000" } }
      }
    };

    const evenRowStyle = {
      fill: { 
        fgColor: { rgb: "D9E1F2" } // Light blue for even rows
      },
      alignment: { 
        horizontal: 'left', 
        vertical: 'center' 
      },
      border: {
        top: { style: 'thin', color: { rgb: "000000" } },
        bottom: { style: 'thin', color: { rgb: "000000" } },
        left: { style: 'thin', color: { rgb: "000000" } },
        right: { style: 'thin', color: { rgb: "000000" } }
      }
    };

    const oddRowStyle = {
      fill: { 
        fgColor: { rgb: "FFFFFF" } // White for odd rows
      },
      alignment: { 
        horizontal: 'left', 
        vertical: 'center' 
      },
      border: {
        top: { style: 'thin', color: { rgb: "000000" } },
        bottom: { style: 'thin', color: { rgb: "000000" } },
        left: { style: 'thin', color: { rgb: "000000" } },
        right: { style: 'thin', color: { rgb: "000000" } }
      }
    };

    // Apply styles to header row (first row)
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:C1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = headerStyle;
    }

    // Apply alternating row styles to data rows
    for (let row = 1; row <= headerRange.e.r; row++) {
      const isEvenRow = row % 2 === 0;
      const rowStyle = isEvenRow ? evenRowStyle : oddRowStyle;
      
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellAddress]) {
          // Create empty cell if it doesn't exist
          worksheet[cellAddress] = { t: 's', v: '' };
        }
        worksheet[cellAddress].s = rowStyle;
      }
    }

    // Apply table formatting with autofilter
    worksheet['!autofilter'] = { ref: XLSX.utils.encode_range(headerRange) };

    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Companies');

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `companies_${new Date().toISOString().split("T")[0]}.xlsx`);
    
    toast.success(t('company.exportSuccess'));
  };

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder={t('company.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          {t('company.exportCSV')}
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  {t('company.name')}
                  {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center">
                  {t('company.email')}
                  {getSortIcon("email")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort("speciality")}
              >
                <div className="flex items-center">
                  {t('company.speciality')}
                  {getSortIcon("speciality")}
                </div>
              </TableHead>
              <TableHead className="text-right">{t('company.actions')}</TableHead>
            </TableRow>
            <TableRow>
              <TableHead className="py-2">
                <Input
                  placeholder={t('company.filterName')}
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="h-8"
                  onClick={(e) => e.stopPropagation()}
                />
              </TableHead>
              <TableHead className="py-2">
                <Input
                  placeholder={t('company.filterEmail')}
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                  className="h-8"
                  onClick={(e) => e.stopPropagation()}
                />
              </TableHead>
              <TableHead className="py-2">
                <Input
                  placeholder={t('company.filterSpeciality')}
                  value={specialityFilter}
                  onChange={(e) => setSpecialityFilter(e.target.value)}
                  className="h-8"
                  onClick={(e) => e.stopPropagation()}
                />
              </TableHead>
              <TableHead className="py-2"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedCompanies?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {searchTerm ? t('company.noResults') : t('company.noCompanies')}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedCompanies?.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.email}</TableCell>
                  <TableCell>
                    {company.company_specialities && company.company_specialities.length > 0
                      ? company.company_specialities
                          .map(cs => language === 'pt' ? cs.specialities.name_pt : cs.specialities.name_en)
                          .join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCompany(company)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(company.id)}
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

      {editingCompany && (
        <CompanyDialog
          open={!!editingCompany}
          onOpenChange={(open) => !open && setEditingCompany(null)}
          company={editingCompany}
        />
      )}
    </>
  );
};
