import asyncio
import logging
from typing import Any, Dict, List, Optional
from .router import get_model_router
from .capabilities import ModelCapability
from ..contracts import HackathonJudgeContract

logger = logging.getLogger("hackforge.mesh.collaboration")

class CrossModelCritic:
    """
    Cross-Model Criticism Engine.
    Workflow: Model A generates → Model B critiques → Model C refines.
    """
    async def execute_cross_critique(
        self, problem_statement: str, context: Dict[str, Any]
    ) -> Dict[str, Any]:
        router = get_model_router()

        # 1. Primary Model generates initial proposal
        generator_agent = router.route_task(
            "code_generation", [ModelCapability.CODING, ModelCapability.STRUCTURED_OUTPUT]
        )
        gen_res = await generator_agent.generate(
            f"Generate technical solution architecture for: {problem_statement}",
            "You are an expert lead software architect."
        )

        # 2. Secondary Model critiques initial proposal
        critic_agent = router.route_task(
            "solution_critic", [ModelCapability.REASONING], preferred_model="meta-llama/llama-3.3-70b-instruct"
        )
        critic_res = await critic_agent.generate(
            f"Critique this solution architecture, identifying security flaws, edge cases, and deadlocks:\n{gen_res['response']}",
            "You are an adversarial security and performance auditor."
        )

        # 3. Judge / Refiner Model synthesizes improved proposal
        refiner_agent = router.route_task(
            "solution_refinement", [ModelCapability.REASONING, ModelCapability.CODING]
        )
        refine_res = await refiner_agent.generate(
            f"Original Proposal:\n{gen_res['response']}\n\nCritic Attack:\n{critic_res['response']}\n\nSynthesize the hardened final architecture.",
            "You are an executive principal engineer."
        )

        return {
            "generator_model": generator_agent.model_name,
            "critic_model": critic_agent.model_name,
            "refiner_model": refiner_agent.model_name,
            "initial_proposal": gen_res["response"],
            "critic_feedback": critic_res["response"],
            "final_hardened_architecture": refine_res["response"],
            "collaboration_mode": "CrossModelCritic"
        }

class ModelDebateAgent:
    """
    Multi-Model Debate Agent.
    Executes user problem across multiple models independently and synthesizes best response via Debate Judge.
    """
    async def run_debate(
        self, problem_statement: str, model_names: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        router = get_model_router()
        target_models = model_names or [
            "qwen/qwen3-70b-instruct",
            "meta-llama/llama-3.3-70b-instruct",
            "mistralai/mistral-large-2411"
        ]

        responses = []
        for name in target_models:
            agent = router.registry.get_model(name) or router.route_task("debate", [ModelCapability.CHAT])
            res = await agent.generate(f"Solve this engineering challenge:\n{problem_statement}")
            responses.append({
                "model": agent.model_name,
                "provider": agent.provider,
                "response": res["response"],
                "latency_ms": res["latency_ms"]
            })

        # Judge compares responses
        judge_agent = router.route_task("judge_evaluation", [ModelCapability.REASONING])
        comparison_prompt = (
            f"Problem Statement:\n{problem_statement}\n\n"
            + "\n\n".join([f"=== Model: {r['model']} ===\n{r['response']}" for r in responses])
            + "\n\nEvaluate correctness, technical quality, safety, and evidence. Declare the winning solution."
        )
        judge_res = await judge_agent.generate(comparison_prompt, "You are an impartial Hackathon Debate Judge.")

        return {
            "debate_participants": [r["model"] for r in responses],
            "individual_responses": responses,
            "debate_verdict": judge_res["response"],
            "judge_model": judge_agent.model_name
        }

class ModelEnsemble:
    """
    Ensemble Orchestrator.
    Modes: BEST, FASTEST, CHEAPEST, DEBATE, CROSS_CRITIC.
    """
    async def execute_mode(
        self, mode: str, problem_statement: str, context: Dict[str, Any]
    ) -> Dict[str, Any]:
        if mode == "DEBATE":
            debate = ModelDebateAgent()
            return await debate.run_debate(problem_statement)
        elif mode == "CROSS_CRITIC":
            critic = CrossModelCritic()
            return await critic.execute_cross_critique(problem_statement, context)
        else:
            router = get_model_router()
            agent = router.route_task(f"ensemble_{mode.lower()}", [ModelCapability.CODING])
            res = await agent.generate(problem_statement)
            return {
                "mode": mode,
                "selected_model": agent.model_name,
                "result": res["response"]
            }
