/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { User, AlertItem, AuditLogItem } from './types';
import { ALL_PROJECTS, ALL_ALERTS, INITIAL_AUDIT_LOGS } from './data/mockData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/auth/Login';
import { AccessDenied } from './components/auth/AccessDenied';
import { Header } from './components/common/Header';
import { Navbar, ViewTab } from './components/common/Navbar';
import { AIAssistantDrawer } from './components/ai/AIAssistantDrawer';
import { Loader2 } from 'lucide-react';

// 12 Views
import { ExecutiveDashboardView } from './components/views/ExecutiveDashboardView';
import { PortfolioView } from './components/views/PortfolioView';
import { ProjectDetailView } from './components/views/ProjectDetailView';
import { EarlyWarningView } from './components/views/EarlyWarningView';
import { AIAssistantView } from './components/views/AIAssistantView';
import { MLRiskLabView } from './components/views/MLRiskLabView';
import { ProjectCompareView } from './components/views/ProjectCompareView';
import { DocumentLibraryView } from './components/views/DocumentLibraryView';
import { GISSpatialMapView } from './components/views/GISSpatialMapView';
import { ReportsView } from './components/views/ReportsView';
import { AdminAuditView } from './components/views/AdminAuditView';
import { HowItWorksView } from './components/views/HowItWorksView';

