
const BASE_URL = 'http://localhost:5000/api';

export const fetchDistricts = async () => {
    const response = await fetch(`${BASE_URL}/districts`);
    if (!response.ok) throw new Error('Failed to fetch districts');
    return await response.json();
};

export const fetchCausalLinks = async () => {
    const response = await fetch(`${BASE_URL}/causal_links`);
    if (!response.ok) throw new Error('Failed to fetch causal links');
    return await response.json();
};

export const fetchCounterfactualScenarios = async () => {
    const response = await fetch(`${BASE_URL}/counterfactual_scenarios`);
    if (!response.ok) throw new Error('Failed to fetch counterfactual scenarios');
    return await response.json();
};

export const fetchFairnessAudit = async () => {
    const response = await fetch(`${BASE_URL}/fairness_audit`);
    if (!response.ok) throw new Error('Failed to fetch fairness audit');
    return await response.json();
};

export const fetchResilienceScores = async () => {
    const response = await fetch(`${BASE_URL}/resilience_scorecard`);
    if (!response.ok) throw new Error('Failed to fetch resilience scores');
    return await response.json();
};

export const fetchRawResilienceScores = async () => {
    const response = await fetch(`${BASE_URL}/resilience_scores`);
    if (!response.ok) throw new Error('Failed to fetch raw resilience scores');
    return await response.json();
};

export const fetchSimulationRuns = async () => {
    const response = await fetch(`${BASE_URL}/simulation_runs`);
    if (!response.ok) throw new Error('Failed to fetch simulation runs');
    return await response.json();
};

export const createSimulationRun = async (data: any) => {
    const response = await fetch(`${BASE_URL}/simulation_runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create simulation run');
    return await response.json();
};

export const fetchCausalCertificates = async () => {
    const response = await fetch(`${BASE_URL}/causal_certificates`);
    if (!response.ok) throw new Error('Failed to fetch causal certificates');
    return await response.json();
};

export const createCausalCertificate = async (data: any) => {
    const response = await fetch(`${BASE_URL}/causal_certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create causal certificate');
    return await response.json();
};

export const fetchMigrationEvents = async () => {
    const response = await fetch(`${BASE_URL}/migration_events`);
    if (!response.ok) throw new Error('Failed to fetch migration events');
    return await response.json();
};

export const fetchPolicyInterventions = async () => {
    const response = await fetch(`${BASE_URL}/policy_interventions`);
    if (!response.ok) throw new Error('Failed to fetch policy interventions');
    return await response.json();
};

export const predictImpact = async (data: { district_id: string; budget: number; time_horizon: number; scale: number }) => {
    const response = await fetch(`${BASE_URL}/predict_impact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to predict impact');
    return await response.json();
};

export const fetchAIRecommendations = async () => {
    const response = await fetch(`${BASE_URL}/ai_recommendations`);
    if (!response.ok) throw new Error('Failed to fetch AI recommendations');
    return await response.json();
};

export const discoverCausality = async () => {
    const response = await fetch(`${BASE_URL}/discover_causality`);
    if (!response.ok) throw new Error('Failed to discover causality');
    return await response.json();
};

export const simulatePolicy = async (data: any) => {
    const response = await fetch(`${BASE_URL}/simulate_policy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to simulate policy');
    return await response.json();
};

export const generateCounterfactual = async (data: any) => {
    const response = await fetch(`${BASE_URL}/generate_dynamic_counterfactuals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to generate counterfactual');
    return await response.json();
};

