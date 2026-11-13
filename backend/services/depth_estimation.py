from typing import Dict, Any, Optional

# Indian Roads Congress IRC:98-2011 Guidelines on Accommodation of Underground Utility Services
IRC_98_STANDARDS = {
    "water": {
        "min_cover_m": 1.80,
        "max_cover_m": 2.40,
        "recommended_cover_m": 1.80,
        "specification": "IRC:98-2011 Clause 5.3 & CPHEEO Manual. Minimum 1.8m cover below Finished Road Level to protect against heavy commercial axle loads (10.2 tonnes standard axle).",
        "default_depth_uncertainty_m": 0.35
    },
    "drainage": {
        "min_cover_m": 2.00,
        "max_cover_m": 3.50,
        "recommended_cover_m": 2.40,
        "specification": "IRC:98-2011 Clause 5.4. Gravity sewer conduits placed deepest among services to maintain hydraulic self-cleansing velocity (min 0.6 m/s) with adequate cover beneath crossing ducts.",
        "default_depth_uncertainty_m": 0.25
    },
    "electrical": {
        "min_cover_m": 1.00,
        "max_cover_m": 1.50,
        "recommended_cover_m": 1.20,
        "specification": "IRC:98-2011 Clause 5.1 & Central Electricity Authority (CEA) Regulations 2010. HV 11kV cables laid in sand bedding at minimum 1.0m to 1.2m depth with RCC warning slabs.",
        "default_depth_uncertainty_m": 0.50
    },
    "gas": {
        "min_cover_m": 1.00,
        "max_cover_m": 1.40,
        "recommended_cover_m": 1.00,
        "specification": "IRC:98-2011 Clause 5.5 & PNGRB T4S Regulations. City gas distribution pipelines laid with minimum 1.0m cover in unpaved footpaths or 1.2m under carriageways with warning tape 300mm above.",
        "default_depth_uncertainty_m": 0.40
    }
}

def estimate_utility_depth(
    category: str,
    measured_depth_m: Optional[float] = None,
    as_built_depth_m: Optional[float] = None,
    manhole_invert_depth_m: Optional[float] = None,
    soil_type: str = "Standard Red Earth",
    road_class: str = "Arterial Urban Highway"
) -> Dict[str, Any]:
    """
    Applies strict depth estimation hierarchy (Section 8):
    1. Verified measured depth
    2. As-built engineering drawings
    3. Survey-derived depth (manhole invert levels)
    4. Applicable engineering design specifications (IRC:98-2011)
    5. Documented depth priors
    """
    cat = category.lower()
    std = IRC_98_STANDARDS.get(cat, IRC_98_STANDARDS["water"])

    # Level 1: Verified measured depth (QL-A / QL-B)
    if measured_depth_m is not None and measured_depth_m > 0:
        return {
            "estimated_depth_m": round(measured_depth_m, 2),
            "depth_measurement_status": "measured",
            "hierarchy_tier": "Tier 1: Direct Physical / Geophysical Measurement",
            "source_of_estimation": "Calibrated On-Site Sensor (GPR B-Scan or Vacuum Pothole)",
            "applicable_assumptions": "Zero extrapolation; localized physical confirmation within survey tolerance.",
            "depth_uncertainty_m": 0.08 if measured_depth_m < 1.0 else 0.12,
            "verification_status": "Field Verified",
            "is_inferred": False
        }

    # Level 2: As-built engineering drawings
    if as_built_depth_m is not None and as_built_depth_m > 0:
        return {
            "estimated_depth_m": round(as_built_depth_m, 2),
            "depth_measurement_status": "inferred",
            "hierarchy_tier": "Tier 2: As-Built Engineering Drawings",
            "source_of_estimation": "Departmental As-Built CAD Profile with Finished Datum",
            "applicable_assumptions": "Assumes negligible ground elevation changes since construction completion date.",
            "depth_uncertainty_m": 0.25,
            "verification_status": "As-Built Archive",
            "is_inferred": True
        }

    # Level 3: Survey-derived depth (Manhole dip)
    if manhole_invert_depth_m is not None and manhole_invert_depth_m > 0:
        return {
            "estimated_depth_m": round(manhole_invert_depth_m, 2),
            "depth_measurement_status": "measured",
            "hierarchy_tier": "Tier 3: Survey-Derived Manhole Invert Level",
            "source_of_estimation": "Physical Dip Measurement at Upstream/Downstream Manholes",
            "applicable_assumptions": "Linear slope gradient maintained between inspected manhole chambers.",
            "depth_uncertainty_m": 0.20,
            "verification_status": "Surface Correlated (QL-C)",
            "is_inferred": False
        }

    # Level 4: IRC:98-2011 Design Standard Prior
    recommended = std["recommended_cover_m"]
    return {
        "estimated_depth_m": recommended,
        "depth_measurement_status": "inferred",
        "hierarchy_tier": "Tier 4: Applicable Engineering Specification (IRC:98-2011 Prior)",
        "source_of_estimation": f"IRC:98-2011 Urban Utility Guidelines ({cat.capitalize()} Standard Cover)",
        "applicable_assumptions": f"{std['specification']} Note: Depth is purely inferential; subject to local utility crossing adjustments.",
        "depth_uncertainty_m": std["default_depth_uncertainty_m"],
        "verification_status": "Unverified Inferred Prior",
        "is_inferred": True
    }

