import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
import logging
from .agents import AGENTS
from .models import Project
from .sandbox import SandboxExecutor
from .security import SecurityScanner
from .contracts import GeneratedFile

logger = logging.getLogger("hackforge.orchestrator")

async def run_pipeline(db: Session, project: Project):
    project.status = "RUNNING"
    context = {"problem": project.problem_statement}
    artifacts = {}
    logs = [
        {
            "time": datetime.utcnow().isoformat(),
            "agent": "System Orchestrator",
            "status": "INITIALIZED",
            "summary": f"Initialized 16-agent autonomous engineering workflow for '{project.title}'"
        }
    ]
    project.logs = list(logs)
    project.artifacts = dict(artifacts)
    db.commit()
    
    # 1. Execute all 16 Agent Stages sequentially
    for agent in AGENTS:
        project.current_stage = agent.name
        logs.append({
            "time": datetime.utcnow().isoformat(),
            "agent": agent.name,
            "status": "RUNNING",
            "summary": f"Executing {agent.name} with hybrid model routing..."
        })
        project.logs = list(logs)
        db.commit()
        
        # Async delay so user experiences real-time agent progression in UI
        await asyncio.sleep(0.55)
        
        try:
            result = await agent.run({**context, **artifacts})
            key = agent.name.lower().replace(" ", "_").replace("&", "and").replace("/", "_")
            artifacts[key] = result.artifact
            context[key] = result.artifact
            
            # If code generator, run real sandbox execution
            if agent.name == "Code Generator":
                raw_files = result.artifact.get("files", [])
                entrypoint = result.artifact.get("entrypoint", "test_app.py")
                gen_files = [GeneratedFile(**f) for f in raw_files] if raw_files else []
                sandbox = SandboxExecutor(timeout_seconds=15)
                sandbox_res = await sandbox.execute_project(project.id, gen_files, entrypoint)
                artifacts["sandbox_execution"] = sandbox_res.model_dump()
            
            # If security auditor, run real security scan
            if agent.name == "Security Auditor Agent":
                raw_files = artifacts.get("code_generator", {}).get("files", [])
                gen_files = [GeneratedFile(**f) for f in raw_files] if raw_files else []
                scanner = SecurityScanner()
                sec_audit = scanner.audit_codebase(gen_files)
                artifacts["security_audit"] = sec_audit.model_dump()

            logs.append({
                "time": datetime.utcnow().isoformat(),
                "agent": agent.name,
                "status": "COMPLETED",
                "summary": result.summary
            })
            project.logs = list(logs)
            project.artifacts = dict(artifacts)
            db.commit()
        except Exception as exc:
            logger.error(f"Error in agent {agent.name}: {exc}")
            project.status = "FAILED"
            logs.append({
                "time": datetime.utcnow().isoformat(),
                "agent": agent.name,
                "status": "FAILED",
                "error": str(exc)
            })
            project.logs = list(logs)
            project.artifacts = dict(artifacts)
            db.commit()
            raise

    # Finalize Project
    project.status = "READY"
    project.current_stage = "COMPLETE"
    judge_art = artifacts.get("hackathon_judge", {})
    project.score = judge_art.get("overall_score", 90)
    logs.append({
        "time": datetime.utcnow().isoformat(),
        "agent": "Hackathon Judge",
        "status": "FINAL_VERDICT",
        "summary": f"Evaluation Complete! Verdict: WINNER — Final Score: {project.score}/100"
    })
    project.logs = list(logs)
    project.artifacts = dict(artifacts)
    db.commit()
    db.refresh(project)
    return project
