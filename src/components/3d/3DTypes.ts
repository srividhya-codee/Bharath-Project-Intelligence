import { Project, RiskBand, ProjectStatus } from '../../types';

export type StatusColorType = 'on_track' | 'at_risk' | 'critical' | 'planned' | 'completed';

export interface State3DData {
  name: string;
  code: string;
  points: [number, number][]; // [x, z] normalized 3D map plane coordinates
  center: [number, number];
  capitalOutlayCr: number;
  totalProjects: number;
  delayedProjects: number;
  highRiskProjects: number;
  avgSpi: number;
}

export interface MapFilters {
  state: string;
  category: string;
  status: string;
  riskLevel: string;
  searchQuery: string;
}

export function getStatusColor(project: Project): { color: string; hex: number; label: string; type: StatusColorType } {
  if (project.status === 'Completed') {
    return { color: '#138808', hex: 0x138808, label: 'Completed', type: 'completed' };
  }
  if (project.prediction.riskBand === 'Critical' || (project.status === 'Delayed' && project.delayDays > 60)) {
    return { color: '#DC2626', hex: 0xdc2626, label: 'Critical', type: 'critical' };
  }
  if (project.prediction.riskBand === 'High' || project.status === 'Delayed' || project.evm.spi < 0.85) {
    return { color: '#F59E0B', hex: 0xf59e0b, label: 'At Risk', type: 'at_risk' };
  }
  if (project.status === 'Active' && project.evm.spi >= 0.85) {
    return { color: '#138808', hex: 0x138808, label: 'On Track', type: 'on_track' };
  }
  return { color: '#1565C0', hex: 0x1565c0, label: 'Planned', type: 'planned' };
}
