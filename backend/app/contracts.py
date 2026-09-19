from pydantic import BaseModel, Field
from typing import Any, List, Dict, Optional

class ProblemAnalystContract(BaseModel):
    problem_definition: str
    target_users: List[str]
    stakeholders: List[str]
    pain_points: List[str]
    root_causes: List[str]
    constraints: List[str]
    assumptions: List[str]
    expected_outcomes: List[str]
    success_metrics: List[str]
    complexity: int = Field(ge=1, le=10)
    confidence: float = Field(ge=0.0, le=1.0)

class DecomposerContract(BaseModel):
    business: List[str]
    technical: List[str]
    data: List[str]
    ai: List[str]
    ux: List[str]
    security: List[str]
    dependency_graph: List[str]

class ResearchCitation(BaseModel):
    source_title: str
    url_or_ref: str
    key_takeaway: str
    relevance_score: float = Field(ge=0.0, le=1.0)

class ResearchAgentContract(BaseModel):
    mode: str
    queries_executed: List[str]
    findings: List[str]
    citations: List[ResearchCitation]
    benchmarks: List[str]
    recommended_libraries: List[str]

class DataEngineeringContract(BaseModel):
    dataset_sources: List[str]
    preprocessing_steps: List[str]
    feature_engineering: List[str]
    validation_schema: List[str]
    data_quality_score: int = Field(ge=0, le=100)

class AIMLEngineeringContract(BaseModel):
    selected_model_architecture: str
    ml_framework: str
    hyperparameter_config: Dict[str, Any]
    evaluation_metrics: List[str]
    target_accuracy_f1: float

class SolutionCandidate(BaseModel):
    id: str
    name: str
    impact: int = Field(ge=1, le=10)
    complexity: int = Field(ge=1, le=10)
    cost: int = Field(ge=1, le=10)
    feasibility: int = Field(ge=1, le=10)
    rationale: str
    critic_score: Optional[float] = None
    flaws: Optional[List[str]] = None

class SolutionGeneratorContract(BaseModel):
    candidates: List[SolutionCandidate]

class SolutionCriticContract(BaseModel):
    selected_solution_id: str
    selected_solution_name: str
    overall_critic_score: float
    strengths: List[str]
    weaknesses: List[str]
    failure_modes: List[str]
    risk_mitigations: List[str]

class SolutionImprovementContract(BaseModel):
    enhanced_solution_name: str
    refined_architecture_summary: str
    mitigated_risks: List[str]
    performance_optimizations: List[str]

class ArchitectureDesignerContract(BaseModel):
    frontend_stack: str
    backend_stack: str
    database_stack: str
    execution_environment: str
    components: List[str]
    data_flow: List[str]
    api_endpoints: List[str]
    security_architecture: List[str]

class BackendEngineeringContract(BaseModel):
    controllers: List[str]
    orm_models: List[str]
    middleware: List[str]
    api_version: str

class FrontendEngineeringContract(BaseModel):
    component_tree: List[str]
    design_system: str
    state_management: str
    responsive_layout: List[str]

class EngineeringPlannerContract(BaseModel):
    data_pipeline_plan: List[str]
    ai_ml_plan: List[str]
    backend_plan: List[str]
    frontend_plan: List[str]
    code_layout: List[str]

class GeneratedFile(BaseModel):
    filepath: str
    content: str
    language: str

class CodeGeneratorContract(BaseModel):
    project_title: str
    files: List[GeneratedFile]
    entrypoint: str

class SandboxExecutionContract(BaseModel):
    execution_mode: str
    build_successful: bool
    test_successful: bool
    exit_code: int
    stdout: str
    stderr: str
    execution_time_seconds: float

class SelfHealingContract(BaseModel):
    root_cause_analysis: str
    files_patched: List[str]
    patch_summary: str
    retest_passed: bool

class SecurityIssue(BaseModel):
    severity: str
    category: str
    description: str
    filepath: str
    remediation: str

class SecurityAuditContract(BaseModel):
    passed_audit: bool
    risk_score: int
    issues_found: List[SecurityIssue]
    sanitization_status: str

class HackathonJudgeContract(BaseModel):
    scores: Dict[str, int]
    overall_score: int
    strengths: List[str]
    weaknesses: List[str]
    verdict: str
