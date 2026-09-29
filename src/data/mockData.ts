import {
  Project,
  User,
  AlertItem,
  AuditLogItem,
  DocumentSnippet,
  StateStats,
  EVMMetrics,
  MLPrediction,
  Milestone,
  RiskItem,
  IssueItem
} from '../types';

export const DEMO_USERS: User[] = [
  {
    id: 1,
    name: 'National Super Administrator',
    email: 'superadmin@nic.in',
    role: 'Super Admin',
    ministryId: null,
    ministryName: 'All Ministries (National Scope)',
    stateId: null,
    stateName: 'Pan-India',
    agencyName: 'Cabinet Secretariat / NITI Aayog'
  },
  {
    id: 2,
    name: 'Ministry Monitoring Officer',
    email: 'officer@morth.nic.in',
    role: 'Government Officer',
    ministryId: 1,
    ministryName: 'Ministry of Road Transport and Highways (MoRTH)',
    stateId: null,
    stateName: 'All States (MoRTH Jurisdiction)',
    agencyName: 'MoRTH Project Monitoring Cell'
  },
  {
    id: 3,
    name: 'NHAI Project Authority (Tamil Nadu)',
    email: 'authority@nhai.gov.in',
    role: 'Project Authority',
    ministryId: 1,
    ministryName: 'Ministry of Road Transport and Highways (MoRTH)',
    stateId: 1,
    stateName: 'Tamil Nadu',
    agencyName: 'National Highways Authority of India (NHAI - RO Madurai)'
  },
  {
    id: 4,
    name: 'Senior Government Decision Maker',
    email: 'decisionmaker@pmo.nic.in',
    role: 'Senior Decision Maker',
    ministryId: null,
    ministryName: 'PMO / Infrastructure Group',
    stateId: null,
    stateName: 'National Strategic Corridors',
    agencyName: 'Cabinet Committee on Infrastructure'
  }
];

export function computeEVM(
  approvedCostCr: number,
  plannedPhysicalPct: number,
  actualPhysicalPct: number,
  expenditureCr: number
): EVMMetrics {
  const bac = approvedCostCr;
  const pv = (bac * plannedPhysicalPct) / 100;
  const ev = (bac * actualPhysicalPct) / 100;
  const ac = expenditureCr;
  const cv = ev - ac;
  const sv = ev - pv;
  const spi = pv > 0 ? Number((ev / pv).toFixed(2)) : 1.0;
  const cpi = ac > 0 ? Number((ev / ac).toFixed(2)) : 1.0;
  const eac = cpi > 0 ? Number((bac / cpi).toFixed(2)) : bac;
  const vac = Number((bac - eac).toFixed(2));
  const financialSpendPct = (expenditureCr / approvedCostCr) * 100;
  const financialPhysicalGap = Number((financialSpendPct - actualPhysicalPct).toFixed(1));

  return {
    bac,
    pv: Number(pv.toFixed(2)),
    ev: Number(ev.toFixed(2)),
    ac: Number(ac.toFixed(2)),
    cv: Number(cv.toFixed(2)),
    sv: Number(sv.toFixed(2)),
    spi,
    cpi,
    eac,
    vac,
    financialPhysicalGap
  };
}

