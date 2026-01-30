-- Create enum types for status and causes
CREATE TYPE public.intervention_status AS ENUM ('planned', 'active', 'completed', 'cancelled');
CREATE TYPE public.migration_cause AS ENUM ('drought', 'flood', 'economic', 'crop_failure', 'debt', 'conflict', 'other');

-- Districts table with Maharashtra district data
CREATE TABLE public.districts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    x_coord NUMERIC NOT NULL,
    y_coord NUMERIC NOT NULL,
    elevation NUMERIC DEFAULT 0,
    area_sq_km NUMERIC,
    population INTEGER,
    drought_index NUMERIC DEFAULT 0 CHECK (drought_index >= 0 AND drought_index <= 100),
    water_stress_index NUMERIC DEFAULT 0 CHECK (water_stress_index >= 0 AND water_stress_index <= 100),
    crop_failure_rate NUMERIC DEFAULT 0 CHECK (crop_failure_rate >= 0 AND crop_failure_rate <= 100),
    net_migration INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Climate observations time series
CREATE TABLE public.climate_observations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
    observation_date DATE NOT NULL,
    rainfall_mm NUMERIC DEFAULT 0,
    temperature_max NUMERIC,
    temperature_min NUMERIC,
    humidity_percent NUMERIC,
    soil_moisture NUMERIC,
    groundwater_level NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Migration events between districts
CREATE TABLE public.migration_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    source_district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
    destination_district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
    event_date DATE NOT NULL,
    volume INTEGER NOT NULL DEFAULT 0,
    primary_cause public.migration_cause NOT NULL DEFAULT 'economic',
    secondary_causes public.migration_cause[],
    confidence NUMERIC DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Causal links discovered through analysis
