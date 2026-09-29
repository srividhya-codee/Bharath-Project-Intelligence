# Bharat Project Intelligence — System Architecture

**AI-Powered Integrated Government Project Monitoring & Decision Support Platform**  
*Prototype designed for Smart India Hackathon (SIH)*  
*Badge:* **Synthetic Demonstration Data**

---

## 1. High-Level Architecture Diagram

```mermaid
flowchart TB
    subgraph DataSources["1. INGESTION & DATA LAYER"]
        P_Data["Synthetic Project Data\n(60-100 Projects, 12+ States)"]
        Docs["Synthetic Project Documents\n(DPR, Inspection, Minutes, Circulars)"]
    end

    subgraph Storage["2. PERSISTENCE & STORAGE"]
        Postgres[("PostgreSQL / SQLite Fallback\nProjects, Milestones, Financials,\nRisks, Issues, Alerts, Audit Logs")]
        Chroma[("ChromaDB Vector Store\nDocument Chunks & Embeddings\nwith RBAC metadata")]
    end

    subgraph ML_Engine["3. PREDICTIVE ANALYTICS (ML)"]
        FeatEng["Feature Engineering\n(SPI, CPI, Spend Gap, Timeline %)"]
        RiskModel["XGBoost Risk Score (0-100)\nLow, Medium, High, Critical"]
        DelayModel["Delay Predictor (Days)"]
        CostModel["Cost Overrun Predictor (%)"]
        SHAP["SHAP Explainability\n(Top Risk Drivers)"]
    end

    subgraph ServiceLayer["4. SERVICE & RULES ENGINE"]
        MetricsSvc["Metrics Service (SPI, CPI, EAC)"]
        AlertsSvc["Early Warning Engine (Thresholds + ML)"]
        AuditSvc["Audit Logging & RBAC Guard"]
    end

    subgraph AgenticAI["5. LANGGRAPH AGENT & AI LAYER"]
        Classify["1. Classify Intent\n(Delayed, High Risk, Why, Compare, Filter)"]
        EntityExtract["2. Entity & Scope Extraction\n(Project Code, State, Ministry)"]
        PlanTools["3. Planner Node\n(Determine DB / ML / RAG requirements)"]
        Tools["4. LangChain Read-Only Tools\n(get_project, filter_projects, run_prediction)"]
        RAG["5. RAG Semantic Retrieval\n(MMR, Sensitivity & Scope Filtered)"]
        Validate["6. Validation Node\n(Numeric integrity, Injection strip, Scope)"]
        ReasonLLM["7. Gemini Reasoning & Summary\n(Strictly from verified evidence)"]
        PostProcess["8. Post-Process & Citation Builder\n(Sources, Confidence, Disclaimers)"]
    end

    subgraph Presentation["6. PRESENTATION LAYER (React + TypeScript)"]
        ExecDash["Executive Dashboard & India Map"]
        Portfolio["Project Portfolio & Advanced Filters"]
        Details["Project 360° & AI Insights"]
        EarlyWarn["Early Warning Center & Workflows"]
        ChatUI["Project Intelligence Assistant\n(Graph Trace, Source Chips, Stream)"]
        AdminUI["Admin & Audit Console"]
    end

    %% Flows
    P_Data --> Postgres
    Docs --> Chroma
    Postgres <--> ServiceLayer
    ServiceLayer --> FeatEng
    FeatEng --> RiskModel & DelayModel & CostModel
    RiskModel & DelayModel & CostModel --> SHAP
    SHAP --> Postgres

    ServiceLayer --> Tools
    Chroma --> RAG

    Classify --> EntityExtract --> PlanTools
    PlanTools --> Tools & RAG
    Tools & RAG --> Validate
    Validate --> ReasonLLM --> PostProcess

    PostProcess --> ChatUI
    ServiceLayer --> Presentation
```

---

## 2. Non-Negotiable Separation of Responsibilities

| Subsystem | Authority / Scope | Constraint / Guardrail |
|---|---|---|
| **Database & Services** | **Single source of truth** for all numbers, milestones, expenditures, and approved budgets. | Parameterized queries only. Free-form SQL is strictly prohibited. |
| **ML Engine** | **Prediction and forward-looking analytics** (risk score 0-100, delay days, cost overrun %, SHAP factors). | Every ML output is strictly labelled: *"AI Prediction, not a confirmed fact"*. |
| **RAG Pipeline** | **Qualitative ground evidence** from verified project documents (DPR, inspection remarks, clearance letters). | Scoped by user ministry/state/role; all retrieved chunks wrapped in untrusted data delimiters. |
| **Gemini LLM** | **Explanation, summarisation, and narrative reasoning** over verified tool results and retrieved document chunks. | **Never computes official figures directly.** Cannot invent facts. Strictly constrained to supplied context. |
| **LangGraph Agent** | **Controlled deterministic workflow** (Intent → Planning → Retrieval/Tools → Evidence Validation → Generation → Citation). | Halts with *"Insufficient verified project data is available to answer this question"* if evidence is below threshold. |
| **Audit & Security** | **Complete traceability** for every action, query, retrieval, and status change. | RBAC enforced in API routes, DB queries, and AI tool execution. |

---

## 3. Data Processing & Retrieval Flow

1. **Transaction / Ingestion Flow:**  
   Project authorities submit progress updates, financial releases, or upload documents. Progress percentages and dates are verified against mathematical sanity bounds (progress cannot decrease without justification).

2. **Early-Warning Engine:**  
   Calculates SPI ($SPI = \frac{\text{Actual Physical \%}}{\text{Planned Physical \%}}$), CPI ($CPI = \frac{\text{Actual Physical \%}}{\text{Financial Progress \%}}$), and financial-physical gap. If $SPI < 0.85$ or gap $> 15$ points or ML Risk $\ge 60$, a structured alert is dispatched with evidence citations.

3. **Conversational Intelligence Flow:**  
   - User poses a query (e.g., *"Why is Project P-102 delayed?"*).
   - LangGraph classifies intent (`PROJECT_DELAY_WHY`) and extracts entity (`P-102`).
   - Tools fetch official metrics (SPI: 0.78, Gap: +22 points).
   - RAG searches indexed documents for `P-102` filtered by user's security level.
   - Validation node checks that metrics and document relevance pass minimum thresholds.
   - Gemini formats an explainable briefing citing document name, page number, and key metrics.
