from typing import List, Optional
from ..base_agent import ModelAgent
from ..capabilities import ModelCapability

class GLMAgent(ModelAgent):
    name = "GLM Model Agent"
    provider = "vLLM / Zhipu / OpenAI-compatible"
    model_name = "THUDM/glm-4-9b-chat"
    capabilities = [
        ModelCapability.CHAT,
        ModelCapability.CODING,
        ModelCapability.TOOL_CALLING,
        ModelCapability.STREAMING
    ]