CREATE TABLE public.causal_links (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    cause_variable TEXT NOT NULL,
    effect_variable TEXT NOT NULL,
    lag_days INTEGER DEFAULT 0,
    strength NUMERIC NOT NULL CHECK (strength >= -1 AND strength <= 1),
    confidence_lower NUMERIC DEFAULT 0,
    confidence_upper NUMERIC DEFAULT 1,
    p_value NUMERIC CHECK (p_value >= 0 AND p_value <= 1),
    is_nonlinear BOOLEAN DEFAULT false,
    nonlinearity_type TEXT,
    sample_size INTEGER,
    analysis_method TEXT DEFAULT 'granger',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Policy interventions
CREATE TABLE public.policy_interventions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    intervention_type TEXT NOT NULL,
    district_id UUID REFERENCES public.districts(id) ON DELETE SET NULL,
    budget_crores NUMERIC DEFAULT 0,
    start_date DATE,
    end_date DATE,
    status public.intervention_status DEFAULT 'planned',
    water_subsidy_percent NUMERIC DEFAULT 0,
    climate_policy_intensity NUMERIC DEFAULT 0,
    expected_migration_reduction NUMERIC DEFAULT 0,
    expected_water_security NUMERIC DEFAULT 0,
    expected_economic_stability NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Counterfactual scenarios for comparison
CREATE TABLE public.counterfactual_scenarios (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    intervention_id UUID REFERENCES public.policy_interventions(id) ON DELETE SET NULL,
    baseline_migration INTEGER DEFAULT 0,
    baseline_water_stress NUMERIC DEFAULT 0,
    baseline_crop_failure NUMERIC DEFAULT 0,
    baseline_economic_loss NUMERIC DEFAULT 0,
    projected_migration INTEGER DEFAULT 0,
    projected_water_stress NUMERIC DEFAULT 0,
    projected_crop_failure NUMERIC DEFAULT 0,
    projected_economic_loss NUMERIC DEFAULT 0,
    treatment_effect_migration INTEGER DEFAULT 0,
    treatment_effect_water_stress NUMERIC DEFAULT 0,
    treatment_effect_crop_failure NUMERIC DEFAULT 0,
    treatment_effect_economic NUMERIC DEFAULT 0,
    confidence_interval_lower NUMERIC DEFAULT 0,
    confidence_interval_upper NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Simulation runs for sensitivity analysis
CREATE TABLE public.simulation_runs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    run_name TEXT,
    run_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    water_subsidy_input NUMERIC DEFAULT 0,
    climate_policy_input NUMERIC DEFAULT 0,
    monsoon_modifier NUMERIC DEFAULT 1,
    butterfly_effect_enabled BOOLEAN DEFAULT false,
    lives_stabilized INTEGER DEFAULT 0,
    migration_reduction_percent NUMERIC DEFAULT 0,
    water_security_percent NUMERIC DEFAULT 0,
    economic_stability_percent NUMERIC DEFAULT 0,
    total_iterations INTEGER DEFAULT 100,
    successful_iterations INTEGER DEFAULT 0,
    robustness_score NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Causal certificates for validation
CREATE TABLE public.causal_certificates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    simulation_run_id UUID REFERENCES public.simulation_runs(id) ON DELETE CASCADE,
    certificate_type TEXT NOT NULL DEFAULT 'robustness',
    placebo_tests_passed INTEGER DEFAULT 0,
    placebo_tests_total INTEGER DEFAULT 100,
    sensitivity_score NUMERIC DEFAULT 0,
    falsification_attempts INTEGER DEFAULT 0,
    falsification_failures INTEGER DEFAULT 0,
    is_valid BOOLEAN DEFAULT false,
    validity_reason TEXT,
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Resilience scores for districts
CREATE TABLE public.resilience_scores (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
    score_date DATE NOT NULL DEFAULT CURRENT_DATE,
    climate_resilience NUMERIC DEFAULT 0 CHECK (climate_resilience >= 0 AND climate_resilience <= 100),
    social_risk_index NUMERIC DEFAULT 0 CHECK (social_risk_index >= 0 AND social_risk_index <= 100),
    infrastructure_score NUMERIC DEFAULT 0 CHECK (infrastructure_score >= 0 AND infrastructure_score <= 100),
    economic_diversity NUMERIC DEFAULT 0 CHECK (economic_diversity >= 0 AND economic_diversity <= 100),
    water_security NUMERIC DEFAULT 0 CHECK (water_security >= 0 AND water_security <= 100),
    overall_score NUMERIC DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
    trend TEXT DEFAULT 'stable',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_climate_observations_district ON public.climate_observations(district_id);
CREATE INDEX idx_climate_observations_date ON public.climate_observations(observation_date);
CREATE INDEX idx_migration_events_source ON public.migration_events(source_district_id);
CREATE INDEX idx_migration_events_dest ON public.migration_events(destination_district_id);
CREATE INDEX idx_migration_events_date ON public.migration_events(event_date);
CREATE INDEX idx_causal_links_variables ON public.causal_links(cause_variable, effect_variable);
CREATE INDEX idx_policy_interventions_district ON public.policy_interventions(district_id);
CREATE INDEX idx_resilience_scores_district ON public.resilience_scores(district_id);

-- Enable RLS on all tables
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.climate_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.causal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counterfactual_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.causal_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resilience_scores ENABLE ROW LEVEL SECURITY;

-- Create public read policies for all tables (dashboard is public)
CREATE POLICY "Public read access for districts" ON public.districts FOR SELECT USING (true);
CREATE POLICY "Public read access for climate_observations" ON public.climate_observations FOR SELECT USING (true);
CREATE POLICY "Public read access for migration_events" ON public.migration_events FOR SELECT USING (true);
CREATE POLICY "Public read access for causal_links" ON public.causal_links FOR SELECT USING (true);
CREATE POLICY "Public read access for policy_interventions" ON public.policy_interventions FOR SELECT USING (true);
CREATE POLICY "Public read access for counterfactual_scenarios" ON public.counterfactual_scenarios FOR SELECT USING (true);
CREATE POLICY "Public read access for simulation_runs" ON public.simulation_runs FOR SELECT USING (true);
CREATE POLICY "Public read access for causal_certificates" ON public.causal_certificates FOR SELECT USING (true);
CREATE POLICY "Public read access for resilience_scores" ON public.resilience_scores FOR SELECT USING (true);

-- Allow anonymous inserts for simulation runs (users can run simulations without auth)
CREATE POLICY "Allow anonymous inserts for simulation_runs" ON public.simulation_runs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous inserts for causal_certificates" ON public.causal_certificates FOR INSERT WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_districts_updated_at BEFORE UPDATE ON public.districts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_causal_links_updated_at BEFORE UPDATE ON public.causal_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_policy_interventions_updated_at BEFORE UPDATE ON public.policy_interventions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();