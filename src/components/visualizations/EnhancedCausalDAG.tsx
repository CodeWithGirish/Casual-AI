import { motion } from "framer-motion";
import { useCausalLinks, formatVariableName, getConfidenceLevel } from "@/hooks/useCausalLinks";
import { Loader2, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useState, useMemo } from "react";

// Dynamic node positioning based on causal relationships
const generateNodeLayout = (causalLinks: any[]) => {
  const nodes = new Map<string, { x: number; y: number; layer: number; connections: number }>();

  // Find all unique variables
  const allVars = new Set<string>();
  const incomingEdges = new Map<string, number>();
  const outgoingEdges = new Map<string, number>();

  causalLinks.forEach(link => {
    allVars.add(link.cause_variable);
    allVars.add(link.effect_variable);
    incomingEdges.set(link.effect_variable, (incomingEdges.get(link.effect_variable) || 0) + 1);
    outgoingEdges.set(link.cause_variable, (outgoingEdges.get(link.cause_variable) || 0) + 1);
  });

  // Determine layers based on topological order
  const layers: string[][] = [[], [], [], [], []];
  const assigned = new Set<string>();

  // Layer 0: Climate drivers (no incoming edges or mostly outgoing)
  allVars.forEach(v => {
    const incoming = incomingEdges.get(v) || 0;
    const outgoing = outgoingEdges.get(v) || 0;
    if (incoming === 0 || (outgoing > incoming * 2)) {
      layers[0].push(v);
      assigned.add(v);
    }
  });

  // Layer 4: Final outcomes (no outgoing edges)
  allVars.forEach(v => {
    if (assigned.has(v)) return;
    const outgoing = outgoingEdges.get(v) || 0;
    if (outgoing === 0) {
      layers[4].push(v);
      assigned.add(v);
    }
  });

  // Distribute remaining nodes across middle layers
  const remaining = Array.from(allVars).filter(v => !assigned.has(v));
  remaining.forEach((v, i) => {
    const layerIndex = (i % 3) + 1; // Layers 1, 2, or 3
    layers[layerIndex].push(v);
  });

  // Calculate positions
  const padding = 60;
  const width = 800;
  const height = 400;

  layers.forEach((layer, layerIndex) => {
    const x = padding + (layerIndex * (width - 2 * padding)) / 4;
    layer.forEach((nodeName, nodeIndex) => {
      const layerHeight = layer.length > 1 ? (height - 2 * padding) / (layer.length - 1) : 0;
      const y = padding + (layer.length > 1 ? nodeIndex * layerHeight : (height - 2 * padding) / 2);
      nodes.set(nodeName, {
        x,
        y,
        layer: layerIndex,
        connections: (incomingEdges.get(nodeName) || 0) + (outgoingEdges.get(nodeName) || 0)
      });
    });
  });

  return nodes;
};

const getNodeColor = (nodeName: string, layer: number) => {
  const colorMap: Record<string, string> = {
    // Climate factors
    rainfall_deficit: "hsl(var(--warning))",
    monsoon_delay: "hsl(var(--warning))",
    temperature_rise: "hsl(var(--destructive))",
    groundwater_depletion: "hsl(var(--warning))",
    // Agricultural impacts
    crop_failure: "hsl(var(--destructive))",
    yield_reduction: "hsl(var(--destructive))",
    water_stress: "hsl(var(--warning))",
    sowing_delay: "hsl(var(--warning))",
    evapotranspiration: "hsl(var(--muted-foreground))",
    // Economic impacts
    farmer_debt: "hsl(var(--primary))",
    income_loss: "hsl(var(--primary))",
    // Migration
    distress_migration: "hsl(var(--destructive))",
    // Policy interventions
    water_subsidy: "hsl(var(--success))",
    climate_policy: "hsl(var(--success))",
  };

  if (colorMap[nodeName]) return colorMap[nodeName];

  // Default colors based on layer
  const layerColors = [
    "hsl(var(--warning))",
    "hsl(var(--muted-foreground))",
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--destructive))",
  ];
  return layerColors[layer] || "hsl(var(--muted-foreground))";
};

interface Props {
  onNodeClick?: (nodeName: string) => void;
  selectedNode?: string | null;
}

