import sqlite3
import json
import os
from typing import Dict, Any, List, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "underground_twin.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Corridors table (Bengaluru Study Areas)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS corridors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        ward_name TEXT NOT NULL,
        ward_no INTEGER NOT NULL,
        zone TEXT NOT NULL,
        center_lat REAL NOT NULL,
        center_lon REAL NOT NULL,
        description TEXT,
        pilot_study BOOLEAN DEFAULT 0,
        bounds_json TEXT
    )
    """)

    # 2. Datasets Inventory Table (Mandatory Section 4 inventory)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS dataset_inventory (
        id TEXT PRIMARY KEY,
        dataset_name TEXT NOT NULL,
        department TEXT NOT NULL,
        source_url TEXT NOT NULL,
        format TEXT NOT NULL,
        geographic_coverage TEXT NOT NULL,
        attributes TEXT NOT NULL,
        availability_status TEXT NOT NULL,
        access_code INTEGER DEFAULT 200,
        license TEXT NOT NULL,
        asce_ql_baseline TEXT NOT NULL,
        reliability_weight REAL NOT NULL,
        limitations TEXT NOT NULL,
        last_inspected TEXT NOT NULL,
        is_demonstration BOOLEAN DEFAULT 0
    )
    """)

    # 3. Underground Utilities Table (Standardized Utility Schema Section 5)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS utilities (
        id TEXT PRIMARY KEY,
        utility_code TEXT NOT NULL,
        category TEXT NOT NULL, -- water, drainage, electrical, gas
        category_name TEXT NOT NULL,
        source_department TEXT NOT NULL,
        corridor_id TEXT NOT NULL,
        geometry_type TEXT NOT NULL, -- LineString, Point
        coordinates_json TEXT NOT NULL, -- GeoJSON coordinates [[lon, lat], ...]
        path_3d_json TEXT NOT NULL, -- Local 3D coordinates relative to corridor origin [{x, y, z}, ...]
        nominal_depth_m REAL NOT NULL,
        depth_measurement_status TEXT NOT NULL, -- 'measured' | 'inferred'
        depth_estimation_source TEXT NOT NULL, -- 'Verified As-Built' | 'IRC:98-2011 Prior' | 'GPR Survey' | 'Design Spec'
        diameter_mm REAL,
        material TEXT,
        installation_year INTEGER,
        data_source_id TEXT NOT NULL,
        acquisition_date TEXT NOT NULL,
        asce_quality_level TEXT NOT NULL, -- QL-A, QL-B, QL-C, QL-D
        confidence_score REAL NOT NULL, -- 0.0 to 1.0 (or 0-100%)
        confidence_class TEXT NOT NULL, -- 'High' | 'Medium' | 'Low'
        horizontal_uncertainty_m REAL NOT NULL, -- +/- dx in meters
        vertical_uncertainty_m REAL NOT NULL, -- +/- dz in meters
        verification_status TEXT NOT NULL, -- 'Unverified Records' | 'Geophysically Traced' | 'Field Validated' | 'Synthetic Benchmark'
        hazard_weight REAL NOT NULL, -- 0.0 to 1.0
        soil_type TEXT NOT NULL,
        nearest_road TEXT NOT NULL,
        is_demonstration BOOLEAN DEFAULT 0,
        FOREIGN KEY (corridor_id) REFERENCES corridors (id)
    )
    """)

    # 4. Excavation Conflicts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS excavation_conflicts (
        id TEXT PRIMARY KEY,
        simulation_id TEXT NOT NULL,
        corridor_id TEXT NOT NULL,
        utility_id TEXT NOT NULL,
        utility_code TEXT NOT NULL,
        utility_category TEXT NOT NULL,
        nominal_distance_m REAL NOT NULL,
        nominal_intersection BOOLEAN NOT NULL,
        clearance_violation BOOLEAN NOT NULL,
        worst_case_distance_m REAL NOT NULL,
        uncertainty_margin_m REAL NOT NULL,
        conflict_probability REAL NOT NULL,
        conflict_classification TEXT NOT NULL, -- 'Direct Collision' | 'Potential Conflict Considering Uncertainty' | 'Caution Distance Violation' | 'No Conflict'
        severity_level TEXT NOT NULL, -- 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE'
        justification TEXT NOT NULL,
        recommended_action TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 5. Excavation Simulation Sessions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS excavation_sessions (
        id TEXT PRIMARY KEY,
        corridor_id TEXT NOT NULL,
        center_lat REAL NOT NULL,
        center_lon REAL NOT NULL,
        length_m REAL NOT NULL,
        width_m REAL NOT NULL,
        depth_m REAL NOT NULL,
        rotation_deg REAL NOT NULL,
        trench_purpose TEXT NOT NULL,
        total_conflicts INTEGER NOT NULL,
        critical_conflicts INTEGER NOT NULL,
        overall_risk_score REAL NOT NULL,
        risk_class TEXT NOT NULL,
        ml_predicted_class TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 6. Research Validation Experiments Log
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS validation_experiments (
        id TEXT PRIMARY KEY,
        experiment_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        hypothesis TEXT NOT NULL,
        parameters_json TEXT NOT NULL,
        results_json TEXT NOT NULL,
        summary TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database schema successfully initialized.")

