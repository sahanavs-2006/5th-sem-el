export type UtilityType = 'water' | 'drainage' | 'electrical' | 'gas';

export interface UtilityCategoryMeta {
  id: UtilityType;
  name: string;
  categoryName: string;
  color: string;
  badgeColor: string;
  hexColor: string;
  threeColor: number;
  nominalDiameterMm: number;
  typicalDepthM: number;
  clearanceThresholdM: number;
  hazardWeight: number;
  description: string;
}

export const UTILITY_CATEGORIES: Record<UtilityType, UtilityCategoryMeta> = {
  water: {
    id: 'water',
    name: 'Water Pipeline',
    categoryName: 'Water Supply Network',
    color: 'text-sky-500 border-sky-300 bg-sky-50',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    hexColor: '#0284c7', // Sky / Deep Blue
    threeColor: 0x0284c7,
    nominalDiameterMm: 450,
    typicalDepthM: 1.8,
    clearanceThresholdM: 0.6,
    hazardWeight: 0.65,
    description: 'High-pressure potable water main (BWSSB Cauvery Stage IV Feeder)'
  },
  drainage: {
    id: 'drainage',
    name: 'Drainage & Sewer',
    categoryName: 'Stormwater & Wastewater',
    color: 'text-emerald-500 border-emerald-300 bg-emerald-50',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    hexColor: '#10b981', // Emerald Green
    threeColor: 0x10b981,
    nominalDiameterMm: 600,
    typicalDepthM: 2.4,
    clearanceThresholdM: 0.8,
    hazardWeight: 0.55,
    description: 'Gravity-fed stormwater & sewage conduit (Reinforced Concrete NP3)'
  },
  electrical: {
    id: 'electrical',
    name: 'Electrical Cable',
    categoryName: 'Power Distribution Network',
    color: 'text-rose-500 border-rose-300 bg-rose-50',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    hexColor: '#ef4444', // Red
    threeColor: 0xef4444,
    nominalDiameterMm: 110,
    typicalDepthM: 1.2,
    clearanceThresholdM: 1.0,
    hazardWeight: 0.95,
    description: 'High-voltage underground armored distribution feeder (BESCOM 11kV)'
  },
  gas: {
    id: 'gas',
    name: 'Gas Pipeline',
    categoryName: 'Natural Gas Distribution',
    color: 'text-amber-500 border-amber-300 bg-amber-50',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    hexColor: '#f59e0b', // Amber / Yellow
    threeColor: 0xf59e0b,
    nominalDiameterMm: 125,
    typicalDepthM: 1.0,
    clearanceThresholdM: 1.2,
    hazardWeight: 0.98,
    description: 'Pressurized city gas distribution pipeline (GAIL Gas MDPE PE100)'
  }
};

export interface CorridorItem {
  id: string;
  name: string;
  ward_name: string;
  ward_no: number;
  zone: string;
  center_lat: number;
  center_lon: number;
  description: string;
  pilot_study: boolean;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface DatasetItem {
  id: string;
  dataset_name: string;
  department: string;
  source_url: string;
  format: string;
  geographic_coverage: string;
  attributes: string;
  availability_status: string;
  access_code: number;
  license: string;
  asce_ql_baseline: string;
  reliability_weight: number;
  limitations: string;
  last_inspected: string;
  is_demonstration: boolean;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface UncertaintyEnvelope {
  k_factor: number;
  confidence_interval: string;
  points_count: number;
  envelopes: Array<{
    center: Point3D;
    semi_axes: { dx: number; dy: number; dz: number };
    bounds: {
      x_min: number;
      x_max: number;
      y_min: number;
      y_max: number;
      z_min: number;
      z_max: number;
    };
  }>;
}

export interface UtilityRecord {
  id: string;
  utility_code: string;
  category: UtilityType;
  category_name: string;
  source_department: string;
  corridor_id: string;
  geometry_type: string;
  coordinates: Array<[number, number]>;
  path_3d: Point3D[];
  nominal_depth_m: number;
  depth_measurement_status: 'measured' | 'inferred';
  depth_estimation_source: string;
  diameter_mm: number;
  material: string;
  installation_year: number;
  data_source_id: string;
  acquisition_date: string;
  asce_quality_level: 'QL-A' | 'QL-B' | 'QL-C' | 'QL-D';
  confidence_score: number;
  confidence_class: 'High' | 'Medium' | 'Low';
  horizontal_uncertainty_m: number;
  vertical_uncertainty_m: number;
  verification_status: string;
  hazard_weight: number;
  soil_type: string;
  nearest_road: string;
  is_demonstration: boolean;
  uncertainty_envelope?: UncertaintyEnvelope;
}

export interface ConflictDetectionResult {
  utility_id: string;
  utility_code: string;
  category: UtilityType;
  category_name: string;
  nominal_depth_m: number;
  nominal_distance_m: number;
  nominal_intersection: boolean;
  clearance_violation: boolean;
  worst_case_distance_m: number;
  uncertainty_margin_m: number;
  conflict_probability: number;
  conflict_classification: 'Direct Collision' | 'Potential Conflict Considering Uncertainty' | 'Caution Distance Violation' | 'No Conflict';
  severity_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';
  hazard_weight: number;
  closest_utility_point: Point3D;
  closest_excavation_point: Point3D;
  asce_quality_level: string;
  confidence_score: number;
  justification: string;
  recommended_action: string;
  monte_carlo_details?: {
    iterations: number;
    direct_strike_probability: number;
    clearance_violation_probability: number;
    combined_conflict_probability: number;
    min_simulated_distance_m: number;
    median_simulated_distance_m: number;
    p95_worst_case_distance_m: number;
  };
  ai_risk_assessment?: {
    predicted_risk_level: 'Low' | 'Medium' | 'High';
    risk_score: number;
    probabilities: { low: number; medium: number; high: number };
    rule_based_baseline_score: number;
    ml_confidence: number;
    model_version: string;
    local_explainability: Array<{
      feature: string;
      contribution: number;
      effect: string;
    }>;
    engineering_risk_verdict: string;
  };
}

export interface SimulationResponse {
  simulation_id: string;
  corridor_id: string;
  excavation_parameters: {
    center_x: number;
    center_y: number;
    length_m: number;
    width_m: number;
    depth_m: number;
    rotation_deg: number;
  };
  total_utilities_evaluated: number;
  critical_conflicts_count: number;
  overall_risk_score: number;
  overall_risk_class: string;
  conflicts: ConflictDetectionResult[];
  engineering_recommendations: Array<{
    code: string;
    title: string;
    priority: string;
    directive: string;
  }>;
}

export interface DashboardStats {
  total_utilities: number;
  total_datasets: number;
  total_corridors: number;
  category_distribution: Record<string, number>;
  asce_ql_distribution: Record<string, number>;
  confidence_distribution: Record<string, number>;
  active_pilot_corridor: string;
  institution: string;
}

