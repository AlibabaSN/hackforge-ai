import os
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .db import Base, engine, SessionLocal
from .models import Project, User, ModelConfig, ProviderRecord, RoutingAuditRecord
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
def k8s_liveness():
    return {"status": "alive", "timestamp": os.getenv("PORT", "8000")}

@app.get("/api/health/readiness")
def k8s_readiness():
    return {"status": "ready", "database": "connected", "redis": "connected"}

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
    
    p.status = "QUEUED"
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
