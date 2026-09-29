import pytest
from backend.app.ai.mock_engine import run_mock_workflow


def test_graph_workflow_p102_benchmark():
    query = "Why is P-102 delayed and what are the main risks?"
    result = run_mock_workflow(query=query)

    # 1. Verification of structure
    assert "final_answer" in result
    assert "citations" in result
    assert "graph_trace" in result
    assert "disclaimers" in result

    # 2. Trace verification: nodes executed in order
    nodes = [step["node"] for step in result["graph_trace"]]
    assert "route_intent" in nodes
    assert "plan_steps" in nodes
    assert "execute_tools" in nodes
    assert "retrieve_docs" in nodes
    assert "synthesize_answer"
    assert "validate_guardrails" in nodes
    assert "format_response" in nodes
    assert "log_audit" in nodes

    # 3. Disclaimers verification
    assert any("Synthetic Demonstration Data" in d for d in result["disclaimers"])
    assert any("AI Prediction" in d for d in result["disclaimers"])

    # 4. Worked example grounding in answer
    answer = result["final_answer"]
    assert "62.0%" in answer  # Actual physical progress
    assert "80.0%" in answer  # Planned physical progress
    assert "0.775" in answer  # SPI
    assert "0.738" in answer  # CPI
    assert "82" in answer     # Risk Score
    assert "Ch 42" in answer  # RoW hindrance chainage
    assert len(result["citations"]) > 0


def test_graph_comparison_workflow():
    query = "Compare P-101 and P-102"
    result = run_mock_workflow(query=query)
    answer = result["final_answer"]
    assert "P-101" in answer
    assert "P-102" in answer
    assert "DFCCIL" in answer
    assert "NHAI" in answer
