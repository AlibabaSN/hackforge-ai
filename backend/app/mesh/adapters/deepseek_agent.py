from typing import List, Optional
from ..base_agent import ModelAgent
from ..capabilities import ModelCapability

class DeepSeekAgent(ModelAgent):
    name = "DeepSeek Model Agent"
    provider = "vLLM / DeepSeek / OpenAI-compatible"
    model_name = "deepseek-ai/deepseek-r1"
    capabilities = [
        ModelCapability.CHAT,
        ModelCapability.REASONING,
        ModelCapability.CODING,
        ModelCapability.STRUCTURED_OUTPUT,
        ModelCapability.LONG_CONTEXT,
        ModelCapability.STREAMING
    ]
