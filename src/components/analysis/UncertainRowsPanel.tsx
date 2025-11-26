/**
 * Uncertain Rows Panel Component
 * Displays rows that AI is uncertain about with accept/reject functionality
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check, X, Edit2, HelpCircle } from "lucide-react";
import { useState } from "react";
import type { UncertainRow } from "@/services/aiAnalysisService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface UncertainRowsPanelProps {
  uncertainRows: UncertainRow[];
  language: 'en' | 'pt';
  onAccept: (row: UncertainRow, modifiedData?: UncertainRow['suggestedData']) => void;
  onReject: (row: UncertainRow) => void;
}

export function UncertainRowsPanel({ 
  uncertainRows, 
  language,
  onAccept,
  onReject
}: UncertainRowsPanelProps) {
  const [editingRow, setEditingRow] = useState<UncertainRow | null>(null);
  const [editedData, setEditedData] = useState<UncertainRow['suggestedData']>({});

  const translations = {
    en: {
      title: "AI Uncertain Rows",
      panelDescription: "These rows were identified by AI as uncertain or problematic. Review and decide whether to accept or reject them.",
      noUncertainRows: "No uncertain rows found. All data appears clear to the AI.",
      sheet: "Sheet",
      row: "Row",
      artigo: "Artigo",
      description: "Description",
      reason: "Reason",
      suggestedAction: "Suggested Action",
      actions: "Actions",
      accept: "Accept",
      reject: "Reject",
      modify: "Modify",
      editTitle: "Edit Row Data",
      editDescription: "Modify the row data before accepting",
      save: "Save & Accept",
      cancel: "Cancel",
      include: "Include",
      exclude: "Exclude",
      unit: "Unit",
      quantity: "Quantity",
      unitPrice: "Unit Price"
    },
    pt: {
      title: "Linhas Incertas da IA",
      panelDescription: "Estas linhas foram identificadas pela IA como incertas ou problemáticas. Reveja e decida se as aceita ou rejeita.",
      noUncertainRows: "Nenhuma linha incerta encontrada. Todos os dados parecem claros para a IA.",
      sheet: "Folha",
      row: "Linha",
      artigo: "Artigo",
      description: "Descrição",
      reason: "Razão",
      suggestedAction: "Ação Sugerida",
      actions: "Ações",
      accept: "Aceitar",
      reject: "Rejeitar",
      modify: "Modificar",
      editTitle: "Editar Dados da Linha",
      editDescription: "Modifique os dados da linha antes de aceitar",
      save: "Guardar e Aceitar",
      cancel: "Cancelar",
      include: "Incluir",
      exclude: "Excluir",
      unit: "Unidade",
      quantity: "Quantidade",
      unitPrice: "Preço Unitário"
    }
  };

  const t = translations[language];

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'include': return 'default';
      case 'exclude': return 'destructive';
      case 'modify': return 'secondary';
      default: return 'outline';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'include': return t.include;
      case 'exclude': return t.exclude;
      case 'modify': return t.modify;
      default: return action;
    }
  };

  const handleModify = (row: UncertainRow) => {
    setEditingRow(row);
    setEditedData(row.suggestedData || {
      artigo: row.artigo,
      descricao: row.descricao
    });
  };

  const handleSaveModified = () => {
    if (editingRow) {
      onAccept(editingRow, editedData);
      setEditingRow(null);
      setEditedData({});
    }
  };

  if (uncertainRows.length === 0) {
    return (
      <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <Check className="h-5 w-5" />
            <p className="text-sm">{t.noUncertainRows}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            <div>
              <CardTitle className="text-xl">{t.title}</CardTitle>
              <CardDescription>{t.panelDescription}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-amber-100 dark:bg-amber-900/20">
                  <TableHead className="min-w-[100px]">{t.sheet}</TableHead>
                  <TableHead className="min-w-[60px]">{t.row}</TableHead>
                  <TableHead className="min-w-[80px]">{t.artigo}</TableHead>
                  <TableHead className="min-w-[200px] max-w-[300px]">{t.description}</TableHead>
                  <TableHead className="min-w-[150px] max-w-[200px]">{t.reason}</TableHead>
                  <TableHead className="min-w-[100px]">{t.suggestedAction}</TableHead>
                  <TableHead className="text-right min-w-[200px]">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uncertainRows.map((row, index) => (
                  <TableRow 
                    key={`${row.sheetName}-${row.rowIndex}-${index}`}
                    className="bg-amber-50/50 dark:bg-amber-950/10 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                  >
                    <TableCell className="font-medium">{row.sheetName}</TableCell>
                    <TableCell>{row.rowIndex}</TableCell>
                    <TableCell>{row.artigo || '-'}</TableCell>
                    <TableCell className="min-w-[200px] max-w-[300px]">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate cursor-help">
                              {row.descricao}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>{row.descricao}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="min-w-[150px] max-w-[200px]">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-sm text-muted-foreground flex items-start gap-1 cursor-help">
                              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span className="overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {row.reason}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>{row.reason}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(row.suggestedAction)}>
                        {getActionLabel(row.suggestedAction)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {row.suggestedAction === 'modify' && row.suggestedData && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModify(row)}
                            className="gap-1"
                          >
                            <Edit2 className="h-3 w-3" />
                            {t.modify}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => onAccept(row, row.suggestedData)}
                          className="gap-1 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-3 w-3" />
                          {t.accept}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onReject(row)}
                          className="gap-1"
                        >
                          <X className="h-3 w-3" />
                          {t.reject}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingRow} onOpenChange={(open) => {
        if (!open) {
          setEditingRow(null);
          setEditedData({});
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.editTitle}</DialogTitle>
            <DialogDescription>{t.editDescription}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingRow && (
              <>
                <div className="space-y-2">
                  <Label>{t.artigo}</Label>
                  <Input
                    value={editedData.artigo || ''}
                    onChange={(e) => setEditedData({ ...editedData, artigo: e.target.value })}
                    placeholder={editingRow.artigo}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.description}</Label>
                  <Textarea
                    value={editedData.descricao || ''}
                    onChange={(e) => setEditedData({ ...editedData, descricao: e.target.value })}
                    placeholder={editingRow.descricao}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t.unit}</Label>
                    <Input
                      value={editedData.un || ''}
                      onChange={(e) => setEditedData({ ...editedData, un: e.target.value })}
                      placeholder="UN"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.quantity}</Label>
                    <Input
                      type="number"
                      value={editedData.qt || ''}
                      onChange={(e) => setEditedData({ ...editedData, qt: parseFloat(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.unitPrice}</Label>
                    <Input
                      type="number"
                      value={editedData.preco_unitario || ''}
                      onChange={(e) => setEditedData({ ...editedData, preco_unitario: parseFloat(e.target.value) })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditingRow(null);
                setEditedData({});
              }}
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleSaveModified}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              {t.save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
