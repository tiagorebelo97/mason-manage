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
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-foreground">{t('brand.title')}</h1>
          <Button onClick={() => setIsBrandDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('brand.addBrand')}
          </Button>
        </div>
        <p className="text-muted-foreground">{t('brand.subtitle')}</p>
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
