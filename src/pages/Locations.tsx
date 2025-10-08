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
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-foreground">{t('location.title') || 'Location Management'}</h1>
          <Button onClick={() => setIsLocationDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('location.addLocation') || 'Add Location'}
          </Button>
        </div>
        <p className="text-muted-foreground">{t('location.subtitle') || 'Manage company locations'}</p>
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
