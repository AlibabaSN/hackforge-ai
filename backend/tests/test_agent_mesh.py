import pytest
from app.mesh.model_adapter import OllamaModelAdapter, VLLMModelAdapter, OpenAICompatibleModelAdapter, get_model_adapter
from app.mesh.agent_mesh import AgentMeshRegistry, AgentFamily, AgentDefinition, AgentModelPolicy, AgentRuntime
from app.mesh.agent_orchestrator import get_agent_orchestrator

def test_universal_model_adapter_factory():
    ollama = get_model_adapter("OLLAMA")
    assert isinstance(ollama, OllamaModelAdapter)

    vllm = get_model_adapter("VLLM")
    assert isinstance(vllm, VLLMModelAdapter)

    custom = get_model_adapter("CUSTOM")
    assert isinstance(custom, OpenAICompatibleModelAdapter)

def test_agent_model_decoupling():
    policy = AgentModelPolicy(
        primary_model="qwen2.5-coder:1.5b",
        fallback_model="gemma3:4b",
        cloud_model="llama3.3:70b"
    )
    agent = AgentDefinition(
        id="custom-researcher",
        name="Custom Researcher",
        family=AgentFamily.RESEARCH,
        purpose="Conducts targeted academic literature review",
        instructions="Analyze citations and synthesize findings",
        capabilities=["RESEARCH", "CITATION"],
        tools=["web_search", "knowledge_search"],
        model_policy=policy
    )
    assert agent.model_policy.primary_model == "qwen2.5-coder:1.5b"
    assert agent.model_policy.fallback_model == "gemma3:4b"
    assert agent.family == AgentFamily.RESEARCH

def test_agent_mesh_registry_families():
    agents = AgentMeshRegistry.list_all()
    assert len(agents) >= 20

    families = {a.family for a in agents}
    assert AgentFamily.MANAGEMENT in families
    assert AgentFamily.RESEARCH in families
    assert AgentFamily.DEVELOPMENT in families
    assert AgentFamily.AIML in families
    assert AgentFamily.CYBERSECURITY in families
    assert AgentFamily.DEVOPS in families
    assert AgentFamily.EVALUATION in families

def test_dynamic_agent_selection_ml():
    orchestrator = get_agent_orchestrator()
    res = orchestrator.select_agents("Build an autonomous computer vision system with RAG vector search and neural prediction")
    
    assert res["detected_category"] == "AI / Machine Learning Engineering"
    agent_ids = [a["id"] for a in res["team"]]
    assert "ai-ml-engineer-agent" in agent_ids
    assert "data-engineer-agent" in agent_ids
    assert "hackathon-judge-agent" in agent_ids

def test_dynamic_agent_selection_security():
    orchestrator = get_agent_orchestrator()
    res = orchestrator.select_agents("Conduct security vulnerability audit and firewall policy inspection")
    
    assert res["detected_category"] == "Zero-Trust Cybersecurity & Audit"
    agent_ids = [a["id"] for a in res["team"]]
    assert "security-engineer-agent" in agent_ids

def test_team_templates():
    orchestrator = get_agent_orchestrator()
    teams = orchestrator.get_team_templates()
    assert len(teams) >= 5
    team_ids = [t["id"] for t in teams]
    assert "web-app-team" in team_ids
    assert "aiml-platform-team" in team_ids
    assert "hackathon-blitz-team" in team_ids
    assert "security-audit-team" in team_ids

def test_model_agent_matrix():
    orchestrator = get_agent_orchestrator()
    matrix = orchestrator.get_model_agent_matrix()
    assert matrix["total_agents"] >= 20
    assert matrix["total_models"] >= 4
    assert len(matrix["agents"]) >= 20

class MockModelAdapter(OllamaModelAdapter):
    async def generate(self, model_name: str, prompt: str, system_prompt: str = None, temperature: float = 0.7, max_tokens: int = 2048, stop=None):
        return {
            "text": f"Simulated output from {model_name} for prompt: {prompt[:30]}...",
            "model": model_name,
            "provider": "Mock Mesh Runtime",
            "total_duration_ms": 15.0
        }

@pytest.mark.asyncio
async def test_multi_agent_debate_protocol():
    mock_runtime = AgentRuntime(adapter=MockModelAdapter())
    from app.mesh.agent_orchestrator import AgentOrchestrator
    orchestrator = AgentOrchestrator(runtime=mock_runtime)
    debate = await orchestrator.run_debate(
        topic="Zero-downtime database migration for high-concurrency e-commerce platform",
        context={"target_qps": 50000}
    )
    assert debate["proposal"]["agent"] is not None
    assert debate["critique"]["agent"] is not None
    assert debate["mitigation"]["agent"] is not None
    assert debate["consensus_verdict"]["status"] == "CONSENSUS_REACHED"

