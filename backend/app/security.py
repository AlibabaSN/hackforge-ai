import re
from typing import List
from .contracts import SecurityAuditContract, SecurityIssue, GeneratedFile

class SecurityScanner:
    """
    Automated security scanner for generated code artifacts.
    Checks for secret leaks, unsafe subprocess execution, and SQL injection risks.
    """
    SECRET_PATTERNS = [
        (r'sk-[a-zA-Z0-9]{32,}', 'Hardcoded OpenAI / API Secret Key'),
        (r'AKIA[0-9A-Z]{16}', 'Hardcoded AWS Access Key'),
        (r'ghp_[a-zA-Z0-9]{36}', 'Hardcoded GitHub Personal Access Token'),
        (r'Bearer\s+[a-zA-Z0-9\._\-]{30,}', 'Hardcoded OAuth/JWT Bearer Token')
    ]

    UNSAFE_CALL_PATTERNS = [
        (r'\beval\s*\(', 'Dangerous eval() statement execution'),
        (r'\bexec\s*\(', 'Dangerous exec() statement execution'),
        (r'shell\s*=\s*True', 'Unsafe subprocess call with shell=True'),
        (r'os\.system\s*\(', 'Unsanitized os.system() invocation')
    ]

    SQL_INJECTION_PATTERNS = [
        (r'f["\'].*SELECT.*\{.*\}', 'Potential SQL injection in f-string query'),
        (r'f["\'].*DELETE.*\{.*\}', 'Potential SQL injection in f-string query'),
        (r'f["\'].*UPDATE.*\{.*\}', 'Potential SQL injection in f-string query')
    ]

    def audit_codebase(self, files: List[GeneratedFile]) -> SecurityAuditContract:
        issues: List[SecurityIssue] = []

        for gf in files:
            content = gf.content
            filename = gf.filepath

            # 1. Check for Secrets
            for pattern, desc in self.SECRET_PATTERNS:
                if re.search(pattern, content):
                    issues.append(SecurityIssue(
                        severity="HIGH",
                        category="Secret Leakage",
                        description=desc,
                        filepath=filename,
                        remediation="Use environment variables (os.getenv) for sensitive credentials."
                    ))

            # 2. Check for Unsafe Execution
            for pattern, desc in self.UNSAFE_CALL_PATTERNS:
                if re.search(pattern, content):
                    issues.append(SecurityIssue(
                        severity="HIGH",
                        category="Unsafe Code Execution",
                        description=desc,
                        filepath=filename,
                        remediation="Avoid eval/exec/shell=True. Use shlex.split and explicit argument lists."
                    ))

            # 3. Check for SQL Injection
            for pattern, desc in self.SQL_INJECTION_PATTERNS:
                if re.search(pattern, content):
                    issues.append(SecurityIssue(
                        severity="MEDIUM",
                        category="SQL Injection Vulnerability",
                        description=desc,
                        filepath=filename,
                        remediation="Use parameterized queries or SQLAlchemy ORM bind parameters."
                    ))

        high_count = sum(1 for i in issues if i.severity == "HIGH")
        med_count = sum(1 for i in issues if i.severity == "MEDIUM")
        risk_score = min(100, high_count * 30 + med_count * 15)
        passed = (high_count == 0)

        return SecurityAuditContract(
            passed_audit=passed,
            risk_score=risk_score,
            issues_found=issues,
            sanitization_status="CLEAN" if passed else "SECURITY_VIOLATIONS_FOUND"
        )
