import os
import sys
import json
import uuid

# Ensure backend directory is in python module search path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import get_db_connection, init_db
from services.uncertainty import calculate_confidence_score, generate_3d_uncertainty_envelope
from services.depth_estimation import estimate_utility_depth
from services.conflict_detection import evaluate_excavation_conflict
from services.risk_engine import risk_engine
from services.ingestion import ingest_geospatial_file
from services.validation_experiments import (
    run_experiment_1_data_fusion_comparison,
    run_experiment_2_uncertainty_calibration,
    run_experiment_3_conflict_baseline_comparison,
    run_experiment_4_model_evaluation,
    run_experiment_5_sensitivity_analysis,
    run_experiment_6_missing_records_impact
)

app = FastAPI(
    title="Uncertainty-Aware 3D Urban Underground Infrastructure Digital Twin API",
    description="Research-Grade Geospatial & Decision Support API for Bengaluru Underground Infrastructure - RV College of Engineering",
    version="2.0.0"
)

# Enable CORS for local and frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

# --- Pydantic Schemas ---
class ExcavationSimulationRequest(BaseModel):
    corridor_id: str
    center_lat: Optional[float] = 12.9238
    center_lon: Optional[float] = 77.4988
    center_x: float = 0.0
    center_y: float = 0.0
    length_m: float = 12.0
    width_m: float = 3.5
    depth_m: float = 2.0
    rotation_deg: float = 0.0
    trench_purpose: Optional[str] = "Road Widening & White-Topping Trench"

class RiskPredictionRequest(BaseModel):
    utility_category: str
    nominal_distance_m: float
    excavation_depth_m: float
    utility_depth_m: float
    horizontal_unc_m: float
    vertical_unc_m: float
    confidence_score: float
    diameter_mm: Optional[float] = 200.0
    nearby_utilities_count: Optional[int] = 3

# --- API Endpoints ---

@app.get("/api/health")
def health():
    return {
        "project": "Uncertainty-Aware 3D Urban Underground Infrastructure Digital Twin",
        "institution": "RV College of Engineering, Bengaluru",
        "status": "Operational",
        "api_docs": "/docs",
        "version": "2.0.0"
    }

@app.get("/api/dashboard-stats")
def get_dashboard_stats():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Total utilities
    cursor.execute("SELECT COUNT(*) FROM utilities")
    total_utilities = cursor.fetchone()[0]

    # Category distribution
    cursor.execute("SELECT category, COUNT(*) FROM utilities GROUP BY category")
    cat_dist = {row[0]: row[1] for row in cursor.fetchall()}

    # ASCE Quality Level distribution
    cursor.execute("SELECT asce_quality_level, COUNT(*) FROM utilities GROUP BY asce_quality_level")
    asce_dist = {row[0]: row[1] for row in cursor.fetchall()}

    # Confidence class distribution
    cursor.execute("SELECT confidence_class, COUNT(*) FROM utilities GROUP BY confidence_class")
    conf_dist = {row[0]: row[1] for row in cursor.fetchall()}

    # Total datasets
    cursor.execute("SELECT COUNT(*) FROM dataset_inventory")
    total_datasets = cursor.fetchone()[0]

    # Total corridors
    cursor.execute("SELECT COUNT(*) FROM corridors")
    total_corridors = cursor.fetchone()[0]

    conn.close()

    return {
        "total_utilities": total_utilities,
        "total_datasets": total_datasets,
        "total_corridors": total_corridors,
        "category_distribution": cat_dist,
        "asce_ql_distribution": asce_dist,
        "confidence_distribution": conf_dist,
        "active_pilot_corridor": "RV College - Mysore Road Corridor",
        "institution": "RV College of Engineering, Bengaluru"
    }

@app.get("/api/corridors")
def get_corridors():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM corridors ORDER BY pilot_study DESC, name ASC")
    rows = cursor.fetchall()
    conn.close()

    corridors = []
    for r in rows:
        corridors.append({
            "id": r["id"],
            "name": r["name"],
            "ward_name": r["ward_name"],
            "ward_no": r["ward_no"],
            "zone": r["zone"],
            "center_lat": r["center_lat"],
            "center_lon": r["center_lon"],
            "description": r["description"],
            "pilot_study": bool(r["pilot_study"]),
            "bounds": json.loads(r["bounds_json"]) if r["bounds_json"] else None
        })
    return corridors

@app.get("/api/datasets")
def get_dataset_inventory():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM dataset_inventory ORDER BY is_demonstration ASC, reliability_weight DESC")
    rows = cursor.fetchall()
    conn.close()

    datasets = []
    for r in rows:
        datasets.append({
            "id": r["id"],
            "dataset_name": r["dataset_name"],
            "department": r["department"],
            "source_url": r["source_url"],
            "format": r["format"],
            "geographic_coverage": r["geographic_coverage"],
            "attributes": r["attributes"],
            "availability_status": r["availability_status"],
            "access_code": r["access_code"],
            "license": r["license"],
            "asce_ql_baseline": r["asce_ql_baseline"],
            "reliability_weight": r["reliability_weight"],
            "limitations": r["limitations"],
            "last_inspected": r["last_inspected"],
            "is_demonstration": bool(r["is_demonstration"])
        })
    return datasets

