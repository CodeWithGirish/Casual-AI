import { useQuery } from "@tanstack/react-query";
import { fetchPolicyInterventions } from "@/lib/api";

export interface PolicyIntervention {
  id: string;
  name: string;
  intervention_type: string;
  district_id: string | null;
  budget_crores: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  water_subsidy_percent: number;
  climate_policy_intensity: number;
  expected_migration_reduction: number;
  expected_water_security: number;
  expected_economic_stability: number;
  created_at: string;
  updated_at: string;
}

export const usePolicyInterventions = () => {
  return useQuery({
    queryKey: ["policy_interventions"],
    queryFn: async (): Promise<PolicyIntervention[]> => {
      return await fetchPolicyInterventions();
    },
  });
};

export const useActiveInterventions = () => {
  return useQuery({
    queryKey: ["policy_interventions", "active"],
    queryFn: async (): Promise<PolicyIntervention[]> => {
      const all = await fetchPolicyInterventions();
      return all.filter((i: PolicyIntervention) => i.status === "active");
    },
  });
};
