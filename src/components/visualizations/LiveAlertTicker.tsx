import { motion } from "framer-motion";
import { AlertTriangle, Droplets, TrendingUp, Users } from "lucide-react";

const alerts = [
  {
    id: 1,
    type: "critical",
    icon: AlertTriangle,
    district: "Beed",
    message: "Severe drought conditions detected. Groundwater levels at 15%",
    time: "2 min ago",
  },
  {
    id: 2,
    type: "warning",
    icon: Droplets,
    district: "Jalna",
    message: "Water table dropped 3m in last 30 days",
    time: "5 min ago",
  },
  {
    id: 3,
    type: "info",
    icon: Users,
    district: "Latur",
    message: "Migration spike detected: +340 families registered for urban relocation",
    time: "12 min ago",
  },
  {
    id: 4,
    type: "warning",
    icon: TrendingUp,
    district: "Osmanabad",
    message: "Crop failure rate increased to 72% in kharif season",
    time: "18 min ago",
  },
  {
    id: 5,
    type: "critical",
    icon: AlertTriangle,
    district: "Solapur",
    message: "Emergency water tanker request: 45 villages affected",
    time: "25 min ago",
  },
  {
    id: 6,
    type: "info",
    icon: Users,
    district: "Ahmednagar",
    message: "MGNREGA enrollment increased by 28%",
    time: "32 min ago",
  },
];

const duplicatedAlerts = [...alerts, ...alerts];

export const LiveAlertTicker = () => {
  return (
    <div className="relative overflow-hidden py-3 glass-card rounded-lg">
      {/* Gradient masks */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-card to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-card to-transparent z-10" />

      {/* Live indicator */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-20">
        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
        <span className="text-xs font-mono text-destructive">LIVE</span>
      </div>

      {/* Scrolling content */}
      <motion.div
        className="flex gap-8 px-24"
        animate={{ x: [0, -50 * alerts.length * 8] }}
        transition={{
          x: {
            duration: 60,
            repeat: Infinity,
            ease: "linear",
          },
        }}
      >
        {duplicatedAlerts.map((alert, index) => {
          const Icon = alert.icon;
          const colorClass =
            alert.type === "critical"
              ? "text-destructive"
              : alert.type === "warning"
              ? "text-warning"
              : "text-secondary";

          return (
            <div
              key={`${alert.id}-${index}`}
              className="flex items-center gap-3 whitespace-nowrap"
            >
              <Icon className={`w-4 h-4 ${colorClass}`} />
              <span className="font-mono text-xs">
                <span className={`font-bold ${colorClass}`}>{alert.district}</span>
                <span className="text-muted-foreground mx-2">|</span>
                <span className="text-foreground">{alert.message}</span>
                <span className="text-muted-foreground ml-2">• {alert.time}</span>
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};
