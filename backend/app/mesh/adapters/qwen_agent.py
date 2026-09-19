from typing import List, Optional
from ..base_agent import ModelAgent
from ..capabilities import ModelCapability

class QwenAgent(ModelAgent):
    name = "Qwen Model Agent"
    provider = "vLLM / Qwen / OpenAI-compatible"
    model_name = "qwen/qwen3-70b-instruct"
    capabilities = [
        ModelCapability.CHAT,
        ModelCapability.REASONING,
        ModelCapability.CODING,
        ModelCapability.TOOL_CALLING,
        ModelCapability.STRUCTURED_OUTPUT,
        ModelCapability.LONG_CONTEXT,
        ModelCapability.STREAMING
    ]