// Full document texts from data/sample_docs for direct RAG verification
export const SAMPLE_DOCUMENTS: DocumentSnippet[] = [
  {
    id: 1,
    projectCode: 'P-102',
    title: 'Detailed Project Report (DPR) - Executive Summary',
    docType: 'DPR',
    sensitivity: 'Public',
    date: '2022-03-15',
    pages: 4,
    filePath: 'data/sample_docs/P-102_DPR_Executive_Summary.txt',
    summary: 'DPR outlines capacity augmentation to four-lane dual carriageway (78.4 km) on Madurai-Tirunelveli corridor. Approved Cost: ₹1,250 Cr. EPC contract model.',
    content: `PROJECT CODE: P-102
PROJECT NAME: Four-Laning of National Highway Corridor Package - Demo
MINISTRY: Ministry of Road Transport and Highways (MoRTH)
IMPLEMENTING AGENCY: National Highways Authority of India (NHAI)
LOCATION: Tamil Nadu (Madurai - Tirunelveli Section)
DOCUMENT TYPE: DPR - Executive Summary
1. EXECUTIVE BRIEF: Capacity augmentation of existing 2-lane to 4-lane dual carriageway (78.4 km). Total Approved Capital Cost: Rs. 1,250.00 Cr (Civil: Rs. 980 Cr; Land Acquisition: Rs. 195 Cr; Utility Shifting: Rs. 75 Cr). Scheduled Completion: 36 months (March 31, 2025). Total land required: 164.8 hectares across 14 revenue villages. Critical Path Risks: Land acquisition bottlenecks in 3 taluks, TANGEDCO/TWAD underground utility shifting, and Northeast monsoon vulnerabilities.`,
    chunks: [
      {
        page: 1,
        section: '1. Executive Brief & Budget',
        text: 'Total Approved Capital Cost: Rs. 1,250.00 Crore. Scheduled Date of Completion: March 31, 2025. 78.4 km dual carriageway on Madurai-Tirunelveli national corridor.'
      },
      {
        page: 2,
        section: '2. Right-of-Way & Environmental Risks',
        text: 'Total land required: 164.8 hectares. Forest fringe diversion: 14.2 hectares requiring Stage-I FC. Three taluks in Madurai and Virudhunagar show pending land compensation disbursement.'
      }
    ]
  },
  {
    id: 2,
    projectCode: 'P-102',
    title: 'Quarterly Site Inspection Report (Q3 2024)',
    docType: 'Inspection Report',
    sensitivity: 'Official Use Only',
    date: '2024-09-12',
    pages: 6,
    filePath: 'data/sample_docs/P-102_Site_Inspection_Report_Q3.txt',
    summary: 'NHAI Regional Quality Monitor noted critical 16.3 percentage point shortfall between planned (74.5%) and actual (58.2%) physical delivery. Paving stalled due to pending forest clearance at Ch 52-61.',
    content: `PROJECT CODE: P-102 | QUARTERLY SITE INSPECTION REPORT (Q3 2024)
INSPECTION DATE: August 28, 2024 | INSPECTING AUTHORITY: Regional Quality Monitor, NHAI RO Madurai
FINDINGS:
1. Physical Progress Shortfall: Planned physical progress: 74.5%. Verified actual progress on site: 58.2% (Deficit: -16.3 percentage points). Schedule Performance Index (SPI): 0.78 (Delayed).
2. Right of Way Obstructions: Chainage 52+400 to 61+200 (8.8 km contiguous stretch) remains un-handed over due to delayed Stage-II Forest Clearance from Regional Forest Bench, Chennai.
3. Utility Shifting: 33kV high-tension power line relocation by TANGEDCO is delayed by 115 days due to dispute regarding supervision charges.
4. Financial vs Physical Divergence: Cumulative expenditure released: Rs. 1,050.00 Cr (84.0% of BAC), while physical execution stands at 58.2%, representing a +25.8 point financial-physical lead gap.
RECOMMENDATION: Issue cure notice to contractor under Clause 12.3; convene inter-departmental taskforce with Tamil Nadu Forest Dept and TANGEDCO.`,
    chunks: [
      {
        page: 1,
        section: 'Physical Progress & SPI Deficit',
        text: 'Planned physical progress: 74.5%, Actual progress: 58.2%. SPI: 0.78. Project delayed by approximately 92 days.'
      },
      {
        page: 2,
        section: 'Right-of-Way & Forest Blockers',
        text: 'Chainage 52+400 to 61+200 (8.8 km stretch) remains completely blocked awaiting Stage-II Forest Clearance from Chennai Bench.'
      },
      {
        page: 3,
        section: 'Financial Divergence Warning',
        text: 'Expenditure released: Rs. 1,050 Cr (84.0% of total outlay) against 58.2% physical completion. Financial lead gap is +25.8%.'
      }
    ]
  },
  {
    id: 3,
    projectCode: 'P-102',
    title: 'Contractor Monthly Progress Report (August 2024)',
    docType: 'Contractor Report',
    sensitivity: 'Official Use Only',
    date: '2024-08-31',
    pages: 5,
    filePath: 'data/sample_docs/P-102_Contractor_Monthly_Progress_Aug2024.txt',
    summary: 'EPC Contractor submission citing unhindered stretch unavailability, heavy monsoon downpours, and stone quarrying permit delays as justification for milestone revisions.',
    content: `PROJECT: P-102 | EPC CONTRACTOR MONTHLY REPORT (AUGUST 2024)
SUBMITTED BY: L&T - Ashoka Buildcon JV | ADDRESSED TO: Project Director, NHAI PIU Madurai
EXECUTIVE SUMMARY: Contractor mobilised 18 pavers, 42 tippers, and 340 personnel. However, daily output was constrained to 42% of rated capacity due to non-availability of contiguous right-of-way between km 52 and km 61.
CLAIMS: 1. Rain disruption: 24 unseasonal heavy rain days in Western Ghats foothills during June-July. 2. Crushed aggregate shortage: Local district administration suspended stone quarrying permits in 2 taluks for 45 days.
REQUEST: Grant 90-day Extension of Time (EoT) without liquidated damages.`,
    chunks: [
      {
        page: 1,
        section: 'Contractor Grounds for Delay',
        text: 'Contractor claims non-availability of continuous right-of-way between km 52 and 61, 24 days unseasonal monsoon rain, and district quarry permit moratorium.'
      }
    ]
  },
  {
    id: 4,
    projectCode: 'P-102',
    title: 'High-Level Review Meeting Minutes (MoRTH Secretary)',
    docType: 'Meeting Minutes',
    sensitivity: 'Official Use Only',
    date: '2024-09-05',
    pages: 3,
    filePath: 'data/sample_docs/P-102_Review_Meeting_Minutes.txt',
    summary: 'Chaired by Secretary, MoRTH. Directed Tamil Nadu Chief Secretary intervention for forest clearances and established revised target date of July 1, 2025.',
    content: `MINUTES OF THE PRAGATI INFRASTRUCTURE REVIEW MEETING (P-102)
CHAIRPERSON: Secretary, Ministry of Road Transport and Highways
DECISIONS:
1. Target Completion Date reset to July 1, 2025 (92 days slippage).
2. Chief Secretary, Tamil Nadu requested to expedite Stage-II forest clearance clearance within 21 days.
3. NHAI RO instructed to withhold further ad-hoc mobilization advances until physical delivery achieves 65%.`,
    chunks: [
      {
        page: 1,
        section: 'Action Decisions',
        text: 'Completion date revised to July 1, 2025. Ad-hoc advances capped until physical progress crosses 65%.'
      }
    ]
  },
  {
    id: 5,
    projectCode: 'P-102',
    title: 'Stage-I Forest and Environmental Clearance Status Note',
    docType: 'Environmental Report',
    sensitivity: 'Official Use Only',
    date: '2024-07-18',
    pages: 2,
    filePath: 'data/sample_docs/P-102_Forest_Environment_Clearance_Note.txt',
    summary: 'Details compensatory afforestation land non-encumbrance certificate delay by Revenue Divisional Officer (RDO) causing Stage-II deadlock.',
    content: `GOVERNMENT OF TAMIL NADU - ENVIRONMENT & FOREST DEPARTMENT
MEMO: Diversion of 14.2 ha forest fringe land for NHAI Corridor P-102.
STATUS: Stage-I clearance accorded on Jan 14, 2023. Stage-II compliance pending due to delay in receipt of mutation certificate for compensatory afforestation parcel (28.4 ha) in Dindigul district.`,
    chunks: [
      {
        page: 1,
        section: 'Compensatory Afforestation',
        text: 'Stage-II compliance pending mutation certificate for 28.4 ha compensatory afforestation in Dindigul district.'
      }
    ]
  },
  {
    id: 6,
    projectCode: 'P-101',
    title: 'Western DFC Progress Review - Phase C-3',
    docType: 'Progress Report',
    sensitivity: 'Public',
    date: '2024-08-20',
    pages: 8,
    filePath: 'data/sample_docs/P-101_DFCCIL_Western_Freight_Progress.txt',
    summary: 'DFCCIL Western Freight Corridor package across Gujarat/Maharashtra. 77% physical progress against 82% target. SPI: 0.94.',
    content: `PROJECT: P-101 | WESTERN DEDICATED FREIGHT CORRIDOR (DADRI TO JNPT)
AGENCY: Dedicated Freight Corridor Corporation of India (DFCCIL) | BUDGET: Rs. 14,800.00 Cr
STATUS: Active, on track for Q4 2025 commissioning. Minor delays in Vaitarna bridge pier work. Overall SPI: 0.94, CPI: 0.91.`,
    chunks: [
      {
        page: 1,
        section: 'Western DFC Progress',
        text: 'Physical progress 77% vs 82% plan. Budget: Rs. 14,800 Cr. Track laying and OHE electrification progressing systematically.'
      }
    ]
  },
  {
    id: 7,
    projectCode: 'P-103',
    title: 'Dholera Industrial Corridor Scope Revision & Land Audit',
    docType: 'Review Report',
    sensitivity: 'Official Use Only',
    date: '2024-07-29',
    pages: 5,
    filePath: 'data/sample_docs/P-103_NICDC_Industrial_Corridor_Scope_Revision.txt',
    summary: 'Dholera SIR Phase 1 trunk infrastructure. Soil stabilization in saline tidal flats causing 85-day schedule adjustment. SPI: 0.81.',
    content: `PROJECT: P-103 | DHOLERA SPECIAL INVESTMENT REGION TRUNK INFRASTRUCTURE
AGENCY: National Industrial Corridor Development Corp (NICDC) | BUDGET: Rs. 4,300.00 Cr
STATUS: Delayed. High soil salinity requires stone-column ground improvement, impacting schedule by 85 days. SPI: 0.81.`,
    chunks: [
      {
        page: 1,
        section: 'Dholera Geotechnical Constraints',
        text: 'Saline marine clay requires deep ground improvement. Schedule delayed by 85 days with revised target.'
      }
    ]
  },
  {
    id: 8,
    projectCode: 'P-104',
    title: 'Bhadla Solar Park Grid Transmission Evacuation Delay Note',
    docType: 'Progress Report',
    sensitivity: 'Public',
    date: '2024-08-14',
    pages: 4,
    filePath: 'data/sample_docs/P-104_Solar_Ultra_Mega_Park_Transmission_Delays.txt',
    summary: 'MNRE / SECI 1,500 MW solar capacity addition. Grid substation 765 kV bay construction delayed by 140 days. SPI: 0.73.',
    content: `PROJECT: P-104 | BHADLA ULTRA MEGA SOLAR PARK TRANSMISSION AUGMENTATION
MINISTRY: MNRE | AGENCY: SECI & POWERGRID | BUDGET: Rs. 2,150.00 Cr
STATUS: Delayed. Substation transformer imports faced transit bottlenecks. SPI: 0.73, Risk Score: 76.4/100.`,
    chunks: [
      {
        page: 1,
        section: 'Transmission Substation Delay',
        text: 'Evacuation lines completed but 765 kV bay transformer commissioning delayed by 140 days.'
      }
    ]
  },
  {
    id: 9,
    projectCode: 'P-105',
    title: 'Jal Jeevan Mission Multi-Village Water Supply Inspection Note',
    docType: 'Inspection Report',
    sensitivity: 'Official Use Only',
    date: '2024-09-01',
    pages: 6,
    filePath: 'data/sample_docs/P-105_JalJeevan_MultiVillage_Water_Supply_Report.txt',
    summary: 'MoJS rural drinking water scheme across 240 villages. HDPE pipe vendor default and monsoon inundation causing 180-day slippage. SPI: 0.69.',
    content: `PROJECT: P-105 | JAL JEEVAN MISSION MULTI-VILLAGE PIPED SCHEME (BUNDELKHAND)
MINISTRY: Ministry of Jal Shakti | BUDGET: Rs. 980.00 Cr
STATUS: Critical. Contractor insolvency for pipe laying contract package 2. SPI: 0.69, Gap: +28.4%.`,
    chunks: [
      {
        page: 1,
        section: 'Pipeline Vendor Default',
        text: 'Pipe laying vendor defaulted on delivery of 140 km ductile iron pipes. Work stalled in 84 villages.'
      }
    ]
  },
  {
    id: 10,
    projectCode: 'P-106',
    title: 'Bengaluru Metro Phase-2 ORR Line Completion Benchmark',
    docType: 'Review Report',
    sensitivity: 'Public',
    date: '2024-08-10',
    pages: 6,
    filePath: 'data/sample_docs/P-106_Bengaluru_Metro_Phase2_Completion_Benchmark.txt',
    summary: 'MoHUA / BMRCL Outer Ring Road metro link (Central Silk Board to KR Puram). Viaduct span erection 84% completed vs 86% plan. SPI: 0.98.',
    content: `PROJECT: P-106 | BENGALURU METRO RAIL PHASE-2 (ORR LINE)
AGENCY: BMRCL | BUDGET: Rs. 5,600.00 Cr
STATUS: Active / On Track. Pre-cast segment launching achieved 84% physical delivery against 86% target. SPI: 0.98. Commercial launch targeted Dec 2025.`,
    chunks: [
      {
        page: 1,
        section: 'Metro ORR Viaduct Construction',
        text: 'Viaduct construction 84% complete. U-girder launching on critical Silk Board interchange nearing final phase.'
      }
    ]
  },
  {
    id: 11,
    projectCode: 'POLICY-01',
    title: 'MoF Guidelines on Cost Overrun Appraisal and Revision Caps',
    docType: 'Circular',
    sensitivity: 'Public',
    date: '2023-11-10',
    pages: 12,
    filePath: 'data/sample_docs/MoF_Guidelines_Cost_Overrun_Appraisal.txt',
    summary: 'Ministry of Finance Department of Expenditure OM capping administrative revisions and requiring Revised Cost Committee (RCC) approval when overrun exceeds 10%.',
    content: `MINISTRY OF FINANCE | DEPARTMENT OF EXPENDITURE
OFFICE MEMORANDUM: Guidelines for Appraisal of Cost Overrun in Central Sector Projects.
Rule 4.2: Any project with cost overrun exceeding 10% of Cabinet-approved cost or 12 months delay must undergo appraisal by the Committee on Non-Plan Expenditure / Public Investment Board (PIB).`,
    chunks: [
      {
        page: 1,
        section: 'Cost Overrun Thresholds',
        text: 'Cost overruns > 10% require mandatory re-appraisal by Revised Cost Committee and Cabinet note submission.'
      }
    ]
  },
  {
    id: 12,
    projectCode: 'POLICY-02',
    title: 'MoRTH Protocol for Severe Monsoon Disruption and Force Majeure',
    docType: 'Circular',
    sensitivity: 'Public',
    date: '2024-01-15',
    pages: 8,
    filePath: 'data/sample_docs/MoRTH_Circular_Monsoon_Disruption_Protocols.txt',
    summary: 'Standard operating procedures for verifying weather claims and granting Extension of Time (EoT) without punitive charges.',
    content: `MINISTRY OF ROAD TRANSPORT & HIGHWAYS | TECHNICAL CIRCULAR
SUBJECT: Guidelines for Extension of Time (EoT) on Account of Severe Weather and Forest Clearances.
1. Rainfall claims must be backed by Indian Meteorological Department (IMD) certified station records showing precipitation > 150% of 10-year mean.
2. In cases where Stage-II forest clearance delay exceeds 90 days from Stage-I compliance, Authority shall consider de-scoping or granting interest relief on idle plant.`,
    chunks: [
      {
        page: 1,
        section: 'Weather & Forest Claim Standards',
        text: 'IMD certification required for rain delays. Stage-II forest delay beyond 90 days qualifies for milestone adjustment.'
      }
    ]
  }
];

