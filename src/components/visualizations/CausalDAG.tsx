import { motion } from "framer-motion";

const nodes = [
  { id: "rain", label: "Lack of Rain", x: 50, y: 80, color: "secondary" },
  { id: "crop", label: "Crop Failure", x: 150, y: 80, color: "warning" },
  { id: "debt", label: "Loan Debt", x: 250, y: 80, color: "destructive" },
  { id: "migration", label: "Mumbai Migration", x: 350, y: 80, color: "primary" },
];

const edges = [
  { from: "rain", to: "crop", strength: 0.92 },
  { from: "crop", to: "debt", strength: 0.85 },
  { from: "debt", to: "migration", strength: 0.78 },
];

export const CausalDAG = () => {
  return (
    <div className="relative w-full h-48">
      <svg viewBox="0 0 420 160" className="w-full h-full">
        {/* Edges with animated arrows */}
        {edges.map((edge, index) => {
          const from = nodes.find((n) => n.id === edge.from)!;
          const to = nodes.find((n) => n.id === edge.to)!;

          return (
            <g key={`edge-${index}`}>
              {/* Edge line */}
              <motion.line
                x1={from.x + 40}
                y1={from.y}
                x2={to.x - 40}
                y2={to.y}
                stroke="hsl(var(--muted-foreground) / 0.4)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              />

              {/* Arrow head */}
              <polygon
                points={`${to.x - 45},${to.y - 5} ${to.x - 35},${to.y} ${to.x - 45},${to.y + 5}`}
                fill="hsl(var(--muted-foreground) / 0.6)"
              />

              {/* Strength label */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.2 }}
              >
                <rect
                  x={(from.x + to.x) / 2 - 12}
                  y={from.y - 25}
                  width="28"
                  height="16"
                  rx="4"
                  fill="hsl(var(--card))"
                  stroke="hsl(var(--border))"
                />
                <text
                  x={(from.x + to.x) / 2 + 2}
                  y={from.y - 14}
                  textAnchor="middle"
                  fill="hsl(var(--foreground))"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {(edge.strength * 100).toFixed(0)}%
                </text>
              </motion.g>

              {/* Animated particle */}
              <motion.circle
                r="3"
                fill="hsl(var(--primary))"
                initial={{ cx: from.x + 40, cy: from.y }}
                animate={{
                  cx: [from.x + 40, to.x - 40],
                  cy: [from.y, to.y],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.5,
                  ease: "easeInOut",
                }}
                style={{ filter: "drop-shadow(0 0 4px hsl(var(--primary)))" }}
              />
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node, index) => (
          <motion.g
            key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {/* Glow */}
            <circle
              cx={node.x}
              cy={node.y}
              r="35"
              fill={`hsl(var(--${node.color}) / 0.1)`}
            />

            {/* Node circle */}
            <circle
              cx={node.x}
              cy={node.y}
              r="28"
              fill="hsl(var(--card))"
              stroke={`hsl(var(--${node.color}))`}
              strokeWidth="2"
            />

            {/* Node label */}
            <text
              x={node.x}
              y={node.y - 3}
              textAnchor="middle"
              fill="hsl(var(--foreground))"
              fontSize="9"
              fontFamily="Inter, sans-serif"
              fontWeight="500"
            >
              {node.label.split(" ")[0]}
            </text>
            <text
              x={node.x}
              y={node.y + 8}
              textAnchor="middle"
              fill="hsl(var(--foreground))"
              fontSize="9"
              fontFamily="Inter, sans-serif"
              fontWeight="500"
            >
              {node.label.split(" ").slice(1).join(" ")}
            </text>
          </motion.g>
        ))}
      </svg>

      {/* Title */}
      <div className="absolute top-2 left-2">
        <span className="text-xs font-mono text-muted-foreground">CAUSAL DISCOVERY ENGINE</span>
      </div>
    </div>
  );
};
