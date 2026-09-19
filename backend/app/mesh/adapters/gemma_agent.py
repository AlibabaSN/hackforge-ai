from typing import List, Optional
from ..base_agent import ModelAgent
from ..capabilities import ModelCapability

class GemmaAgent(ModelAgent):
    name = "Gemma Model Agent"
    provider = "Transformers / Ollama / vLLM"
    model_name = "google/gemma-2-27b-it"
    capabilities = [
        ModelCapability.CHAT,
        ModelCapability.CODING,
        ModelCapability.STREAMING
    ]
