import os
import time
import asyncio
import logging
from typing import Dict, List, Optional, Any
from .base import AIProvider, AIResponse, ProviderType
from .ollama import OllamaProvider
from .vllm import VLLMProvider
from .llamacpp import LlamaCppProvider
from .openai_provider import OpenAIProvider
from .anthropic_provider import AnthropicProvider

logger = logging.getLogger("hackforge.providers.registry")

class CircuitBreaker:
    """
    Circuit Breaker for AI Providers.
    States: CLOSED (normal), OPEN (blocking requests after repeated failures), HALF_OPEN (probing health).
    """
    def __init__(self, failure_threshold: int = 3, cooldown_seconds: int = 60):
        self.failure_threshold = failure_threshold
        self.cooldown_seconds = cooldown_seconds
        self.failures_count = 0
        self.state = "CLOSED"
        self.last_failure_time = 0.0

    def record_success(self):
        self.failures_count = 0
        self.state = "CLOSED"

    def record_failure(self):
        self.failures_count += 1
        self.last_failure_time = time.time()
        if self.failures_count >= self.failure_threshold:
            self.state = "OPEN"
            logger.warning(f"Circuit Breaker TRIPPED: state set to OPEN for {self.cooldown_seconds}s")

    def can_execute(self) -> bool:
        if self.state == "CLOSED":
            return True
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.cooldown_seconds:
                self.state = "HALF_OPEN"
                logger.info("Circuit Breaker probe: state transitioned to HALF_OPEN")
                return True
            return False
        if self.state == "HALF_OPEN":
            return True
        return False

class ProviderRegistry:
    """
    Provider Registry & Discovery Engine for HackForge Hybrid Infrastructure.
    Manages local, remote, and online AI providers with circuit breakers and auto-discovery.
    """
    def __init__(self):
        self._providers: Dict[str, AIProvider] = {}
        self._circuit_breakers: Dict[str, CircuitBreaker] = {}
        self._bootstrap_default_providers()

    def _bootstrap_default_providers(self):
        ollama = OllamaProvider()
        vllm = VLLMProvider()
        llamacpp = LlamaCppProvider()
        openai_p = OpenAIProvider()
        anthropic_p = AnthropicProvider()

        defaults = [ollama, vllm, llamacpp, openai_p, anthropic_p]
        for p in defaults:
            self.register_provider(p)

    def register_provider(self, provider: AIProvider):
        self._providers[provider.name] = provider
        self._circuit_breakers[provider.name] = CircuitBreaker()
        logger.info(f"Registered provider: {provider.name} ({provider.provider_type.value})")

    def get_provider(self, name: str) -> Optional[AIProvider]:
        return self._providers.get(name)

    def get_all_providers(self) -> List[AIProvider]:
        return list(self._providers.values())

    def get_circuit_breaker(self, name: str) -> Optional[CircuitBreaker]:
        return self._circuit_breakers.get(name)

    async def scan_local_servers(self) -> List[Dict[str, Any]]:
        """
        Scans localhost ports for active local inference servers (Ollama:11434, vLLM:8000, llama.cpp:8080).
        Fails fast without reporting false positives.
        """
        results = []
        for provider in self._providers.values():
            if provider.provider_type == ProviderType.LOCAL or provider.provider_type == ProviderType.REMOTE:
                health = await provider.health_check()
                results.append(health)
        return results

    async def health_check_all(self) -> List[Dict[str, Any]]:
        tasks = [p.health_check() for p in self._providers.values()]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        output = []
        for idx, p in enumerate(self._providers.values()):
            res = results[idx]
            if isinstance(res, Exception):
                output.append({
                    "status": "UNAVAILABLE",
                    "provider": p.name,
                    "type": p.provider_type.value,
                    "base_url": p.base_url,
                    "message": str(res)
                })
            else:
                output.append(res)
        return output

_global_registry = ProviderRegistry()

def get_provider_registry() -> ProviderRegistry:
    return _global_registry
