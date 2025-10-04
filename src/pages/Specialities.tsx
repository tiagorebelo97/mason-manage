import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SpecialitiesManager } from "@/components/companies/SpecialitiesManager";
import { SpecialityDialog } from "@/components/companies/SpecialityDialog";
import { useLanguage } from "@/contexts/LanguageContext";

const Specialities = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-foreground">
            {t('nav.specialities')}
          </h1>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('company.addSpeciality')}
          </Button>
        </div>
        <p className="text-muted-foreground">
          Manage construction speciality types
        </p>
      </div>

      <SpecialitiesManager />

      <SpecialityDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};

export default Specialities;
