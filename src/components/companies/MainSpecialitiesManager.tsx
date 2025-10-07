import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { MainSpecialityDialog } from "./MainSpecialityDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SortDirection = "asc" | "desc" | null;

export const MainSpecialitiesManager = () => {
  const [editingMainSpeciality, setEditingMainSpeciality] = useState<{ id: string; type: string; main_specialty_en: string; main_specialty_pt: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  const { data: mainSpecialities, isLoading } = useQuery({
    queryKey: ["main_specialities", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("main_specialties")
        .select("*")
        .order("type");
      if (error) throw error;
      return data;
    },
  });

  const filteredAndSortedMainSpecialities = useMemo(() => {
    if (!mainSpecialities) return [];

    let filtered = mainSpecialities.filter((ms) => {
      const searchLower = searchTerm.toLowerCase();
      const mainSpecialtyName = language === 'pt' ? ms.main_specialty_pt : ms.main_specialty_en;
      return (
        ms.type.toLowerCase().includes(searchLower) ||
        mainSpecialtyName.toLowerCase().includes(searchLower)
      );
    });

    if (sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        const nameA = language === 'pt' ? a.main_specialty_pt : a.main_specialty_en;
        const nameB = language === 'pt' ? b.main_specialty_pt : b.main_specialty_en;
        const comparison = nameA.localeCompare(nameB);
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [mainSpecialities, searchTerm, sortDirection, language]);

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
      const { error } = await supabase.from("main_specialties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["main_specialities", import.meta.env.VITE_SUPABASE_URL] });
      toast.success(t('mainSpecialty.deleteSuccess'));
    },
    onError: () => {
      toast.error(t('mainSpecialty.deleteError'));
    },
  });

  if (isLoading) {
    return <div className="text-center py-4">{t('common.loading')}</div>;
  }

  if (!mainSpecialities || mainSpecialities.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">{t('mainSpecialty.noMainSpecialties')}</div>;
  }

  return (
    <>
      <div className="mb-4">
        <Input
          placeholder={t('mainSpecialty.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('mainSpecialty.type')}</TableHead>
              <TableHead>
                <div className="flex items-center">
                  {t('mainSpecialty.mainSpecialty')}
                  <button
                    onClick={handleSort}
                    className="ml-2 hover:bg-muted/50 rounded p-1"
                  >
                    {getSortIcon()}
                  </button>
                </div>
              </TableHead>
              <TableHead className="text-right">{t('company.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedMainSpecialities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  {searchTerm ? t('mainSpecialty.noResults') : t('mainSpecialty.noMainSpecialties')}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedMainSpecialities.map((mainSpeciality) => (
                <TableRow key={mainSpeciality.id}>
                  <TableCell>{mainSpeciality.type}</TableCell>
                  <TableCell>{language === 'pt' ? mainSpeciality.main_specialty_pt : mainSpeciality.main_specialty_en}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingMainSpeciality(mainSpeciality)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(mainSpeciality.id)}
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
      {editingMainSpeciality && (
        <MainSpecialityDialog
          open={!!editingMainSpeciality}
          onOpenChange={(open) => {
            if (!open) setEditingMainSpeciality(null);
          }}
          mainSpeciality={editingMainSpeciality}
        />
      )}
    </>
  );
};
