import { useQuery } from "@tanstack/react-query";
import { fetchFairnessAudit } from "@/lib/api";

export interface FairnessMetric {
  name: string;
  value: number;
  category: string;
}

export interface AIVerification {
  status: string;
  confidence: number;
  reasoning: string;
  last_audit: string;
}

export interface FairnessAuditResponse {
  metrics: FairnessMetric[];
  ai_verification: AIVerification;
}

export const useFairnessMetrics = () => {
  return useQuery({
    queryKey: ["fairness_metrics"],
    queryFn: async (): Promise<FairnessAuditResponse> => {
      return await fetchFairnessAudit();
    },
  });
};
