import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { BrandDialog } from "./BrandDialog";
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
  brand_specialities?: Array<{ specialities: { name: string; name_en: string; name_pt: string } }>;
  brand_companies?: Array<{ companies: { name: string } }>;
  speciality_ids?: string[];
  company_ids?: string[];
};

type SortField = "name" | "website" | "official_email";
type SortDirection = "asc" | "desc" | null;

export const BrandsTable = () => {
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [viewingBrand, setViewingBrand] = useState<Brand | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
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
          brand_specialities(specialities(id, name, name_en, name_pt)),
          brand_companies(companies(id, name))
        `);
      if (error) throw error;
      
      return data.map(brand => ({
        ...brand,
        speciality_ids: brand.brand_specialities?.map(bs => bs.specialities.id) || [],
        company_ids: brand.brand_companies?.map(bc => bc.companies.id) || [],
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
      const companiesText = brand.brand_companies
        ?.map(bc => bc.companies.name)
        .join(", ") || "";
      
      return (
        brand.name.toLowerCase().includes(searchLower) ||
        (brand.website?.toLowerCase().includes(searchLower)) ||
        (brand.official_email?.toLowerCase().includes(searchLower)) ||
        specialitiesText.toLowerCase().includes(searchLower) ||
        companiesText.toLowerCase().includes(searchLower)
      );
    });

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
        }

        const comparison = aValue.localeCompare(bValue);
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [brands, searchTerm, sortField, sortDirection, language]);

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

  if (isLoading) {
    return <div className="text-center py-4">{t('common.loading')}</div>;
  }

  return (
    <>
      <div className="mb-4">
        <Input
          placeholder={t('brand.searchPlaceholder')}
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
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  {t('brand.name')}
                  {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort("website")}
              >
                <div className="flex items-center">
                  {t('brand.website')}
                  {getSortIcon("website")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort("official_email")}
              >
                <div className="flex items-center">
                  {t('brand.officialEmail')}
                  {getSortIcon("official_email")}
                </div>
              </TableHead>
              <TableHead>{t('brand.specialities')}</TableHead>
              <TableHead>{t('brand.companies')}</TableHead>
              <TableHead className="text-right">{t('brand.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedBrands?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {searchTerm ? t('brand.noResults') : t('brand.noBrands')}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedBrands?.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>{brand.website || "-"}</TableCell>
                  <TableCell>{brand.official_email || "-"}</TableCell>
                  <TableCell>
                    {brand.brand_specialities && brand.brand_specialities.length > 0
                      ? brand.brand_specialities
                          .map(bs => language === 'pt' ? bs.specialities.name_pt : bs.specialities.name_en)
                          .join(", ")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {brand.brand_companies && brand.brand_companies.length > 0
                      ? brand.brand_companies
                          .map(bc => bc.companies.name)
                          .join(", ")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewingBrand(brand)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingBrand(brand)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(brand.id)}
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
