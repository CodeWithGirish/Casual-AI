import { motion } from "framer-motion";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Slider } from "@/components/ui/slider";
import { MapBoxMaharashtra } from "@/components/visualizations/MapBoxMaharashtra";
import { useDistricts, District } from "@/hooks/useDistricts";
import { useImpactPrediction } from "@/hooks/useImpactPrediction";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { MapPin, Droplets, Users, Building, Calendar, Loader2, Sparkles, TrendingDown, Waves } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AIImpactCard = ({ districtId, budget, timeHorizon, scale }: { districtId: string, budget: number, timeHorizon: number, scale: number }) => {
  const { data: impact, isLoading } = useImpactPrediction({ district_id: districtId, budget, time_horizon: timeHorizon, scale });

  if (isLoading) return (
    <div className="glass-card p-6 rounded-xl animate-pulse flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-4 lg:p-6 rounded-xl border border-primary/20 bg-primary/5 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-2 opacity-10">
        <Sparkles className="w-12 h-12 text-primary" />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-sm lg:text-base font-bold text-foreground">AI Impact Prediction</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] lg:text-xs text-muted-foreground uppercase font-semibold">
            <TrendingDown className="w-3 h-3 text-success" />
            Migration Reduction
          </div>
          <div className="text-xl lg:text-2xl font-bold text-success font-mono">
            {impact?.projected_migration_reduction}%
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] lg:text-xs text-muted-foreground uppercase font-semibold">
            <Waves className="w-3 h-3 text-secondary" />
            Water Improvement
          </div>
          <div className="text-xl lg:text-2xl font-bold text-secondary font-mono">
            {impact?.projected_water_improvement}%
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-primary/10">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Lives Stabilized</p>
            <p className="text-lg font-bold text-foreground">{impact?.lives_stabilized?.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground mb-1">Model Confidence</p>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${impact?.impact_score}%` }} />
              </div>
              <span className="text-[10px] font-bold text-primary">{impact?.impact_score}%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const RegionalConfig = () => {
  // Enable real-time updates
  useRealtimeData();

  const navigate = useNavigate();
  const { data: districts, isLoading } = useDistricts();
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [budget, setBudget] = useState([500]);
  const [timeHorizon, setTimeHorizon] = useState([10]);
  const [projectScale, setProjectScale] = useState([50]);

  const handleDistrictSelect = (district: District) => {
    setSelectedDistrict(district);
  };

  const baselineData = selectedDistrict ? {
    waterLevel: selectedDistrict.water_stress_index,
    population: (selectedDistrict.population || 0) / 1000000,
    infrastructure: 100 - selectedDistrict.drought_index,
    rainfall: 650 + (selectedDistrict.elevation * 0.5),
  } : {
    waterLevel: 50,
    population: 2.5,
    infrastructure: 60,
    rainfall: 800,
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 lg:mb-6 pl-12 lg:pl-0"
      >
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
          Regional Configuration
        </h1>
        <p className="text-sm lg:text-base text-muted-foreground mt-1">
          Set the stage before your causal impact analysis begins
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Map Picker */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-12 glass-card p-4 lg:p-6 rounded-xl"
        >
          <h2 className="text-base lg:text-lg font-semibold text-foreground mb-4">
            Interactive Map Picker
          </h2>

          <div className="mb-4 p-3 rounded-lg bg-muted/50 flex items-center gap-3">
            <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-primary flex-shrink-0" />
            <span className="text-sm lg:text-base">
              {selectedDistrict
                ? <span className="font-medium text-foreground">{selectedDistrict.name}, Maharashtra</span>
                : <span className="text-muted-foreground">Click on a district to select</span>
              }
            </span>
          </div>

          <div className="relative h-[300px] sm:h-[350px] lg:h-[400px] rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full bg-muted/30">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <MapBoxMaharashtra
                mode="current"
                onDistrictSelect={handleDistrictSelect}
                selectedDistrict={selectedDistrict?.id}
              />
            )}
          </div>
        </motion.div>

        {/* Baseline Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 glass-card p-4 lg:p-6 rounded-xl"
        >
          <h2 className="text-base lg:text-lg font-semibold text-foreground mb-4">
            Baseline Data {selectedDistrict && <span className="text-primary">- {selectedDistrict.name}</span>}
          </h2>
          <div className="space-y-3 lg:space-y-4">
            <div className="flex items-center justify-between p-2 lg:p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 lg:gap-3">
                <Droplets className="w-4 h-4 lg:w-5 lg:h-5 text-secondary" />
                <span className="text-xs lg:text-sm">Water Stress</span>
              </div>
              <span className="font-mono text-sm lg:text-base text-foreground">
                {baselineData.waterLevel.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between p-2 lg:p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 lg:gap-3">
                <Users className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                <span className="text-xs lg:text-sm">Population</span>
              </div>
              <span className="font-mono text-sm lg:text-base text-foreground">
                {baselineData.population.toFixed(2)}M
              </span>
            </div>
            <div className="flex items-center justify-between p-2 lg:p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 lg:gap-3">
                <Building className="w-4 h-4 lg:w-5 lg:h-5 text-success" />
                <span className="text-xs lg:text-sm">Infra Score</span>
              </div>
              <span className="font-mono text-sm lg:text-base text-foreground">
                {baselineData.infrastructure.toFixed(0)}/100
              </span>
            </div>
          </div>
        </motion.div>

        {/* Project Parameters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-4 glass-card p-4 lg:p-6 rounded-xl"
        >
          <h2 className="text-base lg:text-lg font-semibold text-foreground mb-4">
            Project Parameters
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Budget: ₹{budget[0]} Cr</span>
              </div>
              <Slider value={budget} onValueChange={setBudget} min={100} max={2000} step={50} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Horizon: {timeHorizon[0]} yrs</span>
              </div>
              <Slider value={timeHorizon} onValueChange={setTimeHorizon} min={5} max={25} step={5} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Scale: {projectScale[0]}%</span>
              </div>
              <Slider value={projectScale} onValueChange={setProjectScale} min={10} max={100} step={10} />
            </div>
          </div>
        </motion.div>

        {/* AI Prediction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-4"
        >
          {selectedDistrict ? (
            <AIImpactCard
              districtId={selectedDistrict.id}
              budget={budget[0]}
              timeHorizon={timeHorizon[0]}
              scale={projectScale[0]}
            />
          ) : (
            <div className="glass-card p-4 lg:p-6 rounded-xl h-full flex flex-col items-center justify-center text-center opacity-50">
              <Sparkles className="w-8 h-8 mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Select a district to see AI Impact Prediction</p>
            </div>
          )}
        </motion.div>

        {/* Start Analysis Button */}
        <div className="lg:col-span-12">
          <button
            onClick={() => navigate("/counterfactual")}
            disabled={!selectedDistrict}
            className="w-full py-4 rounded-lg bg-gradient-saffron text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-saffron disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
          >
            Proceed to Counterfactual Analysis →
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RegionalConfig;