// Detailed P-102 Milestones
const P102_MILESTONES: Milestone[] = [
  {
    id: 1,
    projectId: 1,
    name: 'Land Acquisition 80% Notification & Gazetting',
    plannedDate: '2022-08-30',
    expectedDate: '2022-11-15',
    actualDate: '2022-12-10',
    weightPct: 15.0,
    status: 'Completed'
  },
  {
    id: 2,
    projectId: 1,
    name: 'Earthwork & Subgrade Formation (40 km Stretch)',
    plannedDate: '2023-05-31',
    expectedDate: '2023-07-20',
    actualDate: '2023-08-14',
    weightPct: 20.0,
    status: 'Completed'
  },
  {
    id: 3,
    projectId: 1,
    name: 'GSB & Dense Bituminous Paving (Ch 42 to 78)',
    plannedDate: '2024-06-30',
    expectedDate: '2024-11-30',
    actualDate: null,
    weightPct: 30.0,
    status: 'Delayed'
  },
  {
    id: 4,
    projectId: 1,
    name: 'Major River Bridges & Grade Separators (3 Nos)',
    plannedDate: '2024-12-31',
    expectedDate: '2025-04-30',
    actualDate: null,
    weightPct: 20.0,
    status: 'Delayed'
  },
  {
    id: 5,
    projectId: 1,
    name: 'Final Road Markings & Commercial Toll Commissioning',
    plannedDate: '2025-03-31',
    expectedDate: '2025-07-01',
    actualDate: null,
    weightPct: 15.0,
    status: 'Pending'
  }
];

const P102_RISKS: RiskItem[] = [
  {
    id: 1,
    projectId: 1,
    category: 'Forest & Environmental',
    severity: 'High',
    likelihood: 'High',
    impact: 'High',
    description: 'Stage-II Forest Clearance pending with Regional Forest Bench, Chennai for 14.2 ha fringe land (Ch 52-61).',
    mitigationPlan: 'Secretary MoRTH convened bilateral coordination with Tamil Nadu Environment Dept; mutation certificate expedited in Dindigul.',
    status: 'Open'
  },
  {
    id: 2,
    projectId: 1,
    category: 'Utility Shifting',
    severity: 'Medium',
    likelihood: 'High',
    impact: 'Medium',
    description: 'Relocation of 33kV high-tension power line by TANGEDCO delayed by 115 days over supervision fees.',
    mitigationPlan: 'NHAI PIU deposited disputed ₹3.2 Cr in escrow account to enable immediate line de-energization.',
    status: 'Open'
  },
  {
    id: 3,
    projectId: 1,
    category: 'Weather & Monsoon',
    severity: 'Medium',
    likelihood: 'Medium',
    impact: 'Medium',
    description: 'Vulnerability to Northeast monsoon inundation during October-December along Western Ghats foothills.',
    mitigationPlan: 'Constructed temporary perimeter bunds and deployed 12 high-capacity dewatering pumps.',
    status: 'Open'
  },
  {
    id: 4,
    projectId: 1,
    category: 'Financial & Budgetary',
    severity: 'High',
    likelihood: 'High',
    impact: 'High',
    description: 'Financial spend (84.0%) significantly leads verified physical progress (58.2%), creating a 25.8 point liquidity gap.',
    mitigationPlan: 'Capped further ad-hoc contractor mobilization disbursements until verified physical progress reaches 65%.',
    status: 'Open'
  }
];

