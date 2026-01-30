import { saveAs } from "file-saver";

// Generic CSV export function
export const exportToCSV = <T extends object>(
  data: T[],
  filename: string,
  columns?: { key: string; label: string }[]
) => {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // If columns not specified, use all keys from first item
  const cols = columns || Object.keys(data[0]).map((key) => ({
    key,
    label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  }));

  // Build CSV header
  const header = cols.map((col) => `"${col.label}"`).join(",");

  // Build CSV rows
  const rows = data.map((row) =>
    cols
      .map((col) => {
        const value = (row as Record<string, unknown>)[col.key];
        if (value === null || value === undefined) return '""';
        if (typeof value === "string") return `"${value.replace(/"/g, '""')}"`;
        if (Array.isArray(value)) return `"${value.join("; ")}"`;
        if (typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        return `"${value}"`;
      })
      .join(",")
  );

  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
};

// Predefined export configurations
export const districtColumns = [
  { key: "name" as const, label: "District Name" },
  { key: "code" as const, label: "Code" },
  { key: "x_coord" as const, label: "Longitude" },
  { key: "y_coord" as const, label: "Latitude" },
  { key: "elevation" as const, label: "Elevation (m)" },
  { key: "population" as const, label: "Population" },
  { key: "area_sq_km" as const, label: "Area (sq km)" },
  { key: "drought_index" as const, label: "Drought Index (%)" },
  { key: "water_stress_index" as const, label: "Water Stress (%)" },
  { key: "crop_failure_rate" as const, label: "Crop Failure Rate (%)" },
  { key: "net_migration" as const, label: "Net Migration" },
];

export const migrationColumns = [
  { key: "event_date" as const, label: "Event Date" },
  { key: "source_district_id" as const, label: "Source District ID" },
  { key: "destination_district_id" as const, label: "Destination District ID" },
  { key: "volume" as const, label: "Volume" },
  { key: "primary_cause" as const, label: "Primary Cause" },
  { key: "secondary_causes" as const, label: "Secondary Causes" },
  { key: "confidence" as const, label: "Confidence" },
];

export const causalLinksColumns = [
  { key: "cause_variable" as const, label: "Cause Variable" },
  { key: "effect_variable" as const, label: "Effect Variable" },
  { key: "strength" as const, label: "Strength" },
  { key: "p_value" as const, label: "P-Value" },
  { key: "confidence_lower" as const, label: "CI Lower" },
  { key: "confidence_upper" as const, label: "CI Upper" },
  { key: "lag_days" as const, label: "Lag (days)" },
  { key: "is_nonlinear" as const, label: "Nonlinear" },
  { key: "analysis_method" as const, label: "Analysis Method" },
];

export const simulationRunsColumns = [
  { key: "run_name" as const, label: "Run Name" },
  { key: "run_timestamp" as const, label: "Timestamp" },
  { key: "water_subsidy_input" as const, label: "Water Subsidy (%)" },
  { key: "climate_policy_input" as const, label: "Climate Policy (%)" },
  { key: "monsoon_modifier" as const, label: "Monsoon Modifier" },
  { key: "butterfly_effect_enabled" as const, label: "Butterfly Effect" },
  { key: "migration_reduction_percent" as const, label: "Migration Reduction (%)" },
  { key: "water_security_percent" as const, label: "Water Security (%)" },
  { key: "economic_stability_percent" as const, label: "Economic Stability (%)" },
  { key: "robustness_score" as const, label: "Robustness Score" },
  { key: "lives_stabilized" as const, label: "Lives Stabilized" },
];

export const resilienceColumns = [
  { key: "district_id" as const, label: "District ID" },
  { key: "score_date" as const, label: "Score Date" },
  { key: "overall_score" as const, label: "Overall Score" },
  { key: "climate_resilience" as const, label: "Climate Resilience" },
  { key: "water_security" as const, label: "Water Security" },
  { key: "economic_diversity" as const, label: "Economic Diversity" },
  { key: "infrastructure_score" as const, label: "Infrastructure Score" },
  { key: "social_risk_index" as const, label: "Social Risk Index" },
  { key: "trend" as const, label: "Trend" },
];
