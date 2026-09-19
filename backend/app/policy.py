import re
import logging
from enum import Enum
from typing import Dict, Any, List, Tuple

logger = logging.getLogger("hackforge.policy")

class DataLocalityPolicy(str, Enum):
    LOCAL_ONLY = "LOCAL_ONLY"
    CLOUD_ALLOWED = "CLOUD_ALLOWED"
    HYBRID = "HYBRID"
    USER_APPROVAL_REQUIRED = "USER_APPROVAL_REQUIRED"

class PrivacyEngine:
    """
    Privacy & Data Locality Policy Engine.
    Inspects tasks and prompts for secret leakage, private tokens, or confidential data.
    Enforces hard security boundaries so private data NEVER leaves the local machine.
    """
    SECRET_PATTERNS = [
        re.compile(r"sk-[a-zA-Z0-9]{32,}", re.IGNORECASE),
        re.compile(r"ghp_[a-zA-Z0-9]{36}", re.IGNORECASE),
        re.compile(r"AIzaSy[a-zA-Z0-9_-]{33}", re.IGNORECASE),
        re.compile(r"postgres://[a-zA-Z0-9_:]+@[a-zA-Z0-9_.-]+", re.IGNORECASE),
        re.compile(r"BEGIN\s+(RSA|EC|DSA|OPENSSH)\s+PRIVATE\s+KEY", re.IGNORECASE),
        re.compile(r"(password|secret|key|token)\s*[:=]\s*['\"][^'\"]+['\"]", re.IGNORECASE)
    ]

    def inspect_sensitivity(self, text: str) -> Tuple[bool, List[str]]:
        reasons = []
        for pattern in self.SECRET_PATTERNS:
            if pattern.search(text):
                reasons.append(f"Detected potential secret or credential matching pattern: {pattern.pattern}")

        if any(kw in text.upper() for kw in ["CONFIDENTIAL", "PROPRIETARY", "INTERNAL ONLY", "DO NOT SHARE"]):
            reasons.append("Detected explicit confidentiality markings in prompt text.")

        is_sensitive = len(reasons) > 0
        return is_sensitive, reasons

    def evaluate_routing_permission(
        self,
        prompt: str,
        user_policy: DataLocalityPolicy,
        requested_provider_type: str
    ) -> Dict[str, Any]:
        is_sensitive, reasons = self.inspect_sensitivity(prompt)

        # Hard Rule 1: User explicitly configured LOCAL_ONLY policy
        if user_policy == DataLocalityPolicy.LOCAL_ONLY:
            if requested_provider_type in ["ONLINE", "REMOTE"]:
                return {
                    "allowed": False,
                    "enforced_policy": DataLocalityPolicy.LOCAL_ONLY.value,
                    "reason": "User enforced strict LOCAL_ONLY policy. Cloud routing prohibited."
                }
            return {"allowed": True, "enforced_policy": user_policy.value, "reason": "Local execution approved."}

        # Hard Rule 2: Sensitive secret/data detected -> Force Local Only
        if is_sensitive:
            if requested_provider_type in ["ONLINE", "REMOTE"]:
                logger.warning(f"SECURITY BLOCK: Sensitive data detected in prompt! Blocking cloud provider. Reasons: {reasons}")
                return {
                    "allowed": False,
                    "enforced_policy": DataLocalityPolicy.LOCAL_ONLY.value,
                    "reason": f"Security boundary enforced: {reasons[0]}"
                }

        return {
            "allowed": True,
            "enforced_policy": user_policy.value,
            "reason": "Request compliant with policy."
        }
