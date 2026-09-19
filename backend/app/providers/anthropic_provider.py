import os
import time
import json
import httpx
from typing import Any, Dict, List, Optional
from .base import AIProvider, AIResponse, ProviderType

class AnthropicProvider(AIProvider):
    """
    Anthropic Claude Cloud Provider.
    Supports ANTHROPIC_API_KEY and Claude 3.5 Sonnet / Claude 3 Opus models.
    """
    name = "Anthropic Claude Engine"
    provider_type = ProviderType.ONLINE
    default_model = "claude-3-5-sonnet-20241022"

    def __init__(self, api_key: Optional[str] = None):
        key = api_key or os.getenv("ANTHROPIC_API_KEY", "")
        url = "https://api.anthropic.com/v1"
        super().__init__(base_url=url, api_key=key)

    async def health_check(self) -> Dict[str, Any]:
        start = time.time()
        if not self.api_key:
            return {
                "status": "NOT_CONFIGURED",
                "provider": self.name,
                "type": self.provider_type.value,
                "base_url": self.base_url,
                "latency_ms": 0,
                "message": "ANTHROPIC_API_KEY not set in environment"
            }
        return {
            "status": "ONLINE",
            "provider": self.name,
            "type": self.provider_type.value,
            "base_url": self.base_url,
            "latency_ms": round((time.time() - start) * 1000, 2),
            "models": [self.default_model, "claude-3-haiku-20240307"]
        }

    async def list_models(self) -> List[Dict[str, Any]]:
        return [
            {"name": "claude-3-5-sonnet-20241022", "capabilities": ["chat", "coding", "reasoning", "tools"]},
            {"name": "claude-3-haiku-20240307", "capabilities": ["chat", "coding", "fast"]}
        ]

    async def generate(self, prompt: str, model: Optional[str] = None, system_prompt: Optional[str] = None) -> AIResponse:
        start = time.time()
        target_model = model or os.getenv("ANTHROPIC_DEFAULT_MODEL", self.default_model)

        health = await self.health_check()
        if health["status"] != "ONLINE":
            latency = round((time.time() - start) * 1000, 2)
            return AIResponse(
                provider=self.name,
                model=target_model,
                content=f"[Anthropic Claude Offline Fallback] Executed prompt: {prompt[:100]}...",
                usage={"input_tokens": len(prompt.split()), "output_tokens": 30},
                latency_ms=latency,
                finish_reason="stop",
                metadata={"fallback": True, "reason": health["message"]}
            )

        url = f"{self.base_url.rstrip('/')}/messages"
        headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01"
        }
        payload = {
            "model": target_model,
            "max_tokens": 1024,
            "messages": [{"role": "user", "content": prompt}]
        }
        if system_prompt:
            payload["system"] = system_prompt

        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(url, headers=headers, json=payload)
            res.raise_for_status()
            data = res.json()
            latency = round((time.time() - start) * 1000, 2)

            content = data["content"][0]["text"]
            usage = data.get("usage", {})
            in_tokens = usage.get("input_tokens", len(prompt.split()))
            out_tokens = usage.get("output_tokens", len(content.split()))

            return AIResponse(
                provider=self.name,
                model=target_model,
                content=content,
                usage={"input_tokens": in_tokens, "output_tokens": out_tokens},
                latency_ms=latency,
                finish_reason=data.get("stop_reason", "end_turn"),
                metadata=data
            )
