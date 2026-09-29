import pytest
from backend.app.ai.tools import TOOL_REGISTRY, calculate_evm_metrics
from backend.app.rag.retriever import hybrid_search_documents


def test_evm_calculation_tool():
    # Test worked example: planned 80%, actual 62%, cost 1420, spend 1192.8 (84%)
    res = calculate_evm_metrics(
        planned_physical_pct=80.0,
        actual_physical_pct=62.0,
        approved_cost_cr=1420.0,
        expenditure_cr=1192.8
    )
    assert res["spi"] == 0.775
    assert res["cpi"] == 0.738
    assert res["physical_gap"] == 18.0
    assert res["financial_physical_gap"] == 22.0
    assert res["budget_utilisation_pct"] == 84.0


def test_all_16_tools_registered():
    expected_tools = [
        "get_project_summary", "get_project_milestones", "get_project_financials",
        "get_project_risks", "get_project_issues", "get_project_documents",
        "get_project_prediction", "search_project_documents", "compare_projects",
        "get_projects_by_state", "get_projects_by_ministry", "get_projects_by_sector",
        "get_high_risk_projects", "get_early_warning_alerts", "get_audit_log_summary",
        "calculate_evm_metrics"
    ]
    for tool_name in expected_tools:
        assert tool_name in TOOL_REGISTRY, f"Missing tool: {tool_name}"
        assert callable(TOOL_REGISTRY[tool_name])


def test_document_search():
    results = hybrid_search_documents("highway land acquisition inspection", project_code="P-102", top_k=3)
    # Should return grounded snippets from sample_docs
    assert len(results) > 0
    assert any("P-102" in r.get("project_code", "") for r in results)
    assert all("snippet" in r for r in results)
    assert all("title" in r for r in results)
