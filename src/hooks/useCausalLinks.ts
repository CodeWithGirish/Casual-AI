import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCausalLinks, discoverCausality } from "@/lib/api";

export interface CausalLink {
  id: string;
  cause_variable: string;
  effect_variable: string;
  lag_days: number;
  strength: number;
  confidence_lower: number;
  confidence_upper: number;
  p_value: number | null;
  is_nonlinear: boolean;
  nonlinearity_type: string | null;
  sample_size: number | null;
  analysis_method: string;
  causal_reasoning?: string;
  created_at: string;
  updated_at: string;
}

export const useCausalLinks = () => {
  return useQuery({
    queryKey: ["causal_links"],
    queryFn: async (): Promise<CausalLink[]> => {
      // Improved: Use the discovery engine instead of static links
      const data = await discoverCausality();
      return data || [];
    },
  });
};

export const useDiscoverCausality = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: discoverCausality,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["causal_links"] });
    }
  });
};

// Helper function to format causal variable names for display
export const formatVariableName = (name: string): string => {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Get confidence level based on p-value
export const getConfidenceLevel = (pValue: number | null): string => {
  if (!pValue) return "Unknown";
  if (pValue < 0.001) return "Very High";
  if (pValue < 0.01) return "High";
  if (pValue < 0.05) return "Moderate";
  return "Low";
};