const P102_ISSUES: IssueItem[] = [
  {
    id: 1,
    projectId: 1,
    title: 'Stage-II Forest Clearance Deadlock at Km 52-61',
    severity: 'Critical',
    escalatedTo: 'Chief Secretary, Govt of Tamil Nadu & MoEFCC Regional Office',
    description: '8.8 km contiguous carriageway work completely halted due to lack of Stage-II statutory tree felling permit.',
    openedDate: '2024-05-15',
    status: 'Under Escalation'
  },
  {
    id: 2,
    projectId: 1,
    title: 'Dispute on Aggregate Quarry Royalty Fees',
    severity: 'Medium',
    escalatedTo: 'District Collector, Madurai',
    description: 'Local taluk administration halted crushed granite quarry operations for 45 days over royalty cess disputes.',
    openedDate: '2024-06-20',
    status: 'Resolved'
  }
];

const P102_PREDICTION: MLPrediction = {
  modelVersion: 'v1.2.0-gbr (GradientBoosting + SHAP)',
  riskScore: 74.8,
  riskBand: 'High',
  predictedDelayDays: 92,
  predictedDelayMonths: 3.1,
  predictedCostOverrunPct: 10.4,
  predictedFinalCostCr: 1380.0,
  confidenceLowerDelayDays: 78,
  confidenceUpperDelayDays: 114,
  topFactors: [
    {
      feature: 'physical_progress_gap',
      label: 'Physical Progress Deficit (16.3% gap)',
      impact: 'High',
      direction: 'Increases Risk',
      contributionPct: 36.2,
      description: 'Physical progress (58.2%) is severely lagging behind the 74.5% plan.'
    },
    {
      feature: 'financial_lead_gap',
      label: 'Financial-Physical Divergence (+25.8% gap)',
      impact: 'High',
      direction: 'Increases Risk',
      contributionPct: 28.5,
      description: '84.0% budget drawn while only 58.2% delivered.'
    },
    {
      feature: 'forest_clearance_bottleneck',
      label: 'Stage-II Forest Clearance Deadlock',
      impact: 'Moderate',
      direction: 'Increases Risk',
      contributionPct: 18.4,
      description: '8.8 km stretch pending MoEFCC final sanction.'
    },
    {
      feature: 'contractor_past_performance',
      label: 'Tier-1 EPC Contractor Experience (L&T JV)',
      impact: 'Moderate',
      direction: 'Reduces Risk',
      contributionPct: 11.2,
      description: 'Contractor possesses extensive heavy plant and paving machinery.'
    },
    {
      feature: 'approved_budget_stability',
      label: 'Cabinet-Approved Capital Availability',
      impact: 'Low',
      direction: 'Reduces Risk',
      contributionPct: 5.7,
      description: 'Funds earmarked and not constrained by treasury release limits.'
    }
  ],
  disclaimer: 'AI Prediction, not a confirmed fact. Based on statistical inference across 3,000 synthetic infrastructure project benchmarks.'
};

