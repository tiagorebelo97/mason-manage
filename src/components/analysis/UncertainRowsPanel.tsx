/**
 * Uncertain Rows Panel Component
 * Displays rows that AI is uncertain about with accept/reject functionality
 * and the ability to implement AI suggestions or provide custom suggestions
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check, X, Edit2, HelpCircle, Sparkles, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import type { UncertainRow } from "@/services/aiAnalysisService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  const [customSuggestionRow, setCustomSuggestionRow] = useState<string | null>(null); // Row key for custom suggestion input
  const [customSuggestion, setCustomSuggestion] = useState<string>(''); // Custom suggestion text
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(new Set()); // Track which AI suggestions are expanded

  const translations = {
    en: {
      title: "AI Uncertain Rows",
      panelDescription: "These rows were identified by AI as uncertain or problematic. Review the AI suggestions and decide whether to accept, reject, or provide your own instructions.",
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
      unitPrice: "Unit Price",
      aiSuggestion: "AI Suggestion",
      implementAiSuggestion: "Implement AI Suggestion",
      customSuggestion: "Your Instructions",
      customSuggestionPlaceholder: "Describe how you want this row to be handled...",
      confirmCustomSuggestion: "Apply Instructions",
      showAiSuggestion: "Show AI Suggestion",
      hideAiSuggestion: "Hide AI Suggestion",
      noAiSuggestion: "No AI suggestion available for this row",
      provideSuggestion: "Provide Instructions"
    },
    pt: {
      title: "Linhas Incertas da IA",
      panelDescription: "Estas linhas foram identificadas pela IA como incertas ou problemáticas. Reveja as sugestões da IA e decida se aceita, rejeita ou fornece as suas próprias instruções.",
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
      unitPrice: "Preço Unitário",
      aiSuggestion: "Sugestão da IA",
      implementAiSuggestion: "Implementar Sugestão da IA",
      customSuggestion: "As Suas Instruções",
      customSuggestionPlaceholder: "Descreva como quer que esta linha seja tratada...",
      confirmCustomSuggestion: "Aplicar Instruções",
      showAiSuggestion: "Mostrar Sugestão da IA",
      hideAiSuggestion: "Ocultar Sugestão da IA",
      noAiSuggestion: "Nenhuma sugestão da IA disponível para esta linha",
      provideSuggestion: "Fornecer Instruções"
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

  const getRowKey = (row: UncertainRow) => `${row.sheetName}-${row.rowIndex}`;

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

  const handleImplementAiSuggestion = (row: UncertainRow) => {
    // Accept with the AI's suggested data
    onAccept(row, row.suggestedData);
  };

  const handleToggleCustomSuggestion = (rowKey: string) => {
    if (customSuggestionRow === rowKey) {
      setCustomSuggestionRow(null);
      setCustomSuggestion('');
    } else {
      setCustomSuggestionRow(rowKey);
      setCustomSuggestion('');
    }
  };

  const handleConfirmCustomSuggestion = (row: UncertainRow) => {
    // Create modified data that preserves the original row data
    // and adds the user's custom instructions as an observation/note
    // The user's instructions will be appended to the description so they can
    // be seen and acted upon during review
    const modifiedData: UncertainRow['suggestedData'] = {
      ...row.suggestedData,
      // Keep original artigo if available
      artigo: row.suggestedData?.artigo || row.artigo,
      // Preserve original description but add user instruction as context
      descricao: row.suggestedData?.descricao || row.descricao,
      // Preserve other fields from suggested data
      un: row.suggestedData?.un,
      qt: row.suggestedData?.qt,
      preco_unitario: row.suggestedData?.preco_unitario,
    };
    
    // Create a modified row that includes the user's instruction
    // This instruction is passed along so the handler can process it appropriately
    const rowWithInstruction: UncertainRow = {
      ...row,
      // Store the user's instruction in the aiSuggestion field temporarily
      // so the accept handler can access it and act accordingly
      aiSuggestion: `[User instruction]: ${customSuggestion}`,
    };
    
    onAccept(rowWithInstruction, modifiedData);
    setCustomSuggestionRow(null);
    setCustomSuggestion('');
  };

  const toggleAiSuggestionExpanded = (rowKey: string) => {
    const newExpanded = new Set(expandedSuggestions);
    if (newExpanded.has(rowKey)) {
      newExpanded.delete(rowKey);
    } else {
      newExpanded.add(rowKey);
    }
    setExpandedSuggestions(newExpanded);
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
          <div className="space-y-4">
            {uncertainRows.map((row, index) => {
              const rowKey = getRowKey(row);
              const isAiSuggestionExpanded = expandedSuggestions.has(rowKey);
              const isCustomSuggestionOpen = customSuggestionRow === rowKey;
              const hasAiSuggestion = !!row.aiSuggestion;
              
              return (
                <Card 
                  key={`${rowKey}-${index}`}
                  className="border border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-950"
                >
                  <CardContent className="p-4">
                    {/* Row Info Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <span className="font-medium">{t.sheet}: {row.sheetName}</span>
                          <span>•</span>
                          <span>{t.row}: {row.rowIndex}</span>
                          {row.artigo && (
                            <>
                              <span>•</span>
                              <span>{t.artigo}: {row.artigo}</span>
                            </>
                          )}
                        </div>
                        <p className="text-base font-medium break-words">{row.descricao}</p>
                      </div>
                      <Badge variant={getActionBadgeVariant(row.suggestedAction)}>
                        {getActionLabel(row.suggestedAction)}
                      </Badge>
                    </div>

                    {/* Reason */}
                    <div className="flex items-start gap-2 mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                      <div>
                        <span className="text-sm font-medium text-amber-700 dark:text-amber-300">{t.reason}: </span>
                        <span className="text-sm text-amber-800 dark:text-amber-200">{row.reason}</span>
                      </div>
                    </div>

                    {/* AI Suggestion Section */}
                    {hasAiSuggestion && (
                      <Collapsible open={isAiSuggestionExpanded} onOpenChange={() => toggleAiSuggestionExpanded(rowKey)}>
                        <div className="mb-4">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30">
                              <Sparkles className="h-4 w-4" />
                              {isAiSuggestionExpanded ? t.hideAiSuggestion : t.showAiSuggestion}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-start gap-2">
                                <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                                <div className="flex-1">
                                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{t.aiSuggestion}: </span>
                                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">{row.aiSuggestion}</p>
                                </div>
                              </div>
                              <div className="mt-3 flex justify-end">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleImplementAiSuggestion(row)}
                                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                                >
                                  <Sparkles className="h-3 w-3" />
                                  {t.implementAiSuggestion}
                                </Button>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    )}

                    {/* Custom Suggestion Section */}
                    <Collapsible open={isCustomSuggestionOpen} onOpenChange={() => handleToggleCustomSuggestion(rowKey)}>
                      <div className="mb-4">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30">
                            <MessageSquare className="h-4 w-4" />
                            {t.provideSuggestion}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                            <Label className="text-sm font-medium text-purple-700 dark:text-purple-300">{t.customSuggestion}</Label>
                            <Textarea
                              value={customSuggestion}
                              onChange={(e) => setCustomSuggestion(e.target.value)}
                              placeholder={t.customSuggestionPlaceholder}
                              rows={3}
                              className="mt-2 bg-white dark:bg-gray-900"
                            />
                            <div className="mt-3 flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setCustomSuggestionRow(null);
                                  setCustomSuggestion('');
                                }}
                              >
                                {t.cancel}
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleConfirmCustomSuggestion(row)}
                                disabled={!customSuggestion.trim()}
                                className="gap-2 bg-purple-600 hover:bg-purple-700"
                              >
                                <Send className="h-3 w-3" />
                                {t.confirmCustomSuggestion}
                              </Button>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-amber-200 dark:border-amber-800">
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
                  </CardContent>
                </Card>
              );
            })}
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
