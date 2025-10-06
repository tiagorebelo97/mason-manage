import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { SpecialityDialog } from "./SpecialityDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SortDirection = "asc" | "desc" | null;

export const SpecialitiesManager = () => {
  const [editingSpeciality, setEditingSpeciality] = useState<{ id: string; name_en: string; name_pt: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const queryClient = useQueryClient();
  const { language, t } = useLanguage();

  const { data: specialities, isLoading } = useQuery({
    queryKey: ["specialities", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specialities")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Filter and sort specialities
  const filteredAndSortedSpecialities = useMemo(() => {
    if (!specialities) return [];

    // Filter by search term
    let filtered = specialities.filter((speciality) => {
      const searchLower = searchTerm.toLowerCase();
      const name = language === 'pt' ? speciality.name_pt : speciality.name_en;
      return name.toLowerCase().includes(searchLower);
    });

    // Sort by name in current language
    if (sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = language === 'pt' ? a.name_pt : a.name_en;
        const bValue = language === 'pt' ? b.name_pt : b.name_en;
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [specialities, searchTerm, sortDirection, language]);

  const handleSort = () => {
    if (sortDirection === null) {
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      setSortDirection("desc");
    } else {
      setSortDirection(null);
    }
  };

  const getSortIcon = () => {
    if (sortDirection === null) {
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
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={handleSort}
              >
                <div className="flex items-center">
                  {t('speciality.name')}
                  {getSortIcon()}
                </div>
              </TableHead>
              <TableHead className="text-right">{t('company.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedSpecialities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  {searchTerm ? t('speciality.noResults') : t('speciality.noSpecialities')}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedSpecialities.map((speciality) => (
                <TableRow key={speciality.id}>
                  <TableCell>{language === 'pt' ? speciality.name_pt : speciality.name_en}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSpeciality(speciality)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
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

        {editingSpeciality && (
          <SpecialityDialog
            open={!!editingSpeciality}
            onOpenChange={(open) => !open && setEditingSpeciality(null)}
            speciality={editingSpeciality}
          />
        )}
      </div>
    </>
  );
};
