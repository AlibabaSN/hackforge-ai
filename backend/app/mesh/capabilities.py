from enum import Enum
from typing import List

class ModelCapability(str, Enum):
    CHAT = "CHAT"
    REASONING = "REASONING"
    CODING = "CODING"
    VISION = "VISION"
    AUDIO = "AUDIO"
    TOOL_CALLING = "TOOL_CALLING"
    STRUCTURED_OUTPUT = "STRUCTURED_OUTPUT"
    JSON_MODE = "JSON_MODE"
    LONG_CONTEXT = "LONG_CONTEXT"
    RAG = "RAG"
    EMBEDDINGS = "EMBEDDINGS"
    STREAMING = "STREAMING"
    LOCAL_INFERENCE = "LOCAL_INFERENCE"

def get_default_capabilities(model_family: str) -> List[ModelCapability]:
    family = model_family.lower()
    if "qwen" in family:
        return [ModelCapability.CHAT, ModelCapability.REASONING, ModelCapability.CODING, ModelCapability.TOOL_CALLING, ModelCapability.STRUCTURED_OUTPUT, ModelCapability.LONG_CONTEXT, ModelCapability.STREAMING]
    elif "deepseek" in family:
        return [ModelCapability.CHAT, ModelCapability.REASONING, ModelCapability.CODING, ModelCapability.STRUCTURED_OUTPUT, ModelCapability.LONG_CONTEXT, ModelCapability.STREAMING]
    elif "llama" in family:
        return [ModelCapability.CHAT, ModelCapability.CODING, ModelCapability.VISION, ModelCapability.TOOL_CALLING, ModelCapability.STREAMING]
    elif "mistral" in family:
        return [ModelCapability.CHAT, ModelCapability.CODING, ModelCapability.TOOL_CALLING, ModelCapability.STREAMING]
    elif "gemma" in family:
        return [ModelCapability.CHAT, ModelCapability.CODING, ModelCapability.STREAMING]
    elif "phi" in family:
        return [ModelCapability.CHAT, ModelCapability.CODING, ModelCapability.LOCAL_INFERENCE, ModelCapability.STREAMING]
    else:
        return [ModelCapability.CHAT, ModelCapability.CODING, ModelCapability.STREAMING]
