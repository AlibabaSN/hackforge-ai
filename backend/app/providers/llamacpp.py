import os
import time
import json
import httpx
from typing import Any, Dict, List, Optional
from .base import AIProvider, AIResponse, ProviderType

class LlamaCppProvider(AIProvider):
    """
    llama.cpp HTTP Server Provider.
    Connects to llama.cpp binary server HTTP completion endpoints (default: http://localhost:8080).
    """
    name = "llama.cpp Engine"
    provider_type = ProviderType.LOCAL
    default_model = "llama-3.2-3b-instruct.gguf"

    def __init__(self, base_url: Optional[str] = None):
        url = base_url or os.getenv("LLAMACPP_BASE_URL", "http://localhost:8080")
        super().__init__(base_url=url)

    async def health_check(self) -> Dict[str, Any]:
        start = time.time()
        try:
            url = f"{self.base_url.rstrip('/')}/health"
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(url)
                latency = round((time.time() - start) * 1000, 2)
                if res.status_code == 200:
                    data = res.json()
                    status_text = data.get("status", "ok")
                    return {
                        "status": "ONLINE" if status_text == "ok" or status_text == "loading model" else "DEGRADED",
                        "provider": self.name,
                        "type": self.provider_type.value,
                        "base_url": self.base_url,
                        "latency_ms": latency,
                        "slots_idle": data.get("slots_idle", 1)
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
        return [{"name": self.default_model, "capabilities": ["chat", "coding", "local_inference"]}]

    async def generate(self, prompt: str, model: Optional[str] = None, system_prompt: Optional[str] = None) -> AIResponse:
        start = time.time()
        target_model = model or self.default_model

        health = await self.health_check()
        if health["status"] != "ONLINE":
            latency = round((time.time() - start) * 1000, 2)
            return AIResponse(
                provider=self.name,
                model=target_model,
                content=f"[llama.cpp Offline Fallback] Executed prompt: {prompt[:100]}...",
                usage={"input_tokens": len(prompt.split()), "output_tokens": 30},
                latency_ms=latency,
                finish_reason="stop",
                metadata={"fallback": True, "note": "llama.cpp server offline"}
            )

        url = f"{self.base_url.rstrip('/')}/completion"
        full_prompt = f"System: {system_prompt}\nUser: {prompt}\nAssistant:" if system_prompt else f"User: {prompt}\nAssistant:"
        
        payload = {
            "prompt": full_prompt,
            "n_predict": 512,
            "temperature": 0.2
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(url, json=payload)
            res.raise_for_status()
            data = res.json()
            latency = round((time.time() - start) * 1000, 2)

            content = data.get("content", "")
            tokens_eval = data.get("tokens_evaluated", len(prompt.split()))
            tokens_pred = data.get("tokens_predicted", len(content.split()))

            return AIResponse(
                provider=self.name,
                model=target_model,
                content=content,
                usage={"input_tokens": tokens_eval, "output_tokens": tokens_pred},
                latency_ms=latency,
                finish_reason="stop",
                metadata=data
            )
