import React, { useState } from 'react';
import {
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Box,
  Layers,
  ShieldAlert,
  ArrowRight,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  UtilityRecord,
  SimulationResponse,
  UTILITY_CATEGORIES,
  ConflictDetectionResult
} from '../../types/infrastructure';
import { simulateConflict } from '../../services/api';
import { UndergroundScene } from '../three/UndergroundScene';

interface Page6ExcavationSimulatorProps {
  utilities: UtilityRecord[];
  selectedCorridorId: string;
  selectedCorridorName: string;
  onNavigateToRisk: () => void;
  onNavigateToRecommendations: () => void;
}

export const Page6ExcavationSimulator: React.FC<Page6ExcavationSimulatorProps> = ({
  utilities,
  selectedCorridorId,
  selectedCorridorName,
  onNavigateToRisk,
  onNavigateToRecommendations,
}) => {
  // Excavation Parameters
  const [trenchLength, setTrenchLength] = useState<number>(12.0);
  const [trenchWidth, setTrenchWidth] = useState<number>(3.5);
  const [trenchDepth, setTrenchDepth] = useState<number>(2.0);
  const [trenchCenterX, setTrenchCenterX] = useState<number>(0.0);
  const [trenchCenterY, setTrenchCenterY] = useState<number>(1.0);
  const [trenchPurpose, setTrenchPurpose] = useState<string>('Mysore Road Metro Pier Excavation');

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResponse | null>(null);
  const [selectedConflict, setSelectedConflict] = useState<ConflictDetectionResult | null>(null);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await simulateConflict({
        corridor_id: selectedCorridorId,
        center_x: trenchCenterX,
        center_y: trenchCenterY,
        length_m: trenchLength,
        width_m: trenchWidth,
        depth_m: trenchDepth,
        rotation_deg: 0.0,
        trench_purpose: trenchPurpose
      });
      setSimulationResult(res);
      if (res.conflicts && res.conflicts.length > 0) {
        setSelectedConflict(res.conflicts[0]);
      }
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const excavationBox = {
    center_x: trenchCenterX,
    center_y: trenchCenterY,
    length_m: trenchLength,
    width_m: trenchWidth,
    depth_m: trenchDepth,
    rotation_deg: 0.0
  };

  return (
    <div className="p-8 max-w-[1720px] mx-auto space-y-6 bg-[#f8fafc] text-slate-800 min-h-[calc(100vh-68px)]">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              6. 3D Excavation Volume & Spatial Conflict Detection
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Probabilistic Collision Engine
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Section 10: 3D bounding box prism intersection and Monte Carlo clearance violation analysis against underground utilities.
          </p>
        </div>

        {simulationResult && (
          <button
            onClick={onNavigateToRisk}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <span>Predict AI Excavation Risk</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Grid: Parameters Control Panel + 3D Simulation Preview Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Excavation Parameters Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Excavation Trench Specification</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500">{selectedCorridorName.split(' (')[0]}</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Purpose */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Excavation Project Purpose</label>
              <select
                value={trenchPurpose}
                onChange={(e) => setTrenchPurpose(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none"
              >
                <option value="Mysore Road Metro Pier Excavation">Namma Metro Purple Line Pier Foundation</option>
                <option value="BBMP White-Topping Trenching">BBMP White-Topping Pavement Cross-Trench</option>
                <option value="SWD Stormwater Box Culvert">BBMP Stormwater Box Drain Remodeling</option>
                <option value="Road Widening Sub-Base Excavation">Road Widening & Footpath Realignment</option>
              </select>
            </div>

            {/* Depth Slider */}
            <div>
              <div className="flex justify-between text-slate-700 font-semibold mb-1">
                <span>Excavation Depth:</span>
                <span className="font-mono text-blue-600 font-bold">{trenchDepth.toFixed(2)} meters</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.5"
                step="0.1"
                value={trenchDepth}
                onChange={(e) => setTrenchDepth(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0.5m (Pavement)</span>
                <span>1.8m (Water Main)</span>
                <span>3.5m (Deep Sewer)</span>
              </div>
            </div>

            {/* Length and Width */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Trench Length (X)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="2"
                    max="50"
                    step="1"
                    value={trenchLength}
                    onChange={(e) => setTrenchLength(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-slate-800 font-bold"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 text-xs">m</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Trench Width (Y)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="15"
                    step="0.5"
                    value={trenchWidth}
                    onChange={(e) => setTrenchWidth(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-slate-800 font-bold"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 text-xs">m</span>
                </div>
              </div>
            </div>

            {/* Position Offset */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Center X Offset</label>
                <div className="relative">
                  <input
                    type="number"
                    min="-20"
                    max="20"
                    step="0.5"
                    value={trenchCenterX}
                    onChange={(e) => setTrenchCenterX(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-slate-800 font-bold"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 text-xs">m</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Center Y Offset</label>
                <div className="relative">
                  <input
                    type="number"
                    min="-8"
                    max="8"
                    step="0.5"
                    value={trenchCenterY}
                    onChange={(e) => setTrenchCenterY(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-slate-800 font-bold"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 text-xs">m</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isSimulating ? 'Computing 3D Intersections...' : 'Execute Spatial Conflict Engine'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Embedded 3D Scene showing Excavation Box (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden flex flex-col h-[480px]">
          <div className="p-3 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 text-xs font-semibold px-4">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-400" />
              <span>3D Subsurface Cutaway with Simulated Excavation Volume</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Trench Vol: {(trenchLength * trenchWidth * trenchDepth).toFixed(1)} m³
            </div>
          </div>

          <div className="relative flex-1 w-full h-full">
            <UndergroundScene
              utilities={utilities}
              onSelectUtility={() => {}}
              showSurface={true}
              showWater={true}
              showDrainage={true}
              showElectrical={true}
              showGas={true}
              showUncertaintyEnvelopes={true}
              excavation={excavationBox}
              hasConflicts={simulationResult?.critical_conflicts_count ? simulationResult.critical_conflicts_count > 0 : false}
            />

            {/* Overlay simulation status */}
            {simulationResult && (
              <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-xs shadow-xl space-y-1">
                <div className="font-bold text-white flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      simulationResult.overall_risk_class === 'CRITICAL'
                        ? 'bg-rose-500'
                        : simulationResult.overall_risk_class === 'MEDIUM'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span>Status: {simulationResult.overall_risk_class}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {simulationResult.critical_conflicts_count} high-severity breaches detected
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conflicts Results Table (Section 10 Requirement) */}
      {simulationResult && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden space-y-0">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Detected Spatial Conflicts & Uncertainty Evaluation ({simulationResult.conflicts.length} Utilities Checked)</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Simulation ID: {simulationResult.simulation_id}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Utility Code</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Nominal Distance</th>
                  <th className="py-3.5 px-4">95% Uncertainty Margin</th>
                  <th className="py-3.5 px-4">Worst-Case Distance</th>
                  <th className="py-3.5 px-4">Strike Probability</th>
                  <th className="py-3.5 px-4">Classification</th>
                  <th className="py-3.5 px-4">Engineering Directives</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {simulationResult.conflicts.map((conf) => {
                  const meta = UTILITY_CATEGORIES[conf.category] || UTILITY_CATEGORIES.water;

                  return (
                    <tr
                      key={conf.utility_id}
                      onClick={() => setSelectedConflict(conf)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        selectedConflict?.utility_id === conf.utility_id ? 'bg-blue-50/60' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {conf.utility_code}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.hexColor }}></span>
                          {meta.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {conf.nominal_distance_m.toFixed(2)} m
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        ±{conf.uncertainty_margin_m.toFixed(2)} m
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {conf.worst_case_distance_m.toFixed(2)} m
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span
                          className={`${
                            conf.conflict_probability >= 0.5
                              ? 'text-rose-600'
                              : conf.conflict_probability >= 0.2
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {(conf.conflict_probability * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${
                            conf.severity_level === 'CRITICAL'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : conf.severity_level === 'HIGH'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : conf.severity_level === 'MEDIUM'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {conf.conflict_classification}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-[280px] leading-snug text-[11.5px]">
                        {conf.recommended_action}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

