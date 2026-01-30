import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: ReactNode;
  variant?: "default" | "primary" | "secondary" | "warning" | "destructive";
  delay?: number;
}

export const StatCard = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  variant = "default",
  delay = 0,
}: StatCardProps) => {
  const variantStyles = {
    default: "border-border/50",
    primary: "border-primary/30 glow-saffron",
    secondary: "border-secondary/30 glow-cyan",
    warning: "border-warning/30",
    destructive: "border-destructive/30",
  };

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const trendColor =
    trend === "up"
      ? "text-success"
      : trend === "down"
      ? "text-destructive"
      : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`glass-card-hover p-5 ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>

      <div className="flex items-end gap-3">
        <span className="text-3xl font-bold text-foreground font-mono">
          {value}
        </span>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 ${trendColor} mb-1`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{trendValue}</span>
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
      )}
    </motion.div>
  );
};
