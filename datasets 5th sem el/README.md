# Authentic Municipal Infrastructure Datasets (BWSSB Bengaluru)

This directory contains authentic Geographic Information System (GIS) datasets, vector alignments, spatial boundaries, technical network maps, and operational figures sourced from the **Bangalore Water Supply and Sewerage Board (BWSSB)** and Karnataka Geographic Information System (KGIS) repositories.

All cryptic hash / UUID file names have been systematically mapped and renamed based on their true verified internal contents and metadata. Redundant, attribute-less duplicate layers and duplicate zip archives have been removed.

---

## 📋 Canonical Dataset Directory

| Sl | File Name | Format | Size | Description & Layer Contents |
|:---|:---|:---:|:---:|:---|
| 1 | `BWSSB_Operational_Divisions_Boundaries.kml` | KML | 0.68 MB | Official BWSSB administrative operational division polygons (South-1, North, Central, East, West, etc.) |
| 2 | `BWSSB_Operational_Sub_Divisions_Boundaries.kml` | KML | 0.98 MB | Official BWSSB administrative sub-division polygon boundaries across Bengaluru |
| 3 | `BWSSB_Service_Stations_Divisions_Boundaries.kml` | KML | 1.60 MB | Spatial jurisdictional boundaries for all BWSSB maintenance service stations |
| 4 | `BWSSB_Water_Supply_Control_Valves_Network.kml` | KML | 31.02 MB | GIS point layer containing thousands of water distribution control valves with diameters, material IDs, and operational status |
| 5 | `BWSSB_Water_Supply_Lines_Above_300mm_Diameter.kml` | KML | 2.17 MB | Primary potable water transmission mains and feeder trunk pipelines (> 300 mm diameter) |
| 6 | `BWSSB_Water_Supply_Lines_Up_To_300mm_Diameter.kml` | KML | 39.20 MB | Citywide secondary and tertiary municipal water distribution reticulation pipeline network (≤ 300 mm diameter) |
| 7 | `BWSSB_Water_Supply_Lines_Above_300mm_Diameter_Map.pdf` | PDF | 5.31 MB | High-resolution Esri ArcMap 10.8 cartographic map showing Bengaluru primary water supply trunk lines (> 300 mm) |
| 8 | `BWSSB_Water_Supply_Lines_Up_To_300mm_Diameter_Map.pdf` | PDF | 8.11 MB | High-resolution Esri ArcMap 10.8 cartographic map showing distribution pipeline network (≤ 300 mm) |
| 9 | `BWSSB_Sewerage_Lines_Up_To_150mm_Diameter.kml` | KML | 27.85 MB | Local sewer lateral and feeder collection network lines (100 mm and 150 mm diameter) with full KGIS attribute schema |
| 10 | `BWSSB_Sewerage_Lines_150mm_to_300mm_Diameter.kml` | KML | 78.91 MB | Intermediate branch sewerage collector lines (175 mm, 225 mm, 250 mm diameter) with full KGIS attribute schema |
| 11 | `BWSSB_Sewerage_Lines_Detailed_Trunk_Lines_Above_300mm.kml` | KML | 15.98 MB | Major trunk and outfall sewer alignments with exact diameters (300 mm up to 1100 mm) and full KGIS attribute schema |
| 12 | `BWSSB_Sewerage_Lines_Above_300mm_Diameter_Map.pdf` | PDF | 5.36 MB | Official BWSSB ArcMap 10.8 engineering layout of sewerage trunk mains (> 300 mm diameter) |
| 13 | `BWSSB_Sewerage_Lines_Up_To_300mm_Diameter_Map.pdf` | PDF | 8.14 MB | Official BWSSB ArcMap 10.8 engineering layout of sub-mains and branch sewer lines (≤ 300 mm diameter) |
| 14 | `BWSSB_Manholes_Underground_Survey_Bengaluru.geojson` | GeoJSON | 185.3 MB | Complete vector point survey of underground manholes with GIS coordinates, IDs, and condition data |
| 15 | `Bengaluru_Municipal_Water_Supply_Properties_Coverage_2018_2021.csv` | CSV | 285 B | Annual municipal water supply connections coverage: properties connected, unconnected, and tanker dependent |
| 16 | `BWSSB_Water_Supply_System_Key_Figures_and_Cauvery_Source.csv` | CSV | 619 B | Key BWSSB water supply metrics: Cauvery extraction volume (1350 MLD), population served (8.5M), per capita consumption, loss metrics |

---

## 🧹 Quality Control & Deduplication
- **Duplicate Geometry Layers Purged:** Removed attribute-less duplicate KML exports (`BWSSB_Sewerage_Lines_Network_Up_To_300mm_Diameter.kml` and `BWSSB_Sewerage_Lines_Network_Above_300mm_Diameter.kml`) in favor of the fully attributed KGIS engineering layers.
- **Archive Deduplication:** Removed redundant zip archives where uncompressed vector data is already available on disk.
