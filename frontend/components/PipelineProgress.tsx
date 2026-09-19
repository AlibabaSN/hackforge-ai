'use client';
import { CheckCircle2, Loader2, Circle, AlertCircle } from 'lucide-react';

interface PipelineProgressProps {
  stages: string[];
  currentStage: string;
  status: string;
}

export default function PipelineProgress({ stages, currentStage, status }: PipelineProgressProps) {
  const currentIndex = stages.indexOf(currentStage);

  return (
    <div className="pipeline-container">
      <div className="pipeline-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {stages.map((stage, idx) => {
          let state: 'done' | 'running' | 'queued' | 'failed' = 'queued';
          
          if (status === 'READY') {
            state = 'done';
          } else if (status === 'FAILED') {
            state = idx <= currentIndex ? (idx === currentIndex ? 'failed' : 'done') : 'queued';
          } else if (status === 'RUNNING' || status === 'QUEUED') {
            if (idx < currentIndex) state = 'done';
            else if (idx === currentIndex) state = 'running';
            else state = 'queued';
          }

          return (
            <div 
              key={stage} 
              className={`pipeline-step ${state}`} 
              style={{ 
                padding: '10px 12px',
                transform: state === 'running' ? 'translateZ(15px) scale(1.02)' : 'translateZ(0px)',
                boxShadow: state === 'running' ? '0 8px 24px rgba(245, 158, 11, 0.3)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <div className="step-status-icon">
                {state === 'done' && <CheckCircle2 className="icon-done" size={16} />}
                {state === 'running' && <Loader2 className="icon-running spin" size={16} />}
                {state === 'failed' && <AlertCircle className="icon-failed" size={16} />}
                {state === 'queued' && <Circle className="icon-queued" size={16} />}
              </div>
              <div className="step-info" style={{ overflow: 'hidden' }}>
                <span className="step-index">Phase {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                <span className="step-name" style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {stage}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
