import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface RecentListProps {
  title: string;
  description?: string;
  items: any[];
  renderItem: (item: any) => ReactNode;
  onViewAll?: () => void;
  viewAllLabel?: string;
  totalCount?: number;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
}

export const RecentList = ({ 
  title, 
  description, 
  items, 
  renderItem, 
  onViewAll,
  viewAllLabel = "View All",
  totalCount,
  emptyMessage = "No items found",
  emptyIcon: EmptyIcon
}: RecentListProps) => {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        {description && <CardDescription className="text-sm">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-4">
        {items && items.length > 0 ? (
          <div className="space-y-1">
            {items.map((item, index) => (
              <div key={index}>
                {renderItem(item)}
              </div>
            ))}
            {onViewAll && totalCount && totalCount > items.length && (
              <Button
                variant="ghost"
                className="w-full mt-2 text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-all duration-200"
                onClick={onViewAll}
              >
                {viewAllLabel} ({totalCount})
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            {EmptyIcon && <EmptyIcon className="h-16 w-16 mb-4 opacity-20" />}
            <p className="text-sm font-medium">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
