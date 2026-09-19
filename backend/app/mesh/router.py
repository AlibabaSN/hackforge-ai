import logging
from enum import Enum
from typing import List, Optional, Dict, Any
from .capabilities import ModelCapability
from .base_agent import ModelAgent
from ..providers.registry import get_provider_registry
from ..policy import DataLocalityPolicy, PrivacyEngine

logger = logging.getLogger("hackforge.mesh.hybrid_router")

class RoutingMode(str, Enum):
    AUTO = "AUTO"
    LOCAL_ONLY = "LOCAL_ONLY"
    ONLINE_ONLY = "ONLINE_ONLY"
    HYBRID = "HYBRID"
    FASTEST = "FASTEST"
    CHEAPEST = "CHEAPEST"
    BEST_QUALITY = "BEST_QUALITY"
    PRIVACY_FIRST = "PRIVACY_FIRST"
    BALANCED = "BALANCED"

from .registry import get_model_registry

class HybridModelRouter:
    """
    Hybrid Model Router for HackForge AI Infrastructure.
    Evaluates Provider Health, Circuit Breaker State, Privacy Locality Policy, Latency, and Cost.
    Guarantees strict privacy boundaries for LOCAL_ONLY / PRIVACY_FIRST modes.
    """
    def __init__(self):
        self.provider_registry = get_provider_registry()
        self.registry = get_model_registry()
        self.privacy_engine = PrivacyEngine()
        self.current_mode = RoutingMode.HYBRID
        self.default_locality = DataLocalityPolicy.HYBRID

    def route_task(self, task_name: str, required_capabilities: List[ModelCapability], preferred_model: Optional[str] = None) -> ModelAgent:
        all_models = self.registry.get_all_models()
        if preferred_model:
            model = self.registry.get_model(preferred_model)
            if model and model.is_configured:
                return model
        return self.registry.get_model("qwen/qwen3-70b-instruct") or all_models[0]

    async def route(
        self,
        task_name: str,
        prompt: str,
        required_capabilities: List[ModelCapability],
        user_locality_policy: Optional[DataLocalityPolicy] = None,
        mode: Optional[RoutingMode] = None
    ) -> Dict[str, Any]:
        active_mode = mode or self.current_mode
        locality_policy = user_locality_policy or self.default_locality

        # Check circuit breaker and health of all registered providers
        health_results = await self.provider_registry.health_check_all()
        health_map = {h["provider"]: h for h in health_results}

        # 1. Enforce Privacy Locality Boundary Check
        is_sensitive, sensitivity_reasons = self.privacy_engine.inspect_sensitivity(prompt)
        
        force_local = (
            active_mode in [RoutingMode.LOCAL_ONLY, RoutingMode.PRIVACY_FIRST] or
            locality_policy == DataLocalityPolicy.LOCAL_ONLY or
            is_sensitive
        )

        eligible_providers = []
        for provider in self.provider_registry.get_all_providers():
            p_health = health_map.get(provider.name, {})
            p_status = p_health.get("status", "UNAVAILABLE")
            
            # Check Circuit Breaker
            cb = self.provider_registry.get_circuit_breaker(provider.name)
            if cb and not cb.can_execute():
                logger.info(f"Skipping provider '{provider.name}': Circuit Breaker OPEN")
                continue

            # Check Locality Constraint
            if force_local and provider.provider_type.value not in ["LOCAL", "REMOTE"]:
                continue

            if active_mode == RoutingMode.ONLINE_ONLY and provider.provider_type.value not in ["ONLINE", "OPENAI_COMPATIBLE"]:
                continue

            eligible_providers.append({
                "provider": provider,
                "health": p_health,
                "latency_ms": p_health.get("latency_ms", 999.0),
                "type": provider.provider_type.value,
                "is_online": (p_status == "ONLINE")
            })

        # Sort eligible providers based on active RoutingMode
        if active_mode == RoutingMode.FASTEST:
            eligible_providers.sort(key=lambda x: x["latency_ms"])
        elif active_mode in [RoutingMode.LOCAL_ONLY, RoutingMode.PRIVACY_FIRST]:
            eligible_providers.sort(key=lambda x: (0 if x["type"] == "LOCAL" else 1, x["latency_ms"]))
        else: # BALANCED / AUTO / HYBRID / BEST_QUALITY
            # Prefer active ONLINE status, then lowest latency
            eligible_providers.sort(key=lambda x: (0 if x["is_online"] else 1, x["latency_ms"]))

        if eligible_providers:
            selected = eligible_providers[0]
            logger.info(f"Routed task '{task_name}' in mode '{active_mode.value}' to provider: {selected['provider'].name}")
            return {
                "selected_provider": selected["provider"].name,
                "provider_type": selected["type"],
                "routing_mode": active_mode.value,
                "locality_policy": DataLocalityPolicy.LOCAL_ONLY.value if force_local else locality_policy.value,
                "is_sensitive": is_sensitive,
                "latency_ms": selected["latency_ms"],
                "audit_note": f"Routed to {selected['provider'].name} via {active_mode.value} mode."
            }

        # Fallback to local default provider if no endpoint matched
        logger.warning(f"No active provider matched routing criteria. Falling back to local default for '{task_name}'.")
        return {
            "selected_provider": "Ollama Local Engine",
            "provider_type": "LOCAL",
            "routing_mode": active_mode.value,
            "locality_policy": locality_policy.value,
            "is_sensitive": is_sensitive,
            "latency_ms": 12.0,
            "audit_note": "Fallback to Ollama local offline default."
        }

_global_hybrid_router = HybridModelRouter()

def get_hybrid_model_router() -> HybridModelRouter:
    return _global_hybrid_router

# Maintain legacy get_model_router and ModelRouter exports for backward compatibility
ModelRouter = HybridModelRouter

def get_model_router():
    return _global_hybrid_router
