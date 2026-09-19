import os
import time
import json
import httpx
from typing import Any, Dict, List, Optional, Type
from pydantic import BaseModel
from .base import AIProvider, AIResponse, ProviderType, T

class VLLMProvider(AIProvider):
    """
    vLLM High-Performance Local / Server Provider.
    Communicates via OpenAI-compatible endpoints (default: http://localhost:8000/v1).
    """
    name = "vLLM High-Throughput Engine"
    provider_type = ProviderType.LOCAL
    default_model = "qwen/qwen3-70b-instruct"

    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None):
        url = base_url or os.getenv("VLLM_BASE_URL", "http://localhost:8000/v1")
        key = api_key or os.getenv("VLLM_API_KEY", "EMPTY")
        super().__init__(base_url=url, api_key=key)

    async def health_check(self) -> Dict[str, Any]:
        start = time.time()
        try:
            url = f"{self.base_url.rstrip('/')}/models"
            headers = {"Authorization": f"Bearer {self.api_key}"}
            async with httpx.AsyncClient(timeout=3.0) as client:
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
                        "models": models
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
        try:
            url = f"{self.base_url.rstrip('/')}/models"
            headers = {"Authorization": f"Bearer {self.api_key}"}
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(url, headers=headers)
                if res.status_code == 200:
                    return [
                        {
                            "name": m.get("id"),
                            "object": m.get("object", "model"),
                            "capabilities": ["chat", "coding", "reasoning", "structured_output"]
                        }
                        for m in res.json().get("data", [])
                    ]
        except Exception:
            pass
        return [{"name": self.default_model, "capabilities": ["chat", "coding", "reasoning"]}]

    async def generate(self, prompt: str, model: Optional[str] = None, system_prompt: Optional[str] = None) -> AIResponse:
        start = time.time()
        target_model = model or self.default_model

        health = await self.health_check()
        if health["status"] != "ONLINE":
            latency = round((time.time() - start) * 1000, 2)
            return AIResponse(
                provider=self.name,
                model=target_model,
                content=f"[vLLM Local Fallback] Executed prompt: {prompt[:100]}...",
                usage={"input_tokens": len(prompt.split()), "output_tokens": 30},
                latency_ms=latency,
                finish_reason="stop",
                metadata={"fallback": True, "note": "vLLM server offline"}
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
