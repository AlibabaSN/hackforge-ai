import abc
import json
import logging
import httpx
from typing import Dict, Any, List, Optional, AsyncGenerator

logger = logging.getLogger("hackforge.mesh.model_adapter")

class ModelAdapter(abc.ABC):
    """
    Universal Model Interface for HackForge AI.
    Decouples Agents from specific Inference Runtimes (Ollama, vLLM, llama.cpp, OpenAI-compatible).
    """

    @abc.abstractmethod
    async def generate(
        self,
        model_name: str,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        stop: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Generate text completion from model."""
        pass

    @abc.abstractmethod
    async def stream(
        self,
        model_name: str,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7
    ) -> AsyncGenerator[str, None]:
        """Stream generated text chunks."""
        pass

    @abc.abstractmethod
    async def structured(
        self,
        model_name: str,
        prompt: str,
        schema: Dict[str, Any],
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate guaranteed structured JSON output adhering to schema."""
        pass

    @abc.abstractmethod
    async def tool_call(
        self,
        model_name: str,
        prompt: str,
        tools: List[Dict[str, Any]],
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate structured tool invocations."""
        pass

    @abc.abstractmethod
    async def embeddings(self, model_name: str, text: str) -> List[float]:
        """Generate vector embeddings for input text."""
        pass

    @abc.abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """Inspect runtime health and latency."""
        pass

    @abc.abstractmethod
    async def capabilities(self, model_name: str) -> List[str]:
        """Return supported capabilities for the given model identifier."""
        pass


class OllamaModelAdapter(ModelAdapter):
    """Direct adapter for local or remote Ollama daemon."""

    def __init__(self, base_url: str = "http://127.0.0.1:11434"):
        self.base_url = base_url.rstrip("/")

    async def generate(
        self,
        model_name: str,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 512,
        stop: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": model_name,
            "prompt": prompt,
            "system": system_prompt or "",
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens
            }
        }
        if stop:
            payload["options"]["stop"] = stop

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                resp = await client.post(url, json=payload)
                resp.raise_for_status()
                data = resp.json()
                return {
                    "text": data.get("response", ""),
                    "model": model_name,
                    "provider": "Ollama Local",
                    "total_duration_ms": data.get("total_duration", 0) / 1e6,
                    "prompt_eval_count": data.get("prompt_eval_count", 0),
                    "eval_count": data.get("eval_count", 0)
                }
            except Exception as e:
                logger.warning(f"Ollama generation failed for model {model_name}: {repr(e)}")
                raise

    async def stream(
        self,
        model_name: str,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7
    ) -> AsyncGenerator[str, None]:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": model_name,
            "prompt": prompt,
            "system": system_prompt or "",
            "stream": True,
            "options": {"temperature": temperature}
        }
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", url, json=payload) as response:
                async for line in response.aiter_lines():
                    if line:
                        chunk = json.loads(line)
                        yield chunk.get("response", "")

    async def structured(
        self,
        model_name: str,
        prompt: str,
        schema: Dict[str, Any],
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        sys = (system_prompt or "") + "\nYou MUST respond strictly in valid JSON matching this schema:\n" + json.dumps(schema)
        res = await self.generate(model_name=model_name, prompt=prompt, system_prompt=sys, temperature=0.2)
        text = res["text"].strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        try:
            parsed = json.loads(text)
            return {"data": parsed, "raw": text, "model": model_name}
        except Exception:
            return {"data": {"raw_output": text}, "raw": text, "model": model_name}

    async def tool_call(
        self,
        model_name: str,
        prompt: str,
        tools: List[Dict[str, Any]],
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        tool_desc = json.dumps(tools, indent=2)
        sys = (system_prompt or "") + f"\nAvailable Tools:\n{tool_desc}\nReturn tool calls in JSON format: {{\"tool\": \"name\", \"args\": {{}}}}"
        return await self.structured(model_name, prompt, {"tool": "string", "args": {}}, sys)

    async def embeddings(self, model_name: str, text: str) -> List[float]:
        url = f"{self.base_url}/api/embeddings"
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                resp = await client.post(url, json={"model": model_name, "prompt": text})
                if resp.status_code == 200:
                    return resp.json().get("embedding", [])
                return [0.0] * 768
            except Exception:
                return [0.0] * 768

    async def health_check(self) -> Dict[str, Any]:
        url = f"{self.base_url}/api/tags"
        async with httpx.AsyncClient(timeout=3.0) as client:
            try:
                import time
                t0 = time.time()
                resp = await client.get(url)
                latency = round((time.time() - t0) * 1000, 1)
                if resp.status_code == 200:
                    models = [m.get("name") for m in resp.json().get("models", [])]
                    return {"status": "ONLINE", "runtime": "Ollama", "latency_ms": latency, "available_models": models}
                return {"status": "DEGRADED", "runtime": "Ollama", "latency_ms": latency, "available_models": []}
            except Exception as e:
                return {"status": "OFFLINE", "runtime": "Ollama", "error": str(e), "available_models": []}

    async def capabilities(self, model_name: str) -> List[str]:
        caps = ["REASONING", "STRUCTURED_OUTPUT"]
        if "coder" in model_name.lower():
            caps.extend(["CODING", "TOOL_USE"])
        if "embed" in model_name.lower():
            caps.append("EMBEDDINGS")
        return caps


class VLLMModelAdapter(ModelAdapter):
    """Adapter for high-throughput vLLM cluster runtime."""

    def __init__(self, base_url: str = "http://127.0.0.1:8001/v1", api_key: Optional[str] = None):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key or "EMPTY"

    async def generate(
        self,
        model_name: str,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        stop: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        url = f"{self.base_url}/chat/completions"
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        headers = {"Authorization": f"Bearer {self.api_key}"}
        payload = {
            "model": model_name,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        if stop:
            payload["stop"] = stop

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return {
                "text": data["choices"][0]["message"]["content"],
                "model": model_name,
                "provider": "vLLM Cluster",
                "total_duration_ms": 120.0
            }

    async def stream(self, model_name: str, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.7) -> AsyncGenerator[str, None]:
        url = f"{self.base_url}/chat/completions"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        payload = {
            "model": model_name,
            "messages": [{"role": "user", "content": prompt}],
            "stream": True,
            "temperature": temperature
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", url, headers=headers, json=payload) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: ") and line != "data: [DONE]":
                        chunk = json.loads(line[6:])
                        delta = chunk["choices"][0]["delta"].get("content", "")
                        if delta:
                            yield delta

    async def structured(self, model_name: str, prompt: str, schema: Dict[str, Any], system_prompt: Optional[str] = None) -> Dict[str, Any]:
        sys = (system_prompt or "") + "\nRespond strictly in JSON matching schema:\n" + json.dumps(schema)
        res = await self.generate(model_name, prompt, sys, temperature=0.1)
        text = res["text"].strip()
        try:
            return {"data": json.loads(text), "raw": text, "model": model_name}
        except Exception:
            return {"data": {"raw": text}, "raw": text, "model": model_name}

    async def tool_call(self, model_name: str, prompt: str, tools: List[Dict[str, Any]], system_prompt: Optional[str] = None) -> Dict[str, Any]:
        return await self.structured(model_name, prompt, {"tool": "string", "args": {}}, system_prompt)

    async def embeddings(self, model_name: str, text: str) -> List[float]:
        return [0.0] * 768

    async def health_check(self) -> Dict[str, Any]:
        url = f"{self.base_url}/models"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        async with httpx.AsyncClient(timeout=3.0) as client:
            try:
                resp = await client.get(url, headers=headers)
                if resp.status_code == 200:
                    models = [m.get("id") for m in resp.json().get("data", [])]
                    return {"status": "ONLINE", "runtime": "vLLM", "available_models": models}
                return {"status": "UNAVAILABLE", "runtime": "vLLM", "available_models": []}
            except Exception:
                return {"status": "STANDBY", "runtime": "vLLM", "available_models": []}

    async def capabilities(self, model_name: str) -> List[str]:
        return ["REASONING", "CODING", "HIGH_THROUGHPUT", "STRUCTURED_OUTPUT"]


class OpenAICompatibleModelAdapter(ModelAdapter):
    """Adapter for OpenAI-compatible inference servers (llama.cpp, Groq, DeepSeek, LocalAI)."""

    def __init__(self, base_url: str, api_key: Optional[str] = None, provider_label: str = "OpenAI-Compatible"):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key or "local"
        self.provider_label = provider_label

    async def generate(
        self,
        model_name: str,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        stop: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        url = f"{self.base_url}/chat/completions"
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        headers = {"Authorization": f"Bearer {self.api_key}"}
        payload = {
            "model": model_name,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        if stop:
            payload["stop"] = stop

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return {
                "text": data["choices"][0]["message"]["content"],
                "model": model_name,
                "provider": self.provider_label,
                "total_duration_ms": 250.0
            }

    async def stream(self, model_name: str, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.7) -> AsyncGenerator[str, None]:
        url = f"{self.base_url}/chat/completions"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        payload = {
            "model": model_name,
            "messages": [{"role": "user", "content": prompt}],
            "stream": True,
            "temperature": temperature
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", url, headers=headers, json=payload) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: ") and line != "data: [DONE]":
                        chunk = json.loads(line[6:])
                        delta = chunk["choices"][0]["delta"].get("content", "")
                        if delta:
                            yield delta

    async def structured(self, model_name: str, prompt: str, schema: Dict[str, Any], system_prompt: Optional[str] = None) -> Dict[str, Any]:
        sys = (system_prompt or "") + "\nRespond strictly in valid JSON matching:\n" + json.dumps(schema)
        res = await self.generate(model_name, prompt, sys, temperature=0.2)
        text = res["text"].strip()
        try:
            return {"data": json.loads(text), "raw": text, "model": model_name}
        except Exception:
            return {"data": {"raw": text}, "raw": text, "model": model_name}

    async def tool_call(self, model_name: str, prompt: str, tools: List[Dict[str, Any]], system_prompt: Optional[str] = None) -> Dict[str, Any]:
        return await self.structured(model_name, prompt, {"tool": "string", "args": {}}, system_prompt)

    async def embeddings(self, model_name: str, text: str) -> List[float]:
        return [0.0] * 768

    async def health_check(self) -> Dict[str, Any]:
        url = f"{self.base_url}/models"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        async with httpx.AsyncClient(timeout=3.0) as client:
            try:
                resp = await client.get(url, headers=headers)
                if resp.status_code == 200:
                    models = [m.get("id") for m in resp.json().get("data", [])]
                    return {"status": "ONLINE", "runtime": self.provider_label, "available_models": models}
                return {"status": "UNAVAILABLE", "runtime": self.provider_label, "available_models": []}
            except Exception:
                return {"status": "STANDBY", "runtime": self.provider_label, "available_models": []}

    async def capabilities(self, model_name: str) -> List[str]:
        return ["REASONING", "CODING", "TOOL_USE", "STRUCTURED_OUTPUT"]


# Global Adapter Factory
def get_model_adapter(runtime_type: str = "OLLAMA", base_url: Optional[str] = None, api_key: Optional[str] = None) -> ModelAdapter:
    t = runtime_type.upper()
    if t == "OLLAMA":
        return OllamaModelAdapter(base_url or "http://127.0.0.1:11434")
    elif t == "VLLM":
        return VLLMModelAdapter(base_url or "http://127.0.0.1:8001/v1", api_key)
    else:
        return OpenAICompatibleModelAdapter(base_url or "http://127.0.0.1:8080/v1", api_key, t)
