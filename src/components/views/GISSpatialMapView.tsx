import React, { useState } from 'react';
import { Project, User } from '../../types';
import { IndiaMap3D } from '../3d/IndiaMap3D';
import { getStateStatistics } from '../../data/mockData';
import {
  MapPin,
  Building2,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Compass
} from 'lucide-react';

interface GISSpatialMapViewProps {
  projects: Project[];
  currentUser: User;
  onSelectProject: (code: string) => void;
  onOpenAssistantWithQuery: (query: string) => void;
}

export const GISSpatialMapView: React.FC<GISSpatialMapViewProps> = ({
  projects,
  currentUser,
  onSelectProject,
  onOpenAssistantWithQuery
}) => {
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const stateStats = React.useMemo(() => getStateStatistics(projects), [projects]);

  const sortedStates = Object.values(stateStats)
    .filter(s => s.totalProjects > 0)
    .sort((a, b) => b.totalOutlayCr - a.totalOutlayCr);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
              GIS SPATIAL CORRIDOR INTELLIGENCE
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-700" />
            Pan-India Multi-Modal 3D Infrastructure GIS Command Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic distribution, state-level capital outlay, and arterial connectivity corridors in interactive 3D.
          </p>
        </div>

        <button
          onClick={() =>
            onOpenAssistantWithQuery(
              `Summarize spatial bottlenecks and state-level project distribution across India`
            )
          }
          className="px-4 py-2.5 rounded-xl bg-[#1565C0] hover:bg-[#0B1F3A] text-white font-semibold text-xs flex items-center space-x-1.5 shadow-xs transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Spatial Analysis with AI</span>
        </button>
      </div>

      {/* Main Grid: Interactive 3D India Map (8 cols) & State Leaderboard (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <IndiaMap3D
            projects={projects}
            onSelectProject={onSelectProject}
            onViewTimeline={onSelectProject}
            onOpenAssistantWithQuery={onOpenAssistantWithQuery}
            className="h-[680px]"
          />
        </div>

        {/* State Performance Leaderboard */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-700" />
                State Capital Outlay Leaderboard
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                18 STATES
              </span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {sortedStates.map(st => {
                const isSelected = selectedState === st.stateName;
                return (
                  <div
                    key={st.stateName}
                    onClick={() => setSelectedState(isSelected ? null : st.stateName)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-400 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {st.stateName}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                          {st.code}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {st.totalProjects} Projects ({st.delayedProjects} Delayed)
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="font-bold text-slate-900">
                        ₹{st.totalOutlayCr.toLocaleString()} Cr
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Avg SPI:{' '}
                        <span
                          className={`font-bold ${
                            st.avgSpi >= 0.95
                              ? 'text-[#138808]'
                              : st.avgSpi >= 0.85
                              ? 'text-amber-700'
                              : 'text-red-600'
                          }`}
                        >
                          {st.avgSpi}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
