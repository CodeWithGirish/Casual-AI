import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useDistricts, District } from "@/hooks/useDistricts";
import { useMigrationEvents } from "@/hooks/useMigrationEvents";
import { Loader2 } from "lucide-react";

interface MaharashtraMapProps {
  onDistrictSelect?: (district: District) => void;
  selectedDistrict?: string;
}

export const MaharashtraMap = ({ onDistrictSelect, selectedDistrict }: MaharashtraMapProps) => {
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Fetch dynamic data from Supabase
  const { data: districts, isLoading: districtsLoading } = useDistricts();
  const { data: migrationEvents, isLoading: migrationLoading } = useMigrationEvents();

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const getDistrictById = (id: string) => districts?.find((d) => d.id === id);

  const getArcPath = (fromId: string, toId: string) => {
    const from = getDistrictById(fromId);
    const to = getDistrictById(toId);
    // Use x_coord and y_coord from the database (normalized to 100x100 for SVG)
    if (!from || !to) return "";

    const midX = (from.x_coord + to.x_coord) / 2;
    const midY = (from.y_coord + to.y_coord) / 2 - 15;

    return `M ${from.x_coord} ${from.y_coord} Q ${midX} ${midY} ${to.x_coord} ${to.y_coord}`;
  };

  if (districtsLoading || migrationLoading) {
    return (
        <div className="h-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  return (
      <div className="relative w-full h-full">
        <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            style={{ filter: "drop-shadow(0 0 20px hsl(var(--primary) / 0.2))" }}
        >
          {/* State outline and Topographical lines remain the same... */}
          <path
              d="M15 45 Q10 30 25 20 Q45 10 70 15 Q85 20 88 35 Q92 50 85 65 Q78 80 55 85 Q35 88 22 78 Q12 68 15 45"
              fill="hsl(var(--navy))"
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
              className="opacity-80"
          />

          {/* Dynamic Migration arcs from migrationEvents */}
          {migrationEvents?.slice(0, 15).map((event, index) => {
            const path = getArcPath(event.source_district_id, event.destination_district_id);
            if (!path) return null;

            return (
                <g key={`arc-${event.id}`}>
                  <path d={path} fill="none" stroke="hsl(var(--cyan) / 0.3)" strokeWidth="0.8" />
                  <motion.circle
                      r="1"
                      fill="hsl(var(--cyan))"
                      initial={{ offsetDistance: "0%" }}
                      animate={{ offsetDistance: "100%" }}
                      transition={{
                        duration: 3 + (index % 5) * 0.5,
                        repeat: Infinity,
                        ease: "linear",
                        delay: (index % 10) * 0.3,
                      }}
                      style={{ offsetPath: `path("${path}")` }}
                  />
                </g>
            );
          })}

          {/* Dynamic District hotspots from districts data */}
          {districts?.map((district) => {
            const isHovered = hoveredDistrict === district.id;
            const isSelected = selectedDistrict === district.id;
            const isDestination = district.net_migration > 0;
            const normalizedDrought = district.drought_index / 100;
            const size = isDestination ? 4 : 2 + (normalizedDrought * 2);

            return (
                <g
                    key={district.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredDistrict(district.id)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                    onClick={() => onDistrictSelect?.(district)}
                >
                  <circle
                      cx={district.x_coord}
                      cy={district.y_coord}
                      r={size + 3}
                      fill={isDestination ? "hsl(var(--cyan) / 0.2)" : `hsl(var(--saffron) / ${0.1 + normalizedDrought * 0.2})`}
                      className={isHovered || isSelected ? "opacity-100" : "opacity-60"}
                  />

                  <motion.circle
                      cx={district.x_coord}
                      cy={district.y_coord}
                      r={size}
                      fill={isDestination ? "hsl(var(--cyan))" : "hsl(var(--saffron))"}
                      opacity={0.6 + normalizedDrought * 0.4}
                      animate={{
                        r: isHovered || isSelected ? size + 1 : size,
                        opacity: isHovered || isSelected ? 1 : 0.6 + normalizedDrought * 0.4,
                      }}
                  />

                  {district.drought_index > 70 && (
                      <circle
                          cx={district.x_coord}
                          cy={district.y_coord}
                          r={size}
                          fill="none"
                          stroke="hsl(var(--saffron))"
                          strokeWidth="0.3"
                          opacity={(Math.sin(animationPhase * 0.1) + 1) / 4}
                      >
                        <animate attributeName="r" from={size} to={size + 4} dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                      </circle>
                  )}
                  {/* Tooltip Label remains the same... */}
                </g>
            );
          })}
        </svg>
        {/* Legend remains the same... */}
      </div>
  );
};