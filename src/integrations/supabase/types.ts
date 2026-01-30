export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      causal_certificates: {
        Row: {
          certificate_type: string
          created_at: string
          expires_at: string | null
          falsification_attempts: number | null
          falsification_failures: number | null
          id: string
          is_valid: boolean | null
          issued_at: string
          placebo_tests_passed: number | null
          placebo_tests_total: number | null
          sensitivity_score: number | null
          simulation_run_id: string | null
          validity_reason: string | null
        }
        Insert: {
          certificate_type?: string
          created_at?: string
          expires_at?: string | null
          falsification_attempts?: number | null
          falsification_failures?: number | null
          id?: string
          is_valid?: boolean | null
          issued_at?: string
          placebo_tests_passed?: number | null
          placebo_tests_total?: number | null
          sensitivity_score?: number | null
          simulation_run_id?: string | null
          validity_reason?: string | null
        }
        Update: {
          certificate_type?: string
          created_at?: string
          expires_at?: string | null
          falsification_attempts?: number | null
          falsification_failures?: number | null
          id?: string
          is_valid?: boolean | null
          issued_at?: string
          placebo_tests_passed?: number | null
          placebo_tests_total?: number | null
          sensitivity_score?: number | null
          simulation_run_id?: string | null
          validity_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "causal_certificates_simulation_run_id_fkey"
            columns: ["simulation_run_id"]
            isOneToOne: false
            referencedRelation: "simulation_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      causal_links: {
        Row: {
          analysis_method: string | null
          cause_variable: string
          confidence_lower: number | null
          confidence_upper: number | null
          created_at: string
          effect_variable: string
          id: string
          is_nonlinear: boolean | null
          lag_days: number | null
          nonlinearity_type: string | null
          p_value: number | null
          sample_size: number | null
          strength: number
          updated_at: string
        }
        Insert: {
          analysis_method?: string | null
          cause_variable: string
          confidence_lower?: number | null
          confidence_upper?: number | null
          created_at?: string
          effect_variable: string
          id?: string
          is_nonlinear?: boolean | null
          lag_days?: number | null
          nonlinearity_type?: string | null
          p_value?: number | null
          sample_size?: number | null
          strength: number
          updated_at?: string
        }
        Update: {
          analysis_method?: string | null
          cause_variable?: string
          confidence_lower?: number | null
          confidence_upper?: number | null
          created_at?: string
          effect_variable?: string
          id?: string
          is_nonlinear?: boolean | null
          lag_days?: number | null
          nonlinearity_type?: string | null
          p_value?: number | null
          sample_size?: number | null
          strength?: number
          updated_at?: string
        }
        Relationships: []
      }
      climate_observations: {
        Row: {
          created_at: string
          district_id: string
          groundwater_level: number | null
          humidity_percent: number | null
          id: string
          observation_date: string
          rainfall_mm: number | null
          soil_moisture: number | null
          temperature_max: number | null
          temperature_min: number | null
        }
        Insert: {
          created_at?: string
          district_id: string
          groundwater_level?: number | null
          humidity_percent?: number | null
          id?: string
          observation_date: string
          rainfall_mm?: number | null
          soil_moisture?: number | null
          temperature_max?: number | null
          temperature_min?: number | null
        }
        Update: {
          created_at?: string
          district_id?: string
          groundwater_level?: number | null
          humidity_percent?: number | null
          id?: string
          observation_date?: string
          rainfall_mm?: number | null
          soil_moisture?: number | null
          temperature_max?: number | null
          temperature_min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "climate_observations_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      counterfactual_scenarios: {
        Row: {
          baseline_crop_failure: number | null
          baseline_economic_loss: number | null
          baseline_migration: number | null
          baseline_water_stress: number | null
          confidence_interval_lower: number | null
          confidence_interval_upper: number | null
          created_at: string
          description: string | null
          id: string
          intervention_id: string | null
          name: string
          projected_crop_failure: number | null
          projected_economic_loss: number | null
          projected_migration: number | null
          projected_water_stress: number | null
          treatment_effect_crop_failure: number | null
          treatment_effect_economic: number | null
          treatment_effect_migration: number | null
          treatment_effect_water_stress: number | null
        }
        Insert: {
          baseline_crop_failure?: number | null
          baseline_economic_loss?: number | null
          baseline_migration?: number | null
          baseline_water_stress?: number | null
          confidence_interval_lower?: number | null
          confidence_interval_upper?: number | null
          created_at?: string
          description?: string | null
          id?: string
          intervention_id?: string | null
          name: string
          projected_crop_failure?: number | null
          projected_economic_loss?: number | null
          projected_migration?: number | null
          projected_water_stress?: number | null
          treatment_effect_crop_failure?: number | null
          treatment_effect_economic?: number | null
          treatment_effect_migration?: number | null
          treatment_effect_water_stress?: number | null
        }
        Update: {
          baseline_crop_failure?: number | null
          baseline_economic_loss?: number | null
          baseline_migration?: number | null
          baseline_water_stress?: number | null
          confidence_interval_lower?: number | null
          confidence_interval_upper?: number | null
          created_at?: string
          description?: string | null
          id?: string
          intervention_id?: string | null
          name?: string
          projected_crop_failure?: number | null
          projected_economic_loss?: number | null
          projected_migration?: number | null
          projected_water_stress?: number | null
          treatment_effect_crop_failure?: number | null
          treatment_effect_economic?: number | null
          treatment_effect_migration?: number | null
          treatment_effect_water_stress?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "counterfactual_scenarios_intervention_id_fkey"
            columns: ["intervention_id"]
            isOneToOne: false
            referencedRelation: "policy_interventions"
            referencedColumns: ["id"]
          },
        ]
      }
      districts: {
        Row: {
          area_sq_km: number | null
          code: string
          created_at: string
          crop_failure_rate: number | null
          drought_index: number | null
          elevation: number | null
          id: string
          name: string
          net_migration: number | null
          population: number | null
          updated_at: string
          water_stress_index: number | null
          x_coord: number
          y_coord: number
        }
        Insert: {
          area_sq_km?: number | null
          code: string
          created_at?: string
          crop_failure_rate?: number | null
          drought_index?: number | null
          elevation?: number | null
          id?: string
          name: string
          net_migration?: number | null
          population?: number | null
          updated_at?: string
          water_stress_index?: number | null
          x_coord: number
          y_coord: number
        }
        Update: {
          area_sq_km?: number | null
          code?: string
          created_at?: string
          crop_failure_rate?: number | null
          drought_index?: number | null
          elevation?: number | null
          id?: string
          name?: string
          net_migration?: number | null
          population?: number | null
          updated_at?: string
          water_stress_index?: number | null
          x_coord?: number
          y_coord?: number
        }
        Relationships: []
      }
      migration_events: {
        Row: {
          confidence: number | null
          created_at: string
          destination_district_id: string
          event_date: string
          id: string
          primary_cause: Database["public"]["Enums"]["migration_cause"]
          secondary_causes:
            | Database["public"]["Enums"]["migration_cause"][]
            | null
          source_district_id: string
          volume: number
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          destination_district_id: string
          event_date: string
          id?: string
          primary_cause?: Database["public"]["Enums"]["migration_cause"]
          secondary_causes?:
            | Database["public"]["Enums"]["migration_cause"][]
            | null
          source_district_id: string
          volume?: number
        }
        Update: {
          confidence?: number | null
          created_at?: string
          destination_district_id?: string
          event_date?: string
          id?: string
          primary_cause?: Database["public"]["Enums"]["migration_cause"]
          secondary_causes?:
            | Database["public"]["Enums"]["migration_cause"][]
            | null
          source_district_id?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "migration_events_destination_district_id_fkey"
            columns: ["destination_district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "migration_events_source_district_id_fkey"
            columns: ["source_district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_interventions: {
        Row: {
          budget_crores: number | null
          climate_policy_intensity: number | null
          created_at: string
          district_id: string | null
          end_date: string | null
          expected_economic_stability: number | null
          expected_migration_reduction: number | null
          expected_water_security: number | null
          id: string
          intervention_type: string
          name: string
          start_date: string | null
          status: Database["public"]["Enums"]["intervention_status"] | null
          updated_at: string
          water_subsidy_percent: number | null
        }
        Insert: {
          budget_crores?: number | null
          climate_policy_intensity?: number | null
          created_at?: string
          district_id?: string | null
          end_date?: string | null
          expected_economic_stability?: number | null
          expected_migration_reduction?: number | null
          expected_water_security?: number | null
          id?: string
          intervention_type: string
          name: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["intervention_status"] | null
          updated_at?: string
          water_subsidy_percent?: number | null
        }
        Update: {
          budget_crores?: number | null
          climate_policy_intensity?: number | null
          created_at?: string
          district_id?: string | null
          end_date?: string | null
          expected_economic_stability?: number | null
          expected_migration_reduction?: number | null
          expected_water_security?: number | null
          id?: string
          intervention_type?: string
          name?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["intervention_status"] | null
          updated_at?: string
          water_subsidy_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_interventions_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      resilience_scores: {
        Row: {
          climate_resilience: number | null
          created_at: string
          district_id: string
          economic_diversity: number | null
          id: string
          infrastructure_score: number | null
          overall_score: number | null
          score_date: string
          social_risk_index: number | null
          trend: string | null
          water_security: number | null
        }
        Insert: {
          climate_resilience?: number | null
          created_at?: string
          district_id: string
          economic_diversity?: number | null
          id?: string
          infrastructure_score?: number | null
          overall_score?: number | null
          score_date?: string
          social_risk_index?: number | null
          trend?: string | null
          water_security?: number | null
        }
        Update: {
          climate_resilience?: number | null
          created_at?: string
          district_id?: string
          economic_diversity?: number | null
          id?: string
          infrastructure_score?: number | null
          overall_score?: number | null
          score_date?: string
          social_risk_index?: number | null
          trend?: string | null
          water_security?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resilience_scores_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_runs: {
        Row: {
          butterfly_effect_enabled: boolean | null
          climate_policy_input: number | null
          created_at: string
          economic_stability_percent: number | null
          id: string
          lives_stabilized: number | null
          migration_reduction_percent: number | null
          monsoon_modifier: number | null
          robustness_score: number | null
          run_name: string | null
          run_timestamp: string
          status: string | null
          successful_iterations: number | null
          total_iterations: number | null
          water_security_percent: number | null
          water_subsidy_input: number | null
        }
        Insert: {
          butterfly_effect_enabled?: boolean | null
          climate_policy_input?: number | null
          created_at?: string
          economic_stability_percent?: number | null
          id?: string
          lives_stabilized?: number | null
          migration_reduction_percent?: number | null
          monsoon_modifier?: number | null
          robustness_score?: number | null
          run_name?: string | null
          run_timestamp?: string
          status?: string | null
          successful_iterations?: number | null
          total_iterations?: number | null
          water_security_percent?: number | null
          water_subsidy_input?: number | null
        }
        Update: {
          butterfly_effect_enabled?: boolean | null
          climate_policy_input?: number | null
          created_at?: string
          economic_stability_percent?: number | null
          id?: string
          lives_stabilized?: number | null
          migration_reduction_percent?: number | null
          monsoon_modifier?: number | null
          robustness_score?: number | null
          run_name?: string | null
          run_timestamp?: string
          status?: string | null
          successful_iterations?: number | null
          total_iterations?: number | null
          water_security_percent?: number | null
          water_subsidy_input?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      intervention_status: "planned" | "active" | "completed" | "cancelled"
      migration_cause:
        | "drought"
        | "flood"
        | "economic"
        | "crop_failure"
        | "debt"
        | "conflict"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      intervention_status: ["planned", "active", "completed", "cancelled"],
      migration_cause: [
        "drought",
        "flood",
        "economic",
        "crop_failure",
        "debt",
        "conflict",
        "other",
      ],
    },
  },
} as const
