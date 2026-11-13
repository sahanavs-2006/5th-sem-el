import {
  CorridorItem,
  DatasetItem,
  UtilityRecord,
  SimulationResponse,
  DashboardStats
} from '../types/infrastructure';

const API_BASE = '/api';

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/dashboard-stats`);
  if (!res.ok) throw new Error(`Dashboard stats fetch failed: ${res.statusText}`);
  return res.json();
}

export async function fetchCorridors(): Promise<CorridorItem[]> {
  const res = await fetch(`${API_BASE}/corridors`);
  if (!res.ok) throw new Error(`Corridors fetch failed: ${res.statusText}`);
  return res.json();
}

export async function fetchDatasets(): Promise<DatasetItem[]> {
  const res = await fetch(`${API_BASE}/datasets`);
  if (!res.ok) throw new Error(`Datasets fetch failed: ${res.statusText}`);
  return res.json();
}

export async function fetchUtilities(corridorId?: string, includeDemo = true): Promise<UtilityRecord[]> {
  const params = new URLSearchParams();
  if (corridorId) params.append('corridor_id', corridorId);
  params.append('include_demo', includeDemo.toString());

  const res = await fetch(`${API_BASE}/utilities?${params.toString()}`);
  if (!res.ok) throw new Error(`Utilities fetch failed: ${res.statusText}`);
  return res.json();
}

export async function simulateConflict(params: {
  corridor_id: string;
  center_x: number;
  center_y: number;
  length_m: number;
  width_m: number;
  depth_m: number;
  rotation_deg: number;
  trench_purpose?: string;
}): Promise<SimulationResponse> {
  const res = await fetch(`${API_BASE}/simulate-conflict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Simulation failed: ${res.statusText}`);
  return res.json();
}

export async function uploadDatasetFile(formData: FormData): Promise<any> {
  const res = await fetch(`${API_BASE}/datasets/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  return res.json();
}

export async function fetchAllExperiments(): Promise<any> {
  const res = await fetch(`${API_BASE}/experiments/all`);
  if (!res.ok) throw new Error(`Experiments fetch failed: ${res.statusText}`);
  return res.json();
}

export async function fetchSingleExperiment(expId: number): Promise<any> {
  const res = await fetch(`${API_BASE}/experiments/${expId}`);
  if (!res.ok) throw new Error(`Experiment ${expId} fetch failed: ${res.statusText}`);
  return res.json();
}

export async function fetchModelBenchmarks(): Promise<any> {
  const res = await fetch(`${API_BASE}/model-benchmarks`);
  if (!res.ok) throw new Error(`Model benchmarks fetch failed: ${res.statusText}`);
  return res.json();
}

