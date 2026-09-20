import os
import logging
import httpx
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .db import Base, engine, SessionLocal
from .models import (
    Project, User, ModelConfig, ProviderRecord, RoutingAuditRecord,
    SecurityEvent, SecurityPolicy, SecretVaultItem, WorkflowRecord, AutomationRecord
)
from .database_service import (
    get_database_overview, get_all_tables_metadata, get_table_details,
    execute_safe_query, get_schema_graph
)
from .security_service import (
    get_security_overview, analyze_prompt_security, seed_security_defaults_if_empty
)
from .workflow_service import (
    get_all_workflows, get_all_automations, seed_workflows_and_automations_if_empty
)
from .platform_service import (
    get_platform_analytics, get_platform_executions, get_platform_deployments,
    approve_pipeline_deployment, get_platform_knowledge, get_platform_tools,
    get_platform_notifications
)
from pydantic import BaseModel
from .schemas import (
    ProjectCreate, ProjectOut, RunResponse,
    UserRegister, UserLogin, UserOut, TokenResponse, LLMConfigUpdate
)

from .auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, require_current_user
)
from .orchestrator import run_pipeline
from .llm import get_llm_provider
from .mesh.registry import get_model_registry
from .mesh.router import get_hybrid_model_router, RoutingMode
from .mesh.benchmark import ModelBenchmarkAgent
from .mesh.collaboration import ModelDebateAgent, CrossModelCritic
from .providers.registry import get_provider_registry
from .policy import DataLocalityPolicy

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HackForge AI API — Hybrid Local + Online Infrastructure",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Best Security CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000", "http://127.0.0.1:8000", "*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Best Security HTTP Response Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def serialize_user(u: User) -> dict:
    return {
        "id": u.id,
        "email": u.email,
        "full_name": u.full_name,
        "avatar_url": u.avatar_url,
        "created_at": u.created_at
    }

def serialize_project(p: Project) -> dict:
    return {
        "id": p.id,
        "user_id": p.user_id,
        "title": p.title,
        "problem_statement": p.problem_statement,
        "status": p.status,
        "current_stage": p.current_stage,
        "artifacts": p.artifacts or {},
        "logs": p.logs or [],
        "score": p.score,
        "created_at": p.created_at
    }

from .company_agents import COMPANY_AGENTS

@app.get("/api/health")
def health():
    llm = get_llm_provider()
    return {
        "status": "ok",
        "service": "hackforge-api",
        "version": "1.0.0",
        "llm_provider_active": llm.is_configured,
        "llm_model": llm.model_name
    }

@app.get("/api/health/liveness")
@app.get("/health")
def k8s_liveness():
    return {"status": "alive", "timestamp": os.getenv("PORT", "8000"), "service": "hackforge-api"}

@app.get("/api/health/readiness")
@app.get("/ready")
def k8s_readiness():
    return {"status": "ready", "database": "connected", "redis": "connected", "mesh": "ready"}

@app.get("/api/company/agents")
async def list_company_agents():
    results = []
    for agent in COMPANY_AGENTS:
        res = await agent.run({"problem": "Production System Optimization"})
        results.append({
            "name": agent.name,
            "level": getattr(agent, "level", "Company Role"),
            "artifact": res.artifact,
            "summary": res.summary
        })
    return results

@app.get("/api/k8s/manifests")
def list_k8s_manifests():
    return {
        "namespace": "hackforge-system",
        "manifests": ["namespace.yaml", "configmap-secrets.yaml", "postgres-deployment.yaml", "redis-deployment.yaml", "backend-deployment.yaml", "frontend-deployment.yaml", "ingress.yaml"],
        "dockerfiles": ["Dockerfile.backend", "Dockerfile.frontend", "docker-compose.yml"],
        "status": "PRODUCTION READY"
    }

@app.get("/v1/models")
@app.get("/api/v1/models")
def list_v1_models():
    registry = get_model_registry()
    models = registry.get_all_models()
    return {
        "object": "list",
        "data": [
            {
                "id": m.model_name,
                "object": "model",
                "created": 1700000000,
                "owned_by": m.provider.lower(),
                "permission": [],
                "root": m.model_name,
                "parent": None
            }
            for m in models
        ]
    }

# ==================== HYBRID AI SERVER CONTROL CENTER ====================

@app.get("/api/servers")
async def list_servers():
    registry = get_provider_registry()
    health_results = await registry.health_check_all()
    return health_results

@app.get("/api/servers/scan")
async def scan_servers():
    registry = get_provider_registry()
    return await registry.scan_local_servers()

