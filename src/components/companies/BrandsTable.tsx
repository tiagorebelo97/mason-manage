import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { BrandDialog } from "./BrandDialog";
import { ColumnFilter } from "@/components/ui/column-filter";
import { HierarchicalColumnFilter, HierarchicalOption } from "@/components/ui/hierarchical-column-filter";
import * as XLSX from "xlsx-js-style";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Brand = {
  id: string;
  name: string;
  website: string | null;
  official_email: string | null;
  created_at: string | null;
  brand_specialities?: Array<{ 
    specialities: { 
      name: string; 
      name_en: string; 
      name_pt: string;
      main_specialties?: { 
        id: string; 
        main_specialty_en: string; 
        main_specialty_pt: string;
      } | null;
    } 
  }>;
  speciality_ids?: string[];
};

type SortField = "name" | "website" | "official_email" | "specialities";
type SortDirection = "asc" | "desc" | null;

export const BrandsTable = () => {
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [viewingBrand, setViewingBrand] = useState<Brand | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [nameFilter, setNameFilter] = useState<string[]>([]);
  const [websiteFilter, setWebsiteFilter] = useState<string[]>([]);
  const [emailFilter, setEmailFilter] = useState<string[]>([]);
  const [specialityFilter, setSpecialityFilter] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  const { data: brands, isLoading } = useQuery({
    queryKey: ["brands", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select(`
          *,
          brand_specialities(specialities(id, name, name_en, name_pt, main_specialties(id, main_specialty_en, main_specialty_pt)))
        `);
      if (error) throw error;
      
      return data.map(brand => ({
        ...brand,
        speciality_ids: brand.brand_specialities?.map(bs => bs.specialities.id) || [],
      }));
    },
  });

  const filteredAndSortedBrands = useMemo(() => {
    if (!brands) return [];

    let filtered = brands.filter((brand) => {
      const searchLower = searchTerm.toLowerCase();
      const specialitiesText = brand.brand_specialities
        ?.map(bs => language === 'pt' ? bs.specialities.name_pt : bs.specialities.name_en)
        .join(", ") || "";
      
      return (
        brand.name.toLowerCase().includes(searchLower) ||
        (brand.website?.toLowerCase().includes(searchLower)) ||
        (brand.official_email?.toLowerCase().includes(searchLower)) ||
        specialitiesText.toLowerCase().includes(searchLower)
      );
    });

    // Apply column-specific filters
    if (nameFilter.length > 0) {
      filtered = filtered.filter((brand) => 
        nameFilter.includes(brand.name)
      );
    }

    if (websiteFilter.length > 0) {
      filtered = filtered.filter((brand) => 
        brand.website && websiteFilter.includes(brand.website)
      );
    }

    if (emailFilter.length > 0) {
      filtered = filtered.filter((brand) => 
        brand.official_email && emailFilter.includes(brand.official_email)
      );
    }

    if (specialityFilter.length > 0) {
      filtered = filtered.filter((brand) => 
        brand.brand_specialities?.some(bs => {
          const specialityName = language === 'pt' ? bs.specialities.name_pt : bs.specialities.name_en;
          return specialityFilter.includes(specialityName);
        }) || false
      );
    }

    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = "";
        let bValue = "";

        if (sortField === "name") {
          aValue = a.name;
          bValue = b.name;
        } else if (sortField === "website") {
          aValue = a.website || "";
          bValue = b.website || "";
        } else if (sortField === "official_email") {
          aValue = a.official_email || "";
          bValue = b.official_email || "";
        } else if (sortField === "specialities") {
          aValue = a.brand_specialities?.[0]
            ? (language === 'pt' ? a.brand_specialities[0].specialities.name_pt : a.brand_specialities[0].specialities.name_en)
            : "";
          bValue = b.brand_specialities?.[0]
            ? (language === 'pt' ? b.brand_specialities[0].specialities.name_pt : b.brand_specialities[0].specialities.name_en)
            : "";
        }

        const comparison = aValue.localeCompare(bValue);
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [brands, searchTerm, nameFilter, websiteFilter, emailFilter, specialityFilter, sortField, sortDirection, language]);

  // Get unique values for each column for filter options
  const uniqueNames = useMemo(() => {
    if (!brands) return [];
    const names = Array.from(new Set(brands.map(b => b.name))).sort();
    return names.map(name => ({ label: name, value: name }));
  }, [brands]);

  const uniqueWebsites = useMemo(() => {
    if (!brands) return [];
    const websites = Array.from(new Set(brands.map(b => b.website).filter(Boolean) as string[])).sort();
    return websites.map(website => ({ label: website, value: website }));
  }, [brands]);

  const uniqueEmails = useMemo(() => {
    if (!brands) return [];
    const emails = Array.from(new Set(brands.map(b => b.official_email).filter(Boolean) as string[])).sort();
    return emails.map(email => ({ label: email, value: email }));
  }, [brands]);

  // Build hierarchical structure for speciality filter
  const hierarchicalSpecialities = useMemo(() => {
    if (!brands) return [];
    
    // Group specialities by main specialty
    const groupedByMainSpecialty = new Map<string, Set<string>>();
    
    brands.forEach(brand => {
      brand.brand_specialities?.forEach(bs => {
        const mainSpecialtyName = bs.specialities.main_specialties
          ? (language === 'pt' ? bs.specialities.main_specialties.main_specialty_pt : bs.specialities.main_specialties.main_specialty_en)
          : "-";
        const specialityName = language === 'pt' ? bs.specialities.name_pt : bs.specialities.name_en;
        
        if (!groupedByMainSpecialty.has(mainSpecialtyName)) {
          groupedByMainSpecialty.set(mainSpecialtyName, new Set());
        }
        groupedByMainSpecialty.get(mainSpecialtyName)?.add(specialityName);
      });
    });
    
    // Convert to hierarchical options
    const options: HierarchicalOption[] = [];
    const sortedMainSpecialties = Array.from(groupedByMainSpecialty.keys()).sort();
    
    sortedMainSpecialties.forEach(mainSpecialtyName => {
      const children = Array.from(groupedByMainSpecialty.get(mainSpecialtyName) || []).sort().map(specialityName => ({
        label: specialityName,
        value: specialityName,
      }));
      
      options.push({
        label: mainSpecialtyName,
        value: mainSpecialtyName,
        children,
      });
    });
    
    return options;
  }, [brands, language]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
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
      const { error } = await supabase.from("brands").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands", import.meta.env.VITE_SUPABASE_URL] });
      toast.success(t('brand.deleteSuccess'));
    },
    onError: () => {
      toast.error(t('brand.deleteError'));
    },
  });

  const exportToCSV = () => {
    if (!filteredAndSortedBrands || filteredAndSortedBrands.length === 0) {
      toast.error(t('brand.exportError'));
      return;
    }

    const headers = ["Name", "Website", "Email", "Specialities"];
    const rows: string[][] = [];
    
    filteredAndSortedBrands.forEach((brand) => {
      if (brand.brand_specialities && brand.brand_specialities.length > 0) {
        // Create one row per speciality
        brand.brand_specialities.forEach((bs) => {
          const specialityName = language === 'pt' ? bs.specialities.name_pt : bs.specialities.name_en;
          rows.push([
            brand.name,
            brand.website || "",
            brand.official_email || "",
            specialityName,
          ]);
        });
      } else {
        // Brand with no specialities
        rows.push([
          brand.name,
          brand.website || "",
          brand.official_email || "",
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
      { wch: 40 }, // Website column
      { wch: 30 }, // Email column
      { wch: 30 }, // Specialities column
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
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:D1');
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Brands');

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `brands_${new Date().toISOString().split("T")[0]}.xlsx`);
    
    toast.success(t('brand.exportSuccess'));
  };

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder={t('brand.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          {t('brand.exportCSV')}
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {t('brand.name')}
                    <button
                      onClick={() => handleSort("name")}
                      className="ml-2 hover:bg-muted/50 rounded p-1"
                    >
                      {getSortIcon("name")}
                    </button>
                  </div>
                  <ColumnFilter
                    options={uniqueNames}
                    selected={nameFilter}
                    onChange={setNameFilter}
                    placeholder={t('brand.filterName')}
                    emptyText={t('company.noResults')}
                    columnName="name"
                  />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {t('brand.website')}
                    <button
                      onClick={() => handleSort("website")}
                      className="ml-2 hover:bg-muted/50 rounded p-1"
                    >
                      {getSortIcon("website")}
                    </button>
                  </div>
                  <ColumnFilter
                    options={uniqueWebsites}
                    selected={websiteFilter}
                    onChange={setWebsiteFilter}
                    placeholder={t('brand.filterWebsite')}
                    emptyText={t('company.noResults')}
                    columnName="website"
                  />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {t('brand.officialEmail')}
                    <button
                      onClick={() => handleSort("official_email")}
                      className="ml-2 hover:bg-muted/50 rounded p-1"
                    >
                      {getSortIcon("official_email")}
                    </button>
                  </div>
                  <ColumnFilter
                    options={uniqueEmails}
                    selected={emailFilter}
                    onChange={setEmailFilter}
                    placeholder={t('brand.filterEmail')}
                    emptyText={t('company.noResults')}
                    columnName="email"
                  />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {t('brand.specialities')}
                    <button
                      onClick={() => handleSort("specialities")}
                      className="ml-2 hover:bg-muted/50 rounded p-1"
                    >
                      {getSortIcon("specialities")}
                    </button>
                  </div>
                  <HierarchicalColumnFilter
                    options={hierarchicalSpecialities}
                    selected={specialityFilter}
                    onChange={setSpecialityFilter}
                    placeholder={t('brand.filterSpecialities')}
                    emptyText={t('company.noResults')}
                    columnName="specialities"
                  />
                </div>
              </TableHead>
              <TableHead className="text-right">{t('brand.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedBrands?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  {searchTerm ? t('brand.noResults') : t('brand.noBrands')}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedBrands?.map((brand) => (
                <TableRow 
                  key={brand.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setViewingBrand(brand)}
                >
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>{brand.website || "—"}</TableCell>
                  <TableCell>{brand.official_email || "—"}</TableCell>
                  <TableCell>
                    {brand.brand_specialities && brand.brand_specialities.length > 0
                      ? brand.brand_specialities
                          .map(bs => language === 'pt' ? bs.specialities.name_pt : bs.specialities.name_en)
                          .join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingBrand(brand);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(brand.id);
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

      {editingBrand && (
        <BrandDialog
          open={!!editingBrand}
          onOpenChange={(open) => {
            if (!open) setEditingBrand(null);
          }}
          brand={editingBrand}
        />
      )}

      {viewingBrand && (
        <BrandDialog
          open={!!viewingBrand}
          onOpenChange={(open) => {
            if (!open) setViewingBrand(null);
          }}
          brand={viewingBrand}
          readOnly
        />
      )}
    </>
  );
};
