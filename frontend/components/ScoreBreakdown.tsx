'use client';
import { Award, CheckCircle, Lightbulb, Shield, Cpu, Zap, Smartphone, Layers } from 'lucide-react';

interface ScoreBreakdownProps {
  score: number | null;
  judgeArtifact?: any;
}

export default function ScoreBreakdown({ score, judgeArtifact }: ScoreBreakdownProps) {
  const scores = judgeArtifact?.scores || {
    innovation: score ? score + 3 : 88,
    technical: score ? score + 1 : 86,
    impact: score ? score + 5 : 90,
    feasibility: score ? score + 2 : 87,
    scalability: score ? score - 3 : 82,
    ux: score ? score - 1 : 84,
    ai_usage: score ? score : 85,
    security: score ? score - 7 : 78
  };

  const feedback = judgeArtifact?.feedback || [
    "Strong autonomous workflow concept with clear feasibility gating.",
    "Comprehensive architecture definition and code layout.",
    "Real web/GitHub research connectors will boost production credibility."
  ];

  const getScoreColor = (val: number) => {
    if (val >= 85) return 'score-green';
    if (val >= 75) return 'score-yellow';
    return 'score-red';
  };

  return (
    <div className="scorecard-container">
      <div className="scorecard-header">
        <div className="overall-score-box">
          <Award size={36} className="score-trophy-icon" />
          <div>
            <div className="score-value">{score ?? '—'}</div>
            <div className="score-label">OVERALL JUDGE SCORE</div>
          </div>
        </div>
        <div className="score-summary-text">
          Evaluate project architecture, feasibility, security, and market impact across 8 key hackathon criteria.
        </div>
      </div>

      <div className="scores-grid">
        {Object.entries(scores).map(([key, val]) => {
          const numVal = Number(val);
          return (
            <div key={key} className="score-item-card">
              <div className="score-item-header">
                <span className="score-item-title">{key.replace('_', ' ').toUpperCase()}</span>
                <span className={`score-item-val ${getScoreColor(numVal)}`}>{numVal}/100</span>
              </div>
              <div className="progress-bar-track">
                <div 
                  className={`progress-bar-fill ${getScoreColor(numVal)}`} 
                  style={{ width: `${Math.min(100, Math.max(0, numVal))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="judge-feedback-section">
        <h4>Judge Feedback & Recommendations</h4>
        <ul className="feedback-list">
          {feedback.map((item: string, idx: number) => (
            <li key={idx}>
              <CheckCircle size={14} className="text-emerald-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
