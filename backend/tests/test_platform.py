import pytest
import asyncio
from app.contracts import ProblemAnalystContract, GeneratedFile
from app.llm import LLMProvider
from app.sandbox import SandboxExecutor
from app.security import SecurityScanner
from app.research import ResearchEngine

def test_pydantic_contracts():
    contract = ProblemAnalystContract(
        problem_definition="Test Problem Statement",
        target_users=["Developers"],
        stakeholders=["Team"],
        pain_points=["Bugs"],
        root_causes=["Lack of testing"],
        constraints=["Time"],
        assumptions=["Python environment"],
        expected_outcomes=["Working code"],
        success_metrics=["Passes tests"],
        complexity=5,
        confidence=0.9
    )
    assert contract.complexity == 5
    assert contract.confidence == 0.9

def test_security_scanner():
    scanner = SecurityScanner()
    vulnerable_files = [
        GeneratedFile(
            filepath="app.py",
            language="python",
            content="API_KEY = 'sk-12345678901234567890123456789012'\neval('1+1')"
        )
    ]
    audit = scanner.audit_codebase(vulnerable_files)
    assert audit.passed_audit is False
    assert len(audit.issues_found) == 2
    assert audit.risk_score >= 60

def test_clean_security_scan():
    scanner = SecurityScanner()
    clean_files = [
        GeneratedFile(
            filepath="main.py",
            language="python",
            content="import os\nkey = os.getenv('API_KEY')"
        )
    ]
    audit = scanner.audit_codebase(clean_files)
    assert audit.passed_audit is True
    assert len(audit.issues_found) == 0

@pytest.mark.asyncio
async def test_sandbox_execution():
    sandbox = SandboxExecutor(timeout_seconds=5)
    files = [
        GeneratedFile(
            filepath="test_main.py",
            language="python",
            content="import unittest\nclass T(unittest.TestCase):\n def test_ok(self):\n  self.assertTrue(True)\nif __name__=='__main__':\n unittest.main()\n"
        )
    ]
    result = await sandbox.execute_project(999, files, "test_main.py")
    assert result.build_successful is True
    assert result.test_successful is True
    assert result.exit_code == 0

@pytest.mark.asyncio
async def test_research_engine():
    engine = ResearchEngine()
    res = await engine.discover_evidence("Hazard Detection")
    assert len(res.citations) > 0
    assert len(res.benchmarks) > 0
