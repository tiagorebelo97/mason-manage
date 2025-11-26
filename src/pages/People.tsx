import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PeopleTable } from "@/components/companies/PeopleTable";
import { PersonDialog } from "@/components/companies/PersonDialog";
import { useLanguage } from "@/contexts/LanguageContext";

const People = () => {
  const [isPersonDialogOpen, setIsPersonDialogOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t('person.title') || 'People Management'}</h1>
          
          <Button onClick={() => setIsPersonDialogOpen(true)} size="lg" className="shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            {t('person.addPerson') || 'Add Person'}
          </Button>
        </div>
        <p className="text-base text-muted-foreground">{t('person.subtitle') || 'Manage people and their companies'}</p>
      </div>

      <PeopleTable />

      <PersonDialog 
        open={isPersonDialogOpen} 
        onOpenChange={setIsPersonDialogOpen}
      />
    </div>
  );
};

export default People;
