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

const gradients = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-orange-500 to-red-500',
  'from-green-500 to-emerald-500',
];

export const DashboardCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  onClick,
  footer 
}: DashboardCardProps) => {
  const gradientClass = gradients[Math.floor(Math.random() * gradients.length)];
  
  return (
    <Card 
      className={`group transition-all duration-300 hover:shadow-2xl backdrop-blur-sm border-2 overflow-hidden ${onClick ? 'cursor-pointer motion-safe:hover:-translate-y-2' : ''}`}
      onClick={onClick}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
        <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{title}</CardTitle>
        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-lg motion-safe:group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </CardHeader>
      <CardContent className="space-y-1 relative">
        <div className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{value}</div>
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
