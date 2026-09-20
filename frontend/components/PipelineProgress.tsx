'use client';
import { CheckCircle2, Loader2, Circle, AlertCircle, Cpu } from 'lucide-react';

export const STAGE_OPENSOURCE_MODELS: Record<string, { model: string; tag: string; color: string }> = {
  'Problem Analyst': { model: 'DeepSeek-R1-32B', tag: 'DeepSeek', color: '#60a5fa' },
  'Problem Decomposer': { model: 'Qwen-2.5-72B', tag: 'Qwen', color: '#38bdf8' },
  'Research Agent': { model: 'Llama-3.3-70B', tag: 'Meta Llama', color: '#a78bfa' },
  'Data Engineering Agent': { model: 'Qwen-2.5-Coder-32B', tag: 'Qwen Coder', color: '#34d399' },
  'AI / ML Engineering Agent': { model: 'DeepSeek-R1-70B', tag: 'DeepSeek', color: '#60a5fa' },
  'Solution Generator': { model: 'Mistral-Large', tag: 'Mistral', color: '#fb923c' },
  'Solution Critic': { model: 'Llama-3.3-70B', tag: 'Meta Llama', color: '#a78bfa' },
  'Solution Improver': { model: 'Qwen-2.5-Coder-70B', tag: 'Qwen Coder', color: '#34d399' },
  'Architecture Designer': { model: 'DeepSeek-R1-32B', tag: 'DeepSeek', color: '#60a5fa' },
  'Backend Engineering Agent': { model: 'Qwen-2.5-Coder-70B', tag: 'Qwen Coder', color: '#34d399' },
  'Frontend Engineering Agent': { model: 'Qwen-2.5-Coder-32B', tag: 'Qwen Coder', color: '#34d399' },
  'Code Generator': { model: 'Qwen-2.5-Coder-70B', tag: 'Qwen Coder', color: '#34d399' },
  'Sandbox Execution & Tester': { model: 'Qwen-2.5-Coder-7B', tag: 'Qwen Coder', color: '#34d399' },
  'Self-Healing Debug Agent': { model: 'DeepSeek-R1-32B', tag: 'DeepSeek', color: '#60a5fa' },
  'Security Auditor Agent': { model: 'Llama-Guard-3-8B', tag: 'Llama Guard', color: '#f43f5e' },
  'Hackathon Judge': { model: 'DeepSeek-R1-Judge', tag: 'Reasoning Judge', color: '#f59e0b' }
};

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '6px 12px', borderRadius: 8, background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Cpu size={14} className="text-cyan-400" />
          <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 600, color: '#93c5fd' }}>
            Open-Source Multi-Model Execution Mesh: <span style={{ color: '#67e8f9' }}>Qwen 2.5 Coder</span> • <span style={{ color: '#60a5fa' }}>DeepSeek-R1</span> • <span style={{ color: '#a78bfa' }}>Llama 3.3</span> • <span style={{ color: '#fb923c' }}>Mistral</span> • <span style={{ color: '#f43f5e' }}>Llama-Guard</span>
          </span>
        </div>
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          100% Offline / Local Capable
        </span>
      </div>

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
          const modelInfo = STAGE_OPENSOURCE_MODELS[stage] || { model: 'Open-Weight', tag: 'OSS', color: '#94a3b8' };

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
              <div className="step-info" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                  <span className="step-index font-mono text-[10px] text-cyan-400 font-semibold">Phase {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                  <span 
                    className="font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${modelInfo.color}50`,
                      color: modelInfo.color,
                      letterSpacing: '0.01em',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {modelInfo.model}
                  </span>
                </div>
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
