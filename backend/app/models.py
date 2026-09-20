from datetime import datetime
from sqlalchemy import String, Text, DateTime, Integer, JSON, ForeignKey, Boolean, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .db import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(100))
    avatar_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    projects: Mapped[list["Project"]] = relationship("Project", back_populates="user", cascade="all, delete-orphan")

class Project(Base):
    __tablename__ = "projects"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(200))
    problem_statement: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(50), default="CREATED")
    current_stage: Mapped[str] = mapped_column(String(80), default="created")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    artifacts: Mapped[dict] = mapped_column(JSON, default=dict)
    logs: Mapped[list] = mapped_column(JSON, default=list)
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)

    user: Mapped[User | None] = relationship("User", back_populates="projects")

class ModelConfig(Base):
    __tablename__ = "model_configs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    model_name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    provider: Mapped[str] = mapped_column(String(100))
    base_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    api_key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    capabilities: Mapped[list] = mapped_column(JSON, default=list)
    benchmark_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class ProviderRecord(Base):
    __tablename__ = "provider_records"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    provider_type: Mapped[str] = mapped_column(String(50)) # LOCAL, REMOTE, ONLINE, OPENAI_COMPATIBLE, CUSTOM
    base_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    api_key_set: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(50), default="UNAVAILABLE") # ONLINE, DEGRADED, UNAVAILABLE, AUTH_ERROR
    latency_ms: Mapped[float] = mapped_column(Float, default=0.0)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    models: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class RoutingAuditRecord(Base):
    __tablename__ = "routing_audits"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    task_name: Mapped[str] = mapped_column(String(100))
    selected_provider: Mapped[str] = mapped_column(String(100))
    provider_type: Mapped[str] = mapped_column(String(50))
    routing_mode: Mapped[str] = mapped_column(String(50))
    locality_policy: Mapped[str] = mapped_column(String(50))
    is_sensitive: Mapped[bool] = mapped_column(Boolean, default=False)
    audit_note: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class SecurityEvent(Base):
    __tablename__ = "security_events"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    event_type: Mapped[str] = mapped_column(String(80), index=True) # PROMPT_INJECTION, TOOL_EXECUTION_BLOCKED, AUTH_FAILURE, ZERO_TRUST_VIOLATION, EGRESS_CHECK
    severity: Mapped[str] = mapped_column(String(20), default="LOW") # INFO, LOW, MEDIUM, HIGH, CRITICAL
    source_ip: Mapped[str | None] = mapped_column(String(50), nullable=True, default="127.0.0.1")
    user_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    action_attempted: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(30), default="BLOCKED") # BLOCKED, DETECTED, ALLOWED
    details: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

class SecurityPolicy(Base):
    __tablename__ = "security_policies"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)
    category: Mapped[str] = mapped_column(String(60)) # ZERO_TRUST, TOOL_EXECUTION, DATA_LOCALITY, NETWORK_EGRESS, PROMPT_INJECTION
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    severity: Mapped[str] = mapped_column(String(20), default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    description: Mapped[str] = mapped_column(Text)
    rule_definition: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class SecretVaultItem(Base):
    __tablename__ = "secret_vault_items"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    key_type: Mapped[str] = mapped_column(String(50)) # API_KEY, OAUTH_TOKEN, DATABASE_URL, SSH_KEY
    masked_value: Mapped[str] = mapped_column(String(120)) # e.g. "sk-...9a4f"
    service_provider: Mapped[str] = mapped_column(String(80)) # OpenAI, Anthropic, Ollama, HuggingFace, Supabase
    is_valid: Mapped[bool] = mapped_column(Boolean, default=True)
    last_verified: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class WorkflowRecord(Base):
    __tablename__ = "workflows"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)
    description: Mapped[str] = mapped_column(Text)
    trigger_type: Mapped[str] = mapped_column(String(50), default="MANUAL") # MANUAL, WEBHOOK, SCHEDULED, PIPELINE
    stages: Mapped[list] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE") # ACTIVE, PAUSED, DRAFT
    execution_count: Mapped[int] = mapped_column(Integer, default=0)
    last_run_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class AutomationRecord(Base):
    __tablename__ = "automations"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)
    cron_expression: Mapped[str] = mapped_column(String(60), default="0 * * * *")
    agent_target: Mapped[str] = mapped_column(String(80))
    input_payload: Mapped[dict] = mapped_column(JSON, default=dict)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    last_status: Mapped[str] = mapped_column(String(40), default="IDLE") # IDLE, SUCCESS, FAILED, RUNNING
    last_run_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    next_run_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

