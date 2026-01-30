import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { useResilienceScores } from "@/hooks/useResilienceScores";
import { useCausalLinks } from "@/hooks/useCausalLinks";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { exportToCSV } from "@/lib/csvExport";
import { Shield, TrendingUp, AlertTriangle, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

const ResilienceScorecard = () => {
    // Enable real-time listeners for database changes
    useRealtimeData();

    const { data: districtsWithResilience, isLoading } = useResilienceScores();
    const { data: causalLinks } = useCausalLinks();

    // Dynamically map district data from 2021-2025 records
    const districtData = districtsWithResilience?.map((d) => {
        const latestScore = d.resilience_scores?.[0];
        return {
            name: d.name,
            score: latestScore?.overall_score || 0,
            trend: latestScore?.trend || "stable",
            water: latestScore?.water_security || 0,
            economy: latestScore?.economic_diversity || 0,
            infra: latestScore?.infrastructure_score || 0,
            social: latestScore?.social_risk_index || 0,
        };
    }).sort((a, b) => b.score - a.score).slice(0, 12) || [];

    const handleExportCSV = () => {
        if (!districtsWithResilience) return;
        const flatData = districtsWithResilience.flatMap((d) =>
            d.resilience_scores.map((rs) => ({ ...rs, district_name: d.name }))
        );
        exportToCSV(flatData, "resilience_scorecard_2025");
        toast.success("Resilience data exported for audit");
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

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 pl-12 lg:pl-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Resilience Scorecard</h1>
                        <p className="text-sm lg:text-base text-muted-foreground mt-1">
                            Live district health metrics derived from 2021-2025 observations
                        </p>
                    </div>
                    <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm hover:bg-muted/50 transition-colors">
                        <Download className="w-4 h-4" /> Export Audit CSV
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {districtData.map((district, index) => (
                    <motion.div
                        key={district.name}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`glass-card p-4 rounded-xl border-l-4 ${district.score < 40 ? "border-l-destructive" : district.score < 60 ? "border-l-warning" : "border-l-success"
                            }`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-foreground truncate">{district.name}</span>
                            {district.trend === "improving" ? <TrendingUp className="w-4 h-4 text-success" /> : <Shield className="w-4 h-4 text-warning" />}
                        </div>
                        <div className="text-3xl font-bold font-mono mb-4">
                            {Math.round(district.score)}<span className="text-sm text-muted-foreground ml-1">/100</span>
                        </div>
                        <div className="space-y-3">
                            <ScoreMetric label="Water Security" value={district.water} />
                            <ScoreMetric label="Economic Diversity" value={district.economy} />
                            <ScoreMetric label="Infrastructure" value={district.infra} />
                            <ScoreMetric label="Social Stability" value={district.social} />
                        </div>
                    </motion.div>
                ))}
            </div>
            {/* Adaptation Pathways and Audit Trail components remain below */}
        </DashboardLayout>
    );
};

const ScoreMetric = ({ label, value }: { label: string, value: number }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[10px] uppercase font-semibold text-muted-foreground">
            <span>{label}</span>
            <span>{Math.round(value)}%</span>
        </div>
        <Progress value={value} className="h-1" />
    </div>
);

export default ResilienceScorecard;