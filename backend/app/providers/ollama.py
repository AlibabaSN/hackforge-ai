import os
import time
import json
import httpx
from typing import Any, Dict, List, Optional, Type
from pydantic import BaseModel
from .base import AIProvider, AIResponse, ProviderType, T

class OllamaProvider(AIProvider):
    """
    Ollama Local AI Provider.
    Communicates with local Ollama daemon (default: http://localhost:11434).
    """
    name = "Ollama Local Engine"
    provider_type = ProviderType.LOCAL
    default_model = "qwen2.5-coder:latest"

    def __init__(self, base_url: Optional[str] = None):
        url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        super().__init__(base_url=url)

    async def health_check(self) -> Dict[str, Any]:
        start = time.time()
        try:
            url = f"{self.base_url.rstrip('/')}/api/tags"
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(url)
                latency = round((time.time() - start) * 1000, 2)
                if res.status_code == 200:
                    models = [m.get("name") for m in res.json().get("models", [])]
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
            url = f"{self.base_url.rstrip('/')}/api/tags"
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    return [
                        {
                            "name": m.get("name"),
                            "size": m.get("size", 0),
                            "digest": m.get("digest", "")[:12],
                            "capabilities": ["chat", "coding", "reasoning"]
                        }
                        for m in res.json().get("models", [])
                    ]
        except Exception:
            pass
        return [{"name": self.default_model, "capabilities": ["chat", "coding"]}]

    async def generate(self, prompt: str, model: Optional[str] = None, system_prompt: Optional[str] = None) -> AIResponse:
        start = time.time()
        target_model = model or self.default_model
        
        # Check health first for graceful fallback
        health = await self.health_check()
        if health["status"] != "ONLINE":
            latency = round((time.time() - start) * 1000, 2)
            return AIResponse(
                provider=self.name,
                model=target_model,
                content=f"[Ollama Local Offline Fallback] Executed prompt: {prompt[:100]}...",
                usage={"input_tokens": len(prompt.split()), "output_tokens": 30},
                latency_ms=latency,
                finish_reason="stop",
                metadata={"fallback": True, "note": "Ollama server offline"}
            )

        # Dynamically map to an installed open-source model if target model is not present
        available_models = health.get("models", [])
        if available_models:
            # First check direct or fuzzy match
            base_target = target_model.split(':')[0].lower().replace("-", "").replace(".", "")
            matches = [
                m for m in available_models
                if base_target in m.lower().replace("-", "").replace(".", "") or m.lower() in target_model.lower()
            ]
            if matches:
                target_model = matches[0]
            elif target_model not in available_models:
                # Prefer coding model if present, otherwise use the first installed model (e.g. gemma3:4b)
                coder_models = [m for m in available_models if "code" in m.lower()]
                target_model = coder_models[0] if coder_models else available_models[0]

        url = f"{self.base_url.rstrip('/')}/api/chat"
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": target_model,
            "messages": messages,
            "stream": False
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            res = await client.post(url, json=payload)
            res.raise_for_status()
            data = res.json()
            latency = round((time.time() - start) * 1000, 2)

            content = data.get("message", {}).get("content", "")
            in_tokens = data.get("prompt_eval_count", len(prompt.split()))
            out_tokens = data.get("eval_count", len(content.split()))

            return AIResponse(
                provider=self.name,
                model=target_model,
                content=content,
                usage={"input_tokens": in_tokens, "output_tokens": out_tokens},
                latency_ms=latency,
                finish_reason="stop",
                metadata=data
            )

    async def structured_output(self, prompt: str, schema: Type[T], model: Optional[str] = None, system_prompt: Optional[str] = None) -> T:
        schema_json = json.dumps(schema.model_json_schema(), indent=2)
        aug_sys = f"{system_prompt or 'You are an expert AI software engineer.'}\n\nRespond ONLY in valid JSON matching this schema:\n{schema_json}"
        res = await self.generate(prompt, model=model, system_prompt=aug_sys)
        
        text = res.content.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        
        if "{" in text and "}" in text:
            first_brace = text.find("{")
            last_brace = text.rfind("}")
            text = text[first_brace:last_brace + 1]
            
        parsed = json.loads(text)
        return schema.model_validate(parsed)
