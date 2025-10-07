import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { SpecialityDialog } from "./SpecialityDialog";
import { ColumnFilter } from "@/components/ui/column-filter";
import { HierarchicalColumnFilter, HierarchicalOption } from "@/components/ui/hierarchical-column-filter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SortField = "name" | "main_specialty";
type SortDirection = "asc" | "desc" | null;

export const SpecialitiesManager = () => {
  const [editingSpeciality, setEditingSpeciality] = useState<{ id: string; name_en: string; name_pt: string; main_specialty_id?: string | null } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [nameFilter, setNameFilter] = useState<string[]>([]);
  const [mainSpecialtyFilter, setMainSpecialtyFilter] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const queryClient = useQueryClient();
  const { language, t } = useLanguage();

  const { data: specialities, isLoading } = useQuery({
    queryKey: ["specialities", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specialities")
        .select(`
          *,
          main_specialties(id, main_specialty_en, main_specialty_pt)
        `);
      if (error) throw error;
      return data;
    },
  });

  // Filter and sort specialities
  const filteredAndSortedSpecialities = useMemo(() => {
    if (!specialities) return [];

    // Filter by search term (global search)
    let filtered = specialities.filter((speciality) => {
      const searchLower = searchTerm.toLowerCase();
      const name = language === 'pt' ? speciality.name_pt : speciality.name_en;
      const mainSpecialtyName = speciality.main_specialties 
        ? (language === 'pt' ? speciality.main_specialties.main_specialty_pt : speciality.main_specialties.main_specialty_en)
        : "";
      
      return name.toLowerCase().includes(searchLower) || 
             mainSpecialtyName.toLowerCase().includes(searchLower);
    });

    // Apply column-specific filters
    if (nameFilter.length > 0) {
      filtered = filtered.filter((speciality) => {
        const name = language === 'pt' ? speciality.name_pt : speciality.name_en;
        return nameFilter.includes(name);
      });
    }

    if (mainSpecialtyFilter.length > 0) {
      filtered = filtered.filter((speciality) => {
        const specialityName = language === 'pt' ? speciality.name_pt : speciality.name_en;
        return mainSpecialtyFilter.includes(specialityName);
      });
    }

    // Sort by selected field
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = "";
        let bValue = "";

        if (sortField === "name") {
          aValue = language === 'pt' ? a.name_pt : a.name_en;
          bValue = language === 'pt' ? b.name_pt : b.name_en;
        } else if (sortField === "main_specialty") {
          aValue = a.main_specialties 
            ? (language === 'pt' ? a.main_specialties.main_specialty_pt : a.main_specialties.main_specialty_en)
            : "";
          bValue = b.main_specialties 
            ? (language === 'pt' ? b.main_specialties.main_specialty_pt : b.main_specialties.main_specialty_en)
            : "";
        }

        const comparison = aValue.localeCompare(bValue);
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [specialities, searchTerm, nameFilter, mainSpecialtyFilter, sortField, sortDirection, language]);

  // Get unique values for each column for filter options
  const uniqueNames = useMemo(() => {
    if (!specialities) return [];
    const names = Array.from(new Set(specialities.map(s => language === 'pt' ? s.name_pt : s.name_en))).sort();
    return names.map(name => ({ label: name, value: name }));
  }, [specialities, language]);

  // Build hierarchical structure for main specialty filter
  const hierarchicalMainSpecialties = useMemo(() => {
    if (!specialities) return [];
    
    // Group specialities by main specialty
    const groupedByMainSpecialty = new Map<string, Set<string>>();
    
    specialities.forEach(speciality => {
      const mainSpecialtyName = speciality.main_specialties
        ? (language === 'pt' ? speciality.main_specialties.main_specialty_pt : speciality.main_specialties.main_specialty_en)
        : "-";
      const specialityName = language === 'pt' ? speciality.name_pt : speciality.name_en;
      
      if (!groupedByMainSpecialty.has(mainSpecialtyName)) {
        groupedByMainSpecialty.set(mainSpecialtyName, new Set());
      }
      groupedByMainSpecialty.get(mainSpecialtyName)?.add(specialityName);
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
  }, [specialities, language]);

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
      const { error } = await supabase.from("specialities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialities", import.meta.env.VITE_SUPABASE_URL] });
      toast.success("Speciality deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete speciality");
    },
  });

  if (isLoading) {
    return <div className="text-center py-4">{t('common.loading')}</div>;
  }

  if (!specialities || specialities.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">{t('speciality.noSpecialities')}</div>;
  }

  return (
    <>
      <div className="mb-4">
        <Input
          placeholder={t('speciality.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {t('speciality.mainSpecialty')}
                    <button
                      onClick={() => handleSort("main_specialty")}
                      className="ml-2 hover:bg-muted/50 rounded p-1"
                    >
                      {getSortIcon("main_specialty")}
                    </button>
                  </div>
                  <HierarchicalColumnFilter
                    options={hierarchicalMainSpecialties}
                    selected={mainSpecialtyFilter}
                    onChange={setMainSpecialtyFilter}
                    placeholder={t('speciality.filterMainSpecialty') || 'Filter by main specialty'}
                    emptyText={t('company.noResults')}
                    columnName="main_specialty"
                  />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {t('speciality.name')}
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
                    placeholder={t('speciality.filterName') || 'Filter by name'}
                    emptyText={t('company.noResults')}
                    columnName="name"
                  />
                </div>
              </TableHead>
              <TableHead className="text-right">{t('company.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedSpecialities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  {searchTerm ? t('speciality.noResults') : t('speciality.noSpecialities')}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedSpecialities.map((speciality) => (
                <TableRow key={speciality.id}>
                  <TableCell>
                    {speciality.main_specialties 
                      ? (language === 'pt' ? speciality.main_specialties.main_specialty_pt : speciality.main_specialties.main_specialty_en)
                      : "—"}
                  </TableCell>
                  <TableCell>{language === 'pt' ? speciality.name_pt : speciality.name_en}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingSpeciality(speciality)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(speciality.id)}
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

      {editingSpeciality && (
        <SpecialityDialog
          open={!!editingSpeciality}
          onOpenChange={(open) => !open && setEditingSpeciality(null)}
          speciality={editingSpeciality}
        />
      )}
    </>
  );
};
