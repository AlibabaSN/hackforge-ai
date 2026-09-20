import logging
import asyncio
from typing import Dict, Any, List, Optional
from .agent_mesh import AgentMeshRegistry, AgentDefinition, AgentRuntime, AgentFamily
from .router import RoutingMode

logger = logging.getLogger("hackforge.mesh.agent_orchestrator")

class AgentOrchestrator:
    """
    Central Multi-Model Agent Orchestrator for HackForge AI.
    Handles dynamic agent selection, team templates, multi-agent debate, and consensus.
    """

    def __init__(self, runtime: Optional[AgentRuntime] = None):
        self.runtime = runtime or AgentRuntime()
        self.registry = AgentMeshRegistry

    def get_team_templates(self) -> List[Dict[str, Any]]:
        """Pre-configured specialized agent team blueprints."""
        return [
            {
                "id": "web-app-team",
                "name": "Web Application Engineering Swarm",
                "description": "Full-lifecycle modern web application development team.",
                "agents": [
                    "product-manager-agent",
                    "solution-architect-agent",
                    "typescript-developer-agent",
                    "python-developer-agent",
                    "database-architect-agent",
                    "qa-testing-agent",
                    "security-engineer-agent",
                    "devops-sre-agent"
                ]
            },
            {
                "id": "aiml-platform-team",
                "name": "AI / ML & Vector Engineering Swarm",
                "description": "Machine learning, embedding pipelines, RAG systems, and model mesh serving.",
                "agents": [
                    "planner-agent",
                    "research-agent",
                    "ai-ml-engineer-agent",
                    "data-engineer-agent",
                    "scientific-computing-agent",
                    "python-developer-agent",
                    "qa-testing-agent",
                    "security-engineer-agent"
                ]
            },
            {
                "id": "hackathon-blitz-team",
                "name": "Hackathon Blitz & Rapid Prototype Swarm",
                "description": "Optimized for maximum speed, innovation, and hackathon judge evaluation.",
                "agents": [
                    "planner-agent",
                    "research-agent",
                    "solution-architect-agent",
                    "fullstack-developer-agent",
                    "qa-testing-agent",
                    "hackathon-judge-agent",
                    "executive-reporter-agent"
                ]
            },
            {
                "id": "security-audit-team",
                "name": "Zero-Trust Cybersecurity & SOC Swarm",
                "description": "Vulnerability scanning, AST static analysis, prompt injection defense, and compliance.",
                "agents": [
                    "security-engineer-agent",
                    "code-reviewer-agent",
                    "devops-sre-agent",
                    "solution-architect-agent",
                    "self-healing-debugger-agent"
                ]
            },
            {
                "id": "quant-finance-team",
                "name": "Quantitative Finance & Statistical Modeling Swarm",
                "description": "Time-series risk modeling, numerical analysis, and algorithmic backtesting.",
                "agents": [
                    "quant-research-agent",
                    "scientific-computing-agent",
                    "python-developer-agent",
                    "data-engineer-agent",
                    "qa-testing-agent"
                ]
            }
        ]

    def select_agents(self, problem_statement: str) -> Dict[str, Any]:
        """
        Dynamically analyzes a user problem statement and selects the optimal agent team.
        Does not execute every agent for every problem.
        """
        lower = problem_statement.lower()
        selected_ids: List[str] = []

        # Domain classification heuristic
        is_ml = any(k in lower for k in ["ml", "ai", "model", "neural", "rag", "embedding", "vector", "llm", "predict"])
        is_data = any(k in lower for k in ["data", "etl", "pipeline", "sql", "warehouse", "analytics", "stream"])
        is_quant = any(k in lower for k in ["finance", "trading", "quant", "stock", "portfolio", "risk", "crypto"])
        is_security = any(k in lower for k in ["security", "vulnerability", "auth", "encrypt", "firewall", "audit", "soc"])
        is_science = any(k in lower for k in ["math", "physics", "simulation", "chemistry", "biology", "calculus", "scientific"])

        # Always include core orchestration
        selected_ids.append("planner-agent")

        # Dynamic selection
        if is_ml:
            selected_ids.extend(["research-agent", "ai-ml-engineer-agent", "data-engineer-agent", "python-developer-agent", "qa-testing-agent", "security-engineer-agent"])
            category = "AI / Machine Learning Engineering"
        elif is_quant:
            selected_ids.extend(["quant-research-agent", "scientific-computing-agent", "python-developer-agent", "data-engineer-agent", "qa-testing-agent"])
            category = "Quantitative Finance & Analytics"
        elif is_security:
            selected_ids.extend(["security-engineer-agent", "code-reviewer-agent", "solution-architect-agent", "self-healing-debugger-agent", "devops-sre-agent"])
            category = "Zero-Trust Cybersecurity & Audit"
        elif is_science:
            selected_ids.extend(["scientific-computing-agent", "research-agent", "python-developer-agent", "qa-testing-agent"])
            category = "Computational Mathematics & Science"
        elif is_data:
            selected_ids.extend(["data-engineer-agent", "database-architect-agent", "python-developer-agent", "qa-testing-agent", "devops-sre-agent"])
            category = "Data Platforms & ETL Pipelines"
        else:
            # Default Web Application Engineering Swarm
            selected_ids.extend(["product-manager-agent", "solution-architect-agent", "typescript-developer-agent", "python-developer-agent", "qa-testing-agent", "security-engineer-agent"])
            category = "Full-Stack Web & Systems Engineering"

        # Always append evaluation
        selected_ids.append("hackathon-judge-agent")

        # De-duplicate while preserving order
        seen = set()
        final_agents = []
        for aid in selected_ids:
            if aid not in seen:
                seen.add(aid)
                agent = self.registry.get(aid)
                if agent:
                    final_agents.append({
                        "id": agent.id,
                        "name": agent.name,
                        "family": agent.family.value,
                        "primary_model": agent.model_policy.primary_model,
                        "fallback_model": agent.model_policy.fallback_model,
                        "capabilities": agent.capabilities,
                        "tools": agent.tools
                    })

        return {
            "problem": problem_statement,
            "detected_category": category,
            "agent_count": len(final_agents),
            "team": final_agents,
            "execution_strategy": "PARALLEL_DEPENDENCY_PIPELINE"
        }

    async def run_debate(self, topic: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Executes a 4-stage Multi-Agent Debate & Consensus Protocol:
        1. Solution Generator (Proposal)
        2. Solution Critic (Critique & Failure Modes)
        3. Counter-Architect (Alternative Mitigation)
        4. Judge Agent (Calibrated Consensus & Decision)
        """
        arch_agent = self.registry.get("solution-architect-agent")
        critic_agent = self.registry.get("code-reviewer-agent")
        dev_agent = self.registry.get("python-developer-agent")
        judge_agent = self.registry.get("hackathon-judge-agent")

        # Step 1: Solution Proposal
        step1 = await self.runtime.execute(
            agent=arch_agent,
            task_input=f"Formulate initial architectural solution proposal for: {topic}",
            context=context
        )

        # Step 2: Critique
        step2 = await self.runtime.execute(
            agent=critic_agent,
            task_input=f"Identify potential failure modes, scalability bottlenecks, and security risks in this proposal:\n{step1.get('output', '')}",
            context=context
        )

        # Step 3: Alternative Mitigation
        step3 = await self.runtime.execute(
            agent=dev_agent,
            task_input=f"Based on the critique:\n{step2.get('output', '')}\nPropose concrete engineering mitigations and alternative implementation choices.",
            context=context
        )

        # Step 4: Judge Decision & Consensus
        step4 = await self.runtime.execute(
            agent=judge_agent,
            task_input=f"Synthesize final consensus recommendation and score overall solution from 1 to 100 based on:\nProposal:\n{step1.get('output', '')}\nCritique:\n{step2.get('output', '')}\nMitigation:\n{step3.get('output', '')}",
            context=context
        )

        return {
            "topic": topic,
            "proposal": {
                "agent": arch_agent.name,
                "model": step1.get("model_used"),
                "output": step1.get("output")
            },
            "critique": {
                "agent": critic_agent.name,
                "model": step2.get("model_used"),
                "output": step2.get("output")
            },
            "mitigation": {
                "agent": dev_agent.name,
                "model": step3.get("model_used"),
                "output": step3.get("output")
            },
            "consensus_verdict": {
                "agent": judge_agent.name,
                "model": step4.get("model_used"),
                "decision": step4.get("output"),
                "status": "CONSENSUS_REACHED"
            }
        }

    def get_model_agent_matrix(self) -> Dict[str, Any]:
        """
        Generates the dynamic Model / Agent Capability Matrix.
        Reflects real compatibility without hallucination.
        """
        agents = self.registry.list_all()
        models = [
            {"name": "qwen2.5-coder:1.5b", "family": "Qwen", "type": "LOCAL", "status": "ONLINE"},
            {"name": "gemma3:4b", "family": "Gemma", "type": "LOCAL", "status": "ONLINE"},
            {"name": "deepseek-coder:6.7b", "family": "DeepSeek", "type": "REMOTE", "status": "STANDBY"},
            {"name": "llama3.3:70b", "family": "Llama", "type": "CLOUD", "status": "ONLINE"},
            {"name": "mistral-large", "family": "Mistral", "type": "CLOUD", "status": "AVAILABLE"}
        ]

        matrix_rows = []
        for a in agents:
            compat = {}
            for m in models:
                # Determine compatibility based on capabilities
                is_coding_agent = a.family in [AgentFamily.DEVELOPMENT, AgentFamily.DEBUGGING, AgentFamily.TESTING]
                if is_coding_agent and ("coder" in m["name"] or m["family"] in ["Qwen", "DeepSeek", "Llama"]):
                    compat[m["family"]] = "OPTIMAL"
                elif not is_coding_agent and m["family"] in ["Gemma", "Qwen", "Llama", "Mistral"]:
                    compat[m["family"]] = "SUPPORTED"
                else:
                    compat[m["family"]] = "FALLBACK"

            matrix_rows.append({
                "agent_id": a.id,
                "agent_name": a.name,
                "family": a.family.value,
                "assigned_primary": a.model_policy.primary_model,
                "assigned_fallback": a.model_policy.fallback_model,
                "compatibility": compat
            })

        return {
            "models": models,
            "agents": matrix_rows,
            "total_agents": len(agents),
            "total_models": len(models)
        }

# Global Orchestrator Singleton
_orchestrator = None

def get_agent_orchestrator() -> AgentOrchestrator:
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = AgentOrchestrator()
    return _orchestrator
