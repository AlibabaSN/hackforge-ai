from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from .models import WorkflowRecord, AutomationRecord

DEFAULT_WORKFLOWS = [
    {
        "name": "Full Autonomous 16-Stage Software Factory",
        "description": "End-to-end autonomous software lifecycle: Problem decomposition, research, data & ML modeling, code synthesis, sandbox execution, self-healing debugger, security audit, and hackathon evaluation.",
        "trigger_type": "PIPELINE",
        "status": "ACTIVE",
        "execution_count": 4,
        "stages": [
            "Problem Analyst", "Problem Decomposer", "Research Agent", 
            "Data Engineering Agent", "AI / ML Engineering Agent", "Solution Generator",
            "Solution Critic", "Solution Improver", "Architecture Designer",
            "Backend Engineering Agent", "Frontend Engineering Agent", "Code Generator",
            "Sandbox Execution & Tester", "Self-Healing Debug Agent", "Security Auditor Agent",
            "Hackathon Judge"
        ]
    },
    {
        "name": "Zero-Trust Security & Vulnerability Sweep",
        "description": "Continuous vulnerability scanning, AST pattern analysis, static secret egress detection, and OWASP compliance auditing for all synthesized codebases.",
        "trigger_type": "SCHEDULED",
        "status": "ACTIVE",
        "execution_count": 19,
        "stages": ["Code Scanner", "Secret Leak Detector", "Container Boundary Auditor", "Report Generator"]
    },
    {
        "name": "Local Hybrid LLM Benchmarking & Latency Sweep",
        "description": "Benchmarks local Ollama engine (Qwen, Gemma) against external inference providers for tokens-per-second, TTFT, and factual reasoning scores.",
        "trigger_type": "MANUAL",
        "status": "ACTIVE",
        "execution_count": 8,
        "stages": ["Model Ping", "Inference Benchmark", "Locality Policy Check", "Routing Matrix Update"]
    }
]

DEFAULT_AUTOMATIONS = [
    {
        "name": "Hourly Local Model Health & Ollama Daemon Check",
        "cron_expression": "0 * * * *",
        "agent_target": "System Health Monitor",
        "input_payload": {"ping_target": "http://localhost:11434/api/tags", "alert_on_fail": True},
        "is_enabled": True,
        "last_status": "SUCCESS"
    },
    {
        "name": "Nightly Database Integrity & Orphaned Artifact Pruning",
        "cron_expression": "0 2 * * *",
        "agent_target": "Database Maintenance Agent",
        "input_payload": {"vacuum": True, "clean_temp_logs": True},
        "is_enabled": True,
        "last_status": "SUCCESS"
    },
    {
        "name": "Continuous Zero-Trust Container Isolation Watchdog",
        "cron_expression": "*/15 * * * *",
        "agent_target": "Security Operations Agent",
        "input_payload": {"audit_cgroups": True, "kill_rogue_subprocesses": True},
        "is_enabled": True,
        "last_status": "SUCCESS"
    }
]

def seed_workflows_and_automations_if_empty(db: Session):
    if db.query(WorkflowRecord).count() == 0:
        for wf in DEFAULT_WORKFLOWS:
            record = WorkflowRecord(
                **wf,
                last_run_at=datetime.utcnow() - timedelta(minutes=15)
            )
            db.add(record)
        db.commit()

    if db.query(AutomationRecord).count() == 0:
        for auto in DEFAULT_AUTOMATIONS:
            rec = AutomationRecord(
                **auto,
                last_run_at=datetime.utcnow() - timedelta(minutes=30),
                next_run_at=datetime.utcnow() + timedelta(minutes=30)
            )
            db.add(rec)
        db.commit()

def get_all_workflows(db: Session) -> List[Dict[str, Any]]:
    seed_workflows_and_automations_if_empty(db)
    records = db.query(WorkflowRecord).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "description": r.description,
            "trigger_type": r.trigger_type,
            "stages": r.stages,
            "status": r.status,
            "execution_count": r.execution_count,
            "last_run_at": r.last_run_at.isoformat() if r.last_run_at else None,
            "created_at": r.created_at.isoformat()
        } for r in records
    ]

def get_all_automations(db: Session) -> List[Dict[str, Any]]:
    seed_workflows_and_automations_if_empty(db)
    records = db.query(AutomationRecord).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "cron_expression": r.cron_expression,
            "agent_target": r.agent_target,
            "input_payload": r.input_payload,
            "is_enabled": r.is_enabled,
            "last_status": r.last_status,
            "last_run_at": r.last_run_at.isoformat() if r.last_run_at else None,
            "next_run_at": r.next_run_at.isoformat() if r.next_run_at else None,
            "created_at": r.created_at.isoformat()
        } for r in records
    ]
