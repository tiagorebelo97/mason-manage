/**
 * AI Analysis Summary Component
 * Displays a compact summary at the top with key statistics and shortcuts
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertCircle, CheckCircle2, ArrowDown } from "lucide-react";
import type { AIAnalysisResult, UncertainRow } from "@/services/aiAnalysisService";

interface AIAnalysisSummaryProps {
  insights: AIAnalysisResult | null;
  uncertainRows: UncertainRow[];
  language: 'en' | 'pt';
  onScrollToUncertain?: () => void;
  onScrollToInsights?: () => void;
}

export function AIAnalysisSummary({ 
  insights, 
  uncertainRows, 
  language,
  onScrollToUncertain,
  onScrollToInsights
}: AIAnalysisSummaryProps) {
  const translations = {
    en: {
      title: "AI Analysis Summary",
      qualityScore: "Quality Score",
      uncertainItems: "Items Needing Review",
      noUncertainItems: "All items analyzed successfully",
      viewDetails: "View Details",
      reviewItems: "Review Items",
      missingData: "Missing Data",
      excellent: "Excellent",
      good: "Good",
      needsImprovement: "Needs Improvement",
      units: "units",
      quantities: "quantities", 
      prices: "prices"
    },
    pt: {
      title: "Resumo da Análise IA",
      qualityScore: "Pontuação de Qualidade",
      uncertainItems: "Itens que Necessitam Revisão",
      noUncertainItems: "Todos os itens analisados com sucesso",
      viewDetails: "Ver Detalhes",
      reviewItems: "Rever Itens",
      missingData: "Dados em Falta",
      excellent: "Excelente",
      good: "Bom",
      needsImprovement: "Precisa Melhorar",
      units: "unidades",
      quantities: "quantidades",
      prices: "preços"
    }
  };

  const t = translations[language];

  const getQualityColor = (score: number): string => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getQualityBgColor = (score: number): string => {
    if (score >= 80) return "bg-green-600";
    if (score >= 60) return "bg-yellow-600";
    return "bg-red-600";
  };

  const getQualityLabel = (score: number): string => {
    if (score >= 80) return t.excellent;
    if (score >= 60) return t.good;
    return t.needsImprovement;
  };

  // Don't render if no insights and no uncertain rows
  if (!insights && uncertainRows.length === 0) {
    return null;
  }

  const hasUncertainRows = uncertainRows.length > 0;
  const qualityScore = insights?.qualityScore || 0;
  const metrics = insights?.validationMetrics;

  // Build missing data summary
  const missingDataParts: string[] = [];
  if (metrics?.missingUnits && metrics.missingUnits > 0) missingDataParts.push(`${metrics.missingUnits} ${t.units}`);
  if (metrics?.missingQuantities && metrics.missingQuantities > 0) missingDataParts.push(`${metrics.missingQuantities} ${t.quantities}`);
  if (metrics?.missingPrices && metrics.missingPrices > 0) missingDataParts.push(`${metrics.missingPrices} ${t.prices}`);
  const missingDataSummary = missingDataParts.join(', ');

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5 shadow-lg">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          
          <div className="flex-1 space-y-4">
            {/* Header */}
            <div>
              <h3 className="text-xl font-bold mb-1">{t.title}</h3>
            </div>

            {/* Key Metrics Row */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Quality Score - only show if insights available */}
              {insights && (
                <div className="flex items-center gap-3 bg-background/50 rounded-lg px-4 py-3 border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t.qualityScore}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getQualityColor(qualityScore)}`}>
                        {qualityScore}/100
                      </span>
                      <Badge variant="outline" className={getQualityColor(qualityScore)}>
                        {getQualityLabel(qualityScore)}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Uncertain Items */}
              <div className="flex items-center gap-3 bg-background/50 rounded-lg px-4 py-3 border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t.uncertainItems}</p>
                  <div className="flex items-center gap-2">
                    {hasUncertainRows ? (
                      <>
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        <span className="text-2xl font-bold text-amber-600">
                          {uncertainRows.length}
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">
                          {t.noUncertainItems}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Missing Data - only show if insights available and data is missing */}
              {insights && missingDataSummary && (
                <div className="flex items-center gap-3 bg-background/50 rounded-lg px-4 py-3 border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t.missingData}</p>
                    <p className="text-sm font-medium text-red-600">
                      {missingDataSummary}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {insights && onScrollToInsights && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onScrollToInsights}
                  className="gap-2"
                >
                  <ArrowDown className="h-4 w-4" />
                  {t.viewDetails}
                </Button>
              )}
              
              {hasUncertainRows && onScrollToUncertain && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onScrollToUncertain}
                  className="gap-2 bg-amber-600 hover:bg-amber-700"
                >
                  <AlertCircle className="h-4 w-4" />
                  {t.reviewItems} ({uncertainRows.length})
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
