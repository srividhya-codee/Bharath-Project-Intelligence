import time
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from backend.app.config import settings
from backend.app.ai.tools import TOOL_REGISTRY
from backend.app.ai.prompts import SYSTEM_PROMPT
from backend.app.ai.mock_engine import run_mock_workflow


class AgentState(BaseModel):
    query: str
    user_role: str = "Senior Decision Maker"
    user_scope: Dict[str, Any] = {}
    intent: Optional[str] = None
    plan: List[str] = []
    tool_outputs: Dict[str, Any] = {}
    retrieved_docs: List[Dict[str, Any]] = []
    draft_answer: Optional[str] = None
    final_answer: Optional[str] = None
    citations: List[Dict[str, Any]] = []
    graph_trace: List[Dict[str, Any]] = []
    disclaimers: List[str] = []


def run_project_intelligence_graph(
    query: str,
    user_role: str = "Senior Decision Maker",
    user_scope: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Executes the 11-node Bharat Project Intelligence Agent Graph.
    Routes to live Gemini 2.0 Flash when API key is provided and AI_MODE=live;
    otherwise executes the high-fidelity deterministic mock workflow.
    """
    if settings.AI_MODE == "mock" or not settings.GEMINI_API_KEY:
        return run_mock_workflow(query=query, user_role=user_role, user_scope=user_scope)

    # Live Gemini integration workflow
    try:
        from google import genai
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        # 1. Simulate workflow steps for trace
        mock_result = run_mock_workflow(query=query, user_role=user_role, user_scope=user_scope)

        # 2. Augment with Gemini synthesis
        context_str = f"Tools Output: {mock_result['tool_outputs']}\nCitations: {mock_result['citations']}"
        prompt = f"{SYSTEM_PROMPT}\n\nContext:\n{context_str}\n\nUser Question:\n{query}"

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt
        )
        if response and response.text:
            mock_result["final_answer"] = response.text

        return mock_result
    except Exception as e:
        print(f"Gemini API invocation encountered error ({e}). Falling back to deterministic pipeline.")
        return run_mock_workflow(query=query, user_role=user_role, user_scope=user_scope)
