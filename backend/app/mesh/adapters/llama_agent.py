from typing import List, Optional
from ..base_agent import ModelAgent
from ..capabilities import ModelCapability

class LlamaAgent(ModelAgent):
    name = "Llama Model Agent"
    provider = "vLLM / Ollama / llama.cpp"
    model_name = "meta-llama/llama-3.3-70b-instruct"
    capabilities = [
        ModelCapability.CHAT,
        ModelCapability.CODING,
        ModelCapability.VISION,
        ModelCapability.TOOL_CALLING,
        ModelCapability.STREAMING
    ]
