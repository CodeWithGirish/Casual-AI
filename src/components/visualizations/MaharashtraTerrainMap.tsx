import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useDistricts, District } from "@/hooks/useDistricts";

// Actual Maharashtra district boundaries (simplified polygon coordinates)
// These are approximate centroid positions mapped to SVG viewBox (0-100)
const MAHARASHTRA_BOUNDARY = "M 15,35 Q 18,28 25,22 L 35,18 Q 45,15 55,16 L 65,20 Q 75,22 82,28 L 88,35 Q 92,45 90,55 L 85,65 Q 80,72 72,78 L 60,82 Q 48,85 38,82 L 28,75 Q 20,68 16,58 L 12,48 Q 10,40 15,35 Z";

// Western Ghats ridge line for terrain
const WESTERN_GHATS_PATH = "M 18,75 Q 22,65 25,55 L 28,45 Q 30,35 32,28 L 35,22";

// District coordinate mapping (normalized to 0-100 SVG viewBox based on actual lat/long)
const districtCoordinates: Record<string, { x: number; y: number; region: string }> = {
  MUM: { x: 22, y: 58, region: "konkan" },
  THA: { x: 24, y: 52, region: "konkan" },
  PAL: { x: 22, y: 48, region: "konkan" },
  RAI: { x: 24, y: 62, region: "konkan" },
  RAT: { x: 22, y: 72, region: "konkan" },
  SIN: { x: 22, y: 80, region: "konkan" },
  PUN: { x: 30, y: 60, region: "western" },
  SAT: { x: 28, y: 68, region: "western" },
  KOL: { x: 28, y: 76, region: "western" },
  SAN: { x: 32, y: 74, region: "western" },
  SOL: { x: 38, y: 68, region: "western" },
  NAS: { x: 30, y: 48, region: "western" },
  AHM: { x: 35, y: 55, region: "western" },
  DHU: { x: 32, y: 38, region: "khandesh" },
  NDB: { x: 30, y: 32, region: "khandesh" },
  JAG: { x: 38, y: 35, region: "khandesh" },
  AUR: { x: 42, y: 55, region: "marathwada" },
  JAL: { x: 45, y: 48, region: "marathwada" },
  BEE: { x: 48, y: 58, region: "marathwada" },
  LAT: { x: 52, y: 64, region: "marathwada" },
  OSM: { x: 48, y: 68, region: "marathwada" },
  NAN: { x: 58, y: 58, region: "marathwada" },
  PAR: { x: 52, y: 52, region: "marathwada" },
  HIN: { x: 56, y: 48, region: "marathwada" },
  BUL: { x: 48, y: 42, region: "vidarbha" },
  AKO: { x: 55, y: 38, region: "vidarbha" },
  WAS: { x: 58, y: 42, region: "vidarbha" },
  AMR: { x: 62, y: 38, region: "vidarbha" },
  YAV: { x: 65, y: 45, region: "vidarbha" },
  WAR: { x: 68, y: 42, region: "vidarbha" },
  NAG: { x: 72, y: 38, region: "vidarbha" },
  BHA: { x: 76, y: 35, region: "vidarbha" },
  GON: { x: 80, y: 32, region: "vidarbha" },
  CHA: { x: 75, y: 50, region: "vidarbha" },
  GAD: { x: 82, y: 45, region: "vidarbha" },
};

// Region colors for terrain visualization
const regionColors: Record<string, string> = {
  konkan: "hsl(200, 70%, 35%)", // Coastal blue-green
  western: "hsl(120, 40%, 35%)", // Green (ghats)
  khandesh: "hsl(45, 60%, 40%)", // Tan/brown
  marathwada: "hsl(30, 70%, 45%)", // Orange-brown (drought prone)
  vidarbha: "hsl(35, 50%, 40%)", // Light brown
};

// Terrain elevation grid
const generateTerrainGrid = () => {
  const grid: { x: number; y: number; z: number }[][] = [];
  const resolution = 12;

  for (let i = 0; i <= resolution; i++) {
    const row: { x: number; y: number; z: number }[] = [];
    for (let j = 0; j <= resolution; j++) {
      const x = 10 + (j / resolution) * 80;
      const y = 15 + (i / resolution) * 70;

      // Elevation based on Western Ghats (higher on west)
      let z = 0;
      const distFromWest = x - 15;
      if (distFromWest < 25) {
        z = Math.max(0, 15 - distFromWest * 0.5) + Math.sin(y * 0.1) * 3;
      }
      // Vidarbha plateau
      if (x > 60) {
        z += 5 + Math.sin(x * 0.2) * 2;
      }

      row.push({ x, y, z });
    }
    grid.push(row);
  }
  return grid;
};

