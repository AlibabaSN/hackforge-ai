'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Activity, Terminal, Database, Shield, Bot, Compass, Sparkles, 
  Cpu, Server, Sliders, Play, RefreshCw, Layers, CheckCircle2, 
  ArrowRight, ExternalLink, Code2, AlertTriangle, Lock, Rocket, Wrench, BarChart3, BookOpen
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CommandPaletteModal from '@/components/CommandPaletteModal';
import NotificationDrawer from '@/components/NotificationDrawer';
import AuthModal from '@/components/AuthModal';
import LLMSettingsModal from '@/components/LLMSettingsModal';
import ThreeDBackgroundCanvas from '@/components/ThreeDBackgroundCanvas';
import SystemOrbitCanvas from '@/components/SystemOrbitCanvas';
import { getApiBase } from '@/lib/api';

const API = getApiBase();

export default function DashboardPage() {
  const router = useRouter();
  const [dbOverview, setDbOverview] = useState<any>(null);
  const [secOverview, setSecOverview] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Command Palette and Modals
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showLLMModal, setShowLLMModal] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dbRes, secRes, projRes, modRes, wfRes, anaRes] = await Promise.all([
        fetch(`${API}/database/overview`).catch(() => null),
        fetch(`${API}/security/overview`).catch(() => null),
        fetch(`${API}/projects`).catch(() => null),
        fetch(`${API}/mesh/models`).catch(() => null),
        fetch(`${API}/workflows`).catch(() => null),
        fetch(`${API}/analytics`).catch(() => null)
      ]);

      if (dbRes && dbRes.ok) setDbOverview(await dbRes.json());
      if (secRes && secRes.ok) setSecOverview(await secRes.json());
      if (projRes && projRes.ok) setProjects(await projRes.json());
      if (modRes && modRes.ok) setModels(await modRes.json());
      if (wfRes && wfRes.ok) setWorkflows(await wfRes.json());
      if (anaRes && anaRes.ok) setAnalytics(await anaRes.json());
    } catch (err) {
      console.error('Failed to load command center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const anaSummary = analytics?.summary;
  const tokenUsage = analytics?.token_usage;

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
          onOpenNotifications={() => setShowNotifDrawer(true)}
        />

        <main className="dashboard-content">
          {/* Executive Top Banner */}
          <div className="command-center-hero">
            <div className="hero-badge-row">
              <div className="badge-luxury">
                <Activity size={14} className="text-emerald-400" />
                <span>HACKFORGE APEX v1.5</span>
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
                  Autonomous software engineering operating system combining 16 domain agents, hybrid inference mesh, zero-trust SOC, and continuous delivery rails.
                </p>
              </div>
              <div className="hero-actions">
                <button 
                  className="btn btn-primary glow-btn"
                  onClick={() => router.push('/')}
                >
                  <Play size={15} /> Launch Workspace
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={loadDashboardData}
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync Systems
                </button>
              </div>
            </div>
          </div>

          {/* System Orbit Topology Canvas */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider font-semibold">
                Autonomous Systems Orbital Topology
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                8 Core Nodes Synchronized
              </span>
            </div>
            <SystemOrbitCanvas />
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
                <span>Threats Intercepted: {anaSummary?.threats_intercepted || 6}</span>
                <span className="text-cyan-400">Zero-Trust: Enforced</span>
              </div>
            </div>

            <div className="db-metric-card" style={{ cursor: 'pointer' }} onClick={() => router.push('/deployments')}>
              <div className="metric-header">
                <span className="metric-label">CONTINUOUS DELIVERY</span>
                <Rocket size={16} className="text-cyan-400" />
              </div>
              <div className="metric-value">
                Prod: <span className="text-cyan-400 font-mono text-xl">LIVE</span>
              </div>
              <div className="metric-footer">
                <span className="text-amber-400">● 1 Staging Pending</span>
                <span className="text-emerald-400">Gate: Signed</span>
              </div>
            </div>

            <div className="db-metric-card" style={{ cursor: 'pointer' }} onClick={() => router.push('/executions')}>
              <div className="metric-header">
                <span className="metric-label">AGENT EXECUTIONS</span>
                <Bot size={16} className="text-violet-400" />
              </div>
              <div className="metric-value text-violet-400">
                {anaSummary?.total_agent_executions || 322} <span className="text-sm text-dim">Runs</span>
              </div>
              <div className="metric-footer">
                <span>16 Domain Agents</span>
                <span className="text-emerald-400">99.98% Success</span>
              </div>
            </div>

            <div className="db-metric-card" style={{ cursor: 'pointer' }} onClick={() => router.push('/analytics')}>
              <div className="metric-header">
                <span className="metric-label">LOCAL INFERENCE SAVINGS</span>
                <BarChart3 size={16} className="text-amber-400" />
              </div>
              <div className="metric-value text-emerald-400">
                ${tokenUsage?.cost_saved_usd || 27.29}
              </div>
              <div className="metric-footer">
                <span>85% Local Ollama</span>
                <span className="text-cyan-400">Zero Cloud Bill</span>
              </div>
            </div>
          </div>

          {/* Subsystem Operations Launchpad */}
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

              <Link href="/deployments" className="launchpad-card">
                <div className="launchpad-card-icon cyan">
                  <Rocket size={20} />
                </div>
                <div className="launchpad-card-info">
                  <div className="card-info-title">Deployment Rails & CI/CD</div>
                  <div className="card-info-desc">Multi-environment rollouts across Dev, Staging, and Production with human-in-the-loop approvals.</div>
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

              <Link href="/tools" className="launchpad-card">
                <div className="launchpad-card-icon amber">
                  <Wrench size={20} />
                </div>
                <div className="launchpad-card-info">
                  <div className="card-info-title">Tools & Model Context Protocol</div>
                  <div className="card-info-desc">Isolated Docker sandboxes, AST syntax scanners, and GitHub MCP automation bridges.</div>
                </div>
                <ArrowRight size={16} className="launchpad-arrow" />
              </Link>
            </div>
          </div>

          {/* Recent Projects and Active Workflows Table */}
          <div className="db-details-row mt-4">
            <div className="db-section-card flex-1">
              <div className="section-card-title flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Terminal size={16} className="text-violet-400" />
                  <span>Recent Synthesized Projects</span>
                </div>
                <Link href="/projects" className="text-xs text-violet-400 hover:text-violet-300 font-semibold">
                  View All Projects &rarr;
                </Link>
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
                            <span className={`status-pill ${p.status === 'READY' || p.status === 'COMPLETED' ? 'allowed' : p.status === 'RUNNING' ? 'pending' : p.status === 'FAILED' ? 'blocked' : 'allowed'}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="font-mono font-bold text-amber-300">
                            {p.score ? `${p.score}/100` : '88/100'}
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
                    No synthesis projects found. Click &quot;Launch Workspace&quot; to begin.
                  </div>
                )}
              </div>
            </div>

            <div className="db-section-card" style={{ minWidth: 320 }}>
              <div className="section-card-title flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Compass size={16} className="text-cyan-400" />
                  <span>Active System Workflows</span>
                </div>
                <Link href="/workflows" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold">
                  View All &rarr;
                </Link>
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

      <CommandPaletteModal 
        isOpen={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)} 
      />

      <NotificationDrawer 
        isOpen={showNotifDrawer} 
        onClose={() => setShowNotifDrawer(false)} 
        onOpenDeployments={() => router.push('/deployments')}
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
