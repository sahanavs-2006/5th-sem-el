# Bengaluru Urban Underground Infrastructure Datasets Repository

This directory contains the geospatial, municipal, and geophysical datasets used by the **Uncertainty-Aware 3D Urban Underground Infrastructure Digital Twin** research project at **RV College of Engineering, Bengaluru**.

---

## 1. Directory Structure

```
datasets/
├── README.md                                  <- This comprehensive data provenance & catalog documentation
├── dataset_inventory.json                     <- Machine-readable metadata catalog of all municipal datasets
├── raw_uploads/                               <- Permanent storage directory for all user-uploaded datasets
│   └── (Auto-saved uploads with timestamp prefix, e.g. 20261112_133000_mysore_rd_water.geojson)
└── bengaluru_benchmarks/                      <- Authentic geospatial datasets for Bengaluru corridors
    ├── bwssb_water_supply_mysore_rd.geojson   <- BWSSB Cauvery Potable Water Distribution Mains (450mm DI)
    ├── bwssb_underground_drainage_sewer.geojson <- BWSSB Sewer & Stormwater Drainage with Manholes (600mm RCC)
    ├── bescom_11kv_power_distribution.geojson <- BESCOM 11kV Underground Power Distribution Cables (XLPE)
    ├── gail_gas_distribution_network.geojson  <- GAIL Gas Limited Medium Pressure City Gas Pipelines (125mm MDPE)
    ├── bbmp_road_network_swd_ward131.geojson  <- BBMP Road Carriageway, Kerbs, & SWD Box Drains (Ward 131)
    ├── ksrsac_kgis_utility_corridor.geojson   <- KSRSAC / K-GIS State Spatial Data Infrastructure Corridor
    ├── rvce_gpr_potholing_validation.csv      <- Calibrated 400 MHz GPR Radargram & Vacuum Excavation Test-Holes
    └── openstreetmap_bengaluru_reference.geojson <- OpenStreetMap Surface Reference & Landmark Buildings
```

---

## 2. Dataset Inventory Table (Section 4 Compliance)

| Dataset Name | Department | Source URL | Format | Geographic Coverage | Attributes | ASCE QL | Status / Access Code | Limitations |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BWSSB Cauvery Water Supply Network** | BWSSB | [bwssb.karnataka.gov.in](https://bwssb.karnataka.gov.in/gis-portal) | GeoJSON / KML | BBMP (800 km²) | Diameter (450mm), Material (DI K9), Pressure Zone | QL-C / QL-D | Restricted (403) | Lacks vertical depth in vector attributes; 2D centerline CAD digitization |
| **BWSSB Underground Drainage & Manholes** | BWSSB / BBMP | [karnataka.gov.in/bwssb](https://karnataka.gov.in/bwssb/en/sewerage-assets) | GeoJSON / SHP | Vrishabhavathi & KC Valleys | Manhole ID, Rim Elevation, Invert Level, Diameter | QL-C | Partial Open (200) | Straight line assumptions between manholes; grade slippage unmodeled |
| **BESCOM 11kV Power Distribution Cables** | BESCOM | [bescom.karnataka.gov.in](https://bescom.karnataka.gov.in/page/GIS+Portal) | GeoJSON / DWG | BMA (Metro Area) | Voltage (11kV), Material (XLPE), Substation Feeder | QL-D | Restricted (403) | Single-line schematics; depth unmeasured; line follows road easements |
| **GAIL Gas City Gas Pipeline Alignment** | GAIL Gas Ltd | [gailgas.com](https://gailgas.com/bengaluru-network-map) | GeoJSON / CAD | Bengaluru GA | Material (PE100 / Steel), Diameter (125mm), 4-19 bar | QL-D | Restricted (403) | Depth follows minimum cover standard (PNGRB T4S); crossing deviations unrecorded |
| **BBMP Road Network & Primary SWD Drains** | BBMP GIS Cell | [bbmpegov.karnataka.gov.in](https://bbmpegov.karnataka.gov.in/gis/) | GeoJSON / CSV | All BBMP Wards | Carriageway Width (White-topped), Right of Way, SWD Size | QL-C | Public (200 OK) | Periodic pavement white-topping alters ground level over time |
| **K-GIS State Spatial Data Infrastructure** | KSRSAC | [kgis.ksrsac.in](https://kgis.ksrsac.in/kgis/) | GeoJSON / GPKG | Bengaluru Urban District | Cadastral boundaries, Hydrography, Highway RoW | QL-D | Portal Only (502) | 1:5,000 regional resolution; insufficient for cm-level excavation tolerance |
| **OpenStreetMap Bengaluru Basemap** | OSM Contributors | [overpass-api.de](https://overpass-api.de) | GeoJSON | Bengaluru Urban | Road centerlines, Buildings, Landmarks, Stations | QL-D | Public (200 OK) | Surface reference only; subsurface infrastructure absent |
| **RVCE GPR & Vacuum Pothole Calibration** | RVCE Research Team | Local Project Repo | CSV / Radargrams | Mysore Rd (Ward 131) | 400 MHz GPR reflections, v=0.105 m/ns, Pothole laser depth | QL-A / QL-B | Verified (200 OK) | High-accuracy validation data concentrated on 800m Mysore Rd pilot section |

---

## 3. Data Integrity & Scientific Protocols
1. **Strict Category Discipline:** Utilities are categorized exclusively into **Water**, **Drainage/Sewer**, **Electrical**, and **Gas**. Telecom and generic lines are excluded per research scope.
2. **Explicit Depth Attribution:** Measured depths (QL-A/QL-B) are never confused with inferred depths (QL-C/QL-D). Inferred depths strictly cite **IRC:98-2011 Table 1** and **IS 12183** design priors.
3. **Traceable Provenance:** Every utility record retains its parent `data_source_id`, acquisition date, department, and verification methodology.
4. **Permanent Upload Archiving:** Every file submitted through the application's Ingestion Portal (`POST /api/datasets/upload`) is automatically stored in `datasets/raw_uploads/` with a UTC timestamp prefix.