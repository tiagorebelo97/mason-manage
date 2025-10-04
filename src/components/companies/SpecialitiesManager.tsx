import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const SpecialitiesManager = () => {
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  const { data: specialities, isLoading } = useQuery({
    queryKey: ["specialities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specialities")
        .select("*")
        .order("name_en");
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("specialities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialities"] });
      toast.success("Speciality deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete speciality");
    },
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading specialities...</div>;
  }

  if (!specialities || specialities.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No specialities added yet.</div>;
  }

  return (
    <div className="rounded-md border mt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>English Name</TableHead>
            <TableHead>Portuguese Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {specialities.map((speciality) => (
            <TableRow key={speciality.id}>
              <TableCell>{speciality.name_en}</TableCell>
              <TableCell>{speciality.name_pt}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(speciality.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
