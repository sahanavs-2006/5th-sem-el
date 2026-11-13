import React from 'react';
import { ShieldCheck, MapPin, Layers, Sparkles, Building2, AlertCircle } from 'lucide-react';
import { CorridorItem } from '../../types/infrastructure';

interface HeaderProps {
  corridors: CorridorItem[];
  selectedCorridorId: string;
  onSelectCorridor: (id: string) => void;
  includeDemoData: boolean;
  onToggleDemoData: (val: boolean) => void;
  currentPage: number;
  onSelectPage: (page: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  corridors,
  selectedCorridorId,
  onSelectCorridor,
  includeDemoData,
  onToggleDemoData,
  currentPage,
  onSelectPage
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
  const currentCorridor = corridors.find(c => c.id === selectedCorridorId) || corridors[0] || defaultCorridor;

  return (
    <header className="h-[68px] bg-[#0c1836] border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0 z-30 shadow-md">
      {/* Left: Brand & RVCE Research Identity */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 border border-blue-400/30">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="8" rx="2" />
            <rect x="2" y="14" width="20" height="8" rx="2" />
            <line x1="6" y1="6" x2="6.01" y2="6" />
            <line x1="6" y1="18" x2="6.01" y2="18" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-bold text-white text-[16px] tracking-tight leading-none">
              Underground Infrastructure Digital Twin
            </h1>
            <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
              RVCE Journal Research
            </span>
          </div>
          <p className="text-[12px] text-slate-400 mt-1 flex items-center gap-2">
            <span>RV College of Engineering, Bengaluru</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Geodetic Engine
            </span>
          </p>
        </div>
      </div>

      {/* Center: Bengaluru Corridor Selector */}
      <div className="hidden lg:flex items-center gap-3 bg-[#081228] border border-slate-800 rounded-xl px-3 py-1.5">
        <div className="flex items-center gap-2 text-slate-300 text-xs">
          <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="font-semibold text-slate-400">Bengaluru Corridor:</span>
        </div>
        <select
          value={selectedCorridorId}
          onChange={(e) => onSelectCorridor(e.target.value)}
          aria-label="Select Bengaluru Corridor"
          className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer border-none pr-3"
        >
          {corridors.map((c) => (
            <option key={c.id} value={c.id} className="bg-[#0c1836] text-white">
              {c.name} {c.pilot_study ? '(Primary Pilot)' : ''}
            </option>
          ))}
        </select>
        {currentCorridor && (
          <span className="text-[11px] text-slate-400 font-mono pl-2 border-l border-slate-700">
            {currentCorridor.center_lat.toFixed(4)}°N, {currentCorridor.center_lon.toFixed(4)}°E
          </span>
        )}
      </div>

      {/* Right: Quick Action Toggles & Demo Sandbox Notice */}
      <div className="flex items-center gap-3">
        {/* Demonstration Data Sandbox Toggle */}
        <div className="flex items-center gap-2 bg-[#081228] border border-slate-800 px-3 py-1.5 rounded-xl">
          <span className="text-xs text-slate-300 font-medium">Demo Benchmarks:</span>
          <button
            onClick={() => onToggleDemoData(!includeDemoData)}
            className={`w-9 h-5 rounded-full transition-colors relative p-0.5 focus:outline-none ${
              includeDemoData ? 'bg-amber-600' : 'bg-slate-700'
            }`}
            title="Toggle isolated demonstration benchmark records"
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                includeDemoData ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 3D Twin Quick Button */}
        <button
          onClick={() => onSelectPage(4)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
            currentPage === 4
              ? 'bg-blue-600 text-white shadow-blue-500/25'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>3D Twin Viewport</span>
        </button>
      </div>
    </header>
  );
};