// Featured core projects
export const CORE_PROJECTS: Project[] = [
  {
    id: 1,
    projectCode: 'P-102',
    name: 'Four-Laning of National Highway Corridor Package - Demo',
    description: 'Four-laning dual carriageway development spanning 78.4 km on critical freight corridor in Madurai-Tirunelveli section.',
    ministry: 'Ministry of Road Transport and Highways (MoRTH)',
    ministryCode: 'MoRTH',
    sector: 'Roads & Highways',
    state: 'Tamil Nadu',
    district: 'Madurai & Virudhunagar',
    implementingAgency: 'National Highways Authority of India (NHAI)',
    contractorName: 'L&T - Ashoka Buildcon JV (Synthetic)',
    approvedCostCr: 1250.0,
    revisedCostCr: 1380.0,
    expenditureCr: 1050.0,
    startDate: '2022-04-01',
    plannedCompletionDate: '2025-03-31',
    expectedCompletionDate: '2025-07-01',
    actualCompletionDate: null,
    status: 'Delayed',
    plannedPhysicalPct: 74.5,
    actualPhysicalPct: 58.2,
    financialSpendPct: 84.0,
    latitude: 9.9252,
    longitude: 78.1198,
    evm: computeEVM(1250.0, 74.5, 58.2, 1050.0),
    prediction: P102_PREDICTION,
    milestones: P102_MILESTONES,
    risks: P102_RISKS,
    issues: P102_ISSUES,
    documents: SAMPLE_DOCUMENTS.filter(d => d.projectCode === 'P-102'),
    delayDays: 92,
    isSynthetic: true
  },
  {
    id: 2,
    projectCode: 'P-101',
    name: 'Western Dedicated Freight Corridor (Dadri to JNPT C-3)',
    description: 'Electric dual-traction freight corridor spanning 1,504 km connecting Dadri (UP) to Jawaharlal Nehru Port (JNPT Maharashtra).',
    ministry: 'Ministry of Railways (MoR)',
    ministryCode: 'MoR',
    sector: 'Railways',
    state: 'Maharashtra',
    district: 'Palghar & Raigad',
    implementingAgency: 'Dedicated Freight Corridor Corporation of India (DFCCIL)',
    contractorName: 'Tata Projects - Sojitz Consortium',
    approvedCostCr: 14800.0,
    revisedCostCr: null,
    expenditureCr: 11950.0,
    startDate: '2020-01-15',
    plannedCompletionDate: '2025-12-31',
    expectedCompletionDate: '2026-02-15',
    actualCompletionDate: null,
    status: 'Active',
    plannedPhysicalPct: 82.0,
    actualPhysicalPct: 77.0,
    financialSpendPct: 80.7,
    latitude: 19.1136,
    longitude: 72.8697,
    evm: computeEVM(14800.0, 82.0, 77.0, 11950.0),
    prediction: {
      modelVersion: 'v1.2.0-gbr',
      riskScore: 28.5,
      riskBand: 'Low',
      predictedDelayDays: 45,
      predictedDelayMonths: 1.5,
      predictedCostOverrunPct: 2.1,
      predictedFinalCostCr: 15110.0,
      confidenceLowerDelayDays: 30,
      confidenceUpperDelayDays: 60,
      topFactors: [
        {
          feature: 'strong_contractor_capacity',
          label: 'Robust Heavy Rail Execution Capacity',
          impact: 'High',
          direction: 'Reduces Risk',
          contributionPct: 42.0,
          description: 'High track-laying machinery output exceeding targets.'
        }
      ],
      disclaimer: 'AI Prediction, not a confirmed fact.'
    },
    milestones: [
      { id: 10, projectId: 2, name: 'Palghar Viaduct Substructure', plannedDate: '2023-06-30', expectedDate: '2023-07-15', actualDate: '2023-08-01', weightPct: 25.0, status: 'Completed' },
      { id: 11, projectId: 2, name: 'Vaitarna Rail Bridge Girder Launching', plannedDate: '2024-04-30', expectedDate: '2024-09-30', actualDate: null, weightPct: 35.0, status: 'Delayed' },
      { id: 12, projectId: 2, name: '25kV Traction Electrification', plannedDate: '2025-06-30', expectedDate: '2025-08-30', actualDate: null, weightPct: 40.0, status: 'In Progress' }
    ],
    risks: [
      { id: 10, projectId: 2, category: 'Forest & Environmental', severity: 'Medium', likelihood: 'Medium', impact: 'Medium', description: 'CRZ permissions along tidal estuary.', mitigationPlan: 'High-level committee coordination with MCZMA.', status: 'Open' }
    ],
    issues: [],
    documents: SAMPLE_DOCUMENTS.filter(d => d.projectCode === 'P-101'),
    delayDays: 45,
    isSynthetic: true
  },
  {
    id: 3,
    projectCode: 'P-103',
    name: 'Dholera Special Investment Region Phase-1 Trunk Infra',
    description: 'Integrated smart trunk infrastructure for activation area (22.5 sq km) including roads, stormwater drainage, and sewage treatment.',
    ministry: 'Ministry of Commerce and Industry (MoCI)',
    ministryCode: 'MoCI',
    sector: 'Industrial Corridors',
    state: 'Gujarat',
    district: 'Ahmedabad',
    implementingAgency: 'National Industrial Corridor Development Corp (NICDC)',
    contractorName: 'Larsen & Toubro Construction',
    approvedCostCr: 4300.0,
    revisedCostCr: 4620.0,
    expenditureCr: 3250.0,
    startDate: '2021-02-01',
    plannedCompletionDate: '2024-12-31',
    expectedCompletionDate: '2025-03-25',
    actualCompletionDate: null,
    status: 'Delayed',
    plannedPhysicalPct: 68.0,
    actualPhysicalPct: 55.0,
    financialSpendPct: 75.6,
    latitude: 22.2514,
    longitude: 72.1868,
    evm: computeEVM(4300.0, 68.0, 55.0, 3250.0),
    prediction: {
      modelVersion: 'v1.2.0-gbr',
      riskScore: 68.2,
      riskBand: 'High',
      predictedDelayDays: 85,
      predictedDelayMonths: 2.8,
      predictedCostOverrunPct: 7.4,
      predictedFinalCostCr: 4618.0,
      confidenceLowerDelayDays: 70,
      confidenceUpperDelayDays: 105,
      topFactors: [
        { feature: 'marine_clay_stabilization', label: 'Saline Tidal Clay Ground Treatment', impact: 'High', direction: 'Increases Risk', contributionPct: 38.0, description: 'Requires prefabricated vertical drains and stone columns.' }
      ],
      disclaimer: 'AI Prediction, not a confirmed fact.'
    },
    milestones: [
      { id: 20, projectId: 3, name: 'Administrative Building & ABCD Complex', plannedDate: '2023-03-31', expectedDate: '2023-05-15', actualDate: '2023-05-20', weightPct: 30.0, status: 'Completed' },
      { id: 21, projectId: 3, name: 'Underground Common Utility Duct (18 km)', plannedDate: '2024-05-30', expectedDate: '2024-11-15', actualDate: null, weightPct: 40.0, status: 'Delayed' }
    ],
    risks: [],
    issues: [],
    documents: SAMPLE_DOCUMENTS.filter(d => d.projectCode === 'P-103'),
    delayDays: 85,
    isSynthetic: true
  },
  {
    id: 4,
    projectCode: 'P-104',
    name: 'Bhadla Ultra Mega Solar Park Grid Augmentation',
    description: '1,500 MW solar generation evacuation substation and 765 kV double-circuit interstate transmission lines.',
    ministry: 'Ministry of New and Renewable Energy (MNRE)',
    ministryCode: 'MNRE',
    sector: 'Renewable Energy',
    state: 'Rajasthan',
    district: 'Phalodi / Jodhpur',
    implementingAgency: 'Solar Energy Corporation of India (SECI)',
    contractorName: 'Sterlite Power - Siemens Consortium',
    approvedCostCr: 2150.0,
    revisedCostCr: 2320.0,
    expenditureCr: 1720.0,
    startDate: '2022-01-10',
    plannedCompletionDate: '2024-09-30',
    expectedCompletionDate: '2025-02-15',
    actualCompletionDate: null,
    status: 'Delayed',
    plannedPhysicalPct: 60.0,
    actualPhysicalPct: 44.0,
    financialSpendPct: 80.0,
    latitude: 27.5385,
    longitude: 71.9171,
    evm: computeEVM(2150.0, 60.0, 44.0, 1720.0),
    prediction: {
      modelVersion: 'v1.2.0-gbr',
      riskScore: 76.4,
      riskBand: 'High',
      predictedDelayDays: 138,
      predictedDelayMonths: 4.6,
      predictedCostOverrunPct: 7.9,
      predictedFinalCostCr: 2320.0,
      confidenceLowerDelayDays: 120,
      confidenceUpperDelayDays: 160,
      topFactors: [
        { feature: 'transformer_lead_time', label: '765kV Power Transformer Delivery Delays', impact: 'High', direction: 'Increases Risk', contributionPct: 44.0, description: 'Global lead times on high voltage bushings.' }
      ],
      disclaimer: 'AI Prediction, not a confirmed fact.'
    },
    milestones: [],
    risks: [],
    issues: [],
    documents: SAMPLE_DOCUMENTS.filter(d => d.projectCode === 'P-104'),
    delayDays: 138,
    isSynthetic: true
  },
  {
    id: 5,
    projectCode: 'P-105',
    name: 'Jal Jeevan Mission Multi-Village Piped Drinking Water Package',
    description: 'Providing functional household tap connections (FHTC) to 240 drought-prone villages in Bundelkhand region.',
    ministry: 'Ministry of Jal Shakti (MoJS)',
    ministryCode: 'MoJS',
    sector: 'Water Supply',
    state: 'Madhya Pradesh',
    district: 'Chhatarpur & Tikamgarh',
    implementingAgency: 'State Water and Sanitation Mission (SWSM MP)',
    contractorName: 'NCC - Megha Engineering JV',
    approvedCostCr: 980.0,
    revisedCostCr: 1120.0,
    expenditureCr: 810.0,
    startDate: '2021-08-15',
    plannedCompletionDate: '2024-06-30',
    expectedCompletionDate: '2025-01-30',
    actualCompletionDate: null,
    status: 'Delayed',
    plannedPhysicalPct: 78.0,
    actualPhysicalPct: 54.0,
    financialSpendPct: 82.7,
    latitude: 24.9184,
    longitude: 79.5828,
    evm: computeEVM(980.0, 78.0, 54.0, 810.0),
    prediction: {
      modelVersion: 'v1.2.0-gbr',
      riskScore: 84.2,
      riskBand: 'Critical',
      predictedDelayDays: 214,
      predictedDelayMonths: 7.1,
      predictedCostOverrunPct: 14.3,
      predictedFinalCostCr: 1120.0,
      confidenceLowerDelayDays: 190,
      confidenceUpperDelayDays: 245,
      topFactors: [
        { feature: 'hdpe_pipe_shortage', label: 'Ductile Iron Pipe Sub-vendor Default', impact: 'Critical', direction: 'Increases Risk', contributionPct: 52.0, description: 'Primary supplier terminated due to non-performance.' }
      ],
      disclaimer: 'AI Prediction, not a confirmed fact.'
    },
    milestones: [],
    risks: [],
    issues: [],
    documents: SAMPLE_DOCUMENTS.filter(d => d.projectCode === 'P-105'),
    delayDays: 214,
    isSynthetic: true
  },
  {
    id: 6,
    projectCode: 'P-106',
    name: 'Bengaluru Metro Rail Phase-2 Outer Ring Road Line',
    description: '19.75 km elevated rapid transit line connecting Central Silk Board to KR Puram with 13 elevated stations.',
    ministry: 'Ministry of Housing and Urban Affairs (MoHUA)',
    ministryCode: 'MoHUA',
    sector: 'Metro/Rapid Transit',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    implementingAgency: 'Bangalore Metro Rail Corporation (BMRCL)',
    contractorName: 'Afcons Infrastructure - Shankaranarayana JV',
    approvedCostCr: 5600.0,
    revisedCostCr: null,
    expenditureCr: 4420.0,
    startDate: '2021-05-01',
    plannedCompletionDate: '2025-12-31',
    expectedCompletionDate: '2026-01-15',
    actualCompletionDate: null,
    status: 'Active',
    plannedPhysicalPct: 86.0,
    actualPhysicalPct: 84.0,
    financialSpendPct: 78.9,
    latitude: 12.9716,
    longitude: 77.5946,
    evm: computeEVM(5600.0, 86.0, 84.0, 4420.0),
    prediction: {
      modelVersion: 'v1.2.0-gbr',
      riskScore: 22.1,
      riskBand: 'Low',
      predictedDelayDays: 15,
      predictedDelayMonths: 0.5,
      predictedCostOverrunPct: 0.0,
      predictedFinalCostCr: 5600.0,
      confidenceLowerDelayDays: 0,
      confidenceUpperDelayDays: 25,
      topFactors: [
        { feature: 'precast_execution_speed', label: 'Full Span Pre-cast U-Girder Efficiency', impact: 'High', direction: 'Reduces Risk', contributionPct: 48.0, description: 'Specialized launching gantries operating 24x7.' }
      ],
      disclaimer: 'AI Prediction, not a confirmed fact.'
    },
    milestones: [],
    risks: [],
    issues: [],
    documents: SAMPLE_DOCUMENTS.filter(d => d.projectCode === 'P-106'),
    delayDays: 15,
    isSynthetic: true
  }
];

