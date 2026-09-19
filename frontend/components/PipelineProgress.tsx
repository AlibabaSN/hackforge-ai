'use client';
import { CheckCircle2, Loader2, Circle, AlertCircle } from 'lucide-react';

interface PipelineProgressProps {
  stages: string[];
  currentStage: string;
  status: string;
  onSelectStage?: (stage: string) => void;
  selectedStage?: string;
}

export default function PipelineProgress({ stages, currentStage, status, onSelectStage, selectedStage }: PipelineProgressProps) {
  const currentIndex = stages.indexOf(currentStage);

  return (
    <div className="pipeline-container">
      <div className="pipeline-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
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

          const isSelected = selectedStage === stage;

          return (
            <div 
              key={stage} 
              onClick={() => onSelectStage && onSelectStage(stage)}
              className={`pipeline-step ${state} ${isSelected ? 'ring-2 ring-cyan-400 bg-cyan-950/40' : ''}`} 
              style={{ 
                padding: '10px 12px',
                cursor: onSelectStage ? 'pointer' : 'default',
                transform: state === 'running' ? 'translateZ(15px) scale(1.03)' : isSelected ? 'translateZ(10px) scale(1.02)' : 'translateZ(0px)',
                boxShadow: state === 'running' ? '0 0 20px rgba(6, 182, 212, 0.45)' : isSelected ? '0 0 16px rgba(99, 102, 241, 0.35)' : 'none',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: '12px'
              }}
            >
              <div className="step-status-icon">
                {state === 'done' && <CheckCircle2 className="icon-done text-emerald-400" size={16} />}
                {state === 'running' && <Loader2 className="icon-running spin text-cyan-400" size={16} />}
                {state === 'failed' && <AlertCircle className="icon-failed text-rose-400" size={16} />}
                {state === 'queued' && <Circle className="icon-queued text-slate-600" size={16} />}
              </div>
              <div className="step-info" style={{ overflow: 'hidden' }}>
                <span className="step-index font-mono text-[10px] text-cyan-400 font-semibold">Phase {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                <span className="step-name font-medium" style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
