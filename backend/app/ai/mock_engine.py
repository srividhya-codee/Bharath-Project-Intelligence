import re
import datetime
from typing import Dict, Any, List
from backend.app.ai.tools import TOOL_REGISTRY


def run_mock_workflow(
    query: str,
    user_role: str = "Senior Decision Maker",
    user_scope: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Simulates the complete 11-node LangGraph execution deterministically.
    Produces full execution traces, tool outputs, citations, and grounded briefings.
    """
    trace = []
    start_time = datetime.datetime.utcnow()

    # Step 1: route_intent
    trace.append({
        "node": "route_intent",
        "status": "completed",
        "duration_ms": 24,
        "details": "Classified user intent and verified RBAC permissions against scope."
    })

    # Detect project code if present
    match_code = re.search(r"(P-\d+)", query.upper())
    project_code = match_code.group(1) if match_code else None

    # Step 2: plan_steps
    plan = []
    if project_code:
        plan = [
            f"Invoke get_project_summary for {project_code}",
            f"Invoke get_project_prediction for {project_code}",
            f"Invoke get_project_risks for {project_code}",
            f"Invoke search_project_documents for '{query}'"
        ]
    elif "compare" in query.lower():
        plan = ["Extract project codes", "Invoke compare_projects", "Compute EVM divergence matrix"]
    elif "alert" in query.lower() or "high risk" in query.lower() or "delay" in query.lower():
        plan = ["Invoke get_high_risk_projects", "Invoke get_early_warning_alerts"]
    else:
        plan = ["Invoke search_project_documents", "Synthesize findings across active projects"]

    trace.append({
        "node": "plan_steps",
        "status": "completed",
        "duration_ms": 32,
        "details": f"Formulated {len(plan)}-step execution plan."
    })

    # Step 3: execute_tools
    tool_outputs = {}
    citations = []

    if project_code == "P-102" or ("102" in query and "delay" in query.lower()):
        target_code = "P-102"
        summary = TOOL_REGISTRY["get_project_summary"](target_code)
        prediction = TOOL_REGISTRY["get_project_prediction"](target_code)
        risks = TOOL_REGISTRY["get_project_risks"](target_code)
        docs = TOOL_REGISTRY["search_project_documents"]("delay land acquisition inspection", project_code=target_code, top_k=3)

        tool_outputs["summary"] = summary
        tool_outputs["prediction"] = prediction
        tool_outputs["risks"] = risks
        tool_outputs["documents"] = docs

        for d in docs:
            citations.append({
                "source": d.get("title", "Project Document"),
                "chunk_index": d.get("chunk_index", 0),
                "page": d.get("page_no", 1),
                "snippet": d.get("snippet", "")[:180] + "..."
            })

    elif "compare" in query.lower():
        tool_outputs["comparison"] = TOOL_REGISTRY["compare_projects"](["P-101", "P-102"])
    elif "tamil nadu" in query.lower() or "tn" in query.lower():
        tool_outputs["state_projects"] = TOOL_REGISTRY["get_projects_by_state"]("TN")
    else:
        tool_outputs["high_risk"] = TOOL_REGISTRY["get_high_risk_projects"](60.0)
        tool_outputs["alerts"] = TOOL_REGISTRY["get_early_warning_alerts"]()

    trace.append({
        "node": "execute_tools",
        "status": "completed",
        "duration_ms": 68,
        "details": f"Executed tools successfully. Gathered {len(tool_outputs)} data artifacts."
    })

    # Step 4: retrieve_docs
    trace.append({
        "node": "retrieve_docs",
        "status": "completed",
        "duration_ms": 45,
        "details": f"Retrieved {len(citations)} grounded context chunks from ChromaDB."
    })

    # Step 5: synthesize_answer
    if project_code == "P-102" or ("102" in query and "delay" in query.lower()):
        answer_body = """### Executive Briefing: Project P-102 (Four-Laning of NH-45A)
**Watermark: Synthetic Demonstration Data**

#### 1. Core Health & EVM Diagnostics
- **Physical Progress:** **62.0%** actual vs. **80.0%** planned (Physical Lag: **18.0% shortfall**).
- **Financial Expenditure:** **₹1,192.80 Cr** expended out of **₹1,420.00 Cr** approved (**84.0% budget utilization**).
- **EVM Velocity:** **SPI = 0.775** (Severe schedule lag) | **CPI = 0.738** (Cost inefficiency).
- **Divergence:** Financial utilization is running **22.0 percentage points ahead** of on-ground physical delivery.

---

#### 2. Root Causes of Slippage (Site & Document Grounding)
1. **Critical Right-of-Way (RoW) Unavailability:**
   - As documented in *Site Inspection Report Q3*, the civil contractor cannot access **14.5 km of contiguous RoW** between **Ch 42.000 to Ch 56.500** due to pending compensation disbursement by District Revenue Authorities.
   - Heavy earthmoving equipment has been demobilized from Section-II.

2. **Pavement & Subgrade Distress:**
   - Independent engineer inspection reports recorded severe waterlogging and subgrade destabilization across Km 38–44 following unseasonal monsoons. Rectification requires sub-base reconstruction.

3. **Bridge Superstructure Stoppage:**
   - Major Bridge at Ch 48+200 remains halted pending revised structural clearance from the state irrigation department.

---

#### 3. AI Predictive Forecast & Early Warning
- **ML Risk Assessment:** **82 / 100** (**Critical Risk Band**).
- **Predicted Operational Delay:** **~92 days** (~3.1 months beyond approved commercial operation date).
- **Cost Overrun Forecast:** **+14.8%** (Estimated ₹210 Cr required for re-tendering disrupted civil structures).
- *Disclaimer: AI Prediction, not a confirmed fact.*

---

#### 4. Recommended Action Items for High-Powered Committee
- **Immediate (0–15 Days):** Issue directive to District Collector / Special Land Acquisition Officer (SLAO) to disburse escrow compensation for Ch 42–56 km.
- **Contractual (15–30 Days):** Issue formal Notice to Correct to EPC contractor to remobilize paver machinery upon handover.
- **Financial (30 Days):** Realign quarterly capital releases strictly with verified milestone physical certification to arrest financial-physical divergence.
"""
    elif "compare" in query.lower():
        answer_body = """### Comparative Project Benchmark: P-101 vs. P-102
**Watermark: Synthetic Demonstration Data**

| Parameter | P-101 (Western Dedicated Freight Corridor) | P-102 (Four-Laning NH-45A) |
|---|---|---|
| **Implementing Agency** | DFCCIL (Railways) | NHAI (MoRTH) |
| **Approved Budget** | ₹6,450.00 Cr | ₹1,420.00 Cr |
| **Physical Progress** | **84.0%** (Planned: 86.0%) | **62.0%** (Planned: 80.0%) |
| **Schedule Index (SPI)** | **0.977** (On Schedule) | **0.775** (Severe Slippage) |
| **Cost Index (CPI)** | **0.985** (Well Controlled) | **0.738** (Cost Overrun Risk) |
| **Risk Score** | **22.0 / 100 (Low)** | **82.0 / 100 (Critical)** |
| **Projected Delay** | 12 days | 92 days |

**Key Takeaway:** P-101 demonstrates disciplined execution with minimal milestone slippage, whereas P-102 suffers from acute land-acquisition bottlenecks and financial divergence.
"""
    else:
        answer_body = f"""### Portfolio Intelligence Summary
**Watermark: Synthetic Demonstration Data**

- **Analyzed Scope:** National Multi-Sector Infrastructure Portfolio.
- **Current Active Alerts:** 4 High-Severity Early Warning Alerts identified.
- **Primary Bottlenecks:** Land acquisition hurdles (42% of flagged projects), followed by statutory environmental and forest stage-II clearances (28%).
- **AI Prediction Notice:** All forecasted slippages are probabilistic early-warning analytics generated by gradient boosted models.
"""

    trace.append({
        "node": "synthesize_answer",
        "status": "completed",
        "duration_ms": 110,
        "details": "Synthesized grounded briefing with EVM parameters and root causes."
    })

    # Step 6: validate_guardrails
    trace.append({
        "node": "validate_guardrails",
        "status": "completed",
        "duration_ms": 18,
        "details": "Enforced anti-hallucination check; verified all figures match tool metrics."
    })

    # Step 7: format_response
    trace.append({
        "node": "format_response",
        "status": "completed",
        "duration_ms": 12,
        "details": "Formatted Markdown with citation badges and compliance watermarks."
    })

    # Step 8: log_audit
    trace.append({
        "node": "log_audit",
        "status": "completed",
        "duration_ms": 15,
        "details": "Query and tool execution trace recorded to administrative audit log."
    })

    return {
        "query": query,
        "final_answer": answer_body.strip(),
        "citations": citations,
        "graph_trace": trace,
        "disclaimers": [
            "Synthetic Demonstration Data: Figures, projects, and names are illustrative.",
            "AI Prediction, not a confirmed fact."
        ],
        "tool_outputs": tool_outputs
    }
