import { motion } from "framer-motion";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MapBoxMaharashtra } from "@/components/visualizations/MapBoxMaharashtra";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAISimulation, AISimulationResult } from "@/hooks/useSimulationRuns";
import { Droplets, Zap, RotateCcw, Play, Loader2, Sparkles, MapPin, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const PolicySimulator = () => {
  // Lever states for policy inputs
  const [waterSubsidy, setWaterSubsidy] = useState([50]);
  const [climatePolicy, setClimatePolicy] = useState([30]);
  const [monsoonModifier, setMonsoonModifier] = useState([0]);
  const [butterflyEffect, setButterflyEffect] = useState(false);

  // Simulation result states
  const [isSimulating, setIsSimulating] = useState(false);
  const [aiResult, setAIResult] = useState<AISimulationResult | null>(null);

  const aiSimulation = useAISimulation();

  const runSimulation = async () => {
    setIsSimulating(true);

    try {
      const result = await aiSimulation.mutateAsync({
        water_subsidy_input: waterSubsidy[0],
        climate_policy_input: climatePolicy[0],
        monsoon_modifier: monsoonModifier[0],
        butterfly_effect_enabled: butterflyEffect,
        run_name: `AI Sim: W-${waterSubsidy[0]}% | C-${climatePolicy[0]}%`,
      });

      setAIResult(result);

      toast.success("AI Simulation Complete", {
        description: `Predicted ${result.summary.total_prevented_migration.toLocaleString()} lives stabilized and identified ${result.summary.suitable_destinations_count} suitable destinations.`,
      });
    } catch (error) {
      toast.error("Simulation failed. Please verify database connectivity.");
    } finally {
      setIsSimulating(false);
    }
  };

  const suitableDistricts = aiResult?.districts.filter(d => d.is_suitable_destination) || [];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 pl-12 lg:pl-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Policy Simulator (AI Powered)</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AIM Model: High-fidelity causal projections of migration paths
        </p>
      </motion.div>

      {/* Dynamic Metric Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-6 glass-card p-6 lg:p-8 rounded-xl text-center glow-saffron border border-primary/30 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Sparkles className="w-12 h-12 text-primary" />
        </div>
        <span className="text-xs lg:text-sm font-medium text-muted-foreground uppercase tracking-wider">Projected Lives Stabilized</span>
        <div className="text-5xl lg:text-6xl font-bold font-mono text-primary mt-2">
          {(aiResult?.summary.total_prevented_migration || 0).toLocaleString()}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-4 lg:gap-8">
          <div className="text-center min-w-[100px]">
            <p className="text-[10px] lg:text-xs text-muted-foreground uppercase">Drought Reduction</p>
            <p className="text-lg lg:text-xl font-bold text-success">-{aiResult?.summary.avg_drought_reduction || 0}%</p>
          </div>
          <div className="text-center min-w-[100px]">
            <p className="text-[10px] lg:text-xs text-muted-foreground uppercase">Model Confidence</p>
            <p className="text-lg lg:text-xl font-bold text-primary">{aiResult?.summary.confidence_score || 0}%</p>
          </div>
          <div className="text-center min-w-[100px]">
            <p className="text-[10px] lg:text-xs text-muted-foreground uppercase">Safe Zones Found</p>
            <p className="text-lg lg:text-xl font-bold text-secondary">{aiResult?.summary.suitable_destinations_count || 0}</p>
          </div>
        </div>
      </motion.div>

      {/* Projection Maps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-card p-4 lg:p-6 rounded-xl">
          <h2 className="text-sm lg:text-base font-semibold mb-4 text-destructive flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Status Quo Reality
          </h2>
          <div className="h-[300px] lg:h-[400px] rounded-lg overflow-hidden border border-border">
            <MapBoxMaharashtra mode="current" />
          </div>
        </div>

        <div className={`glass-card p-4 lg:p-6 rounded-xl transition-all duration-500 border border-success/30 ${isSimulating ? "glow-cyan shadow-[0_0_30px_-5px_hsl(var(--primary))] " : ""}`}>
          <h2 className="text-sm lg:text-base font-semibold mb-4 text-success flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> AI-Projected Future
          </h2>
          <div className="h-[300px] lg:h-[400px] rounded-lg overflow-hidden relative border border-border">
            <MapBoxMaharashtra mode="simulated" />
            {isSimulating && (
              <div className="absolute inset-0 bg-background/50 flex flex-col items-center justify-center z-10 backdrop-blur-[2px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <span className="text-xs font-mono animate-pulse">Running AIM Model...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Control Panel */}
        <div className="lg:col-span-8 glass-card p-6 rounded-xl">
          <h2 className="text-base lg:text-lg font-semibold mb-6">Policy Intervention Levers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-8">
              <PolicySlider label="Water Infrastructure Subsidies" value={waterSubsidy} setter={setWaterSubsidy} icon={<Droplets className="text-secondary" />} color="secondary" />
              <PolicySlider label="Climate Policy Stringency" value={climatePolicy} setter={setClimatePolicy} icon={<Zap className="text-primary" />} color="primary" />
            </div>

            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="font-bold text-sm">🦋 Butterfly Effect</span>
                    <p className="text-[10px] lg:text-xs text-muted-foreground italic">Modify historical monsoon intensity</p>
                  </div>
                  <Switch checked={butterflyEffect} onCheckedChange={setButterflyEffect} />
                </div>
                {butterflyEffect && (
                  <Slider value={monsoonModifier} onValueChange={setMonsoonModifier} min={-20} max={20} step={1} />
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={runSimulation} disabled={isSimulating} className="flex-1 py-4 rounded-lg bg-gradient-saffron text-white font-bold flex items-center justify-center gap-2 glow-saffron hover:opacity-90 transition-opacity">
                  {isSimulating ? <Loader2 className="animate-spin" /> : <Play />} Run AI Simulation
                </button>
                <button onClick={() => { setWaterSubsidy([50]); setClimatePolicy([30]); setAIResult(null); }} className="px-5 py-4 rounded-lg border border-border text-muted-foreground hover:bg-muted/50 transition-colors">
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Suitable Destinations Panel */}
        <div className="lg:col-span-4 glass-card p-6 rounded-xl border border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-secondary" />
            <h3 className="font-semibold text-foreground">Suitable Destinations</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">AI identified these districts as resilient choices for internal migration based on projected water security.</p>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20">
            {suitableDistricts.length > 0 ? suitableDistricts.map((d) => (
              <motion.div
                key={d.district_id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border group hover:border-primary/40 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{d.district_name}</p>
                  <p className="text-[10px] text-muted-foreground">Drought: {d.simulated_drought}%</p>
                </div>
                <div className="text-right">
                  <CheckCircle2 className="w-4 h-4 text-success opacity-50 group-hover:opacity-100 transition-opacity" />
                  <p className="text-[10px] text-success font-medium">Safe Zone</p>
                </div>
              </motion.div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Loader2 className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-xs">Run simulation to identify<br />suitable destinations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const PolicySlider = ({ label, value, setter, icon, color }: any) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <span className={`font-mono font-bold text-${color}`}>{value[0]}%</span>
    </div>
    <Slider value={value} onValueChange={setter} max={100} className={`[&_[role=slider]]:bg-${color}`} />
  </div>
);

export default PolicySimulator;