import { useQuery } from "@tanstack/react-query";
import { predictImpact } from "@/lib/api";

export interface ImpactPrediction {
    impact_score: number;
    projected_migration_reduction: number;
    projected_water_improvement: number;
    lives_stabilized: number;
    confidence_interval: [number, number];
}

export const useImpactPrediction = (params: { district_id: string | undefined; budget: number; time_horizon: number; scale: number }) => {
    return useQuery({
        queryKey: ["impact_prediction", params.district_id, params.budget, params.time_horizon, params.scale],
        queryFn: async (): Promise<ImpactPrediction> => {
            if (!params.district_id) throw new Error("District ID is required");
            return await predictImpact({
                district_id: params.district_id,
                budget: params.budget,
                time_horizon: params.time_horizon,
                scale: params.scale
            });
        },
        enabled: !!params.district_id,
        staleTime: 5000, // Debounce-ish for sliders
    });
};
