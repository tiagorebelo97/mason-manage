import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CompaniesTable } from "@/components/companies/CompaniesTable";
import { CompanyDialog } from "@/components/companies/CompanyDialog";
import { SpecialityDialog } from "@/components/companies/SpecialityDialog";

const Index = () => {
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [isSpecialityDialogOpen, setIsSpecialityDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-foreground">Company Management</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsSpecialityDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Speciality
              </Button>
              <Button onClick={() => setIsCompanyDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Company
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">Manage your construction company partners</p>
        </div>

        <CompaniesTable />

        <CompanyDialog 
          open={isCompanyDialogOpen} 
          onOpenChange={setIsCompanyDialogOpen}
        />

        <SpecialityDialog 
          open={isSpecialityDialogOpen} 
          onOpenChange={setIsSpecialityDialogOpen}
        />
      </div>
    </div>
  );
};

export default Index;
