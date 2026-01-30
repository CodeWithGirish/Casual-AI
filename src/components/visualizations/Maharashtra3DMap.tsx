import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const districts = [
  { id: "beed", name: "Beed", x: 55, y: 48, drought: 0.85, migration: 12500, elevation: 0.8 },
  { id: "jalna", name: "Jalna", x: 50, y: 38, drought: 0.72, migration: 8900, elevation: 0.6 },
  { id: "osmanabad", name: "Osmanabad", x: 52, y: 58, drought: 0.78, migration: 7200, elevation: 0.7 },
  { id: "latur", name: "Latur", x: 58, y: 55, drought: 0.81, migration: 9800, elevation: 0.75 },
  { id: "solapur", name: "Solapur", x: 42, y: 62, drought: 0.68, migration: 6500, elevation: 0.5 },
  { id: "ahmednagar", name: "Ahmednagar", x: 38, y: 42, drought: 0.55, migration: 4200, elevation: 0.45 },
  { id: "nashik", name: "Nashik", x: 28, y: 30, drought: 0.35, migration: 2100, elevation: 0.9 },
  { id: "pune", name: "Pune", x: 30, y: 52, drought: 0.25, migration: 1500, elevation: 0.65 },
  { id: "mumbai", name: "Mumbai", x: 18, y: 48, drought: 0.1, migration: -45000, elevation: 0.15 },
  { id: "nagpur", name: "Nagpur", x: 75, y: 28, drought: 0.45, migration: 3800, elevation: 0.55 },
  { id: "aurangabad", name: "Aurangabad", x: 45, y: 32, drought: 0.62, migration: 5600, elevation: 0.7 },
  { id: "kolhapur", name: "Kolhapur", x: 28, y: 72, drought: 0.2, migration: 1200, elevation: 0.4 },
];

const migrationArcs = [
  { from: "beed", to: "mumbai" },
  { from: "jalna", to: "mumbai" },
  { from: "osmanabad", to: "mumbai" },
  { from: "latur", to: "mumbai" },
  { from: "solapur", to: "pune" },
  { from: "ahmednagar", to: "pune" },
  { from: "aurangabad", to: "mumbai" },
];

// Generate terrain grid points
const terrainGrid: { x: number; y: number; z: number }[][] = [];
const GRID_SIZE = 20;
for (let i = 0; i <= GRID_SIZE; i++) {
  terrainGrid[i] = [];
  for (let j = 0; j <= GRID_SIZE; j++) {
    const x = (j / GRID_SIZE) * 100;
    const y = (i / GRID_SIZE) * 100;
    // Create varying terrain heights
    const z = 
      Math.sin(x * 0.1) * 3 +
      Math.cos(y * 0.08) * 4 +
      Math.sin((x + y) * 0.05) * 2 +
      (x > 60 ? 2 : 0) + // Eastern highlands
      (y < 35 ? 3 : 0) + // Northern elevation
      (x < 25 && y > 40 && y < 55 ? -2 : 0); // Coastal depression
    terrainGrid[i][j] = { x, y, z: Math.max(0, z + 5) };
  }
}

interface Maharashtra3DMapProps {
  onDistrictSelect?: (district: typeof districts[0]) => void;
  selectedDistrict?: string;
  isSimulated?: boolean;
  simulationIntensity?: number;
}

