import math
import numpy as np
from typing import Dict, Any, List
from .uncertainty import monte_carlo_strike_probability

# Minimum safe clearance regulations (meters) per Indian & international codes
SAFETY_CLEARANCE_THRESHOLDS = {
    "gas": {
        "clearance_m": 1.20,
        "hazard_weight": 0.98,
        "critical_alert": "Pneumatic/Mechanical excavator rupture risks catastrophic deflagration / pipeline rupture."
    },
    "electrical": {
        "clearance_m": 1.00,
        "hazard_weight": 0.95,
        "critical_alert": "Direct tooth contact with 11kV cable induces lethal electric arc flash & grid blackouts."
    },
    "water": {
        "clearance_m": 0.60,
        "hazard_weight": 0.65,
        "critical_alert": "High pressure potable main fracture causes localized street flooding, cavitation & road subsidence."
    },
    "drainage": {
        "clearance_m": 0.80,
        "hazard_weight": 0.55,
        "critical_alert": "Sewer conduit breach releases hazardous bio-solids, toxic H2S fumes, and sanitary contamination."
    }
}

def point_to_segment_distance_3d(px: float, py: float, pz: float,
                                 x1: float, y1: float, z1: float,
                                 x2: float, y2: float, z2: float) -> float:
    """Computes minimum 3D Euclidean distance between a point and a line segment."""
    dx = x2 - x1
    dy = y2 - y1
    dz = z2 - z1
    seg_len_sq = dx*dx + dy*dy + dz*dz

    if seg_len_sq == 0:
        return math.sqrt((px - x1)**2 + (py - y1)**2 + (pz - z1)**2)

    # Project point onto line segment
    t = max(0.0, min(1.0, ((px - x1)*dx + (py - y1)*dy + (pz - z1)*dz) / seg_len_sq))
    proj_x = x1 + t * dx
    proj_y = y1 + t * dy
    proj_z = z1 + t * dz

    return math.sqrt((px - proj_x)**2 + (py - proj_y)**2 + (pz - proj_z)**2)

