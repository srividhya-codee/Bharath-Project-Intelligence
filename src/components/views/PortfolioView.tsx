import React, { useState, useMemo } from 'react';
import { Project, User } from '../../types';
import {
  Search,
  Filter,
  Download,
  FolderGit2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Building2,
  MapPin
} from 'lucide-react';

interface PortfolioViewProps {
  projects: Project[];
  currentUser: User;
  initialStateFilter?: string;
  onSelectProject: (code: string) => void;
  onOpenAssistantWithQuery: (query: string) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  projects,
  currentUser,
  initialStateFilter,
  onSelectProject,
  onOpenAssistantWithQuery
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string>(initialStateFilter || 'All');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedRiskBand, setSelectedRiskBand] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'cost' | 'spi' | 'delay' | 'risk'>('delay');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const states = useMemo(() => ['All', ...Array.from(new Set(projects.map(p => p.state))).sort()], [projects]);
  const sectors = useMemo(() => ['All', ...Array.from(new Set(projects.map(p => p.sector))).sort()], [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchSearch =
        p.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contractorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sector.toLowerCase().includes(searchTerm.toLowerCase());

      const matchState = selectedState === 'All' || p.state === selectedState;
      const matchSector = selectedSector === 'All' || p.sector === selectedSector;
      const matchStatus = selectedStatus === 'All' || p.status === selectedStatus;
      const matchRisk = selectedRiskBand === 'All' || p.prediction.riskBand === selectedRiskBand;

      return matchSearch && matchState && matchSector && matchStatus && matchRisk;
    });
  }, [projects, searchTerm, selectedState, selectedSector, selectedStatus, selectedRiskBand]);

  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      let valA = 0;
      let valB = 0;

      switch (sortBy) {
        case 'cost':
          valA = a.approvedCostCr;
          valB = b.approvedCostCr;
          break;
        case 'spi':
          valA = a.evm.spi;
          valB = b.evm.spi;
          break;
        case 'delay':
          valA = a.delayDays;
          valB = b.delayDays;
          break;
        case 'risk':
          valA = a.prediction.riskScore;
          valB = b.prediction.riskScore;
          break;
      }

      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
  }, [filteredProjects, sortBy, sortOrder]);

  const totalFilteredOutlay = Math.round(
    filteredProjects.reduce((acc, p) => acc + p.approvedCostCr, 0)
  );

  const handleExportCSV = () => {
    const headers = ['Project Code', 'Name', 'Sector', 'State', 'Approved Cost (Cr)', 'Expenditure (Cr)', 'SPI', 'CPI', 'Status', 'Risk Score', 'Delay Days'];
    const rows = sortedProjects.map(p => [
      p.projectCode,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sector,
      p.state,
      p.approvedCostCr,
      p.expenditureCr,
      p.evm.spi,
      p.evm.cpi,
      p.status,
      p.prediction.riskScore,
      p.delayDays
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bharat_Project_Intelligence_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Search Controls */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-blue-700" />
              National Infrastructure Project Portfolio & EVM Registry
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive monitoring register of {projects.length} capital development projects across 18 Indian states.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by code (P-102), title, contractor, state..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700"
            />
          </div>

          <div>
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-700"
            >
              <option value="All">All States (18)</option>
              {states.filter(s => s !== 'All').map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedSector}
              onChange={e => setSelectedSector(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-700"
            >
              <option value="All">All Sectors (13)</option>
              {sectors.filter(s => s !== 'All').map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-700"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Delayed">Delayed</option>
            </select>
          </div>

          <div>
            <select
              value={selectedRiskBand}
              onChange={e => setSelectedRiskBand(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-700"
            >
              <option value="All">All Risk Bands</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
              <option value="Critical">Critical Risk</option>
            </select>
          </div>
        </div>

        {/* Results Counter & Sort Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span>Showing <span className="text-slate-900 font-bold">{sortedProjects.length}</span> matching initiatives</span>
            <span>•</span>
            <span>Combined Outlay: <span className="text-emerald-700 font-bold">₹{totalFilteredOutlay.toLocaleString()} Cr</span></span>
          </div>

          <div className="flex items-center space-x-2">
            <span>Sort by:</span>
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px]">
              {(['delay', 'spi', 'risk', 'cost'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => {
                    if (sortBy === s) {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy(s);
                      setSortOrder('desc');
                    }
                  }}
                  className={`px-2 py-0.5 rounded uppercase font-mono font-medium transition ${
                    sortBy === s ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s} {sortBy === s ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4">Code & Project</th>
                <th className="py-3 px-3">State & Sector</th>
                <th className="py-3 px-3 text-right">Approved Outlay</th>
                <th className="py-3 px-3">Physical Delivery</th>
                <th className="py-3 px-3 text-center">SPI / CPI</th>
                <th className="py-3 px-3 text-center">Delay</th>
                <th className="py-3 px-3 text-center">Risk Tier</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedProjects.map(project => {
                const isWorkedExample = project.projectCode === 'P-102';

                return (
                  <tr
                    key={project.id}
                    className={`hover:bg-slate-50/80 transition ${
                      isWorkedExample ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 min-w-[260px]">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-blue-700">
                          {project.projectCode}
                        </span>
                        {isWorkedExample && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold">
                            KEY PROJECT
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-slate-900 mt-0.5 line-clamp-1">
                        {project.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        Agency: {project.implementingAgency}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{project.state}</div>
                      <div className="text-[10px] text-slate-500">{project.sector}</div>
                    </td>

                    <td className="py-3.5 px-3 text-right whitespace-nowrap font-mono">
                      <div className="font-bold text-slate-900">
                        ₹{project.approvedCostCr.toLocaleString()} Cr
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Spent: ₹{project.expenditureCr.toLocaleString()} Cr
                      </div>
                    </td>

                    <td className="py-3.5 px-3 min-w-[140px]">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-mono font-bold text-slate-900">
                          {project.actualPhysicalPct}%
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Plan: {project.plannedPhysicalPct}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            project.actualPhysicalPct >= project.plannedPhysicalPct
                              ? 'bg-[#138808]'
                              : 'bg-[#DC2626]'
                          }`}
                          style={{ width: `${Math.min(100, project.actualPhysicalPct)}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap font-mono">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          project.evm.spi >= 0.95
                            ? 'bg-emerald-50 text-[#138808] border border-emerald-200'
                            : project.evm.spi >= 0.85
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-red-50 text-[#DC2626] border border-red-200'
                        }`}
                      >
                        SPI {project.evm.spi}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        CPI {project.evm.cpi}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap font-mono">
                      {project.delayDays > 0 ? (
                        <span className="text-[#DC2626] font-bold">
                          +{project.delayDays}d
                        </span>
                      ) : (
                        <span className="text-[#138808] font-bold">On Time</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          project.prediction.riskBand === 'Critical'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : project.prediction.riskBand === 'High'
                            ? 'bg-orange-50 text-orange-700 border border-orange-200'
                            : project.prediction.riskBand === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {project.prediction.riskBand} ({project.prediction.riskScore})
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => onSelectProject(project.projectCode)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-[11px] transition cursor-pointer shadow-2xs"
                      >
                        View Project 360°
                      </button>
                      <button
                        onClick={() =>
                          onOpenAssistantWithQuery(
                            `Why is Project ${project.projectCode} delayed?`
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] transition inline-flex items-center gap-1 font-semibold"
                        title="Analyze with AI"
                      >
                        <Sparkles className="w-3 h-3 text-blue-700" />
                        <span>AI</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
