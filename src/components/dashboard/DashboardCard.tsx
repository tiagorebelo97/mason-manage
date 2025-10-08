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
      className={`hover:shadow-lg transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {footer && (
          <div className="mt-2">{footer}</div>
        )}
      </CardContent>
    </Card>
  );
};
