'use client';
import { useState, useEffect } from 'react';
import { 
  Compass, Play, RefreshCw, CheckCircle2, Clock, 
  Bot, ArrowRight, Layers, Terminal, Shield, Sparkles, Activity
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CommandPalette from '@/components/CommandPalette';
import AuthModal from '@/components/AuthModal';
import LLMSettingsModal from '@/components/LLMSettingsModal';
import ThreeDBackgroundCanvas from '@/components/ThreeDBackgroundCanvas';
import { getApiBase } from '@/lib/api';

const API = getApiBase();

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [selectedStage, setSelectedStage] = useState<string>('Problem Analyst');
  const [loading, setLoading] = useState<boolean>(true);

  // Command Palette & Modals
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showLLMModal, setShowLLMModal] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/workflows`);
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data);
        if (data.length > 0 && !selectedWorkflow) {
          setSelectedWorkflow(data[0]);
          if (data[0].stages?.length > 0) {
            setSelectedStage(data[0].stages[0]);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  return (
    <div className="app-container">
      <ThreeDBackgroundCanvas />
      
      <Sidebar onOpenCommandPalette={() => setShowCommandPalette(true)} />

      <div className="main-content-wrapper">
        <Header
          user={user}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenLLMSettings={() => setShowLLMModal(true)}
          onLogout={() => setUser(null)}
          activeProjectTitle="Workflows & Pipeline Visualizer"
          onOpenCommandPalette={() => setShowCommandPalette(true)}
        />

        <main className="dashboard-content">
          <div className="database-hero-banner">
            <div className="db-banner-left">
              <div className="db-badge">
                <Compass size={16} className="text-cyan-400" />
                <span>MULTI-AGENT PIPELINE GRAPH & ORCHESTRATION</span>
              </div>
              <h1 className="db-hero-title">Workflows & Pipeline Visualizer</h1>
              <p className="db-hero-subtitle">
                Observe the 16-stage autonomous software engineering pipeline. Inspect input/output contracts, model routing, and verification gates.
              </p>
            </div>
            <div className="db-banner-right">
              <button className="btn btn-secondary btn-sm" onClick={loadWorkflows}>
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Graph
              </button>
            </div>
          </div>

          <div className="workflows-layout">
            {/* Workflows selector */}
            <div className="workflows-sidebar-panel">
              <div className="tables-panel-header">
                <Layers size={15} className="text-cyan-400" />
                <span>ACTIVE WORKFLOWS</span>
              </div>
              <div className="tables-selector-list">
                {workflows.map(wf => (
                  <button
                    key={wf.id}
                    className={`table-selector-btn ${selectedWorkflow?.id === wf.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedWorkflow(wf);
                      if (wf.stages?.length > 0) setSelectedStage(wf.stages[0]);
                    }}
                  >
                    <span className="table-btn-name">{wf.name}</span>
                    <span className="table-btn-count">{wf.stages?.length || 0} stages</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Workflow Pipeline Graph */}
            <div className="workflow-detail-panel">
              {selectedWorkflow ? (
                <>
                  <div className="table-data-header">
                    <div>
                      <h2 className="current-table-title">{selectedWorkflow.name}</h2>
                      <span className="current-table-meta">
                        Trigger: {selectedWorkflow.trigger_type} &bull; Runs: {selectedWorkflow.execution_count} &bull; Status: {selectedWorkflow.status}
                      </span>
                    </div>
                  </div>

                  <p className="workflow-desc-text">{selectedWorkflow.description}</p>

                  {/* Horizontal visual stage chain */}
                  <div className="stages-flow-container">
                    <div className="flow-title">PIPELINE EXECUTION FLOW (16 AUTONOMOUS AGENTS)</div>
                    <div className="stages-flow-grid">
                      {selectedWorkflow.stages?.map((stage: string, idx: number) => {
                        const isSelected = selectedStage === stage;
                        return (
                          <div 
                            key={idx}
                            className={`stage-node-box ${isSelected ? 'active' : ''}`}
                            onClick={() => setSelectedStage(stage)}
                          >
                            <div className="node-index font-mono">{(idx + 1).toString().padStart(2, '0')}</div>
                            <div className="node-info">
                              <span className="node-title">{stage}</span>
                              <span className="node-status text-emerald-400">Verified</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Stage Detail Inspector */}
                  <div className="stage-inspector-card">
                    <div className="inspector-header">
                      <Bot size={16} className="text-violet-400" />
                      <span>Stage Inspector: <strong>{selectedStage}</strong></span>
                    </div>
                    <div className="inspector-body">
                      <div className="inspector-item">
                        <span className="inspector-label">Target Role:</span>
                        <span className="inspector-value">Domain-Specialized Autonomous Agent</span>
                      </div>
                      <div className="inspector-item">
                        <span className="inspector-label">Routing Preference:</span>
                        <span className="inspector-value text-cyan-400">Offline Local Ollama (Qwen 2.5 Coder / Gemma 3) with Zero-Trust Guard</span>
                      </div>
                      <div className="inspector-item">
                        <span className="inspector-label">Pydantic Artifact Validation:</span>
                        <span className="inspector-value text-emerald-400">Strict Type-Checked Pydantic Contract</span>
                      </div>
                      <div className="inspector-item">
                        <span className="inspector-label">Data Privacy:</span>
                        <span className="inspector-value text-emerald-400">Confidential Problem Statements Retained on Local Node</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="loading-state">Loading workflow pipeline...</div>
              )}
            </div>
          </div>
        </main>
      </div>

      <CommandPalette 
        isOpen={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)} 
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(userData: any) => {
          setUser(userData);
          setShowAuthModal(false);
        }}
        apiBase={API}
      />

      <LLMSettingsModal
        isOpen={showLLMModal}
        onClose={() => setShowLLMModal(false)}
        apiBase={API}
      />
    </div>
  );
}
