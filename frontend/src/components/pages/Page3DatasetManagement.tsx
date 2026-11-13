import React, { useState } from 'react';
import {
  Database,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Folder,
  HardDrive,
  Download
} from 'lucide-react';
import { DatasetItem } from '../../types/infrastructure';
import { uploadDatasetFile } from '../../services/api';

interface Page3DatasetManagementProps {
  datasets: DatasetItem[];
  selectedCorridorId: string;
  onRefreshDatasets: () => void;
  onNavigateToTwin: () => void;
}

export const Page3DatasetManagement: React.FC<Page3DatasetManagementProps> = ({
  datasets,
  selectedCorridorId,
  onRefreshDatasets,
  onNavigateToTwin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // File Upload state
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadDept, setUploadDept] = useState('BWSSB - Water Division');

  const filteredDatasets = datasets.filter((d) => {
    const matchSearch =
      d.dataset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.format.toLowerCase().includes(searchTerm.toLowerCase());

    const matchDept = selectedDept === 'ALL' || d.department.includes(selectedDept);
    return matchSearch && matchDept;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
      setUploadMessage(null);
      setUploadError(null);
    }
  };

  const handleTriggerUpload = async () => {
    if (!fileToUpload) return;
    setIsUploading(true);
    setUploadMessage(null);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('department', uploadDept);
      formData.append('corridor_id', selectedCorridorId);

      const res = await uploadDatasetFile(formData);
      if (res.success) {
        const savedPathText = res.saved_path ? ` (Archived to ${res.saved_path})` : '';
        setUploadMessage(`Successfully imported ${res.records_imported} utilities from ${fileToUpload.name}!${savedPathText}`);
        setFileToUpload(null);
        onRefreshDatasets();
      } else {
        setUploadError(res.error || 'Upload failed');
      }
    } catch (err: any) {
      setUploadError(err.message || 'File upload encountered an error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-[1720px] mx-auto space-y-6 bg-[#f8fafc] text-slate-800 min-h-[calc(100vh-68px)]">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              3. Geospatial Dataset Management & Authentic Inventory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
              Section 4 Verified
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Mandatory real-world Bengaluru municipal datasets, department access URLs, format standards, and ingestion pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/api/datasets/download-all"
            download="bengaluru_underground_datasets_bundle.zip"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
            title="Download consolidated ZIP bundle containing all authentic geospatial datasets"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download All Datasets (.ZIP)</span>
          </a>
          <button
            onClick={onRefreshDatasets}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Inventory</span>
          </button>
        </div>
      </div>

      {/* Upload Zone Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Geospatial Ingestion Pipeline</h3>
              <p className="text-xs text-slate-500">
                Supports GeoJSON, CSV with latitude/longitude, and KML formats. Automatic CRS detection & attribute normalization.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Target Corridor: <span className="font-bold text-blue-600">{selectedCorridorId}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2">
          {/* File Picker */}
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Select Geospatial File (.geojson, .csv, .kml)
            </label>
            <input
              type="file"
              accept=".geojson,.json,.csv,.kml"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-200 rounded-xl p-1"
            />
          </div>

          {/* Department Tag */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Source Department Tag
            </label>
            <select
              value={uploadDept}
              onChange={(e) => setUploadDept(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="BWSSB - Water Supply">BWSSB (Water Supply Division)</option>
              <option value="BWSSB - Sewerage Division">BWSSB (Drainage & Sewerage)</option>
              <option value="BESCOM - Electrical Grid">BESCOM (Power Distribution)</option>
              <option value="GAIL Gas - City Gas Network">GAIL Gas (City Gas Distribution)</option>
              <option value="BBMP - Civil Works">BBMP (Roads & SWD Drains)</option>
              <option value="Field Survey - QL-B GPR">On-Site Geophysical GPR Survey</option>
            </select>
          </div>

          {/* Upload Button */}
          <div className="md:col-span-3 flex items-end">
            <button
              onClick={handleTriggerUpload}
              disabled={!fileToUpload || isUploading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Ingesting File...' : 'Ingest to Database'}</span>
            </button>
          </div>
        </div>

        {uploadMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadMessage}</span>
          </div>
        )}

        {uploadError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Datasets Local Repository Directory Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <HardDrive className="w-5 h-5 text-indigo-400" />
            <div>
              <h4 className="text-sm font-bold tracking-tight">Dedicated Project Datasets Directory: <span className="font-mono text-cyan-400">datasets/</span></h4>
              <p className="text-[11px] text-slate-400">All municipal benchmark layers and uploaded files are permanently organized on disk.</p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            Path: ./datasets/
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <Folder className="w-4 h-4 text-amber-400" />
              <span>datasets/bengaluru_benchmarks/</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              8 authentic geospatial datasets (BWSSB, KSRSAC, BBMP, BESCOM, GAIL, OSM, RVCE GPR) in GeoJSON & CSV.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <Folder className="w-4 h-4 text-emerald-400" />
              <span>datasets/raw_uploads/</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Permanent archive of all user-uploaded datasets preserved with timestamp prefixes for data provenance.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Metadata & Documentation</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Includes <code className="text-cyan-300">dataset_inventory.json</code> catalog and comprehensive <code className="text-cyan-300">README.md</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dataset name, department, or format..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500 font-medium">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium focus:outline-none shadow-sm"
          >
            <option value="ALL">All Departments</option>
            <option value="BWSSB">BWSSB</option>
            <option value="BESCOM">BESCOM</option>
            <option value="BBMP">BBMP</option>
            <option value="KSRSAC">KSRSAC (K-GIS)</option>
            <option value="GAIL Gas">GAIL Gas</option>
            <option value="OpenStreetMap">OpenStreetMap</option>
          </select>
        </div>
      </div>

      {/* Mandatory Section 4 Dataset Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <Database className="w-4 h-4 text-blue-400" />
            <span>Authentic Bengaluru Geospatial Data Inventory (Section 4 Specification)</span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {filteredDatasets.length} Verified Sources
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Dataset Name</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Format / CRS</th>
                <th className="py-3.5 px-4">Geographic Coverage</th>
                <th className="py-3.5 px-4">Availability & Status</th>
                <th className="py-3.5 px-4">ASCE Baseline</th>
                <th className="py-3.5 px-4">Reliability</th>
                <th className="py-3.5 px-4">Known Limitations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredDatasets.map((ds) => (
                <tr key={ds.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{ds.dataset_name}</span>
                      {ds.is_demonstration && (
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">
                          Demo Sandbox
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-blue-600 mt-0.5 truncate max-w-[220px]">
                      <a href={ds.source_url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                        <span>{ds.source_url}</span>
                        <ExternalLink className="w-2.5 h-2.5 inline" />
                      </a>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">{ds.department}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                      {ds.format}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {ds.geographic_coverage}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        ds.access_code === 200
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : ds.access_code === 403
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          ds.access_code === 200 ? 'bg-emerald-500' : ds.access_code === 403 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                      />
                      {ds.availability_status} ({ds.access_code})
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {ds.asce_ql_baseline}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {(ds.reliability_weight * 100).toFixed(0)}%
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-[280px] leading-snug text-[11.5px]">
                    {ds.limitations}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

