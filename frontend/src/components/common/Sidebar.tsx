import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Database,
  Box,
  Activity,
  AlertTriangle,
  BrainCircuit,
  FileCheck2,
  FlaskConical,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  currentPage: number;
  onSelectPage: (page: number) => void;
}

interface NavItem {
  pageNumber: number;
  title: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
}) => {
  const navItems: NavItem[] = [
    {
      pageNumber: 1,
      title: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Project KPIs & utility overview'
    },
    {
      pageNumber: 2,
      title: 'Bengaluru Study Area',
      badge: 'GIS Map',
      icon: MapPin,
      description: 'Wards, corridors & coordinates'
    },
    {
      pageNumber: 3,
      title: 'Dataset Management',
      badge: 'Authentic',
      icon: Database,
      description: 'Government inventory & upload'
    },
    {
      pageNumber: 4,
      title: '3D Digital Twin',
      badge: 'Three.js',
      icon: Box,
      description: 'Underground 3D subsurface view'
    },
    {
      pageNumber: 5,
      title: 'Uncertainty Analysis',
      badge: 'ASCE 38-22',
      icon: Activity,
      description: 'Gaussian & depth variance models'
    },
    {
      pageNumber: 6,
      title: 'Excavation Simulator',
      badge: 'Conflict Engine',
      icon: AlertTriangle,
      description: '3D trench conflict detection'
    },
    {
      pageNumber: 7,
      title: 'AI Risk Prediction',
      badge: 'ML Ensemble',
      icon: BrainCircuit,
      description: 'Explainable risk & feature importance'
    },
    {
      pageNumber: 8,
      title: 'Decision Support',
      badge: 'Actionable',
      icon: FileCheck2,
      description: 'Engineering potholing & report'
    },
    {
      pageNumber: 9,
      title: 'Research Validation',
      badge: 'Experiments 1-6',
      icon: FlaskConical,
      description: 'Empirical results & peer review'
    }
  ];

  return (
    <aside className="w-[260px] bg-[#081024] border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none">
      {/* Navigation Links */}
      <div className="py-4 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Application Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.pageNumber;

          return (
            <button
              key={item.pageNumber}
              onClick={() => onSelectPage(item.pageNumber)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-md shadow-blue-500/20'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-blue-400 group-hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-[13px] leading-tight flex items-center gap-2">
                    <span className="truncate">{item.title}</span>
                  </div>
                  <div
                    className={`text-[10.5px] truncate mt-0.5 ${
                      isActive ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info: RVCE Research Attribution */}
      <div className="p-4 border-t border-slate-800/80 bg-[#060c1c]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200 leading-tight">
              RVCE Academic Research
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Uncertainty-Aware 3D Twin for Urban Bengaluru
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1">
              v2.4 Research Edition
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