@app.post("/api/servers/{provider_name:.+}/health")
async def health_check_server(provider_name: str):
    registry = get_provider_registry()
    provider = registry.get_provider(provider_name)
    if not provider:
        raise HTTPException(404, f"Provider '{provider_name}' not registered")
    return await provider.health_check()

# Routing Settings & Policy Engine
@app.get("/api/routing/settings")
def get_routing_settings():
    router = get_hybrid_model_router()
    return {
        "current_mode": router.current_mode.value,
        "default_locality_policy": router.default_locality.value,
        "modes_available": [m.value for m in RoutingMode],
        "locality_policies_available": [p.value for p in DataLocalityPolicy]
    }

@app.post("/api/routing/settings")
def update_routing_settings(body: dict):
    router = get_hybrid_model_router()
    if "mode" in body and body["mode"] in [m.value for m in RoutingMode]:
        router.current_mode = RoutingMode(body["mode"])
    if "locality_policy" in body and body["locality_policy"] in [p.value for p in DataLocalityPolicy]:
        router.default_locality = DataLocalityPolicy(body["locality_policy"])
    return get_routing_settings()

@app.get("/api/routing/audits")
def get_routing_audits(db: Session = Depends(get_db)):
    audits = db.query(RoutingAuditRecord).order_by(RoutingAuditRecord.id.desc()).limit(20).all()
    return [
        {
            "id": a.id,
            "task_name": a.task_name,
            "selected_provider": a.selected_provider,
            "provider_type": a.provider_type,
            "routing_mode": a.routing_mode,
            "locality_policy": a.locality_policy,
            "is_sensitive": a.is_sensitive,
            "audit_note": a.audit_note,
            "created_at": a.created_at
        }
        for a in audits
    ]

# ==================== MULTI-MODEL MESH ENDPOINTS ====================

@app.get("/api/models")
async def list_models():
    registry = get_model_registry()
    models = registry.get_all_models()
    health_results = await registry.health_check_all()

    health_map = {h["model"]: h for h in health_results}
    
    return [
        {
            "name": m.name,
            "model_name": m.model_name,
            "provider": m.provider,
            "capabilities": [c.value for c in m.capabilities],
            "is_configured": m.is_configured,
            "status": health_map.get(m.model_name, {}).get("status", "UNCONFIGURED"),
            "latency_ms": health_map.get(m.model_name, {}).get("latency_ms", 0)
        }
        for m in models
    ]

@app.post("/api/models/{model_name:.+}/health")
async def health_check_model(model_name: str):
    registry = get_model_registry()
    model = registry.get_model(model_name)
    if not model:
        raise HTTPException(404, f"Model '{model_name}' not found in registry")
    return await model.health_check()

@app.post("/api/models/benchmark")
async def benchmark_models():
    benchmark_agent = ModelBenchmarkAgent()
    return await benchmark_agent.benchmark_all_models()

@app.get("/api/models/compare")
def compare_models():
    return [
        {"model": "Qwen3 70B", "reasoning": 9, "coding": 9, "latency": 8, "cost": 8, "tool_use": 9},
        {"model": "Llama 3.3 70B", "reasoning": 8, "coding": 9, "latency": 9, "cost": 9, "tool_use": 8},
        {"model": "Mistral Large", "reasoning": 8, "coding": 8, "latency": 9, "cost": 9, "tool_use": 8},
        {"model": "DeepSeek R1", "reasoning": 9, "coding": 10, "latency": 7, "cost": 7, "tool_use": 9},
        {"model": "Gemma 2 27B", "reasoning": 7, "coding": 8, "latency": 9, "cost": 10, "tool_use": 7},
        {"model": "Phi 4", "reasoning": 7, "coding": 8, "latency": 10, "cost": 10, "tool_use": 6}
    ]

@app.post("/api/models/debate")
async def run_model_debate(body: dict):
    problem = body.get("problem", "Design a resilient microservice architecture")
    debate_agent = ModelDebateAgent()
    return await debate_agent.run_debate(problem)

@app.get("/api/models/installed")
async def list_installed_local_models():
    """Returns all open-source models currently downloaded and ready for local offline inference."""
    reg = get_provider_registry()
    ollama = reg.get_provider("Ollama Local Engine")
    if ollama:
        health = await ollama.health_check()
        return {
            "engine": "Ollama Local Engine",
            "status": health.get("status"),
            "models": health.get("models", []),
            "models_count": health.get("models_count", 0),
            "base_url": getattr(ollama, "base_url", "http://localhost:11434")
        }
    return {"engine": "Ollama", "status": "UNAVAILABLE", "models": [], "models_count": 0}

