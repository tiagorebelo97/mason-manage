import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MainSpecialitiesManager } from "@/components/companies/MainSpecialitiesManager";
import { MainSpecialityDialog } from "@/components/companies/MainSpecialityDialog";
import { useLanguage } from "@/contexts/LanguageContext";

const MainSpecialties = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-foreground">
            {t('mainSpecialty.title')}
          </h1>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('mainSpecialty.addMainSpecialty')}
          </Button>
        </div>
        <p className="text-muted-foreground">
          {t('mainSpecialty.subtitle')}
        </p>
      </div>

      <MainSpecialitiesManager />

      <MainSpecialityDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};

export default MainSpecialties;
