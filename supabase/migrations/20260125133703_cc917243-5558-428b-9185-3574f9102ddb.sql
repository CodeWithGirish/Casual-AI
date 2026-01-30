-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.districts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.migration_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.simulation_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resilience_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.causal_certificates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.climate_observations;