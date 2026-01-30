import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { simulatePolicy, fetchSimulationRuns, createSimulationRun } from "@/lib/api";

export interface AISimulationResult {
  districts: {
    district_id: string;
    district_name: string;
    simulated_drought: number;
    simulated_migration: number;
    is_suitable_destination: boolean;
    migration_risk: string;
  }[];
  summary: {
    total_prevented_migration: number;
    avg_drought_reduction: number;
    suitable_destinations_count: number;
    confidence_score: number;
  };
}

export interface SimulationRun {
  id: string;
  run_name: string | null;
  run_timestamp: string;
  water_subsidy_input: number;
  climate_policy_input: number;
  monsoon_modifier: number;
  butterfly_effect_enabled: boolean;
  lives_stabilized: number;
  migration_reduction_percent: number;
  water_security_percent: number;
  economic_stability_percent: number;
  total_iterations: number;
  successful_iterations: number;
  robustness_score: number;
  status: string;
  created_at: string;
}

export interface CreateSimulationInput {
  run_name?: string;
  water_subsidy_input: number;
  climate_policy_input: number;
  monsoon_modifier: number;
  butterfly_effect_enabled: boolean;
}

export const useSimulationRuns = () => {
  return useQuery({
    queryKey: ["simulation_runs"],
    queryFn: async (): Promise<SimulationRun[]> => {
      return await fetchSimulationRuns();
    },
  });
};

export const useCreateSimulation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSimulationInput): Promise<SimulationRun> => {
      // This is the simplified legacy creator, for backwards compatibility
      const simulationData = {
        run_name: input.run_name || `Simulation ${new Date().toISOString()}`,
        run_timestamp: new Date().toISOString(),
        water_subsidy_input: input.water_subsidy_input,
        climate_policy_input: input.climate_policy_input,
        monsoon_modifier: input.monsoon_modifier,
        butterfly_effect_enabled: input.butterfly_effect_enabled,
        lives_stabilized: 0,
        migration_reduction_percent: 0,
        water_security_percent: 0,
        economic_stability_percent: 0,
        total_iterations: 100,
        successful_iterations: 0,
        robustness_score: 0,
        status: "completed",
      };

      return await createSimulationRun(simulationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulation_runs"] });
    },
  });
};

export const useAISimulation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSimulationInput): Promise<AISimulationResult> => {
      return await simulatePolicy({
        water_subsidy_input: input.water_subsidy_input,
        climate_policy_input: input.climate_policy_input,
        monsoon_modifier: input.monsoon_modifier,
        butterfly_effect_enabled: input.butterfly_effect_enabled,
        run_name: input.run_name
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulation_runs"] });
    },
  });
};
