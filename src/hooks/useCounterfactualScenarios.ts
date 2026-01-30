import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCounterfactualScenarios, generateCounterfactual } from "@/lib/api";

export interface CounterfactualScenario {
  id: string;
  name: string;
  description: string | null;
  intervention_id: string | null;
  baseline_migration: number;
  baseline_water_stress: number;
  baseline_crop_failure: number;
  baseline_economic_loss: number;
  projected_migration: number;
  projected_water_stress: number;
  projected_crop_failure: number;
  projected_economic_loss: number;
  treatment_effect_migration: number;
  treatment_effect_water_stress: number;
  treatment_effect_crop_failure: number;
  treatment_effect_economic: number;
  confidence_score: number;
  limitations: string;
  created_at: string;
}

export const useCounterfactualScenarios = () => {
  return useQuery({
    queryKey: ["counterfactual_scenarios"],
    queryFn: async (): Promise<CounterfactualScenario[]> => {
      // For demonstration, we'll fetch dynamic ones if none exist
      const data = await fetchCounterfactualScenarios();
      return data || [];
    },
  });
};

export const useGenerateCounterfactual = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateCounterfactual,
    onSuccess: (newData) => {
      queryClient.setQueryData(["counterfactual_scenarios"], newData);
    }
  });
};
