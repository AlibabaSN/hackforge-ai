from typing import List, Optional
from ..base_agent import ModelAgent
from ..capabilities import ModelCapability

class InternLMAgent(ModelAgent):
    name = "InternLM Model Agent"
    provider = "vLLM / Transformers"
    model_name = "internlm/internlm2_5-20b-chat"
    capabilities = [
        ModelCapability.CHAT,
        ModelCapability.CODING,
        ModelCapability.REASONING,
        ModelCapability.STREAMING
    ]
