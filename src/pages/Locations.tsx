import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LocationsTable } from "@/components/companies/LocationsTable";
import { LocationDialog } from "@/components/companies/LocationDialog";
import { useLanguage } from "@/contexts/LanguageContext";

const Locations = () => {
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t('location.title') || 'Location Management'}</h1>
          
          <Button onClick={() => setIsLocationDialogOpen(true)} size="lg" className="shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            {t('location.addLocation') || 'Add Location'}
          </Button>
        </div>
        <p className="text-base text-muted-foreground">{t('location.subtitle') || 'Manage company locations'}</p>
      </div>

      <LocationsTable />

      <LocationDialog 
        open={isLocationDialogOpen} 
        onOpenChange={setIsLocationDialogOpen}
      />
    </div>
  );
};

export default Locations;
