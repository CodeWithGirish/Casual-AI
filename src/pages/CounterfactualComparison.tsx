import { motion } from "framer-motion";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Switch } from "@/components/ui/switch";
import { useCounterfactualScenarios, useGenerateCounterfactual } from "@/hooks/useCounterfactualScenarios";
import { ArrowRight, TrendingUp, TrendingDown, Minus, BarChart3, Loader2, AlertCircle, Sparkles, ShieldAlert, History } from "lucide-react";

const CounterfactualComparison = () => {
  const [showIntervention, setShowIntervention] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState(0);
  const { data: scenarios, isLoading } = useCounterfactualScenarios();
  const generateCounterfactual = useGenerateCounterfactual();

  const currentScenario = scenarios?.[selectedScenario];

  const handleRunIntervention = async () => {
    await generateCounterfactual.mutateAsync({
      intervention_name: "Drought Resilience Taskforce",
      water_subsidy: 85,
      climate_policy: 60
    });
    setSelectedScenario(0); // Select the new one
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!scenarios || scenarios.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
          <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
          <p>No counterfactual scenarios found.</p>
          <button
            onClick={handleRunIntervention}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Run AI Counterfactual Discovery
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const treatmentEffects = [
    {
      metric: "Migration Reduction",
      value: Math.abs(currentScenario.treatment_effect_migration),
      unit: "families",
      direction: currentScenario.treatment_effect_migration < 0 ? "down" : "up"
    },
    {
      metric: "Water Security Gain",
      value: Math.abs(currentScenario.treatment_effect_water_stress),
      unit: "%",
      direction: currentScenario.treatment_effect_water_stress < 0 ? "up" : "down"
    },
    {
      metric: "Crop Protection",
      value: Math.abs(currentScenario.treatment_effect_crop_failure),
      unit: "%",
      direction: currentScenario.treatment_effect_crop_failure < 0 ? "up" : "down"
    },
    {
      metric: "Economic Savings",
      value: Math.abs(currentScenario.treatment_effect_economic),
      unit: "Cr",
      direction: currentScenario.treatment_effect_economic < 0 ? "up" : "down"
    },
  ];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 pl-12 lg:pl-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Counterfactual Comparison</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">Modeling nonlinear responses & causal treatment effects</p>
        </div>
        <button
          onClick={handleRunIntervention}
          disabled={generateCounterfactual.isPending}
          className="px-4 py-2 bg-gradient-saffron text-white rounded-lg flex items-center gap-2 glow-saffron text-sm font-bold disabled:opacity-50"
        >
          {generateCounterfactual.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Run New Scenario
        </button>
      </motion.div>

      <div className="mb-6 flex flex-wrap gap-2">
        {scenarios.map((scenario, index) => (
          <button
            key={scenario.id}
            onClick={() => setSelectedScenario(index)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${selectedScenario === index ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            <History className="w-3 h-3" /> {scenario.name}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mb-8 bg-muted/20 p-2 rounded-full w-fit mx-auto border border-border">
        <button
          onClick={() => setShowIntervention(false)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${!showIntervention ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
        >
          Status Quo
        </button>
        <button
          onClick={() => setShowIntervention(true)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${showIntervention ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
        >
          With Intervention
        </button>
      </div>

      <div className={`grid gap-4 lg:gap-6 mb-8 ${showIntervention ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 max-w-2xl mx-auto"}`}>
        <div className="glass-card p-4 lg:p-6 rounded-xl border-destructive/30">
          <span className="px-2 py-1 text-xs font-mono rounded bg-destructive/10 text-destructive border border-destructive/30">SCENARIO A (BASELINE)</span>
          <div className="space-y-4 mt-4">
            <MetricBox label="Projected Migration" value={currentScenario.baseline_migration.toLocaleString()} unit="families" color="text-destructive" />
            <MetricBox label="Avg Water Stress" value={`${currentScenario.baseline_water_stress}%`} color="text-warning" />
            <MetricBox label="Crop Failure Risk" value={`${currentScenario.baseline_crop_failure}%`} color="text-destructive" />
            <MetricBox label="Economic Burden" value={`₹${currentScenario.baseline_economic_loss} Cr`} color="text-foreground" />
          </div>
        </div>

        {showIntervention && (
          <div className="glass-card p-4 lg:p-6 rounded-xl border-success/30 glow-cyan">
            <span className="px-2 py-1 text-xs font-mono rounded bg-success/10 text-success border border-success/30">SCENARIO B (AI INTERVENTION)</span>
            <div className="space-y-4 mt-4">
              <MetricBox label="Projected Migration" value={currentScenario.projected_migration.toLocaleString()} subValue={`↓ ${Math.abs(currentScenario.treatment_effect_migration).toLocaleString()} stabilized`} color="text-success" />
              <MetricBox label="Water Stress Index" value={`${currentScenario.projected_water_stress}%`} color="text-success" />
              <MetricBox label="Crop Failure Rate" value={`${currentScenario.projected_crop_failure}%`} color="text-success" />
              <MetricBox label="Economic Outlook" value={`₹${currentScenario.projected_economic_loss} Cr`} color="text-success" />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass-card p-4 lg:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-secondary" />
            <h2 className="text-lg font-semibold">Causal Treatment Effect</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {treatmentEffects.map((effect) => (
              <div key={effect.metric} className="p-4 rounded-lg bg-secondary/5 border border-secondary/20 flex flex-col items-center">
                <div className="text-xl lg:text-3xl font-bold font-mono text-secondary">
                  {effect.direction === "up" ? "+" : "-"}{effect.value.toLocaleString()}<span className="text-sm ml-1">{effect.unit}</span>
                </div>
                <div className="text-[10px] lg:text-xs text-muted-foreground mt-1 uppercase tracking-wider">{effect.metric}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-4 lg:p-6 rounded-xl border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold">Confidence & Evidence</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase mb-1">Causal Confidence</p>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${currentScenario.confidence_score}%` }}
                    className="h-full bg-primary"
                  />
                </div>
                <span className="text-sm font-bold">{currentScenario.confidence_score}%</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase mb-1">Model Limitations</p>
              <p className="text-xs italic text-muted-foreground bg-background/50 p-2 rounded border border-border">
                {currentScenario.limitations || "No limitation data available."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 p-4 border border-dashed border-primary/40 rounded-xl bg-primary/5">
        <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> Planning Evidence for Long-term Adaptation
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The causal links identified above separate the baseline migration trends from specific climate-driven spikes.
          For long-term planning, the AI suggests prioritizing water infrastructure in districts with drought indices
          above 75%, as these exhibit threshold-based nonlinear migration surges.
        </p>
      </motion.div>
    </DashboardLayout>
  );
};

const MetricBox = ({ label, value, subValue, unit, color }: any) => (
  <div className="p-4 rounded-lg bg-muted/50">
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-xl font-bold font-mono ${color}`}>{value}</span>
    </div>
    {subValue && <span className="text-xs text-success font-medium">{subValue}</span>}
  </div>
);

export default CounterfactualComparison;