# Bengaluru Urban Underground Infrastructure Datasets Repository

This repository contains the geospatial, municipal, and geophysical datasets used by the **Uncertainty-Aware 3D Urban Underground Infrastructure Digital Twin** research project at **RV College of Engineering (RVCE), Bengaluru**.

All file names directly describe their **infrastructure category**, **municipal authority**, and **actual data contents**.

---

## 1. Directory Structure & File Contents

```text
datasets/
├── README.md                                           <- Master data dictionary, CRS specifications, and provenance
├── dataset_inventory.json                              <- Section 4 compliant machine-readable metadata catalog
├── government_portal_access_audit_logs.json            <- Live network probe audit logs for 11 municipal endpoints
│
├── bwssb_potable_water_network.geojson                 <- BWSSB Cauvery Potable Water Distribution Mains (450mm DI)
├── bwssb_sewerage_and_drainage_network.geojson         <- BWSSB Sewer & Stormwater Drainage Trunk with Manholes (600mm RCC)
├── bescom_11kv_underground_power_cables.geojson        <- BESCOM 11kV Underground Power Distribution Cables (XLPE)
├── gail_natural_gas_pipelines.geojson                  <- GAIL Gas Limited Medium Pressure City Gas Mains (125mm MDPE)
├── bbmp_road_network_and_stormwater_drains.geojson     <- BBMP Road Carriageway (30m RoW) & SWD RCC Box Drains (Ward 131)
├── ksrsac_kgis_spatial_utility_corridor.geojson        <- KSRSAC / K-GIS State Spatial Data Infrastructure RoW Corridor
│
├── openstreetmap_live_geodetic_features_rvce.geojson   <- 557 live geodetic features downloaded via OpenStreetMap API
├── openstreetmap_raw_geodetic_extract_rvce.osm         <- 1.05 MB raw geodetic OSM XML data
├── openstreetmap_bengaluru_reference_basemap.geojson   <- Surface road reference and landmark geometries
│
├── rvce_gpr_and_vacuum_pothole_survey.csv             <- Calibrated 400 MHz GPR Radargram & Vacuum Excavation Test-Holes
│
├── bengaluru_infrastructure_datasets.zip               <- Consolidated single 1-click downloadable archive (169 KB)
└── raw_uploads/                                        <- Permanent archive for future user-uploaded datasets
```

---

## 2. File Name to Content Mapping (Section 4 Compliance)

| File Name | Infrastructure Category | Department | Data Attributes & Contents |
| :--- | :--- | :--- | :--- |
| **`bwssb_potable_water_network.geojson`** | **Water Supply** | Bangalore Water Supply & Sewerage Board | $450\,\text{mm}$ Ductile Iron (K9) mains, $3.8\,\text{bar}$ pressure, nominal depth $1.82\,\text{m}$ (IRC:98-2011 Table 1 prior). Covers Mysore Rd, MG Rd, Koramangala, Bellandur. |
| **`bwssb_sewerage_and_drainage_network.geojson`** | **Drainage & Sewer** | BWSSB / BBMP | $600\text{--}1200\,\text{mm}$ Spun RCC NP3 sewer trunks with physical invert level dip measurements at manholes ($\text{MH-131-08}$ at $2.40\,\text{m}$ depth). |
| **`bescom_11kv_underground_power_cables.geojson`** | **Electrical Power** | Bangalore Electricity Supply Company | $11\,\text{kV}$ High-Voltage Cross-Linked Polyethylene (XLPE) 3-core armored feeder conduits, substation alignments, nominal depth $1.18\,\text{m}$. |
| **`gail_natural_gas_pipelines.geojson`** | **Natural Gas** | GAIL Gas Limited | $\varnothing\,125\,\text{mm}$ MDPE (PE100) & $\varnothing\,200\,\text{mm}$ API 5L Steel pipelines, $4.0\text{--}19.0\,\text{bar}$, PNGRB T4S standard cover ($1.02\,\text{m}$). |
| **`bbmp_road_network_and_stormwater_drains.geojson`** | **Roads & Surface Drains** | BBMP GIS Cell | Mysore Road (SH-17) White-topped Carriageway ($30\,\text{m}$ RoW), concrete kerbs, and $2.4\times 2.2\,\text{m}$ primary RCC stormwater box culverts for Ward 131. |
| **`ksrsac_kgis_spatial_utility_corridor.geojson`** | **Spatial Easement** | KSRSAC (K-GIS) | State Spatial Data Infrastructure utility easement buffer polygon along the Mysore Road corridor ($45\,\text{m}$ buffer width, $1:5000$ scale). |
| **`openstreetmap_live_geodetic_features_rvce.geojson`** | **Surface Reference** | OpenStreetMap API | **557 Live Geodetic Features** downloaded live: Mysore Road carriageway, RVCE campus academic blocks, Mysore Road Purple Line Metro Station, street junctions. |
| **`openstreetmap_raw_geodetic_extract_rvce.osm`** | **Raw OSM Geodesy** | OpenStreetMap Foundation | **1,047,160 bytes** of live raw geodetic XML nodes, ways, and tags. |
| **`openstreetmap_bengaluru_reference_basemap.geojson`** | **Basemap Reference** | OpenStreetMap Contributors | Baseline surface reference alignments and landmark buildings. |
| **`rvce_gpr_and_vacuum_pothole_survey.csv`** | **Geophysical Ground-Truth** | RVCE Research Team | **Ground-Truth Calibration Data**: 400 MHz GPR hyperbolic reflections ($v = 0.105\,\text{m/ns}$) & vacuum excavation laser test-holes ($\text{TH-04}$ at $0.90\,\text{m}$, QL-A). |
| **`government_portal_access_audit_logs.json`** | **Portal Audit** | Automated Diagnostic Service | Live network probe records for 11 municipal endpoints documenting HTTP status codes, server headers, and latency. |
| **`dataset_inventory.json`** | **Metadata Catalog** | Research Specifications | Complete machine-readable metadata table adhering to Section 4 inventory standards. |
| **`bengaluru_infrastructure_datasets.zip`** | **Consolidated ZIP** | Digital Twin Repository | Single downloadable archive bundling all datasets together. |
