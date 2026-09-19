import os
import json
import logging
from typing import Type, TypeVar, Optional
import httpx
from pydantic import BaseModel

logger = logging.getLogger("hackforge.llm")

T = TypeVar("T", bound=BaseModel)

class LLMProvider:
    """
    OpenAI-compatible LLM Provider abstraction supporting open-weight models
    (e.g., Qwen3 via vLLM, llama.cpp, Ollama) and cloud API providers.
    """
    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
    ):
        self.base_url = base_url or os.getenv("OPENAI_BASE_URL", "")
        self.api_key = api_key or os.getenv("OPENAI_API_KEY", "")
        self.model_name = model_name or os.getenv("MODEL_NAME", "qwen/qwen3-70b-instruct")

    @property
    def is_configured(self) -> bool:
        return bool(self.base_url or self.api_key)

    async def generate_completion(self, system_prompt: str, user_prompt: str) -> str:
        if not self.is_configured:
            raise ValueError("LLM provider is not configured with base_url or api_key.")

        url = f"{self.base_url.rstrip('/')}/chat/completions" if self.base_url else "https://api.openai.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key or 'dummy_key'}"
        }
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(url, headers=headers, json=payload)
            res.raise_for_status()
            data = res.json()
            return data["choices"][0]["message"]["content"]

    async def generate_structured(
        self, system_prompt: str, user_prompt: str, schema: Type[T]
    ) -> T:
        schema_json = json.dumps(schema.model_json_schema(), indent=2)
        augmented_system = (
            f"{system_prompt}\n\n"
            f"You MUST respond ONLY with valid JSON matching the following JSON Schema:\n{schema_json}"
        )

        raw_text = await self.generate_completion(augmented_system, user_prompt)
        
        # Clean markdown codeblocks if present
        clean_text = raw_text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.startswith("```"):
            clean_text = clean_text[3:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        clean_text = clean_text.strip()

        parsed_json = json.loads(clean_text)
        return schema.model_validate(parsed_json)


def get_llm_provider() -> LLMProvider:
    return LLMProvider()
