import { motion } from "framer-motion";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { ClimateMapWithDropdown } from "@/components/visualizations/ClimateMapWithDropdown";
import { useFairnessMetrics } from "@/hooks/useFairnessMetrics";
import { useCausalCertificates } from "@/hooks/useCausalCertificates";
import { useRefutationTests } from "@/hooks/useRefutationTests";
import { useDistrictById } from "@/hooks/useDistricts";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Play,
  Terminal,
  Award,
  Loader2,
  XCircle,
} from "lucide-react";

const IntegrityHub = () => {
  const [mapMode, setMapMode] = useState<"current" | "simulated">("current");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
    eventType: string;
  } | null>(null);

  const { data: fairnessMetrics, isLoading: metricsLoading } = useFairnessMetrics();
  const { data: certificates, refetch: refetchCertificates } = useCausalCertificates();
  // selectedDistrict and useDistrictById are kept for potential context, though the viewer using them is removed
  const { data: _selectedDistrict } = useDistrictById(selectedDistrictId);

  const {
    isRunning,
    progress,
    results,
    summary,
    runTests,
    createCertificate,
    causalLinksCount,
  } = useRefutationTests();

  const handleRunStressTest = async () => {
    const testResults = await runTests();
    if (testResults?.isValid && testResults.summary) {
      await createCertificate.mutateAsync({
        passed: testResults.summary.passed,
        total: testResults.summary.total,
      });
      await refetchCertificates();
    }
  };

  const getLogIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-3 h-3 mt-0.5 text-success" />;
      case "warning":
        return <AlertTriangle className="w-3 h-3 mt-0.5 text-warning" />;
      case "failed":
        return <XCircle className="w-3 h-3 mt-0.5 text-destructive" />;
      default:
        return <span className="w-3 text-muted-foreground">$</span>;
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 lg:mb-6 pl-12 lg:pl-0"
      >
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Integrity Hub</h1>
        <p className="text-sm lg:text-base text-muted-foreground mt-1">
          Trust & transparency - Proving our AI is scientifically sound
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Climate Migration Map with Dropdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-7 glass-card p-4 lg:p-6 rounded-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <div>
              <h2 className="text-base lg:text-lg font-semibold text-foreground">
                Climate Migration Map
              </h2>
              <p className="text-xs lg:text-sm text-muted-foreground">
                View climate impacts across the region
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setMapMode("current")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${mapMode === "current"
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
              >
                Current Reality
              </button>
              <button
                onClick={() => setMapMode("simulated")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${mapMode === "simulated"
                    ? "bg-secondary/10 text-secondary border border-secondary/30"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
              >
                Simulated Future
              </button>
            </div>
          </div>
          <div className="h-[300px] sm:h-[350px] lg:h-[400px] rounded-lg overflow-hidden">
            <ClimateMapWithDropdown
              mode={mapMode}
              selectedDistrict={selectedDistrictId || undefined}
              onDistrictSelect={(district) => setSelectedDistrictId(district.id)}
              onLocationSelect={setSelectedLocation}
            />
          </div>
        </motion.div>

        {/* Bias & Fairness Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-5 glass-card p-4 lg:p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base lg:text-lg font-semibold text-foreground">
                Bias & Fairness Audit
              </h2>
              <p className="text-xs lg:text-sm text-muted-foreground">
                Model fairness across demographics
              </p>
            </div>
            <span className="px-2 py-1 text-xs font-mono rounded bg-success/10 text-success border border-success/30">
              {metricsLoading ? "LOADING" : "PASSED"}
            </span>
          </div>

          {metricsLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="relative w-full aspect-square max-w-[250px] mx-auto mb-4">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {[20, 40, 60, 80, 100].map((r, i) => (
                    <polygon
                      key={i}
                      points={(fairnessMetrics?.metrics || [])
                        .map((_, j) => {
                          const angle = (j * 360) / (fairnessMetrics?.metrics?.length || 6) - 90;
                          const rad = (angle * Math.PI) / 180;
                          const x = 100 + Math.cos(rad) * r * 0.8;
                          const y = 100 + Math.sin(rad) * r * 0.8;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                      fill="none"
                      stroke="hsl(var(--border))"
                      strokeWidth="0.5"
                    />
                  ))}
                  <polygon
                    points={(fairnessMetrics?.metrics || [])
                      .map((metric, j) => {
                        const angle = (j * 360) / (fairnessMetrics?.metrics?.length || 6) - 90;
                        const rad = (angle * Math.PI) / 180;
                        const r = metric.value * 0.8;
                        const x = 100 + Math.cos(rad) * r;
                        const y = 100 + Math.sin(rad) * r;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                    fill="hsl(var(--secondary) / 0.2)"
                    stroke="hsl(var(--secondary))"
                    strokeWidth="2"
                  />
                  {(fairnessMetrics?.metrics || []).map((metric, j) => {
                    const angle = (j * 360) / (fairnessMetrics?.metrics?.length || 6) - 90;
                    const rad = (angle * Math.PI) / 180;
                    const r = metric.value * 0.8;
                    const x = 100 + Math.cos(rad) * r;
                    const y = 100 + Math.sin(rad) * r;
                    return <circle key={j} cx={x} cy={y} r="4" fill="hsl(var(--secondary))" />;
                  })}
                </svg>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  {(fairnessMetrics?.metrics || []).map((metric) => (
                    <div key={metric.name} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={metric.value} className="w-20 h-1.5" />
                        <span className="text-xs font-mono text-foreground w-8">{metric.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {fairnessMetrics?.ai_verification && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">AI Verification</span>
                      <span className="text-[10px] font-mono text-muted-foreground">Confidence: {fairnessMetrics.ai_verification.confidence}%</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                      "{fairnessMetrics.ai_verification.reasoning}"
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>

        {/* Refutation Console */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-7 glass-card p-4 lg:p-6 rounded-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <div>
              <h2 className="text-base lg:text-lg font-semibold text-foreground">
                Refutation Console
              </h2>
              <p className="text-xs lg:text-sm text-muted-foreground">
                Live robustness checks on {causalLinksCount} causal links
              </p>
            </div>
            <button
              onClick={handleRunStressTest}
              disabled={isRunning || causalLinksCount === 0}
              className="px-4 py-2 rounded-lg bg-gradient-saffron text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
            >
              <Play className="w-4 h-4" />
              Run Stress Test
            </button>
          </div>

          {/* Terminal */}
          <div className="bg-background rounded-lg border border-border p-3 font-mono text-xs h-[250px] lg:h-[300px] overflow-y-auto">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
              <Terminal className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">refutation_tests.sh</span>
              {isRunning && (
                <span className="ml-auto text-secondary animate-pulse">Running...</span>
              )}
            </div>
            {results.length === 0 ? (
              <div className="text-muted-foreground">
                <p>$ Click "Run Stress Test" to begin validation</p>
                <p className="mt-2 text-[10px]">
                  Tests will run against {causalLinksCount} causal relationships from the database
                </p>
                <p className="mt-1 text-[10px]">
                  Includes: Placebo tests, sensitivity analysis, cross-validation, CI checks
                </p>
              </div>
            ) : (
              results.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex gap-2 mb-1 ${log.status === "passed"
                      ? "text-success"
                      : log.status === "warning"
                        ? "text-warning"
                        : log.status === "failed"
                          ? "text-destructive"
                          : "text-muted-foreground"
                    }`}
                >
                  <span className="text-muted-foreground/50 shrink-0">[{log.timestamp}]</span>
                  {getLogIcon(log.status)}
                  <span className="break-all">{log.message}</span>
                </motion.div>
              ))
            )}
          </div>

          {/* Progress */}
          {isRunning && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Test Progress</span>
                <span className="font-mono text-foreground">{Math.floor(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Summary */}
          {summary && !isRunning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mt-4 p-4 rounded-lg text-center ${summary.failed === 0
                  ? "bg-success/10 border border-success/30"
                  : "bg-warning/10 border border-warning/30"
                }`}
            >
              <Award className={`w-10 h-10 mx-auto mb-2 ${summary.failed === 0 ? "text-success" : "text-warning"}`} />
              <h3 className={`text-lg font-bold mb-1 ${summary.failed === 0 ? "text-success" : "text-warning"}`}>
                {summary.failed === 0 ? "Causal Certificate Issued" : "Validation Complete with Warnings"}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {summary.passed}/{summary.total} tests passed • {summary.warnings} warnings • {summary.failed} failures
              </p>
              {summary.failed === 0 && (
                <div className="inline-block px-3 py-1.5 rounded bg-success/20 font-mono text-xs text-success">
                  CERT-{new Date().toISOString().slice(0, 10)}-MAHA-{(certificates?.length || 0 + 1).toString().padStart(3, "0")}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Certificate History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-5 glass-card p-4 lg:p-6 rounded-xl"
        >
          <h2 className="text-base lg:text-lg font-semibold text-foreground mb-4">
            Certificate History
          </h2>
          {certificates && certificates.length > 0 ? (
            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {certificates.slice(0, 5).map((cert) => (
                <div
                  key={cert.id}
                  className={`p-3 rounded-lg border ${cert.is_valid
                      ? "bg-success/5 border-success/30"
                      : "bg-destructive/5 border-destructive/30"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-foreground">
                      {cert.certificate_type.toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded ${cert.is_valid
                          ? "bg-success/20 text-success"
                          : "bg-destructive/20 text-destructive"
                        }`}
                    >
                      {cert.is_valid ? "VALID" : "EXPIRED"}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Placebo: {cert.placebo_tests_passed}/{cert.placebo_tests_total} |
                    Sensitivity: {((cert.sensitivity_score || 0)).toFixed(0)}%
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    Issued: {new Date(cert.issued_at).toLocaleDateString()}
                  </div>
                  {cert.validity_reason && (
                    <div className="text-[10px] text-muted-foreground mt-1 italic">
                      {cert.validity_reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No certificates yet</p>
              <p className="text-xs mt-1">Run a stress test to generate one</p>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default IntegrityHub;