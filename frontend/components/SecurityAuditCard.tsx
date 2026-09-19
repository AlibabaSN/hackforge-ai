'use client';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, Lock } from 'lucide-react';

interface SecurityIssue {
  severity: string;
  category: string;
  description: string;
  filepath: string;
  remediation: string;
}

interface SecurityAuditCardProps {
  audit?: {
    passed_audit: boolean;
    risk_score: number;
    issues_found: SecurityIssue[];
    sanitization_status: string;
  };
}

export default function SecurityAuditCard({ audit }: SecurityAuditCardProps) {
  if (!audit) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 32 }}>
        <Lock size={32} className="muted" />
        <p className="muted" style={{ marginTop: 12 }}>
          Security Auditor scanner executes automatically after Sandbox Build stage.
        </p>
      </div>
    );
  }

  const passed = audit.passed_audit;

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="auth-icon-badge" style={{ margin: 0, width: 44, height: 44, background: passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
            {passed ? <ShieldCheck size={24} className="text-emerald-400" /> : <ShieldAlert size={24} className="text-rose-400" />}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Security Audit Scanner</div>
            <div className="muted" style={{ fontSize: 12 }}>
              Status: <span className={passed ? 'score-green' : 'score-red'}>{audit.sanitization_status}</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: passed ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
            {audit.risk_score}/100
          </div>
          <div className="muted" style={{ fontSize: 10, fontWeight: 700 }}>RISK SCORE</div>
        </div>
      </div>

      {audit.issues_found.length === 0 ? (
        <div className="auth-error-banner" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--accent-emerald)', color: 'var(--accent-emerald)' }}>
          <CheckCircle size={16} /> Zero security vulnerabilities or hardcoded secrets detected in generated code!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {audit.issues_found.map((issue, idx) => (
            <div key={idx} style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: issue.severity === 'HIGH' ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>
                  [{issue.severity}] {issue.category}
                </span>
                <span className="muted" style={{ fontSize: 11 }}>{issue.filepath}</span>
              </div>
              <div style={{ fontSize: 13, marginBottom: 6 }}>{issue.description}</div>
              <div className="muted" style={{ fontSize: 11 }}>Remediation: {issue.remediation}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
