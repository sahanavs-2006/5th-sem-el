import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Page1Dashboard } from './components/pages/Page1Dashboard';
import { Page2BengaluruStudyArea } from './components/pages/Page2BengaluruStudyArea';
import { Page3DatasetManagement } from './components/pages/Page3DatasetManagement';
import { Page4DigitalTwin3D } from './components/pages/Page4DigitalTwin3D';
import { Page5UncertaintyAnalysis } from './components/pages/Page5UncertaintyAnalysis';
import { Page6ExcavationSimulator } from './components/pages/Page6ExcavationSimulator';
import { Page7AIRiskPrediction } from './components/pages/Page7AIRiskPrediction';
import { Page8DecisionSupport } from './components/pages/Page8DecisionSupport';
import { Page9ResearchValidation } from './components/pages/Page9ResearchValidation';

import {
  CorridorItem,
  DatasetItem,
  UtilityRecord,
  DashboardStats
} from './types/infrastructure';
import {
  fetchCorridors,
  fetchDatasets,
  fetchUtilities,
  fetchDashboardStats
} from './services/api';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [corridors, setCorridors] = useState<CorridorItem[]>([]);
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('blr-corridor-rvce');
  const [includeDemoData, setIncludeDemoData] = useState<boolean>(true);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [utilities, setUtilities] = useState<UtilityRecord[]>([]);
  const [selectedUtility, setSelectedUtility] = useState<UtilityRecord | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  // Initial Data Fetch
  useEffect(() => {
    Promise.all([fetchCorridors(), fetchDatasets(), fetchDashboardStats()])
      .then(([corrs, dsets, st]) => {
        setCorridors(corrs);
        setDatasets(dsets);
        setStats(st);
        if (corrs.length > 0) {
          const pilot = corrs.find((c) => c.pilot_study) || corrs[0];
          setSelectedCorridorId(pilot.id);
        }
      })
      .catch((err) => console.error('Initial load failed:', err))
      .finally(() => setLoading(false));
  }, []);

  // Fetch utilities whenever corridor or demo toggle changes
  useEffect(() => {
    if (!selectedCorridorId) return;
    fetchUtilities(selectedCorridorId, includeDemoData)
      .then((utils) => {
        setUtilities(utils);
        if (utils.length > 0) {
          setSelectedUtility(utils[0]);
        } else {
          setSelectedUtility(null);
        }
      })
      .catch((err) => console.error('Utilities fetch failed:', err));
  }, [selectedCorridorId, includeDemoData]);

  const handleRefreshDatasets = () => {
    fetchDatasets().then(setDatasets).catch(console.error);
    fetchDashboardStats().then(setStats).catch(console.error);
  };

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

  const activeCorridor = corridors.find((c) => c.id === selectedCorridorId) || corridors[0] || defaultCorridor;

  return (
    <div className="min-h-screen bg-[#070c1a] text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Application Header */}
      <Header
        corridors={corridors}
        selectedCorridorId={selectedCorridorId}
        onSelectCorridor={setSelectedCorridorId}
        includeDemoData={includeDemoData}
        onToggleDemoData={setIncludeDemoData}
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
      />

      {/* Main Body: Left Sidebar + Active Page */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onSelectPage={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* Dynamic Page Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
          {currentPage === 1 && (
            <Page1Dashboard
              stats={stats}
              corridors={corridors}
              selectedCorridorId={selectedCorridorId}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 2 && (
            <Page2BengaluruStudyArea
              corridors={corridors}
              selectedCorridorId={selectedCorridorId}
              onSelectCorridor={setSelectedCorridorId}
              onNavigateToTwin={() => setCurrentPage(4)}
            />
          )}

          {currentPage === 3 && (
            <Page3DatasetManagement
              datasets={datasets}
              selectedCorridorId={selectedCorridorId}
              onRefreshDatasets={handleRefreshDatasets}
              onNavigateToTwin={() => setCurrentPage(4)}
            />
          )}

          {currentPage === 4 && (
            <Page4DigitalTwin3D
              utilities={utilities}
              selectedUtility={selectedUtility}
              onSelectUtility={setSelectedUtility}
              selectedCorridorName={activeCorridor?.name || 'RVCE Mysore Road Corridor'}
              onNavigateToConflict={() => setCurrentPage(6)}
              onNavigateToUncertainty={() => setCurrentPage(5)}
            />
          )}

          {currentPage === 5 && (
            <Page5UncertaintyAnalysis
              utilities={utilities}
              onNavigateToTwin={() => setCurrentPage(4)}
              onNavigateToConflict={() => setCurrentPage(6)}
            />
          )}

          {currentPage === 6 && (
            <Page6ExcavationSimulator
              utilities={utilities}
              selectedCorridorId={selectedCorridorId}
              selectedCorridorName={activeCorridor?.name || 'RVCE Mysore Road Corridor'}
              onNavigateToRisk={() => setCurrentPage(7)}
              onNavigateToRecommendations={() => setCurrentPage(8)}
            />
          )}

          {currentPage === 7 && (
            <Page7AIRiskPrediction
              onNavigateToRecommendations={() => setCurrentPage(8)}
              onNavigateToExperiments={() => setCurrentPage(9)}
            />
          )}

          {currentPage === 8 && (
            <Page8DecisionSupport
              corridor={activeCorridor}
              utilities={utilities}
              onNavigateToTwin={() => setCurrentPage(4)}
              onNavigateToValidation={() => setCurrentPage(9)}
            />
          )}

          {currentPage === 9 && (
            <Page9ResearchValidation />
          )}
        </main>
      </div>
    </div>
  );
};
export default App;

