import time
import json
import httpx
from typing import Any, Dict, List, Optional, Type, TypeVar
from pydantic import BaseModel
from .capabilities import ModelCapability

T = TypeVar("T", bound=BaseModel)

class ModelAgent:
    """
    Standardized ModelAgent interface for HackForge Multi-Model Agent Mesh.
    All model adapters (Qwen, Llama, Mistral, DeepSeek, Gemma, Phi, etc.) inherit from this.
    """
    name: str = "BaseModelAgent"
    provider: str = "generic"
    model_name: str = "base-model"
    capabilities: List[ModelCapability] = [ModelCapability.CHAT]
    base_url: Optional[str] = None
    api_key: Optional[str] = None
    cost_per_1k_input: float = 0.0001
    cost_per_1k_output: float = 0.0002

    def __init__(
        self,
        model_name: Optional[str] = None,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        capabilities: Optional[List[ModelCapability]] = None
    ):
        if model_name: self.model_name = model_name
        if base_url: self.base_url = base_url
        if api_key: self.api_key = api_key
        if capabilities: self.capabilities = capabilities

    @property
    def is_configured(self) -> bool:
        return bool(self.base_url or self.api_key)

    def estimate_cost(self, input_tokens: int, output_tokens: int) -> float:
        input_cost = (input_tokens / 1000.0) * self.cost_per_1k_input
        output_cost = (output_tokens / 1000.0) * self.cost_per_1k_output
        return round(input_cost + output_cost, 6)

    async def health_check(self) -> Dict[str, Any]:
        if not self.is_configured:
            return {
                "status": "UNCONFIGURED",
                "model": self.model_name,
                "provider": self.provider,
                "reachable": False,
                "latency_ms": 0,
                "message": "Inference endpoint base_url or api_key not configured."
            }

        start = time.time()
        try:
            url = f"{self.base_url.rstrip('/')}/models" if self.base_url else "https://api.openai.com/v1/models"
            headers = {"Authorization": f"Bearer {self.api_key or 'dummy'}"}
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(url, headers=headers)
                latency = round((time.time() - start) * 1000, 2)
                reachable = (res.status_code in [200, 401])
                return {
                    "status": "HEALTHY" if reachable else "DEGRADED",
                    "model": self.model_name,
                    "provider": self.provider,
                    "reachable": reachable,
                    "latency_ms": latency,
                    "message": "Endpoint responsive"
                }
        except Exception as e:
            latency = round((time.time() - start) * 1000, 2)
            return {
                "status": "OFFLINE",
                "model": self.model_name,
                "provider": self.provider,
                "reachable": False,
                "latency_ms": latency,
                "message": str(e)
            }

    async def generate(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        start = time.time()
        
        if not self.is_configured:
            # Deterministic fallback response when endpoint is offline/unconfigured
            latency = round((time.time() - start) * 1000, 2)
            return {
                "model": self.model_name,
                "provider": self.provider,
                "response": f"[{self.name} Offline Demo Response] Structured execution for: {prompt[:100]}...",
                "reasoning": f"Generated via {self.name} deterministic contract fallback.",
                "tool_calls": [],
                "usage": {"input_tokens": len(prompt.split()), "output_tokens": 40},
                "latency_ms": latency,
                "cost": 0.0,
                "finish_reason": "stop",
                "confidence": 0.90
            }

        url = f"{self.base_url.rstrip('/')}/chat/completions" if self.base_url else "https://api.openai.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key or 'dummy'}"
        }
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model_name,
            "messages": messages,
            "temperature": 0.2
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(url, headers=headers, json=payload)
            res.raise_for_status()
            data = res.json()
            latency = round((time.time() - start) * 1000, 2)

            content = data["choices"][0]["message"]["content"]
            usage = data.get("usage", {"prompt_tokens": len(prompt.split()), "completion_tokens": len(content.split())})
            in_tokens = usage.get("prompt_tokens", 0)
            out_tokens = usage.get("completion_tokens", 0)
            cost = self.estimate_cost(in_tokens, out_tokens)

            return {
                "model": self.model_name,
                "provider": self.provider,
                "response": content,
                "reasoning": f"Generated via {self.provider} endpoint.",
                "tool_calls": data["choices"][0]["message"].get("tool_calls", []),
                "usage": {"input_tokens": in_tokens, "output_tokens": out_tokens},
                "latency_ms": latency,
                "cost": cost,
                "finish_reason": data["choices"][0].get("finish_reason", "stop"),
                "confidence": 0.95
            }

    async def structured(self, prompt: str, schema: Type[T], system_prompt: Optional[str] = None) -> T:
        schema_json = json.dumps(schema.model_json_schema(), indent=2)
        aug_sys = f"{system_prompt or 'You are an expert AI engineer.'}\n\nRespond ONLY in valid JSON matching:\n{schema_json}"
        
        result = await self.generate(prompt, aug_sys)
        text = result["response"].strip()
        if text.startswith("```json"): text = text[7:]
        if text.startswith("```"): text = text[3:]
        if text.endswith("```"): text = text[:-3]
        text = text.strip()

        parsed = json.loads(text)
        return schema.model_validate(parsed)