// Generate 72 additional synthetic realistic projects to reach 78 projects total across India
const STATES = [
  'Tamil Nadu', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Karnataka',
  'Uttar Pradesh', 'Madhya Pradesh', 'Odisha', 'Andhra Pradesh', 'Telangana',
  'West Bengal', 'Assam', 'Bihar', 'Punjab', 'Kerala', 'Haryana',
  'Jharkhand', 'Chhattisgarh'
];

const SECTORS = [
  'Roads & Highways', 'Railways', 'Metro/Rapid Transit', 'Airports', 'Ports',
  'Power', 'Renewable Energy', 'Water Supply', 'Urban Infrastructure',
  'Healthcare', 'Education', 'Digital Infrastructure', 'Industrial Corridors'
];

const MINISTRIES = [
  { code: 'MoRTH', name: 'Ministry of Road Transport and Highways' },
  { code: 'MoR', name: 'Ministry of Railways' },
  { code: 'MoHUA', name: 'Ministry of Housing and Urban Affairs' },
  { code: 'MoP', name: 'Ministry of Power' },
  { code: 'MNRE', name: 'Ministry of New and Renewable Energy' },
  { code: 'MoJS', name: 'Ministry of Jal Shakti' },
  { code: 'MeitY', name: 'Ministry of Electronics and Information Technology' },
  { code: 'MoHFW', name: 'Ministry of Health and Family Welfare' },
  { code: 'MoCI', name: 'Ministry of Commerce and Industry' },
  { code: 'MoPSW', name: 'Ministry of Ports, Shipping and Waterways' }
];

const AGENCIES = [
  'National Highways Authority of India (NHAI)',
  'Dedicated Freight Corridor Corporation of India (DFCCIL)',
  'National High Speed Rail Corporation (NHSRCL)',
  'Solar Energy Corporation of India (SECI)',
  'NTPC Limited',
  'Central Public Works Department (CPWD)',
  'Bharat Broadband Network Limited (BBNL)',
  'Airports Authority of India (AAI)',
  'National Industrial Corridor Development Corp (NICDC)',
  'State PWD'
];

const CONTRACTORS = [
  'Larsen & Toubro Ltd', 'Tata Projects Ltd', 'Afcons Infrastructure',
  'Dilip Buildcon Ltd', 'NCC Limited', 'KEC International',
  'Ashoka Buildcon', 'Kalpataru Power Transmission', 'IRCON International'
];

