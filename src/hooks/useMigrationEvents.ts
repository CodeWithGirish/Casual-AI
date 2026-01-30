import { useQuery } from "@tanstack/react-query";
import { fetchMigrationEvents } from "@/lib/api";

export interface MigrationEvent {
  id: string;
  source_district_id: string;
  destination_district_id: string;
  event_date: string;
  volume: number;
  primary_cause: string;
  secondary_causes: string[] | null;
  confidence: number;
  created_at: string;
}

export const useMigrationEvents = () => {
  return useQuery({
    queryKey: ["migration_events"],
    queryFn: async (): Promise<MigrationEvent[]> => {
      return await fetchMigrationEvents();
    },
  });
};

export const useMigrationByDistrict = (districtId: string | null) => {
  return useQuery({
    queryKey: ["migration_events", districtId],
    queryFn: async (): Promise<MigrationEvent[]> => {
      if (!districtId) return [];

      const all = await fetchMigrationEvents();
      return all.filter((e: MigrationEvent) =>
        String(e.source_district_id) === String(districtId) ||
        String(e.destination_district_id) === String(districtId)
      );
    },
    enabled: !!districtId,
  });
};
