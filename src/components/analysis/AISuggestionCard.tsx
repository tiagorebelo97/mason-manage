/**
 * AI Suggestion Card Component
 * Shows contextual suggestions to use AI features
 */

import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AISuggestionCardProps {
  title?: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'compact';
}

export function AISuggestionCard({ 
  title = "AI Tip", 
  description, 
  action,
  variant = 'default' 
}: AISuggestionCardProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-start gap-2 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{description}</p>
          {action && (
            <Button 
              variant="link" 
              size="sm" 
              onClick={action.onClick}
              className="h-auto p-0 mt-1 text-purple-600 dark:text-purple-400"
            >
              {action.label} →
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-600 dark:bg-purple-500 rounded-lg">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
            {action && (
              <Button 
                onClick={action.onClick}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {action.label}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