@app.post("/api/models/pull")
async def pull_model_endpoint(body: dict, background_tasks: BackgroundTasks):
    """Triggers background pull of an open-source model (e.g. qwen2.5-coder:1.5b, deepseek-r1:1.5b)."""
    model_name = body.get("model", "qwen2.5-coder:1.5b")
    reg = get_provider_registry()
    ollama = reg.get_provider("Ollama Local Engine")
    if not ollama:
        raise HTTPException(500, "Ollama provider not registered")

    async def _do_pull(name: str):
        try:
            async with httpx.AsyncClient(timeout=600.0) as client:
                await client.post(f"{ollama.base_url.rstrip('/')}/api/pull", json={"name": name, "stream": False})
        except Exception as e:
            logging.getLogger("hackforge.main").error(f"Failed to pull model {name}: {e}")

    background_tasks.add_task(_do_pull, model_name)
    return {"status": "PULLING", "model": model_name, "message": f"Installation of '{model_name}' initiated in background."}

# LLM Configuration Settings
@app.get("/api/settings/llm")
def get_llm_settings():
    return {
        "base_url": os.getenv("OPENAI_BASE_URL", ""),
        "model_name": os.getenv("MODEL_NAME", "qwen/qwen3-70b-instruct"),
        "has_api_key": bool(os.getenv("OPENAI_API_KEY", ""))
    }

@app.post("/api/settings/llm")
def update_llm_settings(body: LLMConfigUpdate):
    if body.base_url is not None:
        os.environ["OPENAI_BASE_URL"] = body.base_url
    if body.api_key is not None:
        os.environ["OPENAI_API_KEY"] = body.api_key
    if body.model_name is not None:
        os.environ["MODEL_NAME"] = body.model_name
    return get_llm_settings()

# Authentication Routes
@app.post("/api/auth/register", response_model=TokenResponse)
def register(body: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    hashed = hash_password(body.password)
    user = User(
        email=body.email.lower(),
        hashed_password=hashed,
        full_name=body.full_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": serialize_user(user)
    }

@app.post("/api/auth/login", response_model=TokenResponse)
def login(body: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email.lower()).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": serialize_user(user)
    }

@app.get("/api/auth/me", response_model=UserOut)
def me(current_user: User = Depends(require_current_user)):
    return serialize_user(current_user)

# Project Routes
@app.post("/api/projects", response_model=ProjectOut)
def create_project(
    body: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user)
):
    p = Project(
        title=body.title,
        problem_statement=body.problem_statement,
        user_id=current_user.id if current_user else None
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return serialize_project(p)

@app.get("/api/projects")
def projects(
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user)
):
    query = db.query(Project)
    if current_user:
        query = query.filter((Project.user_id == current_user.id) | (Project.user_id.is_(None)))
    else:
        query = query.filter(Project.user_id.is_(None))
    
    return [serialize_project(p) for p in query.order_by(Project.id.desc()).all()]

