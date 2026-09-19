from typing import List, Optional
from ..base_agent import ModelAgent
from ..capabilities import ModelCapability

class PhiAgent(ModelAgent):
    name = "Phi Model Agent"
    provider = "Ollama / llama.cpp / Local"
    model_name = "microsoft/phi-4"
    capabilities = [
        ModelCapability.CHAT,
        ModelCapability.CODING,
        ModelCapability.LOCAL_INFERENCE,
        ModelCapability.STREAMING
    ]
