from typing import List, Optional
from ..base_agent import ModelAgent
from ..capabilities import ModelCapability

class CustomModelAgent(ModelAgent):
    """
    Configurable Custom Model Agent for arbitrary user-defined OpenAI-compatible endpoints.
    Allows adding any model to HackForge without modifying source code.
    """
    name = "Custom Model Agent"
    provider = "Custom Endpoint"
    model_name = "custom-model"
    capabilities = [
        ModelCapability.CHAT,
        ModelCapability.CODING,
        ModelCapability.STRUCTURED_OUTPUT,
        ModelCapability.STREAMING
    ]
