from typing import List, Optional
from ..base_agent import ModelAgent
from ..capabilities import ModelCapability

class MistralAgent(ModelAgent):
    name = "Mistral Model Agent"
    provider = "vLLM / Ollama / Transformers"
    model_name = "mistralai/mistral-large-2411"
    capabilities = [
        ModelCapability.CHAT,
        ModelCapability.CODING,
        ModelCapability.TOOL_CALLING,
        ModelCapability.STREAMING
    ]
