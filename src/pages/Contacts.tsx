import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ContactsTable } from "@/components/companies/ContactsTable";
import { ContactDialog } from "@/components/companies/ContactDialog";
import { useLanguage } from "@/contexts/LanguageContext";

const Contacts = () => {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t('contact.title') || 'Contact Management'}</h1>
          
          <Button onClick={() => setIsContactDialogOpen(true)} size="lg" className="shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            {t('contact.addContact') || 'Add Contact'}
          </Button>
        </div>
        <p className="text-base text-muted-foreground">{t('contact.subtitle') || 'Manage contact information'}</p>
      </div>

      <ContactsTable />

      <ContactDialog 
        open={isContactDialogOpen} 
        onOpenChange={setIsContactDialogOpen}
      />
    </div>
  );
};

export default Contacts;
