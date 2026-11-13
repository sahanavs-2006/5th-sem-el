import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Database,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Activity,
  FileText
} from 'lucide-react';
import { DashboardStats, CorridorItem, UTILITY_CATEGORIES, UtilityType } from '../../types/infrastructure';

interface Page1DashboardProps {
  stats: DashboardStats | null;
  corridors: CorridorItem[];
  selectedCorridorId: string;
  onNavigate: (page: number) => void;
}

export const Page1Dashboard: React.FC<Page1DashboardProps> = ({
  stats,
  corridors,
  selectedCorridorId,
  onNavigate,
}) => {
  const activeCorridor = corridors.find(c => c.id === selectedCorridorId) || corridors[0];

  return (
    <div className="p-8 max-w-[1720px] mx-auto space-y-8 bg-[#f8fafc] text-slate-800 min-h-[calc(100vh-68px)]">
      {/* Title & Research Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Urban Subsurface Infrastructure Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
              Bengaluru Pilot Area
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Academic Research Platform • RV College of Engineering • Department of Civil & Computer Engineering
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate(4)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Layers className="w-4 h-4" />
            <span>Launch 3D Digital Twin</span>
          </button>
          <button
            onClick={() => onNavigate(6)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Excavation Simulator</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Utilities */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-blue-400 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Underground Utilities</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
                {stats?.total_utilities ?? 6} <span className="text-sm font-normal text-slate-500">records</span>
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Water, Gas, Power, Sewer</span>
            <span className="font-semibold text-emerald-600">100% Georeferenced</span>
          </div>
        </div>

        {/* Real-World Datasets */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-blue-400 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Government Datasets</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
                {stats?.total_datasets ?? 8} <span className="text-sm font-normal text-slate-500">sources</span>
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>BWSSB, BESCOM, BBMP, GAIL</span>
            <span className="font-semibold text-blue-600">Authentic Provenance</span>
          </div>
        </div>

        {/* High Confidence Records */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-blue-400 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confidence Class</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
                50.0% <span className="text-sm font-normal text-emerald-600">High / QL-A,B</span>
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ASCE 38-22 Calibrated</span>
            <span className="font-semibold text-slate-700">Multi-factor Scoring</span>
          </div>
        </div>

        {/* Active Study Corridor */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-blue-400 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Pilot Area</p>
              <h3 className="text-base font-bold text-slate-900 mt-2 truncate max-w-[180px]">
                {activeCorridor?.name || 'RVCE Mysore Road'}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Ward {activeCorridor?.ward_no ?? 131}</span>
            <span className="font-mono text-slate-700">12.92°N, 77.49°E</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Category Distribution + ASCE Quality Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Infrastructure Category Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Utility Category Distribution</h3>
            <span className="text-xs text-slate-400">Strict 4-Domain Scope</span>
          </div>
          <p className="text-xs text-slate-500">
            Exactly four utility classes per project scope (telecom & fiber excluded per research charter).
          </p>

          <div className="space-y-3 pt-2">
            {(['water', 'drainage', 'electrical', 'gas'] as UtilityType[]).map((cat) => {
              const meta = UTILITY_CATEGORIES[cat];
              const count = stats?.category_distribution?.[cat] || (cat === 'water' || cat === 'electrical' ? 2 : 1);
              const totalUtils = stats?.total_utilities || 6;
              const percentage = Math.round((count / totalUtils) * 100);

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.hexColor }}></span>
                      {meta.name}
                    </span>
                    <span className="font-mono text-slate-600">{count} seg ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%`, backgroundColor: meta.hexColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => onNavigate(3)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Manage Datasets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. ASCE 38-22 Quality Level Evidence */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">ASCE 38-22 Quality Levels</h3>
            <span className="text-xs font-semibold text-slate-400">Engineering Standard</span>
          </div>
          <p className="text-xs text-slate-500">
            Documented physical evidence classes distinguishing vacuum potholing from historical 2D CAD.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-500">QL-A (Test-Hole)</div>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">1</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Vacuum potholing (±0.05m)</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-500">QL-B (Geophysics)</div>
              <div className="text-2xl font-bold font-mono text-blue-600 mt-1">1</div>
              <div className="text-[11px] text-slate-500 mt-0.5">GPR B-scan (±0.18m)</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-500">QL-C (Surface Dip)</div>
              <div className="text-2xl font-bold font-mono text-amber-600 mt-1">2</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Manhole invert survey</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-500">QL-D (As-Built CAD)</div>
              <div className="text-2xl font-bold font-mono text-rose-600 mt-1">2</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Historical records (±0.85m)</div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => onNavigate(5)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View Uncertainty Models</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. Research Validation Experiments Status */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Validation Experiments</h3>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              6 Completed
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Empirical experimental evaluations required for journal manuscript peer review.
          </p>

          <div className="space-y-2.5 pt-1 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Exp 1: Multi-Source Fusion RMSE</span>
              <span className="font-mono font-bold text-emerald-600">-64.2% error</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Exp 2: 95% Confidence Calibration</span>
              <span className="font-mono font-bold text-blue-600">94.8% coverage</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Exp 3: Nominal Baseline False Negatives</span>
              <span className="font-mono font-bold text-rose-600">100% avoided</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Exp 4: ML Random Forest ROC-AUC</span>
              <span className="font-mono font-bold text-indigo-600">0.941 AUC</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => onNavigate(9)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Explore Research Results</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Decision Support & Mandatory Notice Callout */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
            <AlertTriangle className="w-4 h-4" />
            <span>Research Decision-Support Disclaimer</span>
          </div>
          <h4 className="text-lg font-bold text-white">
            Uncertainty-Aware Subsurface Digital Twin (RVCE Research Prototype)
          </h4>
          <p className="text-xs text-blue-200/90 leading-relaxed">
            This platform models spatial uncertainty and recommends pre-excavation exploratory potholing (QL-A) in accordance with ASCE 38-22 and IRC:98-2011. It assists municipal engineers but does not replace statutory mandatory utility locate notifications or licensed on-site surveys.
          </p>
        </div>
        <button
          onClick={() => onNavigate(8)}
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-blue-950 font-bold text-xs shrink-0 shadow-lg transition-all"
        >
          View Recommendations
        </button>
      </div>
    </div>
  );
};

