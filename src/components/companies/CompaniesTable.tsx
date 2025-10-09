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
import { ColumnFilter } from "@/components/ui/column-filter";
import { HierarchicalColumnFilter, HierarchicalOption } from "@/components/ui/hierarchical-column-filter";
type Company = {
  id: string;
  name: string;
  comments: string | null;
  speciality_id: string | null;
  created_at: string;
  company_specialities?: Array<{ 
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
  brand_companies?: Array<{ brands: { name: string } }>;
  company_locations?: Array<{ locations: { name: string } }>;
  people?: Array<{ id: string }>;
};

type SortField = "name" | "speciality" | "brands" | "locations";
type SortDirection = "asc" | "desc" | null;

export const CompaniesTable = () => {
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [nameFilter, setNameFilter] = useState<string[]>([]);
  const [specialityFilter, setSpecialityFilter] = useState<string[]>([]);
  const [brandFilter, setBrandFilter] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  const { data: companies, isLoading, isFetching } = useQuery({
    queryKey: ["companies", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select(`
          *, 
          company_specialities(specialities(name, name_en, name_pt, main_specialties(id, main_specialty_en, main_specialty_pt))),
          brand_companies(brands(name)),
          company_locations(locations(name)),
          people(id)
        `);
      if (error) throw error;
      return data;
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Filter and sort companies
  const filteredAndSortedCompanies = useMemo(() => {
    if (!companies) return [];

    // Filter by search term (global search)
    let filtered = companies.filter((company) => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = company.name.toLowerCase().includes(searchLower);
      const specialityMatch = company.company_specialities?.some(cs =>
        (language === 'pt' ? cs.specialities.name_pt : cs.specialities.name_en).toLowerCase().includes(searchLower)
      ) || false;
      const brandMatch = company.brand_companies?.some(bc =>
        bc.brands.name.toLowerCase().includes(searchLower)
      ) || false;
      const locationMatch = company.company_locations?.some(cl =>
        cl.locations.name.toLowerCase().includes(searchLower)
      ) || false;
      
      return nameMatch || specialityMatch || brandMatch || locationMatch;
    });

    // Apply column-specific filters
    if (nameFilter.length > 0) {
      filtered = filtered.filter((company) => 
        nameFilter.includes(company.name)
      );
    }

    if (specialityFilter.length > 0) {
      filtered = filtered.filter((company) => 
        company.company_specialities?.some(cs => {
          const specialityName = language === 'pt' ? cs.specialities.name_pt : cs.specialities.name_en;
          return specialityFilter.includes(specialityName);
        }) || false
      );
    }

    if (brandFilter.length > 0) {
      filtered = filtered.filter((company) => 
        company.brand_companies?.some(bc => {
          return brandFilter.includes(bc.brands.name);
        }) || false
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
        } else if (sortField === "speciality") {
          aValue = a.company_specialities?.[0]
            ? (language === 'pt' ? a.company_specialities[0].specialities.name_pt : a.company_specialities[0].specialities.name_en)
            : "";
          bValue = b.company_specialities?.[0]
            ? (language === 'pt' ? b.company_specialities[0].specialities.name_pt : b.company_specialities[0].specialities.name_en)
            : "";
        } else if (sortField === "brands") {
          aValue = a.brand_companies?.[0]?.brands.name || "";
          bValue = b.brand_companies?.[0]?.brands.name || "";
        } else if (sortField === "locations") {
          aValue = a.company_locations?.[0]?.locations.name || "";
          bValue = b.company_locations?.[0]?.locations.name || "";
        }

        const comparison = aValue.localeCompare(bValue);
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [companies, searchTerm, nameFilter, specialityFilter, brandFilter, sortField, sortDirection, language]);

  // Get unique values for each column for filter options
  const uniqueNames = useMemo(() => {
    if (!companies) return [];
    const names = Array.from(new Set(companies.map(c => c.name))).sort();
    return names.map(name => ({ label: name, value: name }));
  }, [companies]);

  const uniqueLocations = useMemo(() => {
    if (!companies) return [];
    const locations = new Set<string>();
    companies.forEach(company => {
      company.company_locations?.forEach(cl => {
        locations.add(cl.locations.name);
      });
    });
    return Array.from(locations).sort().map(location => ({ label: location, value: location }));
  }, [companies]);

  // Build hierarchical structure for speciality filter  
  const hierarchicalSpecialities = useMemo(() => {
    if (!companies) return [];
    
    // Group specialities by main specialty
    const groupedByMainSpecialty = new Map<string, Set<string>>();
    
    companies.forEach(company => {
      company.company_specialities?.forEach(cs => {
        const mainSpecialtyName = cs.specialities.main_specialties
          ? (language === 'pt' ? cs.specialities.main_specialties.main_specialty_pt : cs.specialities.main_specialties.main_specialty_en)
          : "-";
        const specialityName = language === 'pt' ? cs.specialities.name_pt : cs.specialities.name_en;
        
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
  }, [companies, language]);

  const uniqueBrands = useMemo(() => {
    if (!companies) return [];
    const brands = new Set<string>();
    companies.forEach(company => {
      company.brand_companies?.forEach(bc => {
        brands.add(bc.brands.name);
      });
    });
    const sortedBrands = Array.from(brands).sort();
    return sortedBrands.map(name => ({ label: name, value: name }));
  }, [companies]);

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

    const headers = ["Name", "Speciality", "Brands", "Locations"];
    const rows: string[][] = [];
    
    filteredAndSortedCompanies.forEach((company) => {
      const specialities = company.company_specialities && company.company_specialities.length > 0
        ? company.company_specialities
        : [null];
      
      const brands = company.brand_companies && company.brand_companies.length > 0
        ? company.brand_companies
        : [null];

      const locations = company.company_locations && company.company_locations.length > 0
        ? company.company_locations
        : [null];

      // Create a row for each combination of speciality, brand, and location
      specialities.forEach((cs) => {
        brands.forEach((bc) => {
          locations.forEach((cl) => {
            const specialityName = cs 
              ? (language === 'pt' ? cs.specialities.name_pt : cs.specialities.name_en)
              : "";
            const brandName = bc ? bc.brands.name : "";
            const locationName = cl ? cl.locations.name : "";
            
            rows.push([
              company.name,
              specialityName,
              brandName,
              locationName,
            ]);
          });
        });
      });
    });

    // Create worksheet data with headers
    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 30 }, // Name column
      { wch: 30 }, // Speciality column
      { wch: 30 }, // Brands column
      { wch: 30 }, // Locations column
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

  if (isLoading && !companies) {
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
              <TableHead>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {t('company.name')}
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
                    placeholder={t('company.filterName')}
                    emptyText={t('company.noResults')}
                    columnName="name"
                  />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {t('company.speciality')}
                    <button
                      onClick={() => handleSort("speciality")}
                      className="ml-2 hover:bg-muted/50 rounded p-1"
                    >
                      {getSortIcon("speciality")}
                    </button>
                  </div>
                  <HierarchicalColumnFilter
                    options={hierarchicalSpecialities}
                    selected={specialityFilter}
                    onChange={setSpecialityFilter}
                    placeholder={t('company.filterSpeciality')}
                    emptyText={t('company.noResults')}
                    columnName="speciality"
                  />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {t('company.brands')}
                    <button
                      onClick={() => handleSort("brands")}
                      className="ml-2 hover:bg-muted/50 rounded p-1"
                    >
                      {getSortIcon("brands")}
                    </button>
                  </div>
                  <ColumnFilter
                    options={uniqueBrands}
                    selected={brandFilter}
                    onChange={setBrandFilter}
                    placeholder={t('company.filterBrands')}
                    emptyText={t('company.noResults')}
                    columnName="brands"
                  />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {t('company.locations') || 'Locations'}
                    <button
                      onClick={() => handleSort("locations")}
                      className="ml-2 hover:bg-muted/50 rounded p-1"
                    >
                      {getSortIcon("locations")}
                    </button>
                  </div>
                  <ColumnFilter
                    options={uniqueLocations}
                    selected={locationFilter}
                    onChange={setLocationFilter}
                    placeholder={t('company.filterLocations') || 'Filter by location...'}
                    emptyText={t('company.noResults')}
                    columnName="locations"
                  />
                </div>
              </TableHead>
              <TableHead>{t('company.associatedPeopleCount')}</TableHead>
              <TableHead className="text-right">{t('company.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedCompanies?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {searchTerm ? t('company.noResults') : t('company.noCompanies')}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedCompanies?.map((company) => (
                <TableRow 
                  key={company.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setViewingCompany(company)}
                >
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>
                    {company.company_specialities && company.company_specialities.length > 0
                      ? company.company_specialities
                          .map(cs => language === 'pt' ? cs.specialities.name_pt : cs.specialities.name_en)
                          .join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {company.brand_companies && company.brand_companies.length > 0
                      ? company.brand_companies
                          .map(bc => bc.brands.name)
                          .join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {company.company_locations && company.company_locations.length > 0
                      ? company.company_locations
                          .map(cl => cl.locations.name)
                          .join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    {company.people ? company.people.length : 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCompany(company);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(company.id);
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

      {editingCompany && (
        <CompanyDialog
          open={!!editingCompany}
          onOpenChange={(open) => !open && setEditingCompany(null)}
          company={editingCompany}
        />
      )}

      {viewingCompany && (
        <CompanyDialog
          open={!!viewingCompany}
          onOpenChange={(open) => !open && setViewingCompany(null)}
          company={viewingCompany}
          readOnly={true}
        />
      )}
    </>
  );
};
