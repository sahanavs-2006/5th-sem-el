import React, { useState } from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Sliders,
  Box,
  MapPin,
  Info,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Droplet,
  Flame,
  Zap,
  Activity,
  Maximize2,
  Scan,
  Compass,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { UtilityRecord, UTILITY_CATEGORIES, UtilityType } from '../../types/infrastructure';
import { UndergroundScene, CameraViewPreset } from '../three/UndergroundScene';

interface Page4DigitalTwin3DProps {
  utilities: UtilityRecord[];
  selectedUtility: UtilityRecord | null;
  onSelectUtility: (u: UtilityRecord) => void;
  selectedCorridorName: string;
  onNavigateToConflict: () => void;
  onNavigateToUncertainty: () => void;
}

export const Page4DigitalTwin3D: React.FC<Page4DigitalTwin3DProps> = ({
  utilities,
  selectedUtility,
  onSelectUtility,
  selectedCorridorName,
  onNavigateToConflict,
  onNavigateToUncertainty,
}) => {
  // Layer visibility toggles
  const [showSurface, setShowSurface] = useState(true);
  const [showWater, setShowWater] = useState(true);
  const [showDrainage, setShowDrainage] = useState(true);
  const [showElectrical, setShowElectrical] = useState(true);
  const [showGas, setShowGas] = useState(true);
  const [showUncertainty, setShowUncertainty] = useState(true);

  // 3D Visual & View Controls
  const [viewPreset, setViewPreset] = useState<CameraViewPreset>('3d');
  const [xrayMode, setXrayMode] = useState<boolean>(false);
  const [depthCutoff, setDepthCutoff] = useState<number>(4.0);
  const [showLegend, setShowLegend] = useState<boolean>(true);

  const activeUtil = selectedUtility || utilities[0];

  return (
    <div className="flex flex-col h-[calc(100vh-68px)] w-full bg-[#070d1e] text-slate-100 overflow-hidden select-none">
      {/* Sub-Header Control Bar */}
      <div className="h-12 bg-[#0a142c] border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Box className="w-4 h-4 text-blue-400" />
            <span>3D Subsurface Digital Twin:</span>
            <span className="text-blue-400 font-bold">{selectedCorridorName}</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
            WebGL 3D Active • PBR Lighting
          </span>
        </div>

        {/* Camera View Presets & Quick Mode Toggles */}
        <div className="flex items-center gap-2">
          {/* Preset Buttons */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800 text-[11px]">
            <button
              onClick={() => setViewPreset('3d')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewPreset === '3d'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Isometric 3D Perspective View"
            >
              Perspective 3D
            </button>
            <button
              onClick={() => setViewPreset('top')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewPreset === 'top'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Orthographic Plan View from Above"
            >
              Plan (Top)
            </button>
            <button
              onClick={() => setViewPreset('cross')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewPreset === 'cross'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Transverse Cross-Section Profile"
            >
              Cross-Section
            </button>
            <button
              onClick={() => setViewPreset('side')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewPreset === 'side'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Longitudinal Elevation Profile"
            >
              Elevation (Side)
            </button>
          </div>

          {/* X-Ray Transparency Toggle */}
          <button
            onClick={() => setXrayMode(!xrayMode)}
            className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all border ${
              xrayMode
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
            title="Toggle Transparent Ground Strata (X-Ray Mode)"
          >
            <Scan className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">X-Ray Strata</span>
          </button>

          {/* Quick navigation */}
          <button
            onClick={onNavigateToUncertainty}
            className="text-xs text-slate-300 hover:text-white px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>Uncertainty Model</span>
          </button>
          <button
            onClick={onNavigateToConflict}
            className="text-xs text-white px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center gap-1.5 transition-colors font-semibold shadow-sm"
          >
            <span>Simulate Excavation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 3D Viewport + Overlaid Panels */}
      <div className="relative flex-1 w-full h-full">
        {/* Three.js Canvas Scene */}
        <UndergroundScene
          utilities={utilities}
          selectedUtilityId={activeUtil?.id}
          onSelectUtility={onSelectUtility}
          showSurface={showSurface}
          showWater={showWater}
          showDrainage={showDrainage}
          showElectrical={showElectrical}
          showGas={showGas}
          showUncertaintyEnvelopes={showUncertainty}
          viewPreset={viewPreset}
          xrayMode={xrayMode}
          depthCutoffM={depthCutoff}
        />

        {/* Floating Left: Layer Visibility & Depth Cutoff Controls */}
        <div className="absolute top-5 left-5 w-64 bg-[#0a142c]/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl z-10 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-white uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Layer Visibility</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Toggles</span>
          </div>

          <div className="space-y-1.5 text-xs">
            {/* Road Surface & Geological Strata */}
            <button
              onClick={() => setShowSurface(!showSurface)}
              className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors ${
                showSurface ? 'bg-slate-800/80 text-white font-medium' : 'text-slate-400 hover:bg-slate-800/40'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span>Road Surface & Strata</span>
              </span>
              {showSurface ? <Eye className="w-3.5 h-3.5 text-blue-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {/* Water */}
            <button
              onClick={() => setShowWater(!showWater)}
              className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors ${
                showWater ? 'bg-sky-500/10 text-sky-300 font-medium border border-sky-500/20' : 'text-slate-400 hover:bg-slate-800/40'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                <span>Water Supply Network</span>
              </span>
              {showWater ? <Eye className="w-3.5 h-3.5 text-sky-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {/* Drainage */}
            <button
              onClick={() => setShowDrainage(!showDrainage)}
              className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors ${
                showDrainage ? 'bg-emerald-500/10 text-emerald-300 font-medium border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800/40'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Drainage & Sewer Mains</span>
              </span>
              {showDrainage ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {/* Electrical */}
            <button
              onClick={() => setShowElectrical(!showElectrical)}
              className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors ${
                showElectrical ? 'bg-rose-500/10 text-rose-300 font-medium border border-rose-500/20' : 'text-slate-400 hover:bg-slate-800/40'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>11kV Electrical Cables</span>
              </span>
              {showElectrical ? <Eye className="w-3.5 h-3.5 text-rose-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {/* Gas */}
            <button
              onClick={() => setShowGas(!showGas)}
              className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors ${
                showGas ? 'bg-amber-500/10 text-amber-300 font-medium border border-amber-500/20' : 'text-slate-400 hover:bg-slate-800/40'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Natural Gas Pipelines</span>
              </span>
              {showGas ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {/* 3D Uncertainty Envelopes */}
            <button
              onClick={() => setShowUncertainty(!showUncertainty)}
              className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors border ${
                showUncertainty ? 'bg-indigo-500/20 text-indigo-300 font-semibold border-indigo-500/40' : 'text-slate-400 hover:bg-slate-800/40 border-transparent'
              }`}
            >
              <span className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span>95% Uncertainty Tubes</span>
              </span>
              {showUncertainty ? <Eye className="w-3.5 h-3.5 text-indigo-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            </button>
          </div>

          {/* Depth Inspection Range Slider */}
          <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Max Cutaway Depth:</span>
              <span className="font-mono text-cyan-400 font-bold">-{depthCutoff.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="5.0"
              step="0.25"
              value={depthCutoff}
              onChange={(e) => setDepthCutoff(parseFloat(e.target.value))}
              className="w-full accent-blue-500 bg-slate-800 rounded-lg cursor-pointer h-1.5"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-1.5m</span>
              <span>-3.0m</span>
              <span>-5.0m</span>
            </div>
          </div>
        </div>

        {/* Floating Right: Selected Utility Inspector Panel */}
        {activeUtil && (
          <div className="absolute top-5 right-5 w-80 bg-[#0a142c]/95 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-2xl z-10 space-y-4 max-h-[calc(100%-40px)] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-blue-600">
                    {activeUtil.utility_code}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    {activeUtil.category_name}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Source: <span className="text-white font-medium">{activeUtil.source_department}</span>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                  activeUtil.confidence_class === 'High'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : activeUtil.confidence_class === 'Medium'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                {activeUtil.confidence_class} Conf
              </span>
            </div>

            {/* Depth & Measurement Status (Section 8 Requirement) */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Nominal Depth:</span>
                <span className="font-mono font-bold text-white text-sm">
                  {activeUtil.nominal_depth_m.toFixed(2)} m
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Measurement Status:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    activeUtil.depth_measurement_status === 'measured'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {activeUtil.depth_measurement_status.toUpperCase()}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 leading-snug">
                <span className="font-semibold text-slate-300">Estimation Source: </span>
                {activeUtil.depth_estimation_source}
              </div>
            </div>

            {/* Physical Attributes */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-400 text-[11px]">Diameter:</span>
                <div className="font-mono font-bold text-white mt-0.5">
                  {activeUtil.diameter_mm} mm
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-400 text-[11px]">Material:</span>
                <div className="font-semibold text-slate-200 mt-0.5 truncate">
                  {activeUtil.material}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-400 text-[11px]">ASCE Quality:</span>
                <div className="font-bold text-blue-400 mt-0.5">
                  {activeUtil.asce_quality_level}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-400 text-[11px]">Confidence Score:</span>
                <div className="font-mono font-bold text-emerald-400 mt-0.5">
                  {(activeUtil.confidence_score * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Positional Uncertainty Dispersion */}
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-900/60 space-y-1.5 text-xs">
              <div className="font-semibold text-indigo-300 text-[11px] uppercase tracking-wider">
                95% Spatial Uncertainty Bounds
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Horizontal (±dx, dy):</span>
                <span className="font-mono font-bold text-white">±{activeUtil.horizontal_uncertainty_m} m</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Vertical Depth (±dz):</span>
                <span className="font-mono font-bold text-white">±{activeUtil.vertical_uncertainty_m} m</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 leading-snug">
              Verification: <span className="text-slate-300 font-medium">{activeUtil.verification_status}</span>
            </div>
          </div>
        )}

        {/* Floating Bottom Center: 3D Interaction Hints & Geological Key */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#0a142c]/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 text-[11px] text-slate-300 shadow-xl z-10">
          <div className="flex items-center gap-1.5 text-slate-400 border-r border-slate-800 pr-3">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span><strong className="text-white">Left-click:</strong> Orbit</span>
            <span className="mx-1">•</span>
            <span><strong className="text-white">Right-click:</strong> Pan</span>
            <span className="mx-1">•</span>
            <span><strong className="text-white">Scroll:</strong> Zoom</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <span>Water (BWSSB)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Drainage (BWSSB)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Power (BESCOM)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Gas (GAIL)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm border border-indigo-400 bg-indigo-500/30"></span>
              <span>95% Ellipsoid Tube</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