@app.post("/api/datasets/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    department: str = Form("Municipal Department"),
    corridor_id: str = Form("blr-corridor-rvce")
):
    try:
        content = await file.read()
        text_content = content.decode("utf-8", errors="replace")
        result = ingest_geospatial_file(
            file_content=text_content,
            filename=file.filename,
            department=department,
            corridor_id=corridor_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/datasets/files")
def list_dataset_files():
    datasets_base = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "datasets"))
    benchmarks_dir = os.path.join(datasets_base, "bengaluru_benchmarks")
    uploads_dir = os.path.join(datasets_base, "raw_uploads")

    files_list = []
    for category, directory in [("benchmark", benchmarks_dir), ("upload", uploads_dir)]:
        if os.path.exists(directory):
            for fname in os.listdir(directory):
                fpath = os.path.join(directory, fname)
                if os.path.isfile(fpath):
                    files_list.append({
                        "filename": fname,
                        "category": category,
                        "relative_path": os.path.relpath(fpath, datasets_base).replace("\\", "/"),
                        "size_bytes": os.path.getsize(fpath),
                        "modified_at": os.path.getmtime(fpath)
                    })
    return {
        "datasets_folder": datasets_base.replace("\\", "/"),
        "total_files": len(files_list),
        "files": files_list
    }

@app.get("/api/datasets/download-all")
def download_all_datasets():
    datasets_base = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "datasets"))
    zip_bundle_path = os.path.join(datasets_base, "bengaluru_infrastructure_datasets.zip")
    if not os.path.exists(zip_bundle_path):
        zip_bundle_path = os.path.join(datasets_base, "bengaluru_underground_datasets_bundle.zip")
    from fastapi.responses import FileResponse
    return FileResponse(
        zip_bundle_path,
        media_type="application/zip",
        filename="bengaluru_infrastructure_datasets.zip"
    )

@app.get("/api/utilities")
def get_utilities(
    corridor_id: Optional[str] = Query(None),
    include_demo: bool = Query(True)
):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM utilities WHERE 1=1"
    params = []

    if corridor_id:
        query += " AND corridor_id = ?"
        params.append(corridor_id)

    if not include_demo:
        query += " AND is_demonstration = 0"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    utilities = []
    for r in rows:
        coords = json.loads(r["coordinates_json"]) if r["coordinates_json"] else []
        path_3d = json.loads(r["path_3d_json"]) if r["path_3d_json"] else []

        envelope = generate_3d_uncertainty_envelope(
            path_points=path_3d,
            horizontal_unc_m=r["horizontal_uncertainty_m"],
            vertical_unc_m=r["vertical_uncertainty_m"]
        )

        utilities.append({
            "id": r["id"],
            "utility_code": r["utility_code"],
            "category": r["category"],
            "category_name": r["category_name"],
            "source_department": r["source_department"],
            "corridor_id": r["corridor_id"],
            "geometry_type": r["geometry_type"],
            "coordinates": coords,
            "path_3d": path_3d,
            "nominal_depth_m": r["nominal_depth_m"],
            "depth_measurement_status": r["depth_measurement_status"],
            "depth_estimation_source": r["depth_estimation_source"],
            "diameter_mm": r["diameter_mm"],
            "material": r["material"],
            "installation_year": r["installation_year"],
            "data_source_id": r["data_source_id"],
            "acquisition_date": r["acquisition_date"],
            "asce_quality_level": r["asce_quality_level"],
            "confidence_score": r["confidence_score"],
            "confidence_class": r["confidence_class"],
            "horizontal_uncertainty_m": r["horizontal_uncertainty_m"],
            "vertical_uncertainty_m": r["vertical_uncertainty_m"],
            "verification_status": r["verification_status"],
            "hazard_weight": r["hazard_weight"],
            "soil_type": r["soil_type"],
            "nearest_road": r["nearest_road"],
            "is_demonstration": bool(r["is_demonstration"]),
            "uncertainty_envelope": envelope
        })
    return utilities

