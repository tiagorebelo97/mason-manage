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
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('nav.specialities')}
          </h1>
          
          <Button onClick={() => setIsDialogOpen(true)} size="lg" className="shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            {t('company.addSpeciality')}
          </Button>
        </div>
        <p className="text-base text-muted-foreground">
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
