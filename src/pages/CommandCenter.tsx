import { motion } from "framer-motion";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MapBoxMaharashtra } from "@/components/visualizations/MapBoxMaharashtra";
import { EnhancedCausalDAG } from "@/components/visualizations/EnhancedCausalDAG";
import { DynamicAlertTicker } from "@/components/visualizations/DynamicAlertTicker";
import { SatelliteViewer } from "@/components/visualizations/SatelliteViewer";
import { StatCard } from "@/components/ui/StatCard";
import { useDistricts, District } from "@/hooks/useDistricts";
import { useCausalLinks } from "@/hooks/useCausalLinks";
import { Users, Droplets, MapPin, AlertTriangle, TrendingUp, Zap, Search } from "lucide-react";

// Added Select component imports
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CommandCenter = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const { data: districts, isLoading: districtsLoading } = useDistricts();
  const { data: causalLinks } = useCausalLinks();

  // Handle manual dropdown selection
  const handleDistrictChange = (districtId: string) => {
    const district = districts?.find((d) => d.id === districtId);
    if (district) {
      setSelectedDistrict(district);
    }
  };

  // Calculate dynamic stats from real data
  const stats = {
    totalMigrants: districts?.reduce((sum, d) => sum + Math.abs(d.net_migration), 0) || 0,
    districtsAtRisk: districts?.filter((d) => d.drought_index > 60).length || 0,
    avgWaterStress: districts?.reduce((sum, d) => sum + d.water_stress_index, 0) / (districts?.length || 1) || 0,
    avgCropFailure: districts?.reduce((sum, d) => sum + d.crop_failure_rate, 0) / (districts?.length || 1) || 0,
    mumbaiInflow: districts?.find((d) => d.code === "MUM")?.net_migration || 0,
    causalConfidence: causalLinks?.length ?
      (causalLinks.filter((l) => (l.p_value || 1) < 0.01).length / causalLinks.length) * 100 : 0,
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 lg:mb-6 pl-12 lg:pl-0"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
              Strategic Command Center
            </h1>
            <p className="text-sm lg:text-base text-muted-foreground mt-1">
              Real-time climate migration intelligence for Maharashtra
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="glass-card px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs lg:text-sm font-mono text-muted-foreground">
                Data: <span className="text-foreground">Live</span>
              </span>
            </div>
            <div className="glass-card px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg hidden sm:block">
              <span className="text-xs lg:text-sm font-mono text-muted-foreground">
                Districts: <span className="text-foreground">{districts?.length || 0}</span>
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Live Alert Ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-4 lg:mb-6"
      >
        <DynamicAlertTicker />
      </motion.div>

      {/* Stats Row - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4 mb-4 lg:mb-6">
        <StatCard
          title="Active Migrants"
          value={districtsLoading ? "..." : `${(stats.totalMigrants / 1000).toFixed(1)}K`}
          trend="up"
          trendValue={districtsLoading ? "" : `${districts?.filter(d => d.net_migration < 0).length} outflow`}
          icon={<Users className="w-4 h-4 lg:w-5 lg:h-5" />}
          variant="primary"
          delay={0.1}
        />
        <StatCard
          title="Districts at Risk"
          value={districtsLoading ? "..." : stats.districtsAtRisk.toString()}
          trend="up"
          trendValue={`>${60}% drought`}
          icon={<AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5" />}
          variant="destructive"
          delay={0.15}
        />
        <StatCard
          title="Avg Water Stress"
          value={districtsLoading ? "..." : `${stats.avgWaterStress.toFixed(0)}%`}
          trend={stats.avgWaterStress > 50 ? "up" : "down"}
          trendValue={stats.avgWaterStress > 50 ? "Critical" : "Moderate"}
          icon={<Droplets className="w-4 h-4 lg:w-5 lg:h-5" />}
          variant="warning"
          delay={0.2}
        />
        <StatCard
          title="Crop Failure Rate"
          value={districtsLoading ? "..." : `${stats.avgCropFailure.toFixed(0)}%`}
          trend="up"
          trendValue="Avg across districts"
          icon={<TrendingUp className="w-4 h-4 lg:w-5 lg:h-5" />}
          delay={0.25}
        />
        <StatCard
          title="Mumbai Inflow"
          value={districtsLoading ? "..." : `${(stats.mumbaiInflow / 1000).toFixed(1)}K`}
          subtitle="net migration"
          icon={<MapPin className="w-4 h-4 lg:w-5 lg:h-5" />}
          variant="secondary"
          delay={0.3}
        />
        <StatCard
          title="Causal Confidence"
          value={`${stats.causalConfidence.toFixed(0)}%`}
          subtitle="p < 0.01 validated"
          icon={<Zap className="w-4 h-4 lg:w-5 lg:h-5" />}
          variant="primary"
          delay={0.35}
        />
      </div>

      {/* Main Content - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Map & Satellite Section */}
        <div className="lg:col-span-7 space-y-4 lg:space-y-6">
          {/* Climate Migration Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4 lg:p-6 rounded-xl min-h-[350px] sm:min-h-[400px] lg:min-h-[500px]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <div>
                <h2 className="text-base lg:text-lg font-semibold text-foreground">
                  Climate Migration Map
                </h2>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  3D terrain with drought zones and migration flows
                </p>
              </div>

              {/* Integrated District Dropdown Selector */}
              <div className="flex items-center gap-2 min-w-[220px]">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Select
                  onValueChange={handleDistrictChange}
                  value={selectedDistrict?.id}
                >
                  <SelectTrigger className="w-full bg-background/50 border-primary/20 backdrop-blur-sm">
                    <SelectValue placeholder="Jump to District" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {districts?.map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="h-[280px] sm:h-[320px] lg:h-[420px] rounded-lg overflow-hidden">
              <MapBoxMaharashtra
                mode="current"
                onDistrictSelect={setSelectedDistrict}
                selectedDistrict={selectedDistrict?.id}
              />
            </div>
          </motion.div>

          {/* Satellite Ground Verification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <SatelliteViewer
              district={selectedDistrict}
              selectedLocation={
                selectedDistrict
                  ? {
                    lat: selectedDistrict.y_coord,
                    lng: selectedDistrict.x_coord,
                    name: selectedDistrict.name,
                    eventType: selectedDistrict.drought_index > 70 ? "drought" : undefined,
                  }
                  : null
              }
            />
          </motion.div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-5 space-y-4 lg:space-y-6">
          {/* Causal Discovery Engine */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4 lg:p-6 rounded-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base lg:text-lg font-semibold text-foreground">
                  Causal Discovery Engine
                </h2>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  Real-time causal inference from database
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-[10px] lg:text-xs font-mono rounded bg-primary/10 text-primary border border-primary/30">
                  {causalLinks?.length || 0} LINKS
                </span>
                <span className="px-2 py-1 text-[10px] lg:text-xs font-mono rounded bg-success/10 text-success border border-success/30">
                  LIVE
                </span>
              </div>
            </div>
            <EnhancedCausalDAG />
          </motion.div>

          {/* District Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-4 lg:p-6 rounded-xl"
          >
            <h2 className="text-base lg:text-lg font-semibold text-foreground mb-4">
              District Analysis
            </h2>
            {selectedDistrict ? (
              <div className="space-y-3 lg:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xl lg:text-2xl font-bold text-foreground">
                    {selectedDistrict.name}
                  </span>
                  <span
                    className={`px-2 lg:px-3 py-1 rounded-full text-[10px] lg:text-xs font-medium ${selectedDistrict.drought_index > 70
                      ? "bg-destructive/10 text-destructive border border-destructive/30"
                      : selectedDistrict.drought_index > 50
                        ? "bg-warning/10 text-warning border border-warning/30"
                        : "bg-success/10 text-success border border-success/30"
                      }`}
                  >
                    {selectedDistrict.drought_index > 70
                      ? "SEVERE"
                      : selectedDistrict.drought_index > 50
                        ? "MODERATE"
                        : "STABLE"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <div className="p-2 lg:p-3 rounded-lg bg-muted/50">
                    <span className="text-[10px] lg:text-xs text-muted-foreground">
                      Drought Index
                    </span>
                    <div className="text-lg lg:text-xl font-bold font-mono text-primary">
                      {selectedDistrict.drought_index.toFixed(0)}%
                    </div>
                  </div>
                  <div className="p-2 lg:p-3 rounded-lg bg-muted/50">
                    <span className="text-[10px] lg:text-xs text-muted-foreground">
                      Net Migration
                    </span>
                    <div className="text-lg lg:text-xl font-bold font-mono text-secondary">
                      {selectedDistrict.net_migration > 0 ? "+" : ""}
                      {(selectedDistrict.net_migration / 1000).toFixed(1)}K
                    </div>
                  </div>
                  <div className="p-2 lg:p-3 rounded-lg bg-muted/50">
                    <span className="text-[10px] lg:text-xs text-muted-foreground">
                      Water Stress
                    </span>
                    <div className="text-lg lg:text-xl font-bold font-mono text-warning">
                      {selectedDistrict.water_stress_index.toFixed(0)}%
                    </div>
                  </div>
                  <div className="p-2 lg:p-3 rounded-lg bg-muted/50">
                    <span className="text-[10px] lg:text-xs text-muted-foreground">
                      Crop Failure
                    </span>
                    <div className="text-lg lg:text-xl font-bold font-mono text-destructive">
                      {selectedDistrict.crop_failure_rate.toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="p-2 lg:p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <span className="text-[10px] lg:text-xs text-muted-foreground">
                    AI Recommendation
                  </span>
                  <p className="text-xs lg:text-sm text-foreground mt-1">
                    {selectedDistrict.drought_index > 70
                      ? `Immediate water subsidy intervention recommended. Projected ${Math.floor(selectedDistrict.drought_index * 0.2)}% reduction in migration if implemented within 30 days.`
                      : selectedDistrict.drought_index > 50
                        ? "Monitor closely. Consider preventive measures for water security and crop insurance programs."
                        : "Continue current resilience measures. District shows stable indicators."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 lg:py-8 text-muted-foreground">
                <MapPin className="w-10 h-10 lg:w-12 lg:h-12 mb-3 opacity-30" />
                <p className="text-xs lg:text-sm">Select a district on the map</p>
                <p className="text-[10px] lg:text-xs mt-1">to view detailed analysis</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CommandCenter;