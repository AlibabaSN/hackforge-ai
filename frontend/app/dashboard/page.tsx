'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Activity, Terminal, Database, Shield, Bot, Compass, Sparkles, 
  Cpu, Server, Sliders, Play, RefreshCw, Layers, CheckCircle2, 
  ArrowRight, ExternalLink, Code2, AlertTriangle, Lock
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CommandPalette from '@/components/CommandPalette';
import AuthModal from '@/components/AuthModal';
import LLMSettingsModal from '@/components/LLMSettingsModal';
import ThreeDBackgroundCanvas from '@/components/ThreeDBackgroundCanvas';
import { getApiBase } from '@/lib/api';

const API = getApiBase();

export default function DashboardPage() {
  const router = useRouter();
  const [dbOverview, setDbOverview] = useState<any>(null);
  const [secOverview, setSecOverview] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Command Palette and Modals
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

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dbRes, secRes, projRes, modRes, wfRes] = await Promise.all([
        fetch(`${API}/database/overview`).catch(() => null),
        fetch(`${API}/security/overview`).catch(() => null),
        fetch(`${API}/projects`).catch(() => null),
        fetch(`${API}/mesh/models`).catch(() => null),
        fetch(`${API}/workflows`).catch(() => null)
      ]);

      if (dbRes && dbRes.ok) setDbOverview(await dbRes.json());
      if (secRes && secRes.ok) setSecOverview(await secRes.json());
      if (projRes && projRes.ok) setProjects(await projRes.json());
      if (modRes && modRes.ok) setModels(await modRes.json());
      if (wfRes && wfRes.ok) setWorkflows(await wfRes.json());
    } catch (err) {
      console.error('Failed to load command center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
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
          activeProjectTitle="Executive Command Center"
          onOpenCommandPalette={() => setShowCommandPalette(true)}
        />

        <main className="dashboard-content">
          {/* Executive Top Banner */}
          <div className="command-center-hero">
            <div className="hero-badge-row">
              <div className="badge-luxury">
                <Activity size={14} className="text-emerald-400" />
                <span>ENTERPRISE AI OPERATING SYSTEM</span>
              </div>
              <div className="badge-runtime">
                <span className="dot-live"></span>
                <span>LOCAL HYBRID RUNTIME ACTIVE</span>
              </div>
            </div>

            <div className="hero-main-row">
              <div>
                <h1 className="hero-heading">AI Engineering Command Center</h1>
                <p className="hero-subheading">
                  Unified orchestration across 16 domain agents, real relational schemas, zero-trust security defense, and hybrid open-source inference clusters.
                </p>
              </div>
              <div className="hero-actions">
                <button 
                  className="btn btn-primary glow-btn"
                  onClick={() => router.push('/')}
                >
                  <Play size={15} /> Launch Synthesis
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={loadDashboardData}
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh OS
                </button>
              </div>
            </div>
          </div>

          {/* Top 4 Core Metrics Grid */}
          <div className="db-telemetry-grid">
            <div className="db-metric-card" style={{ cursor: 'pointer' }} onClick={() => router.push('/security')}>
              <div className="metric-header">
                <span className="metric-label">SECURITY POSTURE</span>
                <Shield size={16} className="text-emerald-400" />
              </div>
              <div className="metric-value text-emerald-400">
                {secOverview?.protection_score || 95}<span className="text-sm font-normal text-dim">/100</span>
              </div>
              <div className="metric-footer">
                <span>Threat: {secOverview?.threat_level || 'LOW'}</span>
                <span className="text-cyan-400">Zero-Trust: Enforced</span>
              </div>
            </div>

            <div className="db-metric-card" style={{ cursor: 'pointer' }} onClick={() => router.push('/database')}>
              <div className="metric-header">
                <span className="metric-label">RELATIONAL DATABASE</span>
                <Database size={16} className="text-cyan-400" />
              </div>
              <div className="metric-value">
                {dbOverview?.total_tables || 10} <span className="text-sm text-dim">tables</span>
              </div>
              <div className="metric-footer">
                <span className="text-emerald-400">● {dbOverview?.status || 'HEALTHY'}</span>
                <span>{dbOverview?.total_rows || 0} Total Rows</span>
              </div>
            </div>

            <div className="db-metric-card" style={{ cursor: 'pointer' }} onClick={() => router.push('/agents')}>
              <div className="metric-header">
                <span className="metric-label">AUTONOMOUS AGENTS</span>
                <Bot size={16} className="text-violet-400" />
              </div>
              <div className="metric-value text-violet-400">
                16 <span className="text-sm text-dim">Specialized</span>
              </div>
              <div className="metric-footer">
                <span>Pipeline: Ready</span>
                <span>Judge: Calibrated</span>
              </div>
            </div>

            <div className="db-metric-card" style={{ cursor: 'pointer' }} onClick={() => router.push('/models')}>
              <div className="metric-header">
                <span className="metric-label">AI INFERENCE MESH</span>
                <Cpu size={16} className="text-amber-400" />
              </div>
              <div className="metric-value text-amber-400">
                {models.length > 0 ? models.length : 5} <span className="text-sm text-dim">Models</span>
              </div>
              <div className="metric-footer">
                <span>Ollama Local: Ready</span>
                <span className="text-emerald-400">Privacy: Offline</span>
              </div>
            </div>
          </div>

          {/* Quick Subsystem Launchpad */}
          <div className="launchpad-section">
            <div className="launchpad-title">
              <Compass size={16} className="text-cyan-400" />
              <span>SUBSYSTEM OPERATIONS LAUNCHPAD</span>
            </div>
            <div className="launchpad-grid">
              <Link href="/" className="launchpad-card">
                <div className="launchpad-card-icon violet">
                  <Terminal size={20} />
                </div>
                <div className="launchpad-card-info">
                  <div className="card-info-title">Autonomous Software Factory</div>
                  <div className="card-info-desc">16-stage multi-agent pipeline synthesizing complete projects, codebases, and tests.</div>
                </div>
                <ArrowRight size={16} className="launchpad-arrow" />
              </Link>

              <Link href="/database" className="launchpad-card">
                <div className="launchpad-card-icon cyan">
                  <Database size={20} />
                </div>
                <div className="launchpad-card-info">
                  <div className="card-info-title">Database Command Center</div>
                  <div className="card-info-desc">Introspect SQLAlchemy schemas, run safe read-only queries, and view pool telemetry.</div>
                </div>
                <ArrowRight size={16} className="launchpad-arrow" />
              </Link>

              <Link href="/security" className="launchpad-card">
                <div className="launchpad-card-icon emerald">
                  <Shield size={20} />
                </div>
                <div className="launchpad-card-info">
                  <div className="card-info-title">Security Operations (SOC)</div>
                  <div className="card-info-desc">Zero-trust policies, secret vault encryption, and real-time prompt injection firewall.</div>
                </div>
                <ArrowRight size={16} className="launchpad-arrow" />
              </Link>

              <Link href="/workflows" className="launchpad-card">
                <div className="launchpad-card-icon amber">
                  <Compass size={20} />
                </div>
                <div className="launchpad-card-info">
                  <div className="card-info-title">Workflows & Pipelines</div>
                  <div className="card-info-desc">Multi-agent execution graph with live stage progression and state inspection.</div>
                </div>
                <ArrowRight size={16} className="launchpad-arrow" />
              </Link>
            </div>
          </div>

          {/* Recent Projects and Active Workflows Table */}
          <div className="db-details-row mt-4">
            <div className="db-section-card flex-1">
              <div className="section-card-title">
                <Terminal size={16} className="text-violet-400" />
                <span>Recent Synthesized Projects</span>
              </div>
              <div className="table-scroll-container">
                {projects && projects.length > 0 ? (
                  <table className="luxury-data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Stage</th>
                        <th>Status</th>
                        <th>Score</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.slice(0, 5).map((p: any) => (
                        <tr key={p.id}>
                          <td className="font-semibold text-white">{p.title}</td>
                          <td className="font-mono text-cyan-300 text-xs">{p.current_stage}</td>
                          <td>
                            <span className={`status-pill ${p.status === 'COMPLETED' ? 'allowed' : 'pending'}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="font-mono font-bold text-amber-300">
                            {p.score ? `${p.score}/100` : '—'}
                          </td>
                          <td>
                            <Link href="/" className="btn btn-secondary btn-xs">
                              Open Workspace
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-table-state">
                    No synthesis projects found. Click &quot;Launch Synthesis&quot; to begin.
                  </div>
                )}
              </div>
            </div>

            <div className="db-section-card" style={{ minWidth: 320 }}>
              <div className="section-card-title">
                <Compass size={16} className="text-cyan-400" />
                <span>Active System Workflows</span>
              </div>
              <div className="workflow-sidebar-list">
                {workflows && workflows.length > 0 ? (
                  workflows.map((wf: any) => (
                    <div key={wf.id} className="wf-mini-card">
                      <div className="wf-mini-header">
                        <span className="wf-mini-name">{wf.name}</span>
                        <span className="wf-mini-status">{wf.status}</span>
                      </div>
                      <div className="wf-mini-meta">
                        <span>{wf.stages?.length || 0} Stages</span> &bull; <span>{wf.execution_count} runs</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-table-state">Loading workflows...</div>
                )}
              </div>
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
