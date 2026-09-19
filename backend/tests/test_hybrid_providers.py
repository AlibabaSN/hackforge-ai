import pytest
from app.providers.base import ProviderType
from app.providers.ollama import OllamaProvider
from app.providers.vllm import VLLMProvider
from app.providers.llamacpp import LlamaCppProvider
from app.providers.openai_provider import OpenAIProvider
from app.providers.anthropic_provider import AnthropicProvider
from app.providers.registry import CircuitBreaker, get_provider_registry
from app.policy import PrivacyEngine, DataLocalityPolicy
from app.rag import LocalRAGEngine
from app.mesh.router import get_hybrid_model_router, RoutingMode

@pytest.mark.asyncio
async def test_ollama_provider_health():
    provider = OllamaProvider()
    health = await provider.health_check()
    assert "status" in health
    assert health["type"] == ProviderType.LOCAL.value

@pytest.mark.asyncio
async def test_vllm_provider_health():
    provider = VLLMProvider()
    health = await provider.health_check()
    assert "status" in health
    assert health["type"] == ProviderType.LOCAL.value

@pytest.mark.asyncio
async def test_llamacpp_provider_health():
    provider = LlamaCppProvider()
    health = await provider.health_check()
    assert "status" in health
    assert health["type"] == ProviderType.LOCAL.value

@pytest.mark.asyncio
async def test_openai_provider_health():
    provider = OpenAIProvider()
    health = await provider.health_check()
    assert "status" in health
    assert health["type"] == ProviderType.ONLINE.value

@pytest.mark.asyncio
async def test_anthropic_provider_health():
    provider = AnthropicProvider()
    health = await provider.health_check()
    assert "status" in health
    assert health["type"] == ProviderType.ONLINE.value

def test_circuit_breaker():
    cb = CircuitBreaker(failure_threshold=2, cooldown_seconds=1)
    assert cb.can_execute() is True
    cb.record_failure()
    assert cb.can_execute() is True
    cb.record_failure()
    assert cb.state == "OPEN"
    assert cb.can_execute() is False

def test_privacy_engine_secret_detection():
    engine = PrivacyEngine()
    is_sensitive, reasons = engine.inspect_sensitivity("User secret key: sk-abcdef12345678901234567890123456")
    assert is_sensitive is True
    assert len(reasons) > 0

    res = engine.evaluate_routing_permission(
        "sk-abcdef12345678901234567890123456",
        DataLocalityPolicy.HYBRID,
        "ONLINE"
    )
    assert res["allowed"] is False
    assert res["enforced_policy"] == DataLocalityPolicy.LOCAL_ONLY.value

@pytest.mark.asyncio
async def test_hybrid_router():
    router = get_hybrid_model_router()
    route_res = await router.route(
        task_name="coding_task",
        prompt="Write a Python FastAPI router",
        required_capabilities=[],
        mode=RoutingMode.LOCAL_ONLY
    )
    assert route_res["selected_provider"] is not None
    assert route_res["locality_policy"] == DataLocalityPolicy.LOCAL_ONLY.value

def test_local_rag_engine():
    rag = LocalRAGEngine()
    rag.add_document("app/main.py", "def health(): return {'status': 'ok'}\n@app.get('/api/projects')\ndef projects(): pass")
    results = rag.retrieve("health status")
    assert len(results) > 0
    assert "health" in results[0]["content"]