function generateAdditionalProjects(): Project[] {
  const extra: Project[] = [];
  let id = 7;

  // Seeded deterministic pseudo-random helper
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const projectTemplates = [
    { prefix: 'Six-Laning of Greenfield Economic Corridor Section', sector: 'Roads & Highways', min: 'MoRTH' },
    { prefix: 'Electrification and Doubling of Strategic Rail Link', sector: 'Railways', min: 'MoR' },
    { prefix: 'AIIMS Super-Specialty Medical Institute Campus', sector: 'Healthcare', min: 'MoHFW' },
    { prefix: 'Green Hydrogen Hub & Solar Integration Facility', sector: 'Renewable Energy', min: 'MNRE' },
    { prefix: 'Modern Deep-Draft Container Terminal Berth Extension', sector: 'Ports', min: 'MoPSW' },
    { prefix: 'BharatNet Phase-3 High-Speed Optical Fiber Ring', sector: 'Digital Infrastructure', min: 'MeitY' },
    { prefix: 'City Water Purification & 24x7 Pressurized Network', sector: 'Water Supply', min: 'MoJS' },
    { prefix: 'Elevated BRTS Corridor and Multi-Modal Transit Interchange', sector: 'Urban Infrastructure', min: 'MoHUA' },
    { prefix: 'High-Voltage Direct Current (HVDC) Substation Link', sector: 'Power', min: 'MoP' },
    { prefix: 'Multi-Modal Logistics Park (MMLP) Logistics Node', sector: 'Industrial Corridors', min: 'MoCI' },
    { prefix: 'Regional Airport Greenfield Terminal & Runway Expansion', sector: 'Airports', min: 'MoRTH' }
  ];

  for (let i = 0; i < 72; i++) {
    const tmpl = projectTemplates[i % projectTemplates.length];
    const state = STATES[i % STATES.length];
    const pcode = `P-${107 + i}`;
    const name = `${tmpl.prefix} (${state} Pkg-${(i % 5) + 1})`;
    const cost = Math.round((450 + rand() * 5200) * 10) / 10;
    
    // Distribute risk bands
    const dice = rand();
    let status: 'Active' | 'Delayed' | 'Completed' = 'Active';
    let plannedPct = Math.round((30 + rand() * 65) * 10) / 10;
    let actualPct = plannedPct;
    let spendPct = plannedPct;
    let delayDays = 0;
    let riskScore = 20;
    let riskBand: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';

    if (dice < 0.50) { // 50% on track / low risk
      actualPct = Math.round(Math.max(10, plannedPct - rand() * 4) * 10) / 10;
      spendPct = Math.round(actualPct + (rand() * 4 - 2));
      delayDays = Math.floor(rand() * 20);
      riskScore = Math.round((15 + rand() * 18) * 10) / 10;
      riskBand = 'Low';
      status = 'Active';
    } else if (dice < 0.78) { // 28% moderate risk
      actualPct = Math.round(Math.max(10, plannedPct - (6 + rand() * 8)) * 10) / 10;
      spendPct = Math.round(actualPct + rand() * 10);
      delayDays = Math.floor(35 + rand() * 55);
      riskScore = Math.round((38 + rand() * 20) * 10) / 10;
      riskBand = 'Medium';
      status = 'Active';
    } else if (dice < 0.93) { // 15% high risk
      actualPct = Math.round(Math.max(10, plannedPct - (14 + rand() * 12)) * 10) / 10;
      spendPct = Math.round(actualPct + (12 + rand() * 14));
      delayDays = Math.floor(90 + rand() * 100);
      riskScore = Math.round((62 + rand() * 16) * 10) / 10;
      riskBand = 'High';
      status = 'Delayed';
    } else { // 7% critical risk
      actualPct = Math.round(Math.max(10, plannedPct - (22 + rand() * 15)) * 10) / 10;
      spendPct = Math.round(actualPct + (20 + rand() * 15));
      delayDays = Math.floor(180 + rand() * 140);
      riskScore = Math.round((80 + rand() * 15) * 10) / 10;
      riskBand = 'Critical';
      status = 'Delayed';
    }

    const expCr = Math.round((cost * (spendPct / 100)) * 10) / 10;
    const minObj = MINISTRIES.find(m => m.code === tmpl.min) || MINISTRIES[0];
    const agency = AGENCIES[i % AGENCIES.length];
    const contractor = CONTRACTORS[i % CONTRACTORS.length];

    const evm = computeEVM(cost, plannedPct, actualPct, expCr);

    extra.push({
      id: id++,
      projectCode: pcode,
      name,
      description: `Synthetic demonstration project for ${tmpl.sector} in ${state}. Simulates EVM monitoring, land/utility constraints, and statutory milestones.`,
      ministry: minObj.name,
      ministryCode: minObj.code,
      sector: tmpl.sector,
      state,
      district: `${state} Central District`,
      implementingAgency: agency,
      contractorName: contractor,
      approvedCostCr: cost,
      revisedCostCr: riskScore > 65 ? Math.round(cost * (1 + (riskScore - 50) * 0.005) * 10) / 10 : null,
      expenditureCr: expCr,
      startDate: '2022-01-01',
      plannedCompletionDate: '2025-06-30',
      expectedCompletionDate: '2025-10-15',
      actualCompletionDate: null,
      status,
      plannedPhysicalPct: plannedPct,
      actualPhysicalPct: actualPct,
      financialSpendPct: spendPct,
      latitude: 12.0 + rand() * 18.0,
      longitude: 72.0 + rand() * 16.0,
      evm,
      prediction: {
        modelVersion: 'v1.2.0-gbr',
        riskScore,
        riskBand,
        predictedDelayDays: delayDays,
        predictedDelayMonths: Number((delayDays / 30.4).toFixed(1)),
        predictedCostOverrunPct: riskScore > 50 ? Number(((riskScore - 40) * 0.25).toFixed(1)) : 0,
        predictedFinalCostCr: riskScore > 50 ? Number((cost * (1 + (riskScore - 40) * 0.0025)).toFixed(1)) : cost,
        confidenceLowerDelayDays: Math.max(0, delayDays - 15),
        confidenceUpperDelayDays: delayDays + 25,
        topFactors: [
          {
            feature: 'progress_slippage',
            label: `Physical vs Planned Gap (${(plannedPct - actualPct).toFixed(1)}%)`,
            impact: riskScore > 60 ? 'High' : 'Moderate',
            direction: 'Increases Risk',
            contributionPct: 40.0,
            description: `Actual physical completion (${actualPct}%) trails plan (${plannedPct}%).`
          },
          {
            feature: 'budget_drawdown',
            label: `Financial Spend Rate (${spendPct}%)`,
            impact: 'Moderate',
            direction: spendPct > actualPct ? 'Increases Risk' : 'Reduces Risk',
            contributionPct: 25.0,
            description: `Capital drawn at ${spendPct}% against ${actualPct}% physical achievement.`
          }
        ],
        disclaimer: 'AI Prediction, not a confirmed fact.'
      },
      milestones: [
        { id: id * 10 + 1, projectId: id, name: 'Phase-1 Detailed Engineering & Survey', plannedDate: '2022-06-30', expectedDate: '2022-07-15', actualDate: '2022-07-20', weightPct: 20.0, status: 'Completed' },
        { id: id * 10 + 2, projectId: id, name: 'Civil Substructure & Foundations', plannedDate: '2023-12-31', expectedDate: '2024-03-15', actualDate: actualPct > 50 ? '2024-03-20' : null, weightPct: 40.0, status: actualPct > 50 ? 'Completed' : 'In Progress' },
        { id: id * 10 + 3, projectId: id, name: 'Equipment Installation & Commissioning', plannedDate: '2025-06-30', expectedDate: '2025-10-15', actualDate: null, weightPct: 40.0, status: 'Pending' }
      ],
      risks: [
        { id: id * 10 + 1, projectId: id, category: 'Land Acquisition', severity: riskBand, likelihood: 'Medium', impact: riskBand, description: 'Right of Way and boundary settlement in taluk revenue tracts.', mitigationPlan: 'District administration monitoring meetings.', status: 'Open' }
      ],
      issues: [],
      documents: [],
      delayDays,
      isSynthetic: true
    });
  }

  return extra;
}

export const ALL_PROJECTS: Project[] = [...CORE_PROJECTS, ...generateAdditionalProjects()];

// Generate alerts from project data
export const ALL_ALERTS: AlertItem[] = [
  {
    id: 1,
    projectId: 1,
    projectCode: 'P-102',
    projectName: 'Four-Laning of National Highway Corridor Package - Demo',
    state: 'Tamil Nadu',
    sector: 'Roads & Highways',
    severity: 'High',
    alertType: 'Schedule Slippage',
    title: 'Critical Schedule Slippage (92 Days) & Forest Deadlock',
    explanation: 'SPI has fallen to 0.78 with 16.3 percentage point shortfall between actual physical progress (58.2%) and planned target (74.5%). Stage-II forest clearance pending at Km 52-61.',
    evidence: {
      spi: 0.78,
      cpi: 0.69,
      gap: 25.8,
      riskScore: 74.8,
      predictedDelay: 92,
      flaggedMilestone: 'GSB & Dense Bituminous Paving (Ch 42 to 78)'
    },
    timestamp: '2024-09-15 10:30 IST',
    status: 'Active'
  },
  {
    id: 2,
    projectId: 5,
    projectCode: 'P-105',
    projectName: 'Jal Jeevan Mission Multi-Village Piped Drinking Water Package',
    state: 'Madhya Pradesh',
    sector: 'Water Supply',
    severity: 'Critical',
    alertType: 'Financial-Physical Gap',
    title: 'Severe Financial-Physical Gap (+28.7%) & Vendor Insolvency',
    explanation: 'Cumulative expenditure released reached 82.7% while actual physical pipeline laying is stalled at 54.0%. Primary pipe vendor defaulted.',
    evidence: {
      spi: 0.69,
      cpi: 0.65,
      gap: 28.7,
      riskScore: 84.2,
      predictedDelay: 214,
      flaggedMilestone: 'Pipeline Network Installation Pkg-2'
    },
    timestamp: '2024-09-14 16:45 IST',
    status: 'Active'
  },
  {
    id: 3,
    projectId: 4,
    projectCode: 'P-104',
    projectName: 'Bhadla Ultra Mega Solar Park Grid Augmentation',
    state: 'Rajasthan',
    sector: 'Renewable Energy',
    severity: 'High',
    alertType: 'Milestone Delay',
    title: '765 kV Substation Bay Commissioning Delayed by 138 Days',
    explanation: 'Transformer shipment import clearance delayed at customs. Physical progress (44.0%) lags planned (60.0%). SPI: 0.73.',
    evidence: {
      spi: 0.73,
      cpi: 0.75,
      gap: 36.0,
      riskScore: 76.4,
      predictedDelay: 138,
      flaggedMilestone: '765 kV Grid Substation Bay'
    },
    timestamp: '2024-09-13 11:20 IST',
    status: 'Active'
  },
  {
    id: 4,
    projectId: 3,
    projectCode: 'P-103',
    projectName: 'Dholera Special Investment Region Phase-1 Trunk Infra',
    state: 'Gujarat',
    sector: 'Industrial Corridors',
    severity: 'High',
    alertType: 'EVM Anomaly',
    title: 'Marine Clay Ground Treatment Impeding Trunk Ducting',
    explanation: 'Geotechnical soil stabilization required stone columns, causing 85-day slippage. SPI: 0.81, Risk Score: 68.2/100.',
    evidence: {
      spi: 0.81,
      cpi: 0.75,
      gap: 20.6,
      riskScore: 68.2,
      predictedDelay: 85,
      flaggedMilestone: 'Underground Common Utility Duct'
    },
    timestamp: '2024-09-12 09:15 IST',
    status: 'Acknowledged'
  },
  {
    id: 5,
    projectId: 2,
    projectCode: 'P-101',
    projectName: 'Western Dedicated Freight Corridor (Dadri to JNPT C-3)',
    state: 'Maharashtra',
    sector: 'Railways',
    severity: 'Medium',
    alertType: 'Environmental Clearance',
    title: 'Estuary Tidal Pier Clearance under Review by MCZMA',
    explanation: 'Vaitarna bridge construction requires localized tidal channel diversion. SPI currently healthy at 0.94.',
    evidence: {
      spi: 0.94,
      cpi: 0.91,
      gap: 3.7,
      riskScore: 28.5,
      predictedDelay: 45
    },
    timestamp: '2024-09-10 14:00 IST',
    status: 'Acknowledged'
  }
];

