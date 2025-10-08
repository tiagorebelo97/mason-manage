import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  onClick?: () => void;
  footer?: ReactNode;
}

export const DashboardCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  onClick,
  footer 
}: DashboardCardProps) => {
  return (
    <Card 
      className={`group transition-all duration-200 border-l-4 border-l-primary/50 ${onClick ? 'cursor-pointer hover:shadow-md hover:border-l-primary hover:-translate-y-0.5' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {footer && (
          <div className="mt-3 pt-3 border-t">{footer}</div>
        )}
      </CardContent>
    </Card>
  );
};