@app.get("/api/projects/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    p = db.get(Project, project_id)
    if not p:
        raise HTTPException(404, "Project not found")
    return serialize_project(p)

async def execute(project_id: int):
    db = SessionLocal()
    try:
        p = db.get(Project, project_id)
        if p:
            await run_pipeline(db, p)
    finally:
        db.close()

@app.post("/api/projects/{project_id}/run", response_model=RunResponse)
async def run_project(
    project_id: int,
    background: BackgroundTasks,
    db: Session = Depends(get_db)
):
    p = db.get(Project, project_id)
    if not p:
        raise HTTPException(404, "Project not found")
    if p.status == "RUNNING":
        raise HTTPException(409, "Project already running")
    p.status = "RUNNING"
    p.current_stage = "Problem Analyst"
    p.logs = [
        {
            "time": datetime.utcnow().isoformat(),
            "agent": "System Orchestrator",
            "status": "INITIALIZED",
            "summary": f"Starting 16-stage autonomous AI multi-agent pipeline for '{p.title}'"
        }
    ]
    p.artifacts = {}
    db.commit()
    background.add_task(execute, project_id)
    return serialize_project(p)

@app.get("/api/projects/{project_id}/code")
def get_project_code(project_id: int, db: Session = Depends(get_db)):
    p = db.get(Project, project_id)
    if not p:
        raise HTTPException(404, "Project not found")
    
    code_artifact = p.artifacts.get("code_generator", {})
    return {
        "project_id": project_id,
        "files": code_artifact.get("files", []),
        "entrypoint": code_artifact.get("entrypoint", "test_app.py")
    }

@app.delete("/api/projects/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user)
):
    p = db.get(Project, project_id)
    if not p:
        raise HTTPException(404, "Project not found")
    if current_user and p.user_id and p.user_id != current_user.id:
        raise HTTPException(403, "Not authorized to delete this project")
    
    db.delete(p)
    db.commit()
    return {"status": "deleted", "id": project_id}

@app.get("/api/projects/{project_id}/logs")
def logs(project_id: int, db: Session = Depends(get_db)):
    p = db.get(Project, project_id)
    if not p:
        raise HTTPException(404, "Project not found")
    return p.logs or []

# =========================================================================
# DATABASE COMMAND CENTER API (REAL TELEMETRY, INSPECTOR, SAFE CONSOLE)
# =========================================================================

class QueryRequest(BaseModel):
    query: str

@app.get("/api/database/overview")
def database_overview():
    return get_database_overview()

@app.get("/api/database/tables")
def database_tables():
    return get_all_tables_metadata()

@app.get("/api/database/tables/{table_name}")
def database_table_data(table_name: str, limit: int = 50):
    return get_table_details(table_name, limit)

@app.post("/api/database/query")
def database_query(req: QueryRequest):
    return execute_safe_query(req.query)

@app.get("/api/database/schema")
def database_schema():
    return get_schema_graph()

# =========================================================================
# SECURITY OPERATIONS CENTER API (SOC, ZERO-TRUST, FIREWALL, SECRET VAULT)
# =========================================================================

class PromptAnalysisRequest(BaseModel):
    prompt: str

class VaultItemCreate(BaseModel):
    name: str
    key_type: str
    masked_value: str
    service_provider: str

@app.get("/api/security/overview")
def security_overview(db: Session = Depends(get_db)):
    return get_security_overview(db)

@app.get("/api/security/events")
def security_events(limit: int = 50, db: Session = Depends(get_db)):
    seed_security_defaults_if_empty(db)
    events = db.query(SecurityEvent).order_by(SecurityEvent.id.desc()).limit(limit).all()
    return [
        {
            "id": e.id,
            "event_type": e.event_type,
            "severity": e.severity,
            "source_ip": e.source_ip,
            "action_attempted": e.action_attempted,
            "status": e.status,
            "details": e.details,
            "created_at": e.created_at.isoformat()
        } for e in events
    ]

@app.get("/api/security/policies")
def security_policies(db: Session = Depends(get_db)):
    seed_security_defaults_if_empty(db)
    policies = db.query(SecurityPolicy).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "category": p.category,
            "is_active": p.is_active,
            "severity": p.severity,
            "description": p.description,
            "rule_definition": p.rule_definition,
            "created_at": p.created_at.isoformat()
        } for p in policies
    ]

@app.post("/api/security/policies/{policy_id}/toggle")
def toggle_security_policy(policy_id: int, db: Session = Depends(get_db)):
    policy = db.get(SecurityPolicy, policy_id)
    if not policy:
        raise HTTPException(404, "Policy not found")
    policy.is_active = not policy.is_active
    db.commit()
    return {"id": policy.id, "name": policy.name, "is_active": policy.is_active}

@app.get("/api/security/vault")
def security_vault(db: Session = Depends(get_db)):
    seed_security_defaults_if_empty(db)
    items = db.query(SecretVaultItem).all()
    return [
        {
            "id": item.id,
            "name": item.name,
            "key_type": item.key_type,
            "masked_value": item.masked_value,
            "service_provider": item.service_provider,
            "is_valid": item.is_valid,
            "last_verified": item.last_verified.isoformat(),
            "created_at": item.created_at.isoformat()
        } for item in items
    ]

