'use client';
import { useEffect, useState } from 'react';
import { Bot, Cpu, Server, Sliders, Shield, Code, Database, Brain, Sparkles, CheckCircle2, Award } from 'lucide-react';
import Header from '../../components/Header';
import AuthModal from '../../components/AuthModal';
import LLMSettingsModal from '../../components/LLMSettingsModal';
import ThreeDBackgroundCanvas from '../../components/ThreeDBackgroundCanvas';
import ThreeDCard from '../../components/ThreeDCard';

const API = 'http://localhost:8000/api';

const AGENT_TEAM = [
  { name: 'Problem Analyst', role: 'Requirements & Goal Decomposition', domain: 'Requirements', icon: Sparkles },
  { name: 'Problem Decomposer', role: 'Business, Data, AI & Security Workstreams', domain: 'Decomposition', icon: Bot },
  { name: 'Research Agent', role: 'Academic Paper & Open-Source Benchmark Discovery', domain: 'Research', icon: Brain },
  { name: 'Data Engineering Agent', role: 'Dataset Curation, Schema Contracts & pandas ETL', domain: 'Data Engineering', icon: Database },
  { name: 'AI / ML Engineering Agent', role: 'PyTorch/scikit-learn Architecture & Hyperparameter Tuning', domain: 'AI / ML', icon: Cpu },
  { name: 'Solution Generator', role: 'Multi-Strategy Candidate Generation', domain: 'Strategy', icon: Bot },
  { name: 'Solution Critic', role: 'Adversarial Risk Attack & Flaw Identification', domain: 'Criticism', icon: Shield },
  { name: 'Solution Improver', role: 'Hardening & Performance Optimization', domain: 'Optimization', icon: Sparkles },
  { name: 'Architecture Designer', role: 'System Architecture & Data Flow Design', domain: 'Architecture', icon: Server },
  { name: 'Backend Engineering Agent', role: 'FastAPI Controllers, ORM Models & REST Endpoints', domain: 'Backend', icon: Code },
  { name: 'Frontend Engineering Agent', role: 'Next.js React Components & Tailwind UI', domain: 'Frontend', icon: Code },
  { name: 'Code Generator', role: 'Multi-File Codebase File Generator', domain: 'Code Generation', icon: Code },
  { name: 'Sandbox Execution & Tester', role: 'Isolated Docker Container Execution', domain: 'Testing', icon: Server },
  { name: 'Self-Healing Debug Agent', role: 'Automated Root-Cause Trace Analysis & Patching', domain: 'Debugging', icon: Sparkles },
  { name: 'Security Auditor Agent', role: 'Vulnerability & Secret Leakage Scanner', domain: 'Security', icon: Shield },
  { name: 'Hackathon Judge', role: 'Multi-Metric Judge Evaluation & Verdict', domain: 'Evaluation', icon: Award }
];

export default function AgentsPage() {
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLLMModal, setShowLLMModal] = useState(false);

  return (
    <div className="app-container">
      {/* 3D Particle Mesh Background */}
      <ThreeDBackgroundCanvas />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Bot size={22} />
          </div>
          <div>
            <div className="brand-title">HackForge AI</div>
            <div className="brand-tag">Specialized Agent Team</div>
          </div>
        </div>

        <nav className="nav-menu">
          <a href="/" className="nav-item"><Cpu size={17} /> Workspace</a>
          <a href="/agents" className="nav-item active"><Bot size={17} /> Agent Team (16)</a>
          <a href="/servers" className="nav-item"><Server size={17} /> AI Server Control</a>
          <a href="/settings/routing" className="nav-item"><Shield size={17} /> Privacy Routing</a>
          <a href="/models" className="nav-item"><Sliders size={17} /> Model Mesh</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Header 
          user={user} 
          onOpenAuth={() => setShowAuthModal(true)} 
          onOpenLLMSettings={() => setShowLLMModal(true)}
          onLogout={() => setUser(null)}
          onNewProject={() => window.location.href = '/'}
          activeProjectTitle="Specialized Agent Team"
        />

        <div className="dashboard-body">
          <div className="hero-banner">
            <div>
              <div className="hero-tag">
                <Sparkles size={14} /> 16 SPECIALIZED DOMAIN AI AGENTS
              </div>
              <h1>Autonomous Engineering Agent Roster</h1>
              <div className="muted">
                Every engineering workstream (Data, AI/ML, Backend, Frontend, Testing, Security) is driven by a dedicated Pydantic-contract agent.
              </div>
            </div>
          </div>

          {/* 16 3D Tilt Agent Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
            {AGENT_TEAM.map((agent, idx) => {
              const Icon = agent.icon;
              return (
                <ThreeDCard key={agent.name}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div className="auth-icon-badge" style={{ margin: 0, width: 42, height: 42, background: 'rgba(99, 102, 241, 0.1)' }}>
                      <Icon size={20} className="text-purple-400" />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: 0.5 }}>
                        AGENT 0{idx + 1} · {agent.domain.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{agent.name}</div>
                    </div>
                  </div>

                  <p className="muted" style={{ fontSize: 13, margin: '0 0 14px', lineHeight: 1.5 }}>
                    {agent.role}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 10, fontSize: 11 }}>
                    <span className="muted">Contract: <strong>Pydantic Typed</strong></span>
                    <span className="status-badge done"><CheckCircle2 size={10} /> ACTIVE</span>
                  </div>
                </ThreeDCard>
              );
            })}
          </div>
        </div>
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={() => {}} apiBase={API} />
      <LLMSettingsModal isOpen={showLLMModal} onClose={() => setShowLLMModal(false)} apiBase={API} />
    </div>
  );
}
