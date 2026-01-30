import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDistricts } from "@/hooks/useDistricts";
import { AlertTriangle, Droplets, TrendingUp, MapPin } from "lucide-react";

interface Alert {
  id: string;
  type: "drought" | "migration" | "water" | "crop";
  district: string;
  message: string;
  severity: "high" | "medium" | "low";
  timestamp: Date;
}

export const DynamicAlertTicker = () => {
  const { data: districts } = useDistricts();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (!districts) return;

    // Generate alerts based on actual district data
    const generatedAlerts: Alert[] = [];

    districts.forEach((district) => {
      if (district.drought_index > 70) {
        generatedAlerts.push({
          id: `drought-${district.id}`,
          type: "drought",
          district: district.name,
          message: `Severe drought alert: ${district.drought_index.toFixed(0)}% drought index`,
          severity: "high",
          timestamp: new Date(),
        });
      }

      if (district.water_stress_index > 75) {
        generatedAlerts.push({
          id: `water-${district.id}`,
          type: "water",
          district: district.name,
          message: `Water stress critical: ${district.water_stress_index.toFixed(0)}% stress level`,
          severity: "high",
          timestamp: new Date(),
        });
      }

      if (district.net_migration < -50000) {
        generatedAlerts.push({
          id: `migration-${district.id}`,
          type: "migration",
          district: district.name,
          message: `High outmigration detected: ${Math.abs(district.net_migration).toLocaleString()} people`,
          severity: "medium",
          timestamp: new Date(),
        });
      }

      if (district.crop_failure_rate > 50) {
        generatedAlerts.push({
          id: `crop-${district.id}`,
          type: "crop",
          district: district.name,
          message: `Crop failure rate: ${district.crop_failure_rate.toFixed(0)}%`,
          severity: district.crop_failure_rate > 60 ? "high" : "medium",
          timestamp: new Date(),
        });
      }
    });

    setAlerts(generatedAlerts);
  }, [districts]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "drought":
        return <AlertTriangle className="w-3 h-3 lg:w-4 lg:h-4" />;
      case "water":
        return <Droplets className="w-3 h-3 lg:w-4 lg:h-4" />;
      case "migration":
        return <MapPin className="w-3 h-3 lg:w-4 lg:h-4" />;
      case "crop":
        return <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4" />;
      default:
        return <AlertTriangle className="w-3 h-3 lg:w-4 lg:h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-destructive bg-destructive/10 border-destructive/30";
      case "medium":
        return "text-warning bg-warning/10 border-warning/30";
      default:
        return "text-muted-foreground bg-muted/50 border-border";
    }
  };

  if (!alerts.length) {
    return (
      <div className="glass-card p-3 rounded-lg">
        <div className="text-sm text-muted-foreground text-center">
          Loading alerts...
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-2 lg:p-3 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
        <span className="text-[10px] lg:text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Live Alerts ({alerts.length})
        </span>
      </div>
      <div className="relative overflow-hidden">
        <motion.div
          className="flex gap-3 lg:gap-4"
          animate={{ x: [0, -50 * alerts.length] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: alerts.length * 5,
              ease: "linear",
            },
          }}
        >
          {[...alerts, ...alerts].map((alert, index) => (
            <div
              key={`${alert.id}-${index}`}
              className={`flex items-center gap-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg border whitespace-nowrap ${getSeverityColor(
                alert.severity
              )}`}
            >
              {getAlertIcon(alert.type)}
              <span className="text-[10px] lg:text-xs font-medium">{alert.district}:</span>
              <span className="text-[10px] lg:text-xs">{alert.message}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default DynamicAlertTicker;
