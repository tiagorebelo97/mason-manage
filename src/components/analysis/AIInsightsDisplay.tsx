/**
 * AI Insights Display Component
 * Shows quality score, summary, suggestions, and validation metrics from AI analysis
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, CheckCircle2, AlertCircle, XCircle, Lightbulb } from "lucide-react";
import type { AIAnalysisResult } from "@/services/aiAnalysisService";

interface AIInsightsDisplayProps {
  insights: AIAnalysisResult;
  language: 'en' | 'pt';
}

export function AIInsightsDisplay({ insights, language }: AIInsightsDisplayProps) {
  // Determine quality score color
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
    if (score >= 80) return language === 'en' ? "Excellent" : "Excelente";
    if (score >= 60) return language === 'en' ? "Good" : "Bom";
    return language === 'en' ? "Needs Improvement" : "Precisa Melhorar";
  };

  const translations = {
    en: {
      title: "AI Analysis Insights",
      description: "AI-powered analysis results and recommendations",
      qualityScore: "Quality Score",
      summary: "Summary",
      suggestions: "Suggestions",
      validationMetrics: "Data Validation Metrics",
      missingUnits: "Missing Units",
      missingQuantities: "Missing Quantities",
      missingPrices: "Missing Prices",
      totalItems: "Total Items",
      completeness: "Completeness"
    },
    pt: {
      title: "Insights de Análise IA",
      description: "Resultados e recomendações da análise com IA",
      qualityScore: "Pontuação de Qualidade",
      summary: "Resumo",
      suggestions: "Sugestões",
      validationMetrics: "Métricas de Validação de Dados",
      missingUnits: "Unidades em Falta",
      missingQuantities: "Quantidades em Falta",
      missingPrices: "Preços em Falta",
      totalItems: "Total de Itens",
      completeness: "Completude"
    }
  };

  const t = translations[language];

  return (
    <Card className="w-full border-2 border-primary/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">{t.title}</CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Quality Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t.qualityScore}</h3>
            <Badge variant="outline" className={getQualityColor(insights.qualityScore)}>
              {getQualityLabel(insights.qualityScore)}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className={`text-2xl font-bold ${getQualityColor(insights.qualityScore)}`}>
                {insights.qualityScore}/100
              </span>
            </div>
            <Progress 
              value={insights.qualityScore} 
              className="h-3"
              indicatorClassName={getQualityBgColor(insights.qualityScore)}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            {t.summary}
          </h3>
          <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
            {insights.summary}
          </p>
        </div>

        {/* Suggestions */}
        {insights.suggestions.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              {t.suggestions}
            </h3>
            <ul className="space-y-2">
              {insights.suggestions.map((suggestion, index) => (
                <li 
                  key={index} 
                  className="flex items-start gap-2 text-sm bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg"
                >
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Validation Metrics */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{t.validationMetrics}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted p-4 rounded-lg space-y-1">
              <div className="text-xs text-muted-foreground">{t.totalItems}</div>
              <div className="text-2xl font-bold">{insights.validationMetrics.totalItems}</div>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg space-y-1">
              <div className="text-xs text-red-600 dark:text-red-400">{t.missingUnits}</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {insights.validationMetrics.missingUnits}
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg space-y-1">
              <div className="text-xs text-orange-600 dark:text-orange-400">{t.missingQuantities}</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {insights.validationMetrics.missingQuantities}
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg space-y-1">
              <div className="text-xs text-yellow-600 dark:text-yellow-400">{t.missingPrices}</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {insights.validationMetrics.missingPrices}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between bg-primary/5 p-4 rounded-lg">
            <span className="font-medium">{t.completeness}</span>
            <div className="flex items-center gap-2">
              <Progress 
                value={insights.validationMetrics.completenessPercentage} 
                className="w-32 h-2"
                indicatorClassName={getQualityBgColor(insights.validationMetrics.completenessPercentage)}
              />
              <span className="font-bold">{insights.validationMetrics.completenessPercentage}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