function AppContent() {
  const { user, isAuthenticated, isLoading, isSuperAdmin } = useAuth();

  const [currentView, setCurrentView] = useState<ViewTab>('overview');
  const [selectedProjectCode, setSelectedProjectCode] = useState<string>('P-102');
  const [portfolioStateFilter, setPortfolioStateFilter] = useState<string | undefined>(undefined);

  const [alerts, setAlerts] = useState<AlertItem[]>(ALL_ALERTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // AI Assistant Drawer state
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantQuery, setAssistantQuery] = useState('');

  // Handle URL path changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (!isAuthenticated && path !== '/login') {
        window.history.replaceState({}, '', '/login');
      } else if (isAuthenticated && (path === '/login' || path === '/')) {
        window.history.replaceState({}, '', '/dashboard');
      }
    }
  }, [isAuthenticated]);

  // Determine authorized visible projects based on authenticated role
  const visibleProjects = useMemo(() => {
    if (!user || isSuperAdmin) return ALL_PROJECTS;
    return ALL_PROJECTS.filter(p => {
      if (user.allowedProjectCodes?.includes('*')) return true;
      if (user.allowedProjectCodes?.includes(p.projectCode)) return true;
      if (user.stateName && p.state.toLowerCase() === user.stateName.toLowerCase()) return true;
      return false;
    });
  }, [user, isSuperAdmin]);

  // Ensure selected project is within user scope
  useEffect(() => {
    if (visibleProjects.length > 0 && !visibleProjects.some(p => p.projectCode === selectedProjectCode)) {
      setSelectedProjectCode(visibleProjects[0].projectCode);
    }
  }, [visibleProjects, selectedProjectCode]);

  // Filter alerts by visible projects
  const visibleAlerts = useMemo(() => {
    if (!user || isSuperAdmin) return alerts;
    const allowedCodes = new Set(visibleProjects.map(p => p.projectCode));
    return alerts.filter(a => allowedCodes.has(a.projectCode));
  }, [alerts, visibleProjects, user, isSuperAdmin]);

  const handleOpenAssistantWithQuery = (query: string) => {
    setAssistantQuery(query);
    setIsAssistantOpen(true);
  };

  const handleSelectProject = (code: string) => {
    setSelectedProjectCode(code);
    setCurrentView('project_detail');
  };

  const handleNavigateToPortfolio = (stateFilter?: string) => {
    setPortfolioStateFilter(stateFilter);
    setCurrentView('portfolio');
  };

  const handleUpdateAlertStatus = (alertId: number, status: AlertItem['status']) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, status } : a))
    );

    // Append to audit log
    if (user) {
      const targetAlert = alerts.find(a => a.id === alertId);
      setAuditLogs(prev => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString('en-IN') + ' IST',
          userName: user.name,
          userRole: user.role,
          action: `Alert ${status}`,
          entityType: 'Alert',
          entityId: targetAlert?.projectCode || `ALERT-${alertId}`,
          details: `Updated early warning alert status to "${status}" for ${targetAlert?.projectCode} (${targetAlert?.title}).`,
          ipAddress: '10.24.12.88'
        },
        ...prev
      ]);
    }
  };

  // 1. Loading splash screen while session is being verified
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-md flex items-center justify-center mb-4">
          <span className="text-3xl" role="img" aria-label="National Emblem of India">
            🇮🇳
          </span>
        </div>
        <h2 className="text-base font-bold text-[#0B1F3A]">Bharat Project Intelligence</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Verifying official credentials and security tokens...
        </p>
        <Loader2 className="w-5 h-5 text-[#1565C0] animate-spin" />
      </div>
    );
  }

  // 2. Unauthenticated: Render official login page
  if (!isAuthenticated || !user) {
    return (
      <Login
        onSuccess={() => {
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/dashboard');
          }
          setCurrentView('overview');
        }}
      />
    );
  }

  const activeAlertsCount = visibleAlerts.filter(a => a.status === 'Active').length;

  // 3. Authenticated: Render Main Government Dashboard
  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#172033] flex flex-col font-sans selection:bg-[#1565C0] selection:text-white">
      {/* Statutory Header with Officer Profile & Logout */}
      <Header
        currentUser={user}
        onOpenAssistant={() => {
          setAssistantQuery('');
          setIsAssistantOpen(true);
        }}
        activeAlertCount={activeAlertsCount}
      />

      {/* Navigation Bar for 11 Views */}
      <Navbar
        currentView={currentView}
        onSelectView={tab => setCurrentView(tab)}
        activeAlertCount={activeAlertsCount}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'overview' && (
          <ExecutiveDashboardView
            projects={visibleProjects}
            alerts={visibleAlerts}
            currentUser={user}
            onSelectProject={handleSelectProject}
            onOpenAssistantWithQuery={handleOpenAssistantWithQuery}
            onNavigateToPortfolio={handleNavigateToPortfolio}
            onNavigateToAlerts={() => setCurrentView('alerts')}
          />
        )}

        {currentView === 'portfolio' && (
          <PortfolioView
            projects={visibleProjects}
            currentUser={user}
            initialStateFilter={portfolioStateFilter}
            onSelectProject={handleSelectProject}
            onOpenAssistantWithQuery={handleOpenAssistantWithQuery}
          />
        )}

        {currentView === 'project_detail' && (
          <ProjectDetailView
            projects={visibleProjects}
            selectedProjectCode={selectedProjectCode}
            onSelectProjectCode={setSelectedProjectCode}
            currentUser={user}
            onOpenAssistantWithQuery={handleOpenAssistantWithQuery}
            onNavigateToTab={(tab, code) => {
              if (code) setSelectedProjectCode(code);
              setCurrentView(tab as ViewTab);
            }}
          />
        )}

        {currentView === 'alerts' && (
          <EarlyWarningView
            alerts={visibleAlerts}
            projects={visibleProjects}
            currentUser={user}
            onSelectProject={handleSelectProject}
            onOpenAssistantWithQuery={handleOpenAssistantWithQuery}
            onUpdateAlertStatus={handleUpdateAlertStatus}
          />
        )}

        {currentView === 'assistant' && (
          <AIAssistantView
            currentUser={user}
            selectedProjectCode={selectedProjectCode}
            onSelectProject={handleSelectProject}
          />
        )}

        {currentView === 'ml_lab' && (
          <MLRiskLabView
            initialProjectCode={selectedProjectCode}
            onSelectProject={handleSelectProject}
          />
        )}

        {currentView === 'compare' && (
          <ProjectCompareView
            projects={visibleProjects}
            currentUser={user}
            onOpenAssistantWithQuery={handleOpenAssistantWithQuery}
            onSelectProject={handleSelectProject}
          />
        )}

        {currentView === 'documents' && (
          <DocumentLibraryView
            currentUser={user}
            onOpenAssistantWithQuery={handleOpenAssistantWithQuery}
          />
        )}

        {currentView === 'gis_map' && (
          <GISSpatialMapView
            projects={visibleProjects}
            currentUser={user}
            onSelectProject={handleSelectProject}
            onOpenAssistantWithQuery={handleOpenAssistantWithQuery}
          />
        )}

        {currentView === 'reports' && (
          <ReportsView
            projects={visibleProjects}
            currentUser={user}
            onOpenAssistantWithQuery={handleOpenAssistantWithQuery}
          />
        )}

        {currentView === 'how_it_works' && (
          <HowItWorksView
            onNavigateToView={tab => setCurrentView(tab as ViewTab)}
          />
        )}

        {currentView === 'audit_admin' && (
          isSuperAdmin ? (
            <AdminAuditView
              currentUser={user}
              onSelectUser={() => {}}
              auditLogs={auditLogs}
            />
          ) : (
            <AccessDenied
              requiredRole="Super Admin"
              onReturnDashboard={() => setCurrentView('overview')}
            />
          )
        )}
      </main>

      {/* Global AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        currentUser={user}
        initialQuery={assistantQuery}
        selectedProjectCode={selectedProjectCode}
        onSelectProject={handleSelectProject}
      />

      {/* Official Government Footer */}
      <footer className="bg-[#0B1F3A] border-t border-slate-800 text-xs text-slate-300 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-white tracking-wide">
              Bharat Project Intelligence
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">
              Integrated Government Infrastructure Monitoring & Decision Support Platform
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span>Demonstration data used for evaluation • Project data shown in this deployment is for demonstration and evaluation purposes.</span>
            </div>
            <div className="flex items-center space-x-4 text-[11px] text-slate-400">
              <span>Cabinet Committee on Infrastructure</span>
              <span>•</span>
              <span>Ministry-Level Program Management Wing</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
