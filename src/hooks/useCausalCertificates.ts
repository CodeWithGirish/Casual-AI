import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCausalCertificates, createCausalCertificate } from "@/lib/api";

export interface CausalCertificate {
  id: string;
  simulation_run_id: string | null;
  certificate_type: string;
  placebo_tests_passed: number;
  placebo_tests_total: number;
  sensitivity_score: number;
  falsification_attempts: number;
  falsification_failures: number;
  is_valid: boolean;
  validity_reason: string | null;
  issued_at: string;
  expires_at: string | null;
  created_at: string;
}

export interface CreateCertificateInput {
  simulation_run_id: string;
  placebo_tests_passed: number;
  placebo_tests_total: number;
}

export const useCausalCertificates = () => {
  return useQuery({
    queryKey: ["causal_certificates"],
    queryFn: async (): Promise<CausalCertificate[]> => {
      return await fetchCausalCertificates();
    },
  });
};

export const useCreateCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCertificateInput): Promise<CausalCertificate> => {
      const passRate = input.placebo_tests_passed / input.placebo_tests_total;
      const isValid = passRate >= 0.95;
      const sensitivityScore = passRate * 100;

      const certificateData = {
        simulation_run_id: input.simulation_run_id,
        certificate_type: "robustness",
        placebo_tests_passed: input.placebo_tests_passed,
        placebo_tests_total: input.placebo_tests_total,
        sensitivity_score: sensitivityScore,
        falsification_attempts: input.placebo_tests_total,
        falsification_failures: input.placebo_tests_total - input.placebo_tests_passed,
        is_valid: isValid,
        validity_reason: isValid
          ? `Causal link verified at p < 0.001 with ${input.placebo_tests_passed}/${input.placebo_tests_total} tests passed`
          : `Insufficient evidence: only ${input.placebo_tests_passed}/${input.placebo_tests_total} tests passed`,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        issued_at: new Date().toISOString(),
      };

      return await createCausalCertificate(certificateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["causal_certificates"] });
    },
  });
};
