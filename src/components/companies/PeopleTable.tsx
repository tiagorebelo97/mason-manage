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
import { PersonDialog } from "./PersonDialog";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

type Person = {
  id: string;
  first_name: string;
  last_name: string | null;
  company_id: string | null;
  created_at: string | null;
  companies?: {
    name: string;
  } | null;
};

export const PeopleTable = () => {
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [viewingPerson, setViewingPerson] = useState<Person | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: people, isLoading } = useQuery({
    queryKey: ["people", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("people")
        .select("*, companies(name)")
        .order("first_name");
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("people").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people", import.meta.env.VITE_SUPABASE_URL] });
      toast.success(t('person.deleteSuccess') || 'Person deleted successfully');
    },
    onError: () => {
      toast.error(t('person.deleteError') || 'Failed to delete person');
    },
  });

  const filteredPeople = people?.filter((person) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${person.first_name} ${person.last_name || ''}`.toLowerCase();
    const companyName = person.companies?.name?.toLowerCase() || '';
    return fullName.includes(searchLower) || companyName.includes(searchLower);
  });

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading') || 'Loading...'}</div>;
  }

  return (
    <>
      <div className="mb-4">
        <Input
          placeholder={t('person.searchPlaceholder') || 'Search people...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('person.firstName') || 'First Name'}</TableHead>
              <TableHead>{t('person.lastName') || 'Last Name'}</TableHead>
              <TableHead>{t('person.company') || 'Company'}</TableHead>
              <TableHead className="text-right">{t('company.actions') || 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPeople?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {searchTerm ? t('person.noResults') || 'No people match your search.' : t('person.noPeople') || 'No people found. Add your first person!'}
                </TableCell>
              </TableRow>
            ) : (
              filteredPeople?.map((person) => (
                <TableRow 
                  key={person.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setViewingPerson(person)}
                >
                  <TableCell className="font-medium">{person.first_name}</TableCell>
                  <TableCell>{person.last_name || "—"}</TableCell>
                  <TableCell>{person.companies?.name || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPerson(person);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(person.id);
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

      <PersonDialog 
        open={!!editingPerson} 
        onOpenChange={(open) => !open && setEditingPerson(null)}
        person={editingPerson}
      />

      <PersonDialog 
        open={!!viewingPerson} 
        onOpenChange={(open) => !open && setViewingPerson(null)}
        person={viewingPerson}
        readOnly={true}
      />
    </>
  );
};
