from pydantic import BaseModel, Field, EmailStr
from typing import Any, List, Optional
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=2, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    avatar_url: str | None = None
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class LLMConfigUpdate(BaseModel):
    base_url: Optional[str] = None
    api_key: Optional[str] = None
    model_name: Optional[str] = None

class ProjectCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    problem_statement: str = Field(min_length=10)

class ProjectOut(BaseModel):
    id: int
    user_id: int | None = None
    title: str
    problem_statement: str
    status: str
    current_stage: str
    artifacts: dict[str, Any]
    logs: list[Any] = []
    score: int | None
    created_at: datetime | None = None

class RunResponse(BaseModel):
    id: int
    user_id: int | None = None
    title: str
    problem_statement: str
    status: str
    current_stage: str
    artifacts: dict[str, Any]
    logs: list[Any] = []
    score: int | None
