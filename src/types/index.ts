export type RiskBand = 'Low' | 'Medium' | 'High' | 'Critical';
export type ProjectStatus = 'Active' | 'Delayed' | 'Completed' | 'Stalled' | 'Under Review';
export type UserRole = 'Super Admin' | 'Authorized User' | 'Government Officer' | 'Project Authority' | 'Senior Decision Maker';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  designation?: string;
  ministryId?: number | null;
  ministryName?: string | null;
  stateId?: number | null;
  stateName?: string | null;
  agencyName?: string | null;
  allowedProjectCodes?: string[];
  permissions?: string[];
}

export interface Milestone {
  id: number;
  projectId: number;
  name: string;
  plannedDate: string;
  expectedDate: string;
  actualDate?: string | null;
  weightPct: number;
  status: 'Completed' | 'Delayed' | 'In Progress' | 'Pending';
}

export interface RiskItem {
  id: number;
  projectId: number;
  category: 'Land Acquisition' | 'Utility Shifting' | 'Forest & Environmental' | 'Contractor Impedance' | 'Financial & Budgetary' | 'Design & Scope' | 'Weather & Monsoon';
  severity: RiskBand;
  likelihood: 'Low' | 'Medium' | 'High' | 'Critical';
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  mitigationPlan: string;
  status: 'Open' | 'Mitigated' | 'Closed';
}

export interface IssueItem {
  id: number;
  projectId: number;
  title: string;
  severity: RiskBand;
  escalatedTo?: string;
  description: string;
  openedDate: string;
  status: 'Open' | 'Under Escalation' | 'Resolved';
}

export interface EVMMetrics {
  bac: number; // Budget at Completion (₹ Cr)
  pv: number;  // Planned Value (₹ Cr)
  ev: number;  // Earned Value (₹ Cr)
  ac: number;  // Actual Cost (₹ Cr)
  cv: number;  // Cost Variance (₹ Cr) = EV - AC
  sv: number;  // Schedule Variance (₹ Cr) = EV - PV
  spi: number; // Schedule Performance Index = EV / PV
  cpi: number; // Cost Performance Index = EV / AC
  eac: number; // Estimate at Completion (₹ Cr) = BAC / CPI
  vac: number; // Variance at Completion (₹ Cr) = BAC - EAC
  financialPhysicalGap: number; // Expenditure % - Actual Physical %
}

export interface TopFactor {
  feature: string;
  label: string;
  impact: 'Critical' | 'High' | 'Moderate' | 'Low' | 'Baseline';
  direction: 'Increases Risk' | 'Reduces Risk';
  contributionPct: number; // e.g. 35.4%
  description: string;
}

export interface MLPrediction {
  modelVersion: string;
  riskScore: number; // 0-100
  riskBand: RiskBand;
  predictedDelayDays: number;
  predictedDelayMonths: number;
  predictedCostOverrunPct: number;
  predictedFinalCostCr: number;
  confidenceLowerDelayDays: number;
  confidenceUpperDelayDays: number;
  topFactors: TopFactor[];
  disclaimer: string;
}

export interface DocumentSnippet {
  id: number;
  projectCode: string;
  title: string;
  docType: 'DPR' | 'Inspection Report' | 'Meeting Minutes' | 'Contractor Report' | 'Environmental Report' | 'Circular' | 'Review Report' | 'Progress Report';
  sensitivity: 'Public' | 'Official Use Only' | 'Confidential';
  date: string;
  pages: number;
  summary: string;
  filePath: string;
  content: string;
  chunks: {
    page: number;
    text: string;
    section: string;
  }[];
}

export interface Project {
  id: number;
  projectCode: string;
  name: string;
  description: string;
  ministry: string;
  ministryCode: string;
  sector: string;
  state: string;
  district?: string;
  implementingAgency: string;
  contractorName: string;
  approvedCostCr: number;
  revisedCostCr?: number | null;
  expenditureCr: number;
  startDate: string;
  plannedCompletionDate: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string | null;
  status: ProjectStatus;
  plannedPhysicalPct: number;
  actualPhysicalPct: number;
  financialSpendPct: number;
  latitude: number;
  longitude: number;
  evm: EVMMetrics;
  prediction: MLPrediction;
  milestones: Milestone[];
  risks: RiskItem[];
  issues: IssueItem[];
  documents: DocumentSnippet[];
  delayDays: number;
  isSynthetic: boolean;
}

export interface AlertItem {
  id: number;
  projectId: number;
  projectCode: string;
  projectName: string;
  state: string;
  sector: string;
  severity: RiskBand;
  alertType: 'Schedule Slippage' | 'Financial-Physical Gap' | 'Milestone Delay' | 'Environmental Clearance' | 'EVM Anomaly';
  title: string;
  explanation: string;
  evidence: {
    spi?: number;
    cpi?: number;
    gap?: number;
    riskScore?: number;
    predictedDelay?: number;
    flaggedMilestone?: string;
  };
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Escalated' | 'Resolved';
}

export interface AuditLogItem {
  id: number;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'Project' | 'AI_Query' | 'Alert' | 'ML_Model' | 'Export';
  entityId: string;
  details: string;
  ipAddress: string;
}

export interface LangGraphNodeTrace {
  nodeId: string;
  nodeName: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'denied' | 'skipped';
  latencyMs: number;
  inputPayload?: any;
  outputPayload?: any;
  notes?: string;
}

export interface Citation {
  citationId: string;
  docTitle: string;
  docType: string;
  page: number;
  projectCode: string;
  snippet: string;
  confidence: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  intent?: string;
  nodesExecuted?: LangGraphNodeTrace[];
  citations?: Citation[];
  toolOutputs?: Record<string, any>;
  isStreaming?: boolean;
}

export interface StateStats {
  stateName: string;
  code: string;
  totalProjects: number;
  activeProjects: number;
  delayedProjects: number;
  highRiskProjects: number;
  totalOutlayCr: number;
  avgSpi: number;
  avgCpi: number;
  sectors: { name: string; count: number }[];
  coordinates: { x: number; y: number };
}
