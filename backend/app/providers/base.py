import time
from enum import Enum
from typing import Any, Dict, List, Optional, Type, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T", bound=BaseModel)

class ProviderType(str, Enum):
    LOCAL = "LOCAL"
    REMOTE = "REMOTE"
    ONLINE = "ONLINE"
    OPENAI_COMPATIBLE = "OPENAI_COMPATIBLE"
    CUSTOM = "CUSTOM"

class AIResponse(BaseModel):
    provider: str
    model: str
    content: str
    tool_calls: List[Dict[str, Any]] = Field(default_factory=list)
    usage: Dict[str, int] = Field(default_factory=lambda: {"input_tokens": 0, "output_tokens": 0})
    latency_ms: float = 0.0
    finish_reason: str = "stop"
    metadata: Dict[str, Any] = Field(default_factory=dict)

class AIProvider:
    """
    Standardized Unified AI Provider interface for HackForge AI Hybrid Infrastructure.
    All local, remote, and cloud providers inherit from this class.
    """
    name: str = "BaseAIProvider"
    provider_type: ProviderType = ProviderType.CUSTOM
    base_url: Optional[str] = None
    api_key: Optional[str] = None
    is_enabled: bool = True

    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None, is_enabled: bool = True):
        if base_url: self.base_url = base_url
        if api_key: self.api_key = api_key
        self.is_enabled = is_enabled

    @property
    def is_configured(self) -> bool:
        return bool(self.base_url or self.api_key)

    async def health_check(self) -> Dict[str, Any]:
        raise NotImplementedError

    async def list_models(self) -> List[Dict[str, Any]]:
        raise NotImplementedError

    async def generate(self, prompt: str, model: Optional[str] = None, system_prompt: Optional[str] = None) -> AIResponse:
        raise NotImplementedError

    async def stream(self, prompt: str, model: Optional[str] = None, system_prompt: Optional[str] = None):
        raise NotImplementedError

    async def structured_output(self, prompt: str, schema: Type[T], model: Optional[str] = None, system_prompt: Optional[str] = None) -> T:
        raise NotImplementedError

    async def tool_call(self, prompt: str, tools: List[Dict[str, Any]], model: Optional[str] = None) -> AIResponse:
        raise NotImplementedError

    async def get_capabilities(self, model: str) -> List[str]:
        return ["chat", "coding", "reasoning"]
