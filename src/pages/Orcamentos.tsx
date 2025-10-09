import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { OrcamentosTable } from "@/components/orcamentos/OrcamentosTable";
import { OrcamentoDialog } from "@/components/orcamentos/OrcamentoDialog";
import { useLanguage } from "@/contexts/LanguageContext";

const Orcamentos = () => {
  const [isOrcamentoDialogOpen, setIsOrcamentoDialogOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-foreground">{t('orcamento.title')}</h1>
          <Button onClick={() => setIsOrcamentoDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('orcamento.addOrcamento')}
          </Button>
        </div>
        <p className="text-muted-foreground">{t('orcamento.subtitle')}</p>
      </div>

      <OrcamentosTable />

      <OrcamentoDialog 
        open={isOrcamentoDialogOpen} 
        onOpenChange={setIsOrcamentoDialogOpen}
      />
    </div>
  );
};

export default Orcamentos;
