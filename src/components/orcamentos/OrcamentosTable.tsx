import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { OrcamentoDialog } from "./OrcamentoDialog";
import { ColumnFilter } from "@/components/ui/column-filter";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Orcamento = {
  id: string;
  name: string;
  state: "open" | "closed";
  creation_date: string;
  delivery_date: string | null;
  created_at: string;
};

type SortField = "name" | "creation_date" | "delivery_date" | "state";
type SortDirection = "asc" | "desc" | null;

export const OrcamentosTable = () => {
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(null);
  const [viewingOrcamento, setViewingOrcamento] = useState<Orcamento | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  const { data: orcamentos, isLoading } = useQuery({
    queryKey: ["orcamentos", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamentos")
        .select("*")
        .order("creation_date", { ascending: false });
      if (error) throw error;
      return data as Orcamento[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("orcamentos")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos", import.meta.env.VITE_SUPABASE_URL] });
      toast.success(t('orcamento.deleteSuccess'));
    },
    onError: () => {
      toast.error(t('orcamento.deleteError'));
    },
  });

  const filteredAndSortedOrcamentos = useMemo(() => {
    if (!orcamentos) return [];

    let filtered = orcamentos.filter((orcamento) => {
      const searchLower = searchTerm.toLowerCase();
      return orcamento.name.toLowerCase().includes(searchLower);
    });

    if (stateFilter.length > 0) {
      filtered = filtered.filter((orcamento) => 
        stateFilter.includes(orcamento.state)
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
        } else if (sortField === "state") {
          aValue = a.state;
          bValue = b.state;
        } else if (sortField === "creation_date") {
          aValue = a.creation_date || "";
          bValue = b.creation_date || "";
        } else if (sortField === "delivery_date") {
          aValue = a.delivery_date || "";
          bValue = b.delivery_date || "";
        }

        const comparison = aValue.localeCompare(bValue);
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [orcamentos, searchTerm, stateFilter, sortField, sortDirection]);

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
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const uniqueStates = useMemo(() => {
    if (!orcamentos) return [];
    const states = new Set<string>();
    orcamentos.forEach(orcamento => {
      states.add(orcamento.state);
    });
    return Array.from(states);
  }, [orcamentos]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'pt' ? 'pt-PT' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder={t('orcamento.searchPlaceholder')}
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
                    {t('orcamento.name')}
                    <button
                      onClick={() => handleSort("name")}
                      className="ml-2 hover:bg-muted/50 rounded p-1"
                    >
                      {getSortIcon("name")}
                    </button>
                  </div>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {t('orcamento.creationDate')}
                    <button
                      onClick={() => handleSort("creation_date")}
                      className="ml-2 hover:bg-muted/50 rounded p-1"
                    >
                      {getSortIcon("creation_date")}
                    </button>
                  </div>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {t('orcamento.deliveryDate')}
                    <button
                      onClick={() => handleSort("delivery_date")}
                      className="ml-2 hover:bg-muted/50 rounded p-1"
                    >
                      {getSortIcon("delivery_date")}
                    </button>
                  </div>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {t('orcamento.state')}
                    <button
                      onClick={() => handleSort("state")}
                      className="ml-2 hover:bg-muted/50 rounded p-1"
                    >
                      {getSortIcon("state")}
                    </button>
                  </div>
                  <ColumnFilter
                    options={uniqueStates}
                    selected={stateFilter}
                    onChange={setStateFilter}
                    placeholder={t('orcamento.filterState')}
                    emptyText={t('orcamento.noResults')}
                    columnName="state"
                  />
                </div>
              </TableHead>
              <TableHead className="text-right">{t('orcamento.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedOrcamentos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  {searchTerm || stateFilter.length > 0
                    ? t('orcamento.noResults')
                    : t('orcamento.noOrcamentos')}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedOrcamentos.map((orcamento) => (
                <TableRow 
                  key={orcamento.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setViewingOrcamento(orcamento)}
                >
                  <TableCell className="font-medium">{orcamento.name}</TableCell>
                  <TableCell>{formatDate(orcamento.creation_date)}</TableCell>
                  <TableCell>{formatDate(orcamento.delivery_date)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={orcamento.state === "open" ? "default" : "destructive"}
                      className={orcamento.state === "open" ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {t(`orcamento.state${orcamento.state.charAt(0).toUpperCase() + orcamento.state.slice(1)}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingOrcamento(orcamento);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(orcamento.id);
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

      <OrcamentoDialog
        open={!!editingOrcamento}
        onOpenChange={(open) => !open && setEditingOrcamento(null)}
        orcamento={editingOrcamento}
      />

      <OrcamentoDialog
        open={!!viewingOrcamento}
        onOpenChange={(open) => !open && setViewingOrcamento(null)}
        orcamento={viewingOrcamento}
        viewMode={true}
      />
    </>
  );
};