def evaluate_excavation_conflict(
    excavation: Dict[str, Any],
    utility: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluates 3D spatial conflict between a planned excavation prism and a utility.
    Excavation parameters:
    - center_x, center_y
    - length_m (along X)
    - width_m (along Y)
    - depth_m (positive, penetrates to -depth_m)
    - rotation_deg
    """
    cat = utility["category"].lower()
    meta = SAFETY_CLEARANCE_THRESHOLDS.get(cat, SAFETY_CLEARANCE_THRESHOLDS["water"])
    clearance_m = meta["clearance_m"]
    hazard_weight = meta["hazard_weight"]

    pipe_radius_m = (utility.get("diameter_mm", 200.0) / 1000.0) / 2.0
    horiz_unc = utility.get("horizontal_uncertainty_m", 0.50)
    vert_unc = utility.get("vertical_uncertainty_m", 0.30)
    conf_score = utility.get("confidence_score", 0.70)
    asce_ql = utility.get("asce_quality_level", "QL-D")

    # Excavation 3D AABB approximation (transformed to local coordinates)
    exc_cx = excavation.get("center_x", 0.0)
    exc_cy = excavation.get("center_y", 0.0)
    exc_l = excavation.get("length_m", 10.0)
    exc_w = excavation.get("width_m", 3.0)
    exc_depth = excavation.get("depth_m", 2.0)

    # 3D Path of utility
    path = utility.get("path_3d", [])
    if not path and "path_3d_json" in utility:
        import json
        path = json.loads(utility["path_3d_json"])

    min_distance = float('inf')
    closest_util_pt = None
    closest_exc_pt = None

    # Sample points on excavation box boundary
    x_min, x_max = exc_cx - exc_l / 2.0, exc_cx + exc_l / 2.0
    y_min, y_max = exc_cy - exc_w / 2.0, exc_cy + exc_w / 2.0
    z_min, z_max = -exc_depth, 0.0

    # Test all segments of the utility path against the excavation prism
    for i in range(len(path) - 1):
        p1 = path[i]
        p2 = path[i+1]
        
        # Check segment samples against excavation box center & boundaries
        samples = 15
        for s in range(samples + 1):
            t = s / samples
            ux = p1["x"] + t * (p2["x"] - p1["x"])
            uy = p1["y"] + t * (p2["y"] - p1["y"])
            uz = p1["z"] + t * (p2["z"] - p1["z"])

            # Clamping to box closest point
            cx = max(x_min, min(x_max, ux))
            cy = max(y_min, min(y_max, uy))
            cz = max(z_min, min(z_max, uz))

            dist = math.sqrt((ux - cx)**2 + (uy - cy)**2 + (uz - cz)**2)
            if dist < min_distance:
                min_distance = dist
                closest_util_pt = {"x": round(ux, 2), "y": round(uy, 2), "z": round(uz, 2)}
                closest_exc_pt = {"x": round(cx, 2), "y": round(cy, 2), "z": round(cz, 2)}

    nominal_dist = round(min_distance, 3)
    nominal_intersection = nominal_dist <= pipe_radius_m
    clearance_violation = nominal_dist <= (pipe_radius_m + clearance_m)

    # Uncertainty-aware calculation
    uncertainty_margin = round(1.96 * math.sqrt(horiz_unc**2 + vert_unc**2), 3)
    worst_case_distance = max(0.0, round(nominal_dist - uncertainty_margin - pipe_radius_m, 3))

    # Monte Carlo simulation
    mc_results = monte_carlo_strike_probability(
        nominal_distance_m=nominal_dist,
        pipe_radius_m=pipe_radius_m,
        clearance_threshold_m=clearance_m,
        horizontal_unc_m=horiz_unc,
        vertical_unc_m=vert_unc,
        iterations=1000
    )

    conflict_prob = mc_results["combined_conflict_probability"]

    # Conflict Classification per Section 10
    if nominal_intersection:
        classification = "Direct Collision"
        severity = "CRITICAL"
        justification = f"Planned trench directly bisects {utility.get('utility_code', 'utility')} nominal geometry at depth {-closest_util_pt['z']}m."
        action = "STOP EXCAVATION. Redesign trench alignment or lower/reroute utility line before machinery mobilization."
    elif worst_case_distance == 0.0 or conflict_prob >= 0.30:
        classification = "Potential Conflict Considering Uncertainty"
        severity = "CRITICAL" if hazard_weight >= 0.90 else "HIGH"
        justification = f"Nominal clearance is {nominal_dist}m, but 95% positional uncertainty ({uncertainty_margin}m) creates {round(conflict_prob*100, 1)}% probability of strike."
        action = f"Mandatory Non-Destructive Vacuum Potholing (QL-A verification) required along corridor before any mechanical backhoe excavation."
    elif clearance_violation:
        classification = "Caution Distance Violation"
        severity = "HIGH" if hazard_weight >= 0.90 else "MEDIUM"
        justification = f"Utility is within mandatory {clearance_m}m safety buffer ({meta['critical_alert']})."
        action = f"Maintain manual hand-digging protocols within {clearance_m}m of boundary. Assign dedicated spotter."
    else:
        classification = "No Conflict"
        severity = "SAFE"
        justification = f"Utility path is {nominal_dist}m away, safely outside clearance threshold ({clearance_m}m) even under 95% uncertainty envelope."
        action = "Standard careful excavation allowed per approved work method statement."

    return {
        "utility_id": utility.get("id"),
        "utility_code": utility.get("utility_code", "U-UNKNOWN"),
        "category": cat,
        "category_name": utility.get("category_name", cat.capitalize()),
        "nominal_depth_m": utility.get("nominal_depth_m", 1.5),
        "nominal_distance_m": nominal_dist,
        "nominal_intersection": nominal_intersection,
        "clearance_violation": clearance_violation,
        "worst_case_distance_m": worst_case_distance,
        "uncertainty_margin_m": uncertainty_margin,
        "conflict_probability": conflict_prob,
        "conflict_classification": classification,
        "severity_level": severity,
        "hazard_weight": hazard_weight,
        "closest_utility_point": closest_util_pt,
        "closest_excavation_point": closest_exc_pt,
        "asce_quality_level": asce_ql,
        "confidence_score": conf_score,
        "justification": justification,
        "recommended_action": action,
        "monte_carlo_details": mc_results
    }

