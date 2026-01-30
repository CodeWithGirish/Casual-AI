import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { useSimulationRuns } from "@/hooks/useSimulationRuns";
import { useCausalCertificates } from "@/hooks/useCausalCertificates";
import { useDistricts } from "@/hooks/useDistricts";
import { useAIRecommendations } from "@/hooks/useAIRecommendations";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { exportToCSV, simulationRunsColumns, districtColumns } from "@/lib/csvExport";
import {
  Download,
  FileText,
  Shield,
  Lightbulb,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const PolicyReport = () => {
  // Enable real-time updates
  useRealtimeData();

  const { data: simulations, isLoading: simsLoading } = useSimulationRuns();
  const { data: certificates } = useCausalCertificates();
  const { data: districts } = useDistricts();
  const { data: aiRecs, isLoading: recsLoading } = useAIRecommendations();

  const latestSim = simulations?.[0];
  const validCerts = certificates?.filter((c) => c.is_valid).length || 0;

  const scorecards = [
    {
      name: "Climate Resilience",
      value: latestSim?.water_security_percent || 72,
      max: 100,
      color: "secondary"
    },
    {
      name: "Social Risk Index",
      value: 100 - (latestSim?.migration_reduction_percent || 65),
      max: 100,
      color: "warning",
      inverted: true
    },
    {
      name: "Economic Viability",
      value: latestSim?.economic_stability_percent || 84,
      max: 100,
      color: "success"
    },
    {
      name: "Model Robustness",
      value: latestSim?.robustness_score || 68,
      max: 100,
      color: "primary"
    },
  ];

  const handleExportSimulations = () => {
    if (simulations) {
      exportToCSV(simulations, "simulation_runs", simulationRunsColumns);
      toast.success("Simulations exported");
    }
  };

  const handleExportDistricts = () => {
    if (districts) {
      exportToCSV(districts, "districts", districtColumns);
      toast.success("Districts data exported");
    }
  };

  if (simsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 lg:mb-6 pl-12 lg:pl-0"
      >
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
          Policy Recommendation Report
        </h1>
        <p className="text-sm lg:text-base text-muted-foreground mt-1">
          Executive summary for decision-makers with real-time AI insights
        </p>
      </motion.div>

      {/* Actionable Scorecards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8"
      >
        {scorecards.map((scorecard, index) => (
          <motion.div
            key={scorecard.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-4 lg:p-6 rounded-xl text-center"
          >
            <div className="relative w-20 h-20 lg:w-28 lg:h-28 mx-auto mb-3 lg:mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={`hsl(var(--${scorecard.color}))`}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(scorecard.value / scorecard.max) * 251.2} 251.2`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xl lg:text-2xl font-bold font-mono text-${scorecard.color}`}>
                  {Math.round(scorecard.value)}
                </span>
              </div>
            </div>
            <h3 className="text-xs lg:text-sm font-medium text-foreground">
              {scorecard.name}
            </h3>
            <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">
              {scorecard.inverted
                ? scorecard.value < 40
                  ? "Low Risk"
                  : "Elevated Risk"
                : scorecard.value > 70
                  ? "Strong"
                  : scorecard.value > 50
                    ? "Moderate"
                    : "Needs Attention"}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Mitigation Suggestions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-8 glass-card p-4 lg:p-6 rounded-xl border border-primary/20"
        >
          <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
            <Lightbulb className="w-5 h-5 lg:w-6 lg:h-6 text-warning" />
            <div>
              <h2 className="text-base lg:text-lg font-semibold text-foreground">
                AI-Generated Mitigation Suggestions
              </h2>
              <p className="text-xs lg:text-sm text-muted-foreground">
                Real-time recommendations derived from current regional health metrics
              </p>
            </div>
          </div>

          <div className="space-y-3 lg:space-y-4">
            {recsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : aiRecs && aiRecs.length > 0 ? aiRecs.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-3 lg:p-4 rounded-lg bg-primary/5 border border-primary/20 hover:border-primary/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                    <span
                      className={`px-2 py-0.5 text-[10px] lg:text-xs font-medium rounded ${rec.priority === "High"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-warning/10 text-warning"
                        }`}
                    >
                      {rec.priority} Priority
                    </span>
                    <h3 className="font-semibold text-foreground text-sm lg:text-base">{rec.title}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] lg:text-sm font-mono text-muted-foreground">
                      Est. Cost:
                    </span>
                    <span className="text-[10px] lg:text-sm font-mono text-foreground ml-1 lg:ml-2">
                      {rec.cost}
                    </span>
                  </div>
                </div>
                <p className="text-xs lg:text-sm text-muted-foreground italic font-serif">
                  "{rec.description}"
                </p>
                <div className="flex items-center gap-2 mt-2 lg:mt-3">
                  <span className="text-[10px] lg:text-xs text-muted-foreground">AI Predicted Impact:</span>
                  <span
                    className={`text-[10px] lg:text-xs font-bold ${rec.impact === "High" ? "text-success" : "text-secondary"
                      }`}
                  >
                    {rec.impact}
                  </span>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No AI suggestions available for current data set.
              </div>
            )}
          </div>
        </motion.div>

        {/* Export Center */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-4 space-y-4 lg:space-y-6"
        >
          {/* Summary Stats */}
          <div className="glass-card p-4 lg:p-6 rounded-xl">
            <h3 className="text-base lg:text-lg font-semibold text-foreground mb-3 lg:mb-4">
              Report Summary
            </h3>
            <div className="space-y-2 lg:space-y-3">
              <div className="flex items-center justify-between p-2 lg:p-3 rounded bg-muted/50">
                <span className="text-xs lg:text-sm text-muted-foreground">Districts Analyzed</span>
                <span className="font-mono text-sm lg:text-base text-foreground">{districts?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 lg:p-3 rounded bg-muted/50">
                <span className="text-xs lg:text-sm text-muted-foreground">Simulations Run</span>
                <span className="font-mono text-sm lg:text-base text-foreground">{simulations?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 lg:p-3 rounded bg-muted/50">
                <span className="text-xs lg:text-sm text-muted-foreground">Valid Certificates</span>
                <span className="font-mono text-sm lg:text-base text-success">{validCerts}</span>
              </div>
            </div>
          </div>

          {/* Export Actions */}
          <div className="glass-card p-4 lg:p-6 rounded-xl">
            <h3 className="text-base lg:text-lg font-semibold text-foreground mb-3 lg:mb-4">
              Export Center
            </h3>
            <div className="space-y-2">
              <button className="w-full py-3 rounded-lg bg-gradient-saffron text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity glow-saffron text-sm">
                <FileText className="w-4 h-4" />
                Generate PDF Report
              </button>
              <button
                onClick={handleExportDistricts}
                className="w-full py-2.5 rounded-lg border border-border text-foreground font-medium flex items-center justify-center gap-2 hover:bg-muted/50 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Export Districts (CSV)
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default PolicyReport;
