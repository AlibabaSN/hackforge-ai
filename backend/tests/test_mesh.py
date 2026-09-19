import pytest
from app.mesh.capabilities import ModelCapability
from app.mesh.registry import get_model_registry
from app.mesh.router import get_model_router
from app.mesh.adapters.qwen_agent import QwenAgent
from app.mesh.adapters.llama_agent import LlamaAgent
from app.mesh.adapters.deepseek_agent import DeepSeekAgent
from app.mesh.benchmark import ModelBenchmarkAgent
from app.mesh.collaboration import CrossModelCritic, ModelDebateAgent

def test_model_registry_population():
    registry = get_model_registry()
    models = registry.get_all_models()
    assert len(models) >= 9
    model_names = [m.model_name for m in models]
    assert "qwen/qwen3-70b-instruct" in model_names
    assert "meta-llama/llama-3.3-70b-instruct" in model_names
    assert "deepseek-ai/deepseek-r1" in model_names

@pytest.mark.asyncio
async def test_model_agent_interface():
    agent = QwenAgent()
    assert agent.name == "Qwen Model Agent"
    assert ModelCapability.CODING in agent.capabilities
    
    # Test generation (offline fallback mode)
    res = await agent.generate("Write a quicksort in Python")
    assert "model" in res
    assert "response" in res
    assert "usage" in res
    assert "latency_ms" in res
    assert res["model"] == "qwen/qwen3-70b-instruct"

def test_model_router():
    router = get_model_router()
    model = router.route_task("coding_task", [ModelCapability.CODING, ModelCapability.REASONING])
    assert model is not None
    assert ModelCapability.CODING in model.capabilities

@pytest.mark.asyncio
async def test_model_benchmark():
    benchmark_agent = ModelBenchmarkAgent()
    results = await benchmark_agent.benchmark_all_models()
    assert len(results) >= 9
    assert "score" in results[0]
    assert "latency_ms" in results[0]

@pytest.mark.asyncio
async def test_cross_model_critic():
    critic = CrossModelCritic()
    res = await critic.execute_cross_critique("Design high-frequency trading API", {})
    assert "generator_model" in res
    assert "critic_model" in res
    assert "final_hardened_architecture" in res

@pytest.mark.asyncio
async def test_model_debate():
    debate = ModelDebateAgent()
    res = await debate.run_debate("Should we use Rust or Go for microservices?")
    assert len(res["debate_participants"]) == 3
    assert "debate_verdict" in res
