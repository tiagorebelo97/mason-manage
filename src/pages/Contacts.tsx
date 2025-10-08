import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ContactsTable } from "@/components/companies/ContactsTable";
import { ContactDialog } from "@/components/companies/ContactDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";

const Contacts = () => {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-4xl font-bold text-foreground">{t('contact.title') || 'Contact Management'}</h1>
            <p className="text-muted-foreground mt-1">{t('contact.subtitle') || 'Manage contact information'}</p>
          </div>
          <Button onClick={() => setIsContactDialogOpen(true)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            {t('contact.addContact') || 'Add Contact'}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <ContactsTable />
      </Card>

      <ContactDialog 
        open={isContactDialogOpen} 
        onOpenChange={setIsContactDialogOpen}
      />
    </div>
  );
};

export default Contacts;
