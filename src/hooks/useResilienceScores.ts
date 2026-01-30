import { useQuery } from "@tanstack/react-query";
import { fetchResilienceScores, fetchRawResilienceScores } from "@/lib/api";

export interface ResilienceScore {
  id: string;
  district_id: string;
  score_date: string;
  climate_resilience: number;
  social_risk_index: number;
  infrastructure_score: number;
  economic_diversity: number;
  water_security: number;
  overall_score: number;
  trend: string;
  created_at: string;
}

export interface DistrictWithResilience {
  id: string;
  name: string;
  code: string;
  drought_index: number;
  water_stress_index: number;
  crop_failure_rate: number;
  net_migration: number;
  resilience_scores: ResilienceScore[];
}

export const useResilienceScores = () => {
  return useQuery({
    queryKey: ["resilience_scores"],
    queryFn: async (): Promise<DistrictWithResilience[]> => {
      return await fetchResilienceScores();
    },
  });
};

export const useDistrictResilience = (districtId: string | null) => {
  return useQuery({
    queryKey: ["resilience_scores", districtId],
    queryFn: async (): Promise<ResilienceScore | null> => {
      if (!districtId) return null;

      const scores = await fetchRawResilienceScores();
      const districtScores = scores
        .filter((s: ResilienceScore) => String(s.district_id) === String(districtId))
        .sort((a: ResilienceScore, b: ResilienceScore) =>
          new Date(b.score_date).getTime() - new Date(a.score_date).getTime()
        );

      return districtScores.length > 0 ? districtScores[0] : null;
    },
    enabled: !!districtId,
  });
};
