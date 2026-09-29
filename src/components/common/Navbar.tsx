import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  Sparkles,
  AlertTriangle,
  MapPin,
  Printer,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type MainNavId =
  | 'dashboard'
  | 'projects'
  | 'intelligence'
  | 'early_warnings'
  | 'gis'
  | 'reports'
  | 'governance';

export type ViewTab =
  | 'overview'
  | 'portfolio'
  | 'project_detail'
  | 'alerts'
  | 'assistant'
  | 'ml_lab'
  | 'compare'
  | 'documents'
  | 'gis_map'
  | 'reports'
  | 'audit_admin'
  | 'how_it_works';

interface NavbarProps {
  currentView: ViewTab;
  onSelectView: (view: ViewTab) => void;
  activeAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  activeAlertCount
}) => {
  const { isSuperAdmin } = useAuth();

  // Map the granular currentView to the primary 7 top-level navigation items
  const getActiveNavId = (view: ViewTab): MainNavId => {
    switch (view) {
      case 'overview':
        return 'dashboard';
      case 'portfolio':
      case 'project_detail':
        return 'projects';
      case 'assistant':
      case 'documents':
      case 'ml_lab':
        return 'intelligence';
      case 'alerts':
        return 'early_warnings';
      case 'gis_map':
        return 'gis';
      case 'reports':
      case 'compare':
        return 'reports';
      case 'audit_admin':
      case 'how_it_works':
        return 'governance';
      default:
        return 'dashboard';
    }
  };

  const activeNavId = getActiveNavId(currentView);

  const mainNavItems: {
    id: MainNavId;
    label: string;
    icon: React.ElementType;
    defaultView: ViewTab;
    badge?: number;
    adminOnly?: boolean;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      defaultView: 'overview'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderGit2,
      defaultView: currentView === 'project_detail' ? 'project_detail' : 'portfolio'
    },
    {
      id: 'intelligence',
      label: 'Intelligence',
      icon: Sparkles,
      defaultView: currentView === 'documents' ? 'documents' : currentView === 'ml_lab' ? 'ml_lab' : 'assistant'
    },
    {
      id: 'early_warnings',
      label: 'Early Warnings',
      icon: AlertTriangle,
      defaultView: 'alerts',
      badge: activeAlertCount
    },
    {
      id: 'gis',
      label: 'GIS',
      icon: MapPin,
      defaultView: 'gis_map'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: Printer,
      defaultView: currentView === 'compare' ? 'compare' : 'reports'
    },
    {
      id: 'governance',
      label: 'Governance',
      icon: ShieldCheck,
      defaultView: currentView === 'how_it_works' ? 'how_it_works' : 'audit_admin',
      adminOnly: true
    }
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-[69px] z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          {mainNavItems.map(item => {
            const Icon = item.icon;
            const active = activeNavId === item.id;
            const isRestricted = item.adminOnly && !isSuperAdmin;

            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.defaultView)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-[#1565C0] text-white shadow-xs'
                    : isRestricted
                    ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    active ? 'text-white' : isRestricted ? 'text-slate-400' : 'text-slate-500'
                  }`}
                />
                <span>{item.label}</span>

                {isRestricted && (
                  <span className="flex items-center text-[10px] text-slate-400 ml-0.5" title="Admin access required">
                    <Lock className="w-3 h-3" />
                  </span>
                )}

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      active ? 'bg-white text-blue-900' : 'bg-[#DC2626] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Sub-Navigation Pill Bar for Grouped Capabilities */}
        {activeNavId === 'projects' && (
          <div className="flex items-center space-x-2 py-2 border-t border-slate-100 text-xs">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mr-1">
              Project Views:
            </span>
            <button
              onClick={() => onSelectView('portfolio')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                currentView === 'portfolio'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Project Portfolio
            </button>
            <button
              onClick={() => onSelectView('project_detail')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                currentView === 'project_detail'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Project 360° Detailed View
            </button>
          </div>
        )}

        {activeNavId === 'intelligence' && (
          <div className="flex items-center space-x-2 py-2 border-t border-slate-100 text-xs">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mr-1">
              Intelligence Modules:
            </span>
            <button
              onClick={() => onSelectView('assistant')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                currentView === 'assistant'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              AI Project Assistant
            </button>
            <button
              onClick={() => onSelectView('documents')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                currentView === 'documents'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Document Intelligence
            </button>
            <button
              onClick={() => onSelectView('ml_lab')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                currentView === 'ml_lab'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Predictive Analysis
            </button>
          </div>
        )}

        {activeNavId === 'reports' && (
          <div className="flex items-center space-x-2 py-2 border-t border-slate-100 text-xs">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mr-1">
              Reports & Decision Briefs:
            </span>
            <button
              onClick={() => onSelectView('reports')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                currentView === 'reports'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Executive Briefs
            </button>
            <button
              onClick={() => onSelectView('compare')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                currentView === 'compare'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Project Comparison
            </button>
          </div>
        )}

        {activeNavId === 'governance' && (
          <div className="flex items-center space-x-2 py-2 border-t border-slate-100 text-xs">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mr-1">
              Governance & Oversight:
            </span>
            <button
              onClick={() => onSelectView('audit_admin')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                currentView === 'audit_admin'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Audit Trail & Logs
            </button>
            <button
              onClick={() => onSelectView('how_it_works')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                currentView === 'how_it_works'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              System Architecture & Workflow
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
