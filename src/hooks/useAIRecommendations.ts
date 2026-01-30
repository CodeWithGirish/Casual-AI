import { useQuery } from "@tanstack/react-query";
import { fetchAIRecommendations } from "@/lib/api";

export interface AIRecommendation {
    priority: string;
    title: string;
    description: string;
    impact: string;
    cost: string;
}

export const useAIRecommendations = () => {
    return useQuery({
        queryKey: ["ai_recommendations"],
        queryFn: async (): Promise<AIRecommendation[]> => {
            return await fetchAIRecommendations();
        },
    });
};
