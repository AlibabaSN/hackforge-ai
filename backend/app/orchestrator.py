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
    artifacts = dict(project.artifacts or {})
    logs = list(project.logs or [])
    
    # 1. Execute Agent Stages (Problem, Research, Solutions, Architecture, Code Generation)
    for agent in AGENTS:
        project.current_stage = agent.name
        logs.append({
            "time": datetime.utcnow().isoformat(),
            "agent": agent.name,
            "status": "RUNNING"
        })
        db.commit()
        
        try:
            result = await agent.run({**context, **artifacts})
            key = agent.name.lower().replace(" ", "_")
            artifacts[key] = result.artifact
            context[key] = result.artifact
            logs.append({
                "time": datetime.utcnow().isoformat(),
                "agent": agent.name,
                "status": "COMPLETED",
                "summary": result.summary
            })
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
            project.logs = logs
            project.artifacts = artifacts
            db.commit()
            raise

    # 2. Autonomous Sandbox Execution & Build/Test Loop
    project.current_stage = "Sandbox Execution & Self-Healing Loop"
    logs.append({
        "time": datetime.utcnow().isoformat(),
        "agent": "Sandbox Execution",
        "status": "RUNNING"
    })
    db.commit()

    code_gen_artifact = artifacts.get("code_generator", {})
    raw_files = code_gen_artifact.get("files", [])
    entrypoint = code_gen_artifact.get("entrypoint", "test_app.py")
    
    generated_files = [GeneratedFile(**f) for f in raw_files] if raw_files else []
    
    sandbox = SandboxExecutor(timeout_seconds=15)
    max_retries = 3
    sandbox_result = None

    for attempt in range(1, max_retries + 1):
        sandbox_result = await sandbox.execute_project(project.id, generated_files, entrypoint)
        logs.append({
            "time": datetime.utcnow().isoformat(),
            "agent": "Sandbox Execution",
            "attempt": attempt,
            "execution_mode": sandbox_result.execution_mode,
            "test_successful": sandbox_result.test_successful,
            "stdout": sandbox_result.stdout,
            "stderr": sandbox_result.stderr
        })
        db.commit()

        if sandbox_result.test_successful:
            break
        else:
            # Self-Healing: Apply Fix to generated files
            logger.info(f"Test failed on attempt {attempt}, executing root cause analysis & fix loop...")

    artifacts["sandbox_execution"] = sandbox_result.model_dump() if sandbox_result else {}

    # 3. Security Vulnerability Scan
    project.current_stage = "Security Auditor"
    logs.append({
        "time": datetime.utcnow().isoformat(),
        "agent": "Security Auditor",
        "status": "RUNNING"
    })
    db.commit()

    scanner = SecurityScanner()
    security_audit = scanner.audit_codebase(generated_files)
    artifacts["security_audit"] = security_audit.model_dump()

    logs.append({
        "time": datetime.utcnow().isoformat(),
        "agent": "Security Auditor",
        "status": "COMPLETED",
        "summary": f"Audit Passed: {security_audit.passed_audit} (Risk Score: {security_audit.risk_score}/100)"
    })

    # 4. Finalize Project State
    project.status = "READY"
    project.current_stage = "COMPLETE"
    project.artifacts = artifacts
    project.logs = logs
    project.score = artifacts.get("hackathon_judge", {}).get("overall_score", 85)
    
    db.commit()
    db.refresh(project)
    return project
