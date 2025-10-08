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
import { LocationDialog } from "./LocationDialog";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

type Location = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  postal_code: string | null;
  created_at: string | null;
};

export const LocationsTable = () => {
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [viewingLocation, setViewingLocation] = useState<Location | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: locations, isLoading } = useQuery({
    queryKey: ["locations", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("locations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations", import.meta.env.VITE_SUPABASE_URL] });
      toast.success(t('location.deleteSuccess') || 'Location deleted successfully');
    },
    onError: () => {
      toast.error(t('location.deleteError') || 'Failed to delete location');
    },
  });

  const filteredLocations = locations?.filter((location) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      location.name.toLowerCase().includes(searchLower) ||
      location.address?.toLowerCase().includes(searchLower) ||
      location.city?.toLowerCase().includes(searchLower) ||
      location.country?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading') || 'Loading...'}</div>;
  }

  return (
    <>
      <div className="mb-4">
        <Input
          placeholder={t('location.searchPlaceholder') || 'Search locations...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('location.name') || 'Name'}</TableHead>
              <TableHead>{t('location.address') || 'Address'}</TableHead>
              <TableHead>{t('location.city') || 'City'}</TableHead>
              <TableHead>{t('location.country') || 'Country'}</TableHead>
              <TableHead>{t('location.postalCode') || 'Postal Code'}</TableHead>
              <TableHead className="text-right">{t('company.actions') || 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLocations?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {searchTerm ? t('location.noResults') || 'No locations match your search.' : t('location.noLocations') || 'No locations found. Add your first location!'}
                </TableCell>
              </TableRow>
            ) : (
              filteredLocations?.map((location) => (
                <TableRow 
                  key={location.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setViewingLocation(location)}
                >
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell>{location.address || "—"}</TableCell>
                  <TableCell>{location.city || "—"}</TableCell>
                  <TableCell>{location.country || "—"}</TableCell>
                  <TableCell>{location.postal_code || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingLocation(location);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(location.id);
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

      <LocationDialog 
        open={!!editingLocation} 
        onOpenChange={(open) => !open && setEditingLocation(null)}
        location={editingLocation}
      />

      <LocationDialog 
        open={!!viewingLocation} 
        onOpenChange={(open) => !open && setViewingLocation(null)}
        location={viewingLocation}
        readOnly={true}
      />
    </>
  );
};
