import os
import time
import json
import httpx
from typing import Any, Dict, List, Optional
from .base import AIProvider, AIResponse, ProviderType

class OpenAIProvider(AIProvider):
    """
    OpenAI Cloud & OpenAI-Compatible API Provider.
    Supports OPENAI_API_KEY and custom endpoints.
    """
    name = "OpenAI Cloud Engine"
    provider_type = ProviderType.ONLINE
    default_model = "gpt-4o-mini"

    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        key = api_key or os.getenv("OPENAI_API_KEY", "")
        url = base_url or os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
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
                "message": "OPENAI_API_KEY not set in environment"
            }

        try:
            url = f"{self.base_url.rstrip('/')}/models"
            headers = {"Authorization": f"Bearer {self.api_key}"}
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(url, headers=headers)
                latency = round((time.time() - start) * 1000, 2)
                if res.status_code == 200:
                    models = [m.get("id") for m in res.json().get("data", [])]
                    return {
                        "status": "ONLINE",
                        "provider": self.name,
                        "type": self.provider_type.value,
                        "base_url": self.base_url,
                        "latency_ms": latency,
                        "models_count": len(models),
                        "models": models[:10]
                    }
                elif res.status_code == 401:
                    return {
                        "status": "AUTH_ERROR",
                        "provider": self.name,
                        "type": self.provider_type.value,
                        "base_url": self.base_url,
                        "latency_ms": latency,
                        "message": "Invalid API key"
                    }
                return {
                    "status": "DEGRADED",
                    "provider": self.name,
                    "type": self.provider_type.value,
                    "base_url": self.base_url,
                    "latency_ms": latency,
                    "message": f"HTTP {res.status_code}"
                }
        except Exception as e:
            latency = round((time.time() - start) * 1000, 2)
            return {
                "status": "UNAVAILABLE",
                "provider": self.name,
                "type": self.provider_type.value,
                "base_url": self.base_url,
                "latency_ms": latency,
                "message": str(e)
            }

    async def list_models(self) -> List[Dict[str, Any]]:
        return [
            {"name": "gpt-4o", "capabilities": ["chat", "coding", "reasoning", "vision", "tools"]},
            {"name": "gpt-4o-mini", "capabilities": ["chat", "coding", "tools"]},
            {"name": "o3-mini", "capabilities": ["chat", "reasoning", "coding"]}
        ]

    async def generate(self, prompt: str, model: Optional[str] = None, system_prompt: Optional[str] = None) -> AIResponse:
        start = time.time()
        target_model = model or os.getenv("OPENAI_DEFAULT_MODEL", self.default_model)

        health = await self.health_check()
        if health["status"] != "ONLINE":
            latency = round((time.time() - start) * 1000, 2)
            return AIResponse(
                provider=self.name,
                model=target_model,
                content=f"[OpenAI Cloud Offline Fallback] Executed prompt: {prompt[:100]}...",
                usage={"input_tokens": len(prompt.split()), "output_tokens": 30},
                latency_ms=latency,
                finish_reason="stop",
                metadata={"fallback": True, "reason": health["message"]}
            )

        url = f"{self.base_url.rstrip('/')}/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": target_model,
            "messages": messages,
            "temperature": 0.2
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(url, headers=headers, json=payload)
            res.raise_for_status()
            data = res.json()
            latency = round((time.time() - start) * 1000, 2)

            content = data["choices"][0]["message"]["content"]
            usage = data.get("usage", {})
            in_tokens = usage.get("prompt_tokens", len(prompt.split()))
            out_tokens = usage.get("completion_tokens", len(content.split()))

            return AIResponse(
                provider=self.name,
                model=target_model,
                content=content,
                tool_calls=data["choices"][0]["message"].get("tool_calls", []),
                usage={"input_tokens": in_tokens, "output_tokens": out_tokens},
                latency_ms=latency,
                finish_reason=data["choices"][0].get("finish_reason", "stop"),
                metadata=data
            )