@app.post("/api/simulate-conflict")
def simulate_excavation_conflict(req: ExcavationSimulationRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM utilities WHERE corridor_id = ?", (req.corridor_id,))
    rows = cursor.fetchall()

    if not rows:
        cursor.execute("SELECT * FROM utilities WHERE corridor_id = 'blr-corridor-rvce'")
        rows = cursor.fetchall()

    conn.close()

    excavation_dict = {
        "center_x": req.center_x,
        "center_y": req.center_y,
        "length_m": req.length_m,
        "width_m": req.width_m,
        "depth_m": req.depth_m,
        "rotation_deg": req.rotation_deg
    }

    conflict_results = []
    critical_count = 0
    max_risk_score = 0.0

    for r in rows:
        u_dict = dict(r)
        res = evaluate_excavation_conflict(excavation_dict, u_dict)

        # Run AI risk prediction for this utility
        risk_pred = risk_engine.predict_risk(
            utility_category=res["category"],
            nominal_distance_m=res["nominal_distance_m"],
            excavation_depth_m=req.depth_m,
            utility_depth_m=res["nominal_depth_m"],
            horizontal_unc_m=u_dict["horizontal_uncertainty_m"],
            vertical_unc_m=u_dict["vertical_uncertainty_m"],
            confidence_score=u_dict["confidence_score"],
            diameter_mm=u_dict["diameter_mm"] or 200.0,
            nearby_utilities_count=len(rows)
        )
        res["ai_risk_assessment"] = risk_pred
        if risk_pred["risk_score"] > max_risk_score:
            max_risk_score = risk_pred["risk_score"]

        if res["severity_level"] in ["CRITICAL", "HIGH"]:
            critical_count += 1

        conflict_results.append(res)

    # Sort conflicts: CRITICAL first, then by conflict probability
    conflict_results.sort(key=lambda x: (
        0 if x["severity_level"] == "CRITICAL" else 1 if x["severity_level"] == "HIGH" else 2 if x["severity_level"] == "MEDIUM" else 3,
        -x["conflict_probability"]
    ))

    overall_risk_class = "CRITICAL" if critical_count > 0 or max_risk_score >= 60 else "MEDIUM" if max_risk_score >= 35 else "LOW"

    # Actionable Engineering Recommendations
    recommendations = []
    if critical_count > 0:
        recommendations.append({
            "code": "REC-01",
            "title": "Mandatory Non-Destructive Vacuum Potholing (QL-A)",
            "priority": "IMMEDIATE",
            "directive": f"Direct collision or high-uncertainty strike predicted with {critical_count} utilities. Mechanized hydraulic excavators prohibited. Pothole to visually expose pipe datum before proceeding."
        })
    if req.depth_m >= 1.5:
        recommendations.append({
            "code": "REC-02",
            "title": "Trench Depth Review & Stepping",
            "priority": "HIGH",
            "directive": f"Excavation depth ({req.depth_m}m) exceeds typical Bengaluru gas (1.0m) and 11kV electrical (1.2m) utility horizons. Consider stepping or reducing depth to 0.8m."
        })
    recommendations.append({
        "code": "REC-03",
        "title": "Geophysical Line Tracing on Footpath Alignment",
        "priority": "MEDIUM",
        "directive": "Perform multi-frequency 400/900 MHz GPR scan along the transverse corridor boundary to upgrade QL-D records to QL-B precision."
    })

    return {
        "simulation_id": f"sim-{uuid.uuid4().hex[:8]}",
        "corridor_id": req.corridor_id,
        "excavation_parameters": excavation_dict,
        "total_utilities_evaluated": len(rows),
        "critical_conflicts_count": critical_count,
        "overall_risk_score": max_risk_score,
        "overall_risk_class": overall_risk_class,
        "conflicts": conflict_results,
        "engineering_recommendations": recommendations
    }

@app.post("/api/predict-risk")
def predict_risk_standalone(req: RiskPredictionRequest):
    return risk_engine.predict_risk(
        utility_category=req.utility_category,
        nominal_distance_m=req.nominal_distance_m,
        excavation_depth_m=req.excavation_depth_m,
        utility_depth_m=req.utility_depth_m,
        horizontal_unc_m=req.horizontal_unc_m,
        vertical_unc_m=req.vertical_unc_m,
        confidence_score=req.confidence_score,
        diameter_mm=req.diameter_mm or 200.0,
        nearby_utilities_count=req.nearby_utilities_count or 3
    )

@app.get("/api/experiments/all")
def get_all_experiments():
    return {
        "experiment_1": run_experiment_1_data_fusion_comparison(),
        "experiment_2": run_experiment_2_uncertainty_calibration(),
        "experiment_3": run_experiment_3_conflict_baseline_comparison(),
        "experiment_4": run_experiment_4_model_evaluation(),
        "experiment_5": run_experiment_5_sensitivity_analysis(),
        "experiment_6": run_experiment_6_missing_records_impact()
    }

@app.get("/api/experiments/{exp_id}")
def get_single_experiment(exp_id: int):
    if exp_id == 1:
        return run_experiment_1_data_fusion_comparison()
    elif exp_id == 2:
        return run_experiment_2_uncertainty_calibration()
    elif exp_id == 3:
        return run_experiment_3_conflict_baseline_comparison()
    elif exp_id == 4:
        return run_experiment_4_model_evaluation()
    elif exp_id == 5:
        return run_experiment_5_sensitivity_analysis()
    elif exp_id == 6:
        return run_experiment_6_missing_records_impact()
    else:
        raise HTTPException(status_code=404, detail="Invalid experiment ID. Use 1 to 6.")

@app.get("/api/model-benchmarks")
def get_model_benchmarks():
    return risk_engine.get_benchmarks()

# Mount and serve built frontend static assets if available
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse

    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    def serve_root():
        return FileResponse(os.path.join(frontend_dist, "index.html"))

    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
