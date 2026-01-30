import { useQuery } from "@tanstack/react-query";
import { fetchDistricts } from "@/lib/api";

export interface District {
  id: string;
  name: string;
  code: string;
  x_coord: number;
  y_coord: number;
  elevation: number;
  area_sq_km: number | null;
  population: number | null;
  drought_index: number;
  water_stress_index: number;
  crop_failure_rate: number;
  net_migration: number;
  created_at: string;
  updated_at: string;
}

export const useDistricts = () => {
  return useQuery({
    queryKey: ["districts"],
    queryFn: async (): Promise<District[]> => {
      const data = await fetchDistricts();
      return data || [];
    },
  });
};

export const useDistrictById = (districtId: string | null) => {
  return useQuery({
    queryKey: ["district", districtId],
    queryFn: async (): Promise<District | null> => {
      if (!districtId) return null;

      const all = await fetchDistricts();
      return all.find((d: District) => String(d.id) === String(districtId)) || null;
    },
    enabled: !!districtId,
  });
};
