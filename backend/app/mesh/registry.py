import os
import logging
from typing import Dict, List, Optional, Type
from .base_agent import ModelAgent
from .capabilities import ModelCapability
from .adapters.qwen_agent import QwenAgent
from .adapters.llama_agent import LlamaAgent
from .adapters.mistral_agent import MistralAgent
from .adapters.deepseek_agent import DeepSeekAgent
from .adapters.gemma_agent import GemmaAgent
from .adapters.phi_agent import PhiAgent
from .adapters.glm_agent import GLMAgent
from .adapters.internlm_agent import InternLMAgent
from .adapters.custom_agent import CustomModelAgent

logger = logging.getLogger("hackforge.mesh.registry")

class ModelRegistry:
    """
    Dynamic Model Registry for HackForge Multi-Model Agent Mesh.
    Manages registration, capability mapping, health monitoring, and dynamic model loading.
    """
    def __init__(self):
        self._agents: Dict[str, ModelAgent] = {}
        self._bootstrap_default_agents()

    def _bootstrap_default_agents(self):
        base_url = os.getenv("OPENAI_BASE_URL", "")
        api_key = os.getenv("OPENAI_API_KEY", "")

        defaults = [
            QwenAgent(base_url=base_url, api_key=api_key),
            LlamaAgent(base_url=base_url, api_key=api_key),
            MistralAgent(base_url=base_url, api_key=api_key),
            DeepSeekAgent(base_url=base_url, api_key=api_key),
            GemmaAgent(base_url=base_url, api_key=api_key),
            PhiAgent(base_url=base_url, api_key=api_key),
            GLMAgent(base_url=base_url, api_key=api_key),
            InternLMAgent(base_url=base_url, api_key=api_key),
            CustomModelAgent(base_url=base_url, api_key=api_key)
        ]

        for agent in defaults:
            self._agents[agent.model_name] = agent

    def get_all_models(self) -> List[ModelAgent]:
        return list(self._agents.values())

    def get_configured_models(self) -> List[ModelAgent]:
        return [m for m in self._agents.values() if m.is_configured]

    def get_model(self, model_name: str) -> Optional[ModelAgent]:
        return self._agents.get(model_name)

    def register_model(self, agent: ModelAgent):
        self._agents[agent.model_name] = agent
        logger.info(f"Registered model agent: {agent.name} ({agent.model_name})")

    def unregister_model(self, model_name: str):
        if model_name in self._agents:
            del self._agents[model_name]

    async def health_check_all(self) -> List[Dict]:
        results = []
        for agent in self._agents.values():
            res = await agent.health_check()
            results.append(res)
        return results

_global_registry = ModelRegistry()

def get_model_registry() -> ModelRegistry:
    return _global_registry