export const Maharashtra3DMap = ({ 
  onDistrictSelect, 
  selectedDistrict,
  isSimulated = false,
  simulationIntensity = 0
}: Maharashtra3DMapProps) => {
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [rotateX, setRotateX] = useState(55);
  const [rotateZ, setRotateZ] = useState(-15);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const getDistrictById = (id: string) => districts.find((d) => d.id === id);

  const getArcPath = (fromId: string, toId: string) => {
    const from = getDistrictById(fromId);
    const to = getDistrictById(toId);
    if (!from || !to) return "";

    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2 - 15;

    return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
  };

  // Calculate migration intensity reduction based on simulation
  const getMigrationOpacity = (baseOpacity: number) => {
    if (!isSimulated) return baseOpacity;
    return Math.max(0.1, baseOpacity - simulationIntensity * 0.3);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ perspective: "1000px" }}
    >
      {/* 3D Container */}
      <div
        className="w-full h-full transition-transform duration-300"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotateX}deg) rotateZ(${rotateZ}deg)`,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{ 
            filter: `drop-shadow(0 0 20px hsl(var(--primary) / 0.2))`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Terrain mesh */}
          <defs>
            <linearGradient id="terrainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--navy))" />
              <stop offset="100%" stopColor="hsl(var(--navy-light))" />
            </linearGradient>
            <linearGradient id="terrainHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--border) / 0.5)" />
              <stop offset="100%" stopColor="hsl(var(--navy))" />
            </linearGradient>
            <filter id="glow3d">
              <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* State base shape with gradient */}
          <path
            d="M15 45 Q10 30 25 20 Q45 10 70 15 Q85 20 88 35 Q92 50 85 65 Q78 80 55 85 Q35 88 22 78 Q12 68 15 45"
            fill="url(#terrainGradient)"
            stroke="hsl(var(--border))"
            strokeWidth="0.3"
            className="opacity-90"
          />

          {/* 3D Terrain grid lines - horizontal */}
          {terrainGrid.map((row, i) => {
            if (i === 0) return null;
            const points = row.map((p, j) => {
              const prev = terrainGrid[i - 1][j];
              return `${p.x},${p.y - p.z * 0.3}`;
            }).join(' ');
            
            return (
              <polyline
                key={`h-${i}`}
                points={points}
                fill="none"
                stroke="hsl(var(--cyan) / 0.15)"
                strokeWidth="0.15"
              />
            );
          })}

          {/* 3D Terrain grid lines - vertical */}
          {Array.from({ length: GRID_SIZE + 1 }).map((_, j) => {
            const points = terrainGrid.map((row) => {
              const p = row[j];
              return `${p.x},${p.y - p.z * 0.3}`;
            }).join(' ');
            
            return (
              <polyline
                key={`v-${j}`}
                points={points}
                fill="none"
                stroke="hsl(var(--cyan) / 0.1)"
                strokeWidth="0.15"
              />
            );
          })}

          {/* Contour lines for elevation */}
          {[2, 4, 6, 8].map((level, idx) => (
            <path
              key={`contour-${idx}`}
              d={`M ${20 + idx * 10} ${25 + idx * 5} 
                  Q ${35 + idx * 8} ${20 + idx * 3} ${55 + idx * 5} ${30 + idx * 4}
                  Q ${70 + idx * 3} ${40 + idx * 5} ${75 - idx * 2} ${55 + idx * 3}`}
              fill="none"
              stroke={`hsl(var(--saffron) / ${0.1 + idx * 0.05})`}
              strokeWidth="0.2"
              strokeDasharray="2,2"
            />
          ))}

          {/* Migration arcs with 3D effect */}
          {migrationArcs.map((arc, index) => {
            const path = getArcPath(arc.from, arc.to);
            const from = getDistrictById(arc.from);
            const opacity = getMigrationOpacity(0.4);
            
            return (
              <g key={`arc-${index}`}>
                {/* Arc shadow */}
                <path
                  d={path}
                  fill="none"
                  stroke="hsl(var(--cyan) / 0.1)"
                  strokeWidth="1.5"
                  transform="translate(0.3, 0.3)"
                />
                {/* Main arc */}
                <path
                  d={path}
                  fill="none"
                  stroke={`hsl(var(--cyan) / ${opacity})`}
                  strokeWidth="0.8"
                  filter="url(#glow3d)"
                />
                {/* Animated particle */}
                <motion.circle
                  r={isSimulated ? 0.6 : 1}
                  fill="hsl(var(--cyan))"
                  initial={{ offsetDistance: "0%" }}
                  animate={{ offsetDistance: "100%" }}
                  transition={{
                    duration: isSimulated ? 5 + index * 0.5 : 3 + index * 0.5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: index * 0.3,
                  }}
                  style={{
                    offsetPath: `path("${path}")`,
                    opacity: getMigrationOpacity(1),
                  }}
                />
              </g>
            );
          })}

          {/* District hotspots with 3D elevation */}
          {districts.map((district) => {
            const isHovered = hoveredDistrict === district.id;
            const isSelected = selectedDistrict === district.id;
            const isMumbai = district.id === "mumbai";
            const size = isMumbai ? 4 : 2 + district.drought * 2;
            const elevationOffset = district.elevation * 3;

            return (
              <g
                key={district.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredDistrict(district.id)}
                onMouseLeave={() => setHoveredDistrict(null)}
                onClick={() => onDistrictSelect?.(district)}
                style={{ transform: `translateY(-${elevationOffset}px)` }}
              >
                {/* Elevation line */}
                <line
                  x1={district.x}
                  y1={district.y}
                  x2={district.x}
                  y2={district.y + elevationOffset * 0.3}
                  stroke="hsl(var(--border) / 0.3)"
                  strokeWidth="0.3"
                  strokeDasharray="1,1"
                />

                {/* Base shadow */}
                <ellipse
                  cx={district.x}
                  cy={district.y + elevationOffset * 0.3 + 1}
                  rx={size * 0.8}
                  ry={size * 0.3}
                  fill="hsl(0 0% 0% / 0.3)"
                />

                {/* Outer glow */}
                <circle
                  cx={district.x}
                  cy={district.y}
                  r={size + 4}
                  fill={isMumbai 
                    ? "hsl(var(--cyan) / 0.15)" 
                    : `hsl(var(--saffron) / ${0.1 + (isSimulated ? -simulationIntensity * 0.05 : district.drought * 0.15)})`
                  }
                  className={isHovered || isSelected ? "opacity-100" : "opacity-60"}
                />

                {/* Main hotspot */}
                <motion.circle
                  cx={district.x}
                  cy={district.y}
                  r={size}
                  fill={isMumbai ? "hsl(var(--cyan))" : "hsl(var(--saffron))"}
                  opacity={isSimulated 
                    ? Math.max(0.3, 0.6 + district.drought * 0.4 - simulationIntensity * 0.3) 
                    : 0.6 + district.drought * 0.4
                  }
                  animate={{
                    r: isHovered || isSelected ? size + 1.5 : size,
                    opacity: isHovered || isSelected ? 1 : isSimulated 
                      ? Math.max(0.3, 0.6 + district.drought * 0.4 - simulationIntensity * 0.3)
                      : 0.6 + district.drought * 0.4,
                  }}
                  transition={{ duration: 0.2 }}
                  filter="url(#glow3d)"
                />

                {/* Inner highlight for 3D effect */}
                <circle
                  cx={district.x - size * 0.2}
                  cy={district.y - size * 0.2}
                  r={size * 0.3}
                  fill="hsl(0 0% 100% / 0.3)"
                />

                {/* Pulse ring for high drought */}
                {district.drought > 0.7 && !isSimulated && (
                  <circle
                    cx={district.x}
                    cy={district.y}
                    r={size}
                    fill="none"
                    stroke="hsl(var(--saffron))"
                    strokeWidth="0.3"
                    opacity={(Math.sin(animationPhase * 0.1) + 1) / 4}
                  >
                    <animate
                      attributeName="r"
                      from={size}
                      to={size + 5}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.5"
                      to="0"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Label */}
                {(isHovered || isSelected) && (
                  <motion.g
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <rect
                      x={district.x - 14}
                      y={district.y - 14}
                      width="28"
                      height="9"
                      rx="2"
                      fill="hsl(var(--card))"
                      stroke="hsl(var(--border))"
                      strokeWidth="0.3"
                    />
                    <text
                      x={district.x}
                      y={district.y - 8}
                      textAnchor="middle"
                      fill="hsl(var(--foreground))"
                      fontSize="3.5"
                      fontFamily="Inter, sans-serif"
                      fontWeight="500"
                    >
                      {district.name}
                    </text>
                  </motion.g>
                )}
              </g>
            );
          })}

          {/* Simulated overlay effect */}
          {isSimulated && (
            <rect
              x="0"
              y="0"
              width="100"
              height="100"
              fill="hsl(var(--cyan) / 0.05)"
              className="pointer-events-none"
            />
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 glass-card p-2 sm:p-3 rounded-lg">
        <div className="text-xs font-medium text-foreground mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Drought Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-secondary" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Destination</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 sm:w-6 h-0.5 bg-secondary opacity-50" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Migration Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 sm:w-6 h-px bg-cyan-500/30" style={{ borderTop: '1px dashed' }} />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Terrain Contour</span>
          </div>
        </div>
      </div>

      {/* 3D Controls hint */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 glass-card px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg">
        <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">3D TERRAIN VIEW</span>
      </div>
    </div>
  );
};
