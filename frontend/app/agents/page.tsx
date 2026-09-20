'use client';
import { useEffect, useState } from 'react';
import { Bot, Cpu, Server, Sliders, Shield, Code, Database, Brain, Sparkles, CheckCircle2, Award } from 'lucide-react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import CommandPalette from '../../components/CommandPalette';
import AuthModal from '../../components/AuthModal';
import LLMSettingsModal from '../../components/LLMSettingsModal';
import ThreeDBackgroundCanvas from '../../components/ThreeDBackgroundCanvas';
import ThreeDCard from '../../components/ThreeDCard';
import { getApiBase } from '@/lib/api';

const API = getApiBase();

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
  const [showCommandPalette, setShowCommandPalette] = useState(false);

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

  return (
    <div className="app-container">
      {/* 3D Particle Mesh Background */}
      <ThreeDBackgroundCanvas />

      {/* Luxury Enterprise Sidebar */}
      <Sidebar onOpenCommandPalette={() => setShowCommandPalette(true)} />

      {/* Main Content */}
      <div className="main-content-wrapper">
        <Header 
          user={user} 
          onOpenAuth={() => setShowAuthModal(true)} 
          onOpenLLMSettings={() => setShowLLMModal(true)}
          onLogout={() => setUser(null)}
          onNewProject={() => window.location.href = '/'}
          activeProjectTitle="16 Specialized Domain Agents"
          onOpenCommandPalette={() => setShowCommandPalette(true)}
        />

        <div className="dashboard-content">
          <div className="database-hero-banner">
            <div className="db-banner-left">
              <div className="db-badge">
                <Sparkles size={16} className="text-violet-400" />
                <span>16 DOMAIN-SPECIALIZED AUTONOMOUS AGENTS</span>
              </div>
              <h1 className="db-hero-title">Autonomous Engineering Agent Roster</h1>
              <p className="db-hero-subtitle">
                Every engineering workstream (Data, AI/ML, Backend, Frontend, Testing, Security) is driven by a dedicated Pydantic-contract agent wired to offline local models.
              </p>
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
      </div>

      <CommandPalette 
        isOpen={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)} 
      />

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={() => {}} apiBase={API} />
      <LLMSettingsModal isOpen={showLLMModal} onClose={() => setShowLLMModal(false)} apiBase={API} />
    </div>
  );
}
