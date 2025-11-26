import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BrandsTable } from "@/components/companies/BrandsTable";
import { BrandDialog } from "@/components/companies/BrandDialog";
import { useLanguage } from "@/contexts/LanguageContext";

const Brands = () => {
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('brand.title')}
          </h1>
          <Button onClick={() => setIsBrandDialogOpen(true)} size="lg" className="shadow-lg">
            <Plus className="mr-2 h-5 w-5" />
            {t('brand.addBrand')}
          </Button>
        </div>
        <p className="text-base text-muted-foreground">{t('brand.subtitle')}</p>
      </div>

      <BrandsTable />

      <BrandDialog 
        open={isBrandDialogOpen} 
        onOpenChange={setIsBrandDialogOpen}
      />
    </div>
  );
};

export default Brands;