export const EnhancedCausalDAG = ({ onNodeClick, selectedNode }: Props) => {
  const { data: causalLinks, isLoading, error } = useCausalLinks();
  const [zoom, setZoom] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodeLayout = useMemo(() => {
    if (!causalLinks?.length) return new Map();
    return generateNodeLayout(causalLinks);
  }, [causalLinks]);

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !causalLinks?.length) {
    return (
      <div className="h-80 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">No causal links found</p>
          <p className="text-xs mt-1">Run causal discovery analysis first</p>
        </div>
      </div>
    );
  }

  const viewBox = `0 0 ${800 / zoom} ${400 / zoom}`;

  return (
    <div className="relative">
      {/* Zoom controls */}
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        <button
          onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
          className="p-1.5 rounded bg-muted/80 hover:bg-muted text-foreground"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
          className="p-1.5 rounded bg-muted/80 hover:bg-muted text-foreground"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="p-1.5 rounded bg-muted/80 hover:bg-muted text-foreground"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <svg viewBox={viewBox} className="w-full h-80 bg-background/50 rounded-lg">
        <defs>
          <marker
            id="dag-arrow"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--muted-foreground))" />
          </marker>
          <marker
            id="dag-arrow-highlight"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--primary))" />
          </marker>
          <marker
            id="dag-arrow-negative"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--success))" />
          </marker>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {causalLinks.map((link, i) => {
          const fromPos = nodeLayout.get(link.cause_variable);
          const toPos = nodeLayout.get(link.effect_variable);
          if (!fromPos || !toPos) return null;

          const isNegative = link.strength < 0;
          const isHighlighted = hoveredNode === link.cause_variable || hoveredNode === link.effect_variable ||
            selectedNode === link.cause_variable || selectedNode === link.effect_variable;
          const strokeWidth = Math.abs(link.strength) * 3 + 1;
          const opacity = isHighlighted ? 1 : Math.abs(link.strength) * 0.5 + 0.2;

          // Calculate control point for curved edges
          const midX = (fromPos.x + toPos.x) / 2;
          const midY = (fromPos.y + toPos.y) / 2;
          const dx = toPos.x - fromPos.x;
          const dy = toPos.y - fromPos.y;
          const controlOffset = Math.min(40, Math.sqrt(dx * dx + dy * dy) * 0.2);
          const controlY = midY + (i % 2 === 0 ? -controlOffset : controlOffset);

          return (
            <g key={`edge-${i}`}>
              <motion.path
                d={`M ${fromPos.x + 45} ${fromPos.y} Q ${midX} ${controlY} ${toPos.x - 45} ${toPos.y}`}
                fill="none"
                stroke={isNegative ? "hsl(var(--success))" : isHighlighted ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                strokeWidth={strokeWidth}
                strokeOpacity={opacity}
                strokeDasharray={isNegative ? "8,4" : undefined}
                markerEnd={isNegative ? "url(#dag-arrow-negative)" : isHighlighted ? "url(#dag-arrow-highlight)" : "url(#dag-arrow)"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: i * 0.05 }}
              />

              {/* Edge label */}
              {isHighlighted && (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <rect
                    x={midX - 35}
                    y={controlY - 25}
                    width="70"
                    height="28"
                    rx="4"
                    fill="hsl(var(--card))"
                    stroke="hsl(var(--border))"
                    filter="url(#glow)"
                  />
                  <text
                    x={midX}
                    y={controlY - 14}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="hsl(var(--foreground))"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {(link.strength * 100).toFixed(0)}%
                  </text>
                  <text
                    x={midX}
                    y={controlY - 4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="hsl(var(--primary))"
                    fontSize="7"
                    fontFamily="Inter, sans-serif"
                  >
                    {link.causal_reasoning || "Causal Path"}
                  </text>
                </motion.g>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {Array.from(nodeLayout.entries()).map(([nodeName, pos], i) => {
          const isHighlighted = hoveredNode === nodeName || selectedNode === nodeName;
          const nodeColor = getNodeColor(nodeName, pos.layer);
          const nodeSize = 40 + pos.connections * 2;

          // Get p-value for this node's causal links
          const relatedLinks = causalLinks.filter(
            l => l.cause_variable === nodeName || l.effect_variable === nodeName
          );
          const avgPValue = relatedLinks.length > 0
            ? relatedLinks.reduce((sum, l) => sum + (l.p_value || 0.05), 0) / relatedLinks.length
            : null;

          return (
            <motion.g
              key={nodeName}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 + 0.5 }}
              onMouseEnter={() => setHoveredNode(nodeName)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => onNodeClick?.(nodeName)}
              style={{ cursor: "pointer" }}
            >
              {/* Node glow */}
              {isHighlighted && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeSize / 2 + 8}
                  fill={nodeColor}
                  opacity={0.2}
                  filter="url(#glow)"
                />
              )}

              {/* Node circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={nodeSize / 2}
                fill="hsl(var(--card))"
                stroke={nodeColor}
                strokeWidth={isHighlighted ? 3 : 2}
              />

              {/* Node label */}
              <text
                x={pos.x}
                y={pos.y - 4}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="hsl(var(--foreground))"
                fontSize="9"
                fontWeight="500"
              >
                {formatVariableName(nodeName).split(" ").slice(0, 1).join(" ")}
              </text>
              <text
                x={pos.x}
                y={pos.y + 7}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="hsl(var(--muted-foreground))"
                fontSize="8"
              >
                {formatVariableName(nodeName).split(" ").slice(1, 2).join(" ")}
              </text>

              {/* Confidence indicator */}
              {avgPValue !== null && (
                <text
                  x={pos.x}
                  y={pos.y + nodeSize / 2 + 12}
                  textAnchor="middle"
                  fill="hsl(var(--muted-foreground))"
                  fontSize="7"
                  fontFamily="JetBrains Mono, monospace"
                >
                  p={avgPValue.toFixed(3)}
                </text>
              )}
            </motion.g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-muted-foreground" />
          <span className="text-muted-foreground">Positive Effect</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-success" style={{ borderTop: "2px dashed" }} />
          <span className="text-muted-foreground">Negative (Policy)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-muted-foreground">Climate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-muted-foreground">Impact</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-muted-foreground">Intervention</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-2 flex justify-between text-xs text-muted-foreground font-mono">
        <span>{causalLinks.length} causal links</span>
        <span>{nodeLayout.size} variables</span>
        <span>{causalLinks.filter(l => l.is_nonlinear).length} nonlinear</span>
      </div>
    </div>
  );
};

export default EnhancedCausalDAG;