interface Maharashtra3DMapProps {
  onDistrictSelect?: (district: District | null) => void;
  selectedDistrict?: string | null;
  isSimulated?: boolean;
  simulationIntensity?: number;
}

export const MaharashtraTerrainMap = ({
  onDistrictSelect,
  selectedDistrict,
  isSimulated = false,
  simulationIntensity = 0,
}: Maharashtra3DMapProps) => {
  const { data: districts, isLoading } = useDistricts();
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  const terrainGrid = useMemo(() => generateTerrainGrid(), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 0.02) % (2 * Math.PI));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const getDistrictColor = (district: District) => {
    const droughtLevel = district.drought_index / 100;

    if (isSimulated) {
      const adjustedDrought = Math.max(0, droughtLevel - simulationIntensity * 0.4);
      if (adjustedDrought > 0.7) return "hsl(0, 80%, 50%)";
      if (adjustedDrought > 0.5) return "hsl(30, 80%, 50%)";
      if (adjustedDrought > 0.3) return "hsl(45, 70%, 50%)";
      return "hsl(142, 70%, 45%)";
    }

    if (droughtLevel > 0.7) return "hsl(var(--destructive))";
    if (droughtLevel > 0.5) return "hsl(var(--warning))";
    if (droughtLevel > 0.3) return "hsl(var(--primary))";
    return "hsl(var(--success))";
  };

  const getDistrictCoords = (district: District) => {
    const coords = districtCoordinates[district.code];
    if (coords) return coords;
    // Fallback based on actual coordinates (normalized)
    return {
      x: ((district.x_coord - 72) / 10) * 80 + 10,
      y: ((21.5 - district.y_coord) / 6) * 70 + 15,
      region: "western",
    };
  };

  const getMigrationArcs = () => {
    if (!districts) return [];
    const arcs: { from: District; to: District; volume: number }[] = [];

    // Create arcs from high-drought to low-drought districts
    const highDroughtDistricts = districts.filter((d) => d.drought_index > 60);
    const lowDroughtDistricts = districts.filter((d) => d.drought_index < 30);

    highDroughtDistricts.forEach((source) => {
      const dest = lowDroughtDistricts.find((d) => d.net_migration > 50000);
      if (dest) {
        arcs.push({
          from: source,
          to: dest,
          volume: Math.abs(source.net_migration),
        });
      }
    });

    return arcs.slice(0, 8); // Limit for performance
  };

  const renderArcPath = (from: District, to: District) => {
    const fromCoords = getDistrictCoords(from);
    const toCoords = getDistrictCoords(to);
    const midX = (fromCoords.x + toCoords.x) / 2;
    const midY = (fromCoords.y + toCoords.y) / 2 - 15;
    return `M ${fromCoords.x} ${fromCoords.y} Q ${midX} ${midY} ${toCoords.x} ${toCoords.y}`;
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading terrain data...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full" style={{ perspective: "1000px" }}>
      <div
        className="w-full h-full transition-transform duration-500"
        style={{
          transform: "rotateX(45deg) rotateZ(-5deg)",
          transformStyle: "preserve-3d",
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            {/* Gradient for state boundary */}
            <linearGradient id="stateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.1" />
            </linearGradient>

            {/* Drought hotspot glow */}
            <filter id="droughtGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Migration arc glow */}
            <filter id="arcGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Terrain shadow */}
            <filter id="terrainShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.5" floodColor="black" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* State base shape */}
          <path
            d={MAHARASHTRA_BOUNDARY}
            fill="url(#stateGradient)"
            stroke="hsl(var(--border))"
            strokeWidth="0.3"
            filter="url(#terrainShadow)"
          />

          {/* Terrain grid lines */}
          {terrainGrid.map((row, i) => (
            <polyline
              key={`h-${i}`}
              points={row.map((p) => `${p.x},${p.y - p.z * 0.3}`).join(" ")}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="0.1"
              strokeOpacity="0.3"
            />
          ))}
          {terrainGrid[0].map((_, j) => (
            <polyline
              key={`v-${j}`}
              points={terrainGrid.map((row) => `${row[j].x},${row[j].y - row[j].z * 0.3}`).join(" ")}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="0.1"
              strokeOpacity="0.3"
            />
          ))}

          {/* Western Ghats elevation line */}
          <path
            d={WESTERN_GHATS_PATH}
            fill="none"
            stroke="hsl(var(--success))"
            strokeWidth="0.5"
            strokeOpacity="0.6"
            strokeDasharray="2,1"
          />

          {/* Migration arcs */}
          {!isSimulated &&
            getMigrationArcs().map((arc, i) => (
              <g key={`arc-${i}`}>
                {/* Arc shadow */}
                <path
                  d={renderArcPath(arc.from, arc.to)}
                  fill="none"
                  stroke="hsl(var(--secondary))"
                  strokeWidth="0.3"
                  strokeOpacity="0.2"
                  transform="translate(0.3, 0.3)"
                />
                {/* Arc line */}
                <motion.path
                  d={renderArcPath(arc.from, arc.to)}
                  fill="none"
                  stroke="hsl(var(--secondary))"
                  strokeWidth="0.4"
                  strokeOpacity={0.6}
                  filter="url(#arcGlow)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, repeatDelay: 3 }}
                />
                {/* Animated particle */}
                <motion.circle
                  r="0.6"
                  fill="hsl(var(--secondary))"
                  initial={{ offsetDistance: "0%" }}
                  animate={{ offsetDistance: "100%" }}
                  transition={{ duration: 3, delay: i * 0.3, repeat: Infinity, repeatDelay: 2 }}
                  style={{ offsetPath: `path('${renderArcPath(arc.from, arc.to)}')` }}
                />
              </g>
            ))}

          {/* District hotspots */}
          {districts?.map((district) => {
            const coords = getDistrictCoords(district);
            const isHovered = hoveredDistrict === district.id;
            const isSelected = selectedDistrict === district.id;
            const droughtLevel = district.drought_index / 100;
            const size = 1.5 + droughtLevel * 1.5;
            const pulseScale = 1 + Math.sin(animationPhase + district.drought_index * 0.1) * 0.15;

            return (
              <g key={district.id}>
                {/* Elevation shadow */}
                <ellipse
                  cx={coords.x + 0.5}
                  cy={coords.y + 0.5}
                  rx={size * 0.8}
                  ry={size * 0.4}
                  fill="black"
                  fillOpacity="0.3"
                />

                {/* Drought pulse ring */}
                {droughtLevel > 0.6 && !isSimulated && (
                  <motion.circle
                    cx={coords.x}
                    cy={coords.y}
                    r={size * 2}
                    fill="none"
                    stroke={getDistrictColor(district)}
                    strokeWidth="0.2"
                    initial={{ opacity: 0.6, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.5 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                {/* Main hotspot */}
                <motion.circle
                  cx={coords.x}
                  cy={coords.y}
                  r={size * (isHovered || isSelected ? 1.3 : pulseScale)}
                  fill={getDistrictColor(district)}
                  fillOpacity={0.9}
                  stroke={isSelected ? "white" : "hsl(var(--background))"}
                  strokeWidth={isSelected ? 0.4 : 0.2}
                  filter={droughtLevel > 0.5 ? "url(#droughtGlow)" : undefined}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredDistrict(district.id)}
                  onMouseLeave={() => setHoveredDistrict(null)}
                  onClick={() => onDistrictSelect?.(district)}
                  whileHover={{ scale: 1.2 }}
                />

                {/* District label */}
                {(isHovered || isSelected) && (
                  <motion.g
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <rect
                      x={coords.x - 8}
                      y={coords.y - 7}
                      width="16"
                      height="4"
                      rx="0.5"
                      fill="hsl(var(--background))"
                      fillOpacity="0.9"
                    />
                    <text
                      x={coords.x}
                      y={coords.y - 4.5}
                      textAnchor="middle"
                      fill="hsl(var(--foreground))"
                      fontSize="2.5"
                      fontFamily="Inter, sans-serif"
                      fontWeight="600"
                    >
                      {district.name}
                    </text>
                  </motion.g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 glass-card p-2 rounded-lg text-[10px] lg:text-xs space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
          <span className="text-muted-foreground">Severe Drought (&gt;70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-warning" />
          <span className="text-muted-foreground">Moderate (50-70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-success" />
          <span className="text-muted-foreground">Stable (&lt;30%)</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-border/50">
          <div className="w-6 h-0.5 bg-secondary rounded" />
          <span className="text-muted-foreground">Migration Flow</span>
        </div>
      </div>

      {/* 3D indicator */}
      <div className="absolute top-2 right-2 px-2 py-1 rounded bg-muted/80 text-[10px] text-muted-foreground">
        3D Terrain View
      </div>
    </div>
  );
};

export default MaharashtraTerrainMap;
