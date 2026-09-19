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
