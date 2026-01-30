import { motion } from "framer-motion";
import { useCausalLinks, formatVariableName, getConfidenceLevel } from "@/hooks/useCausalLinks";
import { Loader2 } from "lucide-react";

// Node positions in the DAG visualization
const nodePositions: Record<string, { x: number; y: number; color: string }> = {
  rainfall_deficit: { x: 20, y: 20, color: "hsl(var(--secondary))" },
  monsoon_delay: { x: 20, y: 50, color: "hsl(var(--secondary))" },
  groundwater_depletion: { x: 20, y: 80, color: "hsl(var(--secondary))" },
  temperature_rise: { x: 50, y: 15, color: "hsl(var(--warning))" },
  evapotranspiration: { x: 50, y: 35, color: "hsl(var(--warning))" },
  water_stress: { x: 50, y: 60, color: "hsl(var(--warning))" },
  sowing_delay: { x: 50, y: 85, color: "hsl(var(--warning))" },
  crop_failure: { x: 80, y: 30, color: "hsl(var(--primary))" },
  yield_reduction: { x: 80, y: 55, color: "hsl(var(--primary))" },
  farmer_debt: { x: 80, y: 75, color: "hsl(var(--primary))" },
  income_loss: { x: 110, y: 45, color: "hsl(var(--destructive))" },
  distress_migration: { x: 140, y: 50, color: "hsl(var(--destructive))" },
  water_subsidy: { x: 80, y: 95, color: "hsl(var(--success))" },
  climate_policy: { x: 110, y: 85, color: "hsl(var(--success))" },
};

export const DynamicCausalDAG = () => {
  const { data: causalLinks, isLoading, error } = useCausalLinks();

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !causalLinks) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        Failed to load causal links
      </div>
    );
  }

  // Get unique nodes from the links
  const nodes = new Set<string>();
  causalLinks.forEach((link) => {
    nodes.add(link.cause_variable);
    nodes.add(link.effect_variable);
  });

  const nodeArray = Array.from(nodes);

  return (
    <div className="relative">
      <svg viewBox="0 0 160 110" className="w-full h-48">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="6"
            markerHeight="4"
            refX="5"
            refY="2"
            orient="auto"
          >
            <polygon points="0 0, 6 2, 0 4" fill="hsl(var(--muted-foreground))" />
          </marker>
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {causalLinks.map((link, i) => {
          const fromPos = nodePositions[link.cause_variable];
          const toPos = nodePositions[link.effect_variable];
          if (!fromPos || !toPos) return null;

          const isNegative = link.strength < 0;
          const strokeWidth = Math.abs(link.strength) * 2 + 0.5;
          const opacity = Math.abs(link.strength) * 0.6 + 0.3;

          return (
            <motion.line
              key={`edge-${i}`}
              x1={fromPos.x}
              y1={fromPos.y}
              x2={toPos.x}
              y2={toPos.y}
              stroke={isNegative ? "hsl(var(--success))" : "hsl(var(--muted-foreground))"}
              strokeWidth={strokeWidth}
              strokeOpacity={opacity}
              strokeDasharray={isNegative ? "3,2" : "none"}
              markerEnd="url(#arrowhead)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: i * 0.05 }}
            />
          );
        })}

        {/* Nodes */}
        {nodeArray.map((nodeName, i) => {
          const pos = nodePositions[nodeName];
          if (!pos) return null;

          // Find if this node is involved in nonlinear relationships
          const isNonlinear = causalLinks.some(
            (l) => (l.cause_variable === nodeName || l.effect_variable === nodeName) && l.is_nonlinear
          );

          return (
            <motion.g
              key={nodeName}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 + 0.3 }}
            >
              {/* Node circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isNonlinear ? 5 : 4}
                fill={pos.color}
                filter={isNonlinear ? "url(#nodeGlow)" : undefined}
                stroke="hsl(var(--background))"
                strokeWidth="0.5"
              />
              {/* Node label */}
              <text
                x={pos.x}
                y={pos.y + 9}
                textAnchor="middle"
                fill="hsl(var(--foreground))"
                fontSize="3.5"
                fontFamily="Inter, sans-serif"
              >
                {formatVariableName(nodeName).split(" ").slice(0, 2).join(" ")}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute top-0 right-0 text-[10px] space-y-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-muted-foreground" />
          <span className="text-muted-foreground">Positive</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-success border-dashed" style={{ borderTop: "1px dashed" }} />
          <span className="text-muted-foreground">Negative (Policy)</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>{causalLinks.length} causal links identified</span>
        <span>{causalLinks.filter((l) => l.is_nonlinear).length} nonlinear relationships</span>
      </div>
    </div>
  );
};

export default DynamicCausalDAG;
