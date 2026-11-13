import math
import numpy as np
from typing import Dict, Any, List, Tuple

# ASCE 38-22 Standard Quality Levels Reference
ASCE_QL_SPECS = {
    "QL-A": {
        "description": "Precise horizontal and vertical location determined by non-destructive actual exposure (e.g., vacuum excavation potholing).",
        "max_horizontal_uncertainty_m": 0.08,
        "max_vertical_uncertainty_m": 0.05,
        "base_reliability": 0.98,
        "verification_class": "Field Validated"
    },
    "QL-B": {
        "description": "Two-dimensional horizontal mapping and depth estimation using surface geophysical methods (e.g., GPR, electromagnetic locators).",
        "max_horizontal_uncertainty_m": 0.25,
        "max_vertical_uncertainty_m": 0.18,
        "base_reliability": 0.88,
        "verification_class": "Geophysically Traced"
    },
    "QL-C": {
        "description": "Correlation of surface-visible utility features (manholes, valve boxes, hydrants) with municipal utility records.",
        "max_horizontal_uncertainty_m": 0.65,
        "max_vertical_uncertainty_m": 0.40,
        "base_reliability": 0.75,
        "verification_class": "Surface Correlated"
    },
    "QL-D": {
        "description": "Information derived purely from existing records, historical drawings, schematic route maps, or verbal recollections.",
        "max_horizontal_uncertainty_m": 1.50,
        "max_vertical_uncertainty_m": 0.80,
        "base_reliability": 0.55,
        "verification_class": "Unverified Records"
    }
}

def calculate_confidence_score(
    asce_ql: str,
    source_reliability: float,
    depth_status: str,
    has_diameter: bool,
    has_material: bool,
    installation_year: int,
    horizontal_unc_m: float,
    vertical_unc_m: float,
    current_year: int = 2026
) -> Dict[str, Any]:
    """
    Mathematically explainable multi-factor confidence scoring model.
    Section 7 requirement: Define and document exact scoring methodology.
    
    Composite Confidence Score:
    S_conf = w_source * R_s + w_comp * C_attr + w_age * A(t) + w_horiz * (1 - unc_h / 2.0) + w_vert * (1 - unc_z / 1.0)
    """
    # 1. Attribute completeness score (0 to 1)
    completeness_elements = [
        1.0 if depth_status == 'measured' else 0.5,
        1.0 if has_diameter else 0.0,
        1.0 if has_material else 0.0,
        1.0 if installation_year > 1900 else 0.0
    ]
    completeness_score = sum(completeness_elements) / len(completeness_elements)

    # 2. Data age decay factor A(t) = exp(-0.015 * age_years)
    age_years = max(0, current_year - installation_year)
    age_decay = math.exp(-0.015 * min(age_years, 60))

    # 3. Normalized positional precision
    horiz_precision = max(0.0, min(1.0, 1.0 - (horizontal_unc_m / 2.0)))
    vert_precision = max(0.0, min(1.0, 1.0 - (vertical_unc_m / 1.0)))

    # 4. Weighted combination
    w_source = 0.25
    w_comp = 0.15
    w_age = 0.15
    w_horiz = 0.25
    w_vert = 0.20

    raw_score = (
        w_source * source_reliability +
        w_comp * completeness_score +
        w_age * age_decay +
        w_horiz * horiz_precision +
        w_vert * vert_precision
    )

    # Scale and bound between 0.05 and 0.99
    final_score = round(max(0.05, min(0.99, raw_score)), 3)

    if final_score >= 0.80:
        conf_class = "High"
    elif final_score >= 0.60:
        conf_class = "Medium"
    else:
        conf_class = "Low"

    return {
        "confidence_score": final_score,
        "confidence_percentage": round(final_score * 100, 1),
        "confidence_class": conf_class,
        "breakdown": {
            "source_reliability_contribution": round(w_source * source_reliability, 3),
            "completeness_score": round(completeness_score, 3),
            "age_decay_factor": round(age_decay, 3),
            "horizontal_precision_factor": round(horiz_precision, 3),
            "vertical_precision_factor": round(vert_precision, 3)
        },
        "asce_quality_level": asce_ql,
        "asce_description": ASCE_QL_SPECS.get(asce_ql, {}).get("description", "Standard specification")
    }

def generate_3d_uncertainty_envelope(
    path_points: List[Dict[str, float]],
    horizontal_unc_m: float,
    vertical_unc_m: float,
    num_samples: int = 500
) -> Dict[str, Any]:
    """
    Computes 3D Uncertainty Ellipsoid and Confidence Envelopes
    around a 3D utility centerline for visualization and Monte Carlo simulation.
    k = 1.96 for 95% marginal confidence intervals.
    """
    k = 1.96
    envelopes = []
    
    for pt in path_points:
        x, y, z = pt["x"], pt["y"], pt["z"]
        envelopes.append({
            "center": {"x": x, "y": y, "z": z},
            "semi_axes": {
                "dx": round(k * horizontal_unc_m, 3),
                "dy": round(k * horizontal_unc_m, 3),
                "dz": round(k * vertical_unc_m, 3)
            },
            "bounds": {
                "x_min": round(x - k * horizontal_unc_m, 3),
                "x_max": round(x + k * horizontal_unc_m, 3),
                "y_min": round(y - k * horizontal_unc_m, 3),
                "y_max": round(y + k * horizontal_unc_m, 3),
                "z_min": round(z - k * vertical_unc_m, 3),
                "z_max": round(z + k * vertical_unc_m, 3)
            }
        })

    return {
        "k_factor": k,
        "confidence_interval": "95%",
        "points_count": len(path_points),
        "envelopes": envelopes
    }

def monte_carlo_strike_probability(
    nominal_distance_m: float,
    pipe_radius_m: float,
    clearance_threshold_m: float,
    horizontal_unc_m: float,
    vertical_unc_m: float,
    iterations: int = 1000
) -> Dict[str, Any]:
    """
    Monte Carlo simulation for spatial uncertainty propagation to estimate
    exact probabilistic risk of physical collision or clearance breach.
    """
    np.random.seed(42)
    # 2D/3D Gaussian perturbation
    dx = np.random.normal(0, horizontal_unc_m, iterations)
    dy = np.random.normal(0, horizontal_unc_m, iterations)
    dz = np.random.normal(0, vertical_unc_m, iterations)

    radial_offset = np.sqrt(dx**2 + dy**2)
    perturbed_dist = np.maximum(0, nominal_distance_m - radial_offset - np.abs(dz))

    physical_strike_threshold = pipe_radius_m
    clearance_violation_threshold = pipe_radius_m + clearance_threshold_m

    direct_strikes = np.sum(perturbed_dist <= physical_strike_threshold)
    clearance_violations = np.sum(perturbed_dist <= clearance_violation_threshold)

    p_strike = float(direct_strikes / iterations)
    p_clearance_breach = float(clearance_violations / iterations)

    return {
        "iterations": iterations,
        "direct_strike_probability": round(p_strike, 4),
        "clearance_violation_probability": round(p_clearance_breach, 4),
        "combined_conflict_probability": round(max(p_strike, p_clearance_breach * 0.8), 4),
        "min_simulated_distance_m": round(float(np.min(perturbed_dist)), 3),
        "median_simulated_distance_m": round(float(np.median(perturbed_dist)), 3),
        "p95_worst_case_distance_m": round(float(np.percentile(perturbed_dist, 5)), 3)
    }