// Audit trail
export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 101,
    timestamp: '2024-09-24 12:15:30 IST',
    userName: 'Ministry Monitoring Officer',
    userRole: 'Government Officer',
    action: 'Query AI Assistant',
    entityType: 'AI_Query',
    entityId: 'P-102',
    details: 'Initiated root cause inquiry: "Why is Project P-102 delayed?" 11-node LangGraph trace executed successfully.',
    ipAddress: '10.24.18.92'
  },
  {
    id: 102,
    timestamp: '2024-09-24 11:45:12 IST',
    userName: 'NHAI Project Authority (Tamil Nadu)',
    userRole: 'Project Authority',
    action: 'Update Milestone Forecast',
    entityType: 'Project',
    entityId: 'P-102',
    details: 'Updated expected completion date for GSB Paving to 2024-11-30 (+153 days variance).',
    ipAddress: '10.24.18.104'
  },
  {
    id: 103,
    timestamp: '2024-09-24 10:12:05 IST',
    userName: 'National Super Administrator',
    userRole: 'Super Admin',
    action: 'Retrain ML Gradient Boosting Model',
    entityType: 'ML_Model',
    entityId: 'v1.2.0-gbr',
    details: 'Triggered retraining script on 3,000 synthetic multi-period infrastructure observations. Test R²: 0.892, MAE: 4.8 days.',
    ipAddress: '10.24.0.1'
  },
  {
    id: 104,
    timestamp: '2024-09-24 09:30:45 IST',
    userName: 'Senior Government Decision Maker',
    userRole: 'Senior Decision Maker',
    action: 'Generate Cabinet Note',
    entityType: 'Export',
    entityId: 'REPORT-CCI-2024-Q3',
    details: 'Exported Executive Infrastructure Portfolio Briefing on 78 national projects for Cabinet Review.',
    ipAddress: '10.24.5.12'
  },
  {
    id: 105,
    timestamp: '2024-09-23 18:20:10 IST',
    userName: 'National Super Administrator',
    userRole: 'Super Admin',
    action: 'Acknowledge Early Warning Alert',
    entityType: 'Alert',
    entityId: 'ALERT-004',
    details: 'Acknowledged high-risk alert on Dholera P-103 trunk infrastructure ground stabilization.',
    ipAddress: '10.24.0.1'
  }
];

// Helper to compute state-level statistics
export function getStateStatistics(projects: Project[]): Record<string, StateStats> {
  const stats: Record<string, StateStats> = {};

  // Standard coordinates for India Map visualization
  const STATE_COORDINATES: Record<string, { x: number; y: number; code: string }> = {
    'Jammu and Kashmir': { x: 300, y: 120, code: 'JK' },
    'Himachal Pradesh': { x: 330, y: 170, code: 'HP' },
    'Punjab': { x: 290, y: 200, code: 'PB' },
    'Uttarakhand': { x: 370, y: 210, code: 'UK' },
    'Haryana': { x: 320, y: 240, code: 'HR' },
    'Rajasthan': { x: 240, y: 310, code: 'RJ' },
    'Uttar Pradesh': { x: 420, y: 310, code: 'UP' },
    'Bihar': { x: 550, y: 340, code: 'BR' },
    'Sikkim': { x: 620, y: 290, code: 'SK' },
    'Assam': { x: 710, y: 310, code: 'AS' },
    'Arunachal Pradesh': { x: 760, y: 250, code: 'AR' },
    'Nagaland': { x: 770, y: 330, code: 'NL' },
    'Manipur': { x: 760, y: 370, code: 'MN' },
    'Mizoram': { x: 740, y: 410, code: 'MZ' },
    'Tripura': { x: 710, y: 400, code: 'TR' },
    'Meghalaya': { x: 690, y: 340, code: 'ML' },
    'West Bengal': { x: 610, y: 410, code: 'WB' },
    'Jharkhand': { x: 540, y: 400, code: 'JH' },
    'Odisha': { x: 540, y: 470, code: 'OD' },
    'Chhattisgarh': { x: 460, y: 440, code: 'CG' },
    'Madhya Pradesh': { x: 360, y: 400, code: 'MP' },
    'Gujarat': { x: 190, y: 400, code: 'GJ' },
    'Maharashtra': { x: 290, y: 510, code: 'MH' },
    'Telangana': { x: 390, y: 540, code: 'TS' },
    'Andhra Pradesh': { x: 420, y: 620, code: 'AP' },
    'Karnataka': { x: 300, y: 650, code: 'KA' },
    'Goa': { x: 260, y: 630, code: 'GA' },
    'Kerala': { x: 320, y: 760, code: 'KL' },
    'Tamil Nadu': { x: 370, y: 750, code: 'TN' }
  };

  for (const [stName, meta] of Object.entries(STATE_COORDINATES)) {
    stats[stName] = {
      stateName: stName,
      code: meta.code,
      totalProjects: 0,
      activeProjects: 0,
      delayedProjects: 0,
      highRiskProjects: 0,
      totalOutlayCr: 0,
      avgSpi: 1.0,
      avgCpi: 1.0,
      sectors: [],
      coordinates: { x: meta.x, y: meta.y }
    };
  }

  projects.forEach(p => {
    if (!stats[p.state]) {
      stats[p.state] = {
        stateName: p.state,
        code: p.state.substring(0, 2).toUpperCase(),
        totalProjects: 0,
        activeProjects: 0,
        delayedProjects: 0,
        highRiskProjects: 0,
        totalOutlayCr: 0,
        avgSpi: 1.0,
        avgCpi: 1.0,
        sectors: [],
        coordinates: { x: 350, y: 500 }
      };
    }

    const s = stats[p.state];
    s.totalProjects++;
    if (p.status === 'Delayed') s.delayedProjects++;
    else s.activeProjects++;

    if (p.prediction.riskBand === 'High' || p.prediction.riskBand === 'Critical') {
      s.highRiskProjects++;
    }

    s.totalOutlayCr += p.approvedCostCr;
  });

  // Calculate averages
  for (const s of Object.values(stats)) {
    const stateProjects = projects.filter(p => p.state === s.stateName);
    if (stateProjects.length > 0) {
      const sumSpi = stateProjects.reduce((acc, p) => acc + p.evm.spi, 0);
      const sumCpi = stateProjects.reduce((acc, p) => acc + p.evm.cpi, 0);
      s.avgSpi = Number((sumSpi / stateProjects.length).toFixed(2));
      s.avgCpi = Number((sumCpi / stateProjects.length).toFixed(2));
      s.totalOutlayCr = Math.round(s.totalOutlayCr * 10) / 10;
    }
  }

  return stats;
}
