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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {items && items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index}>
                {renderItem(item)}
              </div>
            ))}
            {onViewAll && totalCount && totalCount > items.length && (
              <div 
                className="text-sm text-primary hover:underline cursor-pointer text-center pt-2 font-medium"
                onClick={onViewAll}
              >
                {viewAllLabel} ({totalCount})
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            {EmptyIcon && <EmptyIcon className="h-12 w-12 mb-3 opacity-20" />}
            <p className="text-sm">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
