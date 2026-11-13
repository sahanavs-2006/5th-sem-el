import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  Navigation,
  Layers,
  CheckCircle2,
  Building,
  Info,
  ExternalLink,
  Target,
  ArrowRight
} from 'lucide-react';
import { CorridorItem } from '../../types/infrastructure';

interface Page2BengaluruStudyAreaProps {
  corridors: CorridorItem[];
  selectedCorridorId: string;
  onSelectCorridor: (id: string) => void;
  onNavigateToTwin: () => void;
}

export const Page2BengaluruStudyArea: React.FC<Page2BengaluruStudyAreaProps> = ({
  corridors,
  selectedCorridorId,
  onSelectCorridor,
  onNavigateToTwin,
}) => {
  const defaultCorridor: CorridorItem = {
    id: 'blr-corridor-rvce',
    name: 'RV College - Mysore Road Corridor (Primary Pilot)',
    ward_name: 'Nayandahalli / Kengeri',
    ward_no: 131,
    zone: 'Rajarajeshwari Nagar (RR Nagar)',
    center_lat: 12.9238,
    center_lon: 77.4988,
    description: 'Primary academic & field research corridor surrounding RV College of Engineering campus, Mysore Road arterial highway, Metro Purple Line corridor.',
    pilot_study: true
  };
  const activeCorridor = corridors.find(c => c.id === selectedCorridorId) || corridors[0] || defaultCorridor;
  const [hoveredCorridorId, setHoveredCorridorId] = useState<string | null>(null);

  // Map view bounding coordinates for Bengaluru Urban
  // Center roughly at 12.94°N, 77.58°E
  const mapOrigin = { lat: 12.95, lon: 77.59 };
  const latScale = 650; // pixels per degree
  const lonScale = 650;

  return (
    <div className="p-8 max-w-[1720px] mx-auto space-y-6 bg-[#f8fafc] text-slate-800 min-h-[calc(100vh-68px)]">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              2. Bengaluru Study Region & Corridor Selection
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Authentic Bengaluru Coordinates
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Geospatial boundaries, BBMP administrative wards, and designated high-risk excavation pilot study corridors.
          </p>
        </div>

        <button
          onClick={onNavigateToTwin}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Layers className="w-4 h-4" />
          <span>Inspect Selected Corridor in 3D</span>
        </button>
      </div>

      {/* Main Grid: Left GIS Interactive Viewport + Right Corridor Information Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 2D GIS Map Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
          {/* Map Toolbar */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Compass className="w-4 h-4 text-blue-400" />
              <span>Bengaluru Metropolitan Region (BBMP 800 sq km)</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span>WGS84 EPSG:4326</span>
              <span>•</span>
              <span className="text-emerald-400">UTM Zone 43N</span>
            </div>
          </div>

          {/* Interactive Vector GIS Canvas */}
          <div className="relative w-full h-[520px] bg-[#0c1836] overflow-hidden select-none">
            {/* Background Grid Pattern */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />

            {/* Stylized Bengaluru Road Network Representation */}
            <svg className="w-full h-full absolute inset-0 pointer-events-none">
              {/* Outer Ring Road (ORR) Arterial Ring */}
              <ellipse
                cx="52%"
                cy="54%"
                rx="38%"
                ry="36%"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                opacity="0.6"
              />
              {/* Mysore Road Radial (South-West) */}
              <line
                x1="48%"
                y1="52%"
                x2="15%"
                y2="78%"
                stroke="#2563eb"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.8"
              />
              {/* Hosur Road Radial (South-East) */}
              <line
                x1="52%"
                y1="54%"
                x2="78%"
                y2="88%"
                stroke="#1e3a8a"
                strokeWidth="2.5"
                opacity="0.5"
              />
              {/* Old Madras Road Radial (East) */}
              <line
                x1="52%"
                y1="52%"
                x2="88%"
                y2="42%"
                stroke="#1e3a8a"
                strokeWidth="2.5"
                opacity="0.5"
              />
              {/* Bellary Road Radial (North - Airport) */}
              <line
                x1="50%"
                y1="50%"
                x2="48%"
                y2="10%"
                stroke="#1e3a8a"
                strokeWidth="2.5"
                opacity="0.5"
              />
            </svg>

            {/* Interactive Corridor Hotspot Markers */}
            {corridors.map((c) => {
              const isSelected = c.id === selectedCorridorId;
              const isHovered = c.id === hoveredCorridorId;

              // Project lat/lon to percentage inside SVG viewport
              // Center: 12.95 N, 77.59 E
              const xPct = 50 + (c.center_lon - mapOrigin.lon) * 240;
              const yPct = 50 - (c.center_lat - mapOrigin.lat) * 450;

              return (
                <div
                  key={c.id}
                  style={{ left: `${xPct}%`, top: `${yPct}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                  onClick={() => onSelectCorridor(c.id)}
                  onMouseEnter={() => setHoveredCorridorId(c.id)}
                  onMouseLeave={() => setHoveredCorridorId(null)}
                >
                  {/* Ping Animation for Pilot Study */}
                  {c.pilot_study && (
                    <span className="absolute -inset-2 rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                  )}

                  <div
                    className={`px-3 py-1.5 rounded-xl shadow-lg border transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-400 ring-4 ring-blue-500/30 scale-110'
                        : isHovered
                        ? 'bg-slate-800 text-white border-slate-600 scale-105'
                        : 'bg-slate-900/90 text-slate-200 border-slate-700 backdrop-blur-sm'
                    }`}
                  >
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : c.pilot_study ? 'text-emerald-400' : 'text-blue-400'}`} />
                    <span className="text-[11px] font-bold whitespace-nowrap">
                      {c.name.split(' (')[0]}
                    </span>
                    {c.pilot_study && (
                      <span className="text-[9px] font-extrabold uppercase bg-emerald-500/30 text-emerald-300 px-1 py-0.2 rounded">
                        Pilot
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Map Legend HUD */}
            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-xs text-slate-300 space-y-1.5 shadow-xl">
              <div className="font-semibold text-white text-[11px] uppercase tracking-wider mb-1">
                Study Area Legend
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>Primary Research Pilot (RVCE Mysore Road)</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>Secondary Comparative Corridors</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-5 h-0.5 bg-blue-600"></span>
                <span>SH-17 Mysore Road Expressway Axis</span>
              </div>
            </div>

            {/* Coordinate Crosshair readout */}
            <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] font-mono text-slate-300 shadow-lg">
              Lat: <span className="text-white">{activeCorridor.center_lat.toFixed(4)}° N</span> • Lon: <span className="text-white">{activeCorridor.center_lon.toFixed(4)}° E</span>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-500" />
              Coordinate Reference System: WGS 84 / UTM Zone 43N (Transverse Mercator, EPSG:32643)
            </span>
            <span className="font-semibold text-slate-700">Datum: Mean Sea Level (MSL)</span>
          </div>
        </div>

        {/* Right: Selected Corridor Details & Selection List (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Active Corridor Card */}
          <div className="bg-white rounded-2xl p-6 border-2 border-blue-500/30 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                  {activeCorridor.pilot_study ? 'Active Research Pilot Corridor' : 'Comparative Urban Corridor'}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  {activeCorridor.name}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {activeCorridor.description}
            </p>

            {/* Spatial Attributes Table */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 font-medium">BBMP Ward</span>
                <p className="font-bold text-slate-800 mt-0.5">Ward {activeCorridor.ward_no} - {activeCorridor.ward_name}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 font-medium">Municipal Zone</span>
                <p className="font-bold text-slate-800 mt-0.5">{activeCorridor.zone}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 font-medium">Latitude Datum</span>
                <p className="font-mono font-bold text-slate-800 mt-0.5">{activeCorridor.center_lat.toFixed(5)}° N</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 font-medium">Longitude Datum</span>
                <p className="font-mono font-bold text-slate-800 mt-0.5">{activeCorridor.center_lon.toFixed(5)}° E</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onNavigateToTwin}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>Load Corridor in 3D Digital Twin</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Corridor Selection List */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">
              All Available Bengaluru Corridors
            </h4>
            <div className="space-y-2">
              {corridors.map((c) => {
                const isSelected = c.id === selectedCorridorId;
                return (
                  <button
                    key={c.id}
                    onClick={() => onSelectCorridor(c.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between border ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-400 text-blue-950 font-semibold'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold flex items-center gap-2">
                        <span>{c.name}</span>
                        {c.pilot_study && (
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                            Pilot
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Ward {c.ward_no} • {c.zone}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