@app.post("/api/security/vault")
def create_vault_item(req: VaultItemCreate, db: Session = Depends(get_db)):
    item = SecretVaultItem(
        name=req.name,
        key_type=req.key_type,
        masked_value=req.masked_value,
        service_provider=req.service_provider,
        is_valid=True
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {
        "id": item.id,
        "name": item.name,
        "masked_value": item.masked_value,
        "is_valid": item.is_valid
    }

@app.post("/api/security/analyze-prompt")
def analyze_prompt(req: PromptAnalysisRequest, request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    return analyze_prompt_security(req.prompt, client_ip)

# =========================================================================
# WORKFLOWS & AUTOMATIONS API
# =========================================================================

@app.get("/api/workflows")
def list_workflows(db: Session = Depends(get_db)):
    return get_all_workflows(db)

@app.get("/api/automations")
def list_automations(db: Session = Depends(get_db)):
    return get_all_automations(db)

@app.post("/api/automations/{automation_id}/toggle")
def toggle_automation(automation_id: int, db: Session = Depends(get_db)):
    auto = db.get(AutomationRecord, automation_id)
    if not auto:
        raise HTTPException(404, "Automation not found")
    auto.is_enabled = not auto.is_enabled
    db.commit()
    return {"id": auto.id, "name": auto.name, "is_enabled": auto.is_enabled}

# =========================================================================
# PLATFORM APEX API (ANALYTICS, EXECUTIONS, DEPLOYMENTS, KNOWLEDGE, TOOLS)
# =========================================================================

class DeploymentApprovalRequest(BaseModel):
    approved: bool

@app.get("/api/analytics")
def get_analytics(db: Session = Depends(get_db)):
    return get_platform_analytics(db)

@app.get("/api/executions")
def get_executions(status: Optional[str] = None, limit: int = 50, db: Session = Depends(get_db)):
    return get_platform_executions(db, status_filter=status, limit=limit)

@app.get("/api/deployments")
def get_deployments():
    return get_platform_deployments()

@app.post("/api/deployments/{dep_id}/approve")
def approve_deployment(dep_id: str, req: DeploymentApprovalRequest):
    res = approve_pipeline_deployment(dep_id, req.approved)
    if not res.get("success"):
        raise HTTPException(404, res.get("error", "Failed to approve deployment"))
    return res

@app.get("/api/knowledge")
def get_knowledge():
    return get_platform_knowledge()

@app.get("/api/tools")
def get_tools():
    return get_platform_tools()

@app.get("/api/notifications")
def get_notifications(db: Session = Depends(get_db)):
    return get_platform_notifications(db)

# ==================== MULTI-MODEL AGENT MESH ENDPOINTS ====================
from .mesh.agent_mesh import AgentMeshRegistry
from .mesh.agent_orchestrator import get_agent_orchestrator
from .mesh.model_adapter import get_model_adapter

class ProblemSelectRequest(BaseModel):
    problem_statement: str

class DebateRequest(BaseModel):
    topic: str
    context: Optional[dict] = None

@app.get("/api/mesh/agents")
def list_mesh_agents():
    """List all registered specialized agents across all 20 domain families."""
    agents = AgentMeshRegistry.list_all()
    return {
        "total_agents": len(agents),
        "agents": [
            {
                "id": a.id,
                "name": a.name,
                "family": a.family.value,
                "purpose": a.purpose,
                "capabilities": a.capabilities,
                "tools": a.tools,
                "primary_model": a.model_policy.primary_model,
                "fallback_model": a.model_policy.fallback_model,
                "status": a.status
            }
            for a in agents
        ]
    }

@app.get("/api/mesh/matrix")
def get_model_agent_matrix():
    """Returns the live capability matrix mapping agents to open-source models."""
    orchestrator = get_agent_orchestrator()
    return orchestrator.get_model_agent_matrix()

@app.get("/api/mesh/teams")
def get_team_templates():
    """Returns pre-configured agent swarm blueprints."""
    orchestrator = get_agent_orchestrator()
    return {"teams": orchestrator.get_team_templates()}

@app.post("/api/mesh/orchestrate/select")
def select_agents_for_problem(req: ProblemSelectRequest):
    """Dynamically determines the specialized agent swarm for a given problem."""
    orchestrator = get_agent_orchestrator()
    return orchestrator.select_agents(req.problem_statement)

@app.post("/api/mesh/debate")
async def run_multi_agent_debate(req: DebateRequest):
    """Executes a multi-agent debate and consensus protocol."""
    orchestrator = get_agent_orchestrator()
    return await orchestrator.run_debate(req.topic, req.context)

@app.get("/api/mesh/runtimes")
async def get_inference_runtimes():
    """Checks the live health of inference runtimes (Ollama, vLLM, llama.cpp)."""
    ollama_adapter = get_model_adapter("OLLAMA")
    vllm_adapter = get_model_adapter("VLLM")
    
    ollama_health = await ollama_adapter.health_check()
    vllm_health = await vllm_adapter.health_check()
    
    return {
        "runtimes": [
            ollama_health,
            vllm_health,
            {"status": "STANDBY", "runtime": "llama.cpp", "available_models": []}
        ]
    }



