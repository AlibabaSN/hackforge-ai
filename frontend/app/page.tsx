'use client';
import { useEffect, useState } from 'react';
import { 
  Sparkles, Play, RefreshCw, Trash2, FolderPlus, 
  Bot, Layout, Settings, BookOpen, ShieldCheck, FileCode, Cpu, Server, Sliders,
  Terminal, Activity, Zap, CheckCircle2, ChevronRight, Eye, Code, Award
} from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import CommandPalette from '../components/CommandPalette';
import AuthModal from '../components/AuthModal';
import LLMSettingsModal from '../components/LLMSettingsModal';
import PipelineProgress from '../components/PipelineProgress';
import ScoreBreakdown from '../components/ScoreBreakdown';
import CodeWorkspaceExplorer from '../components/CodeWorkspaceExplorer';
import SecurityAuditCard from '../components/SecurityAuditCard';
import ThreeDBackgroundCanvas from '../components/ThreeDBackgroundCanvas';
import ThreeDCard from '../components/ThreeDCard';
import ArtifactDetailViewer from '../components/ArtifactDetailViewer';
import NotificationDrawer from '../components/NotificationDrawer';
import { getApiBase } from '@/lib/api';

const API = getApiBase();
const STAGES = [
  'Problem Analyst',
  'Problem Decomposer',
  'Research Agent',
  'Data Engineering Agent',
  'AI / ML Engineering Agent',
  'Solution Generator',
  'Solution Critic',
  'Solution Improver',
  'Architecture Designer',
  'Backend Engineering Agent',
  'Frontend Engineering Agent',
  'Code Generator',
  'Sandbox Execution & Tester',
  'Self-Healing Debug Agent',
  'Security Auditor Agent',
  'Hackathon Judge'
];

function stageToTab(stage: string): string {
  const map: Record<string, string> = {
    'Problem Analyst': 'Problem',
    'Problem Decomposer': 'Overview',
    'Research Agent': 'Research',
    'Data Engineering Agent': 'Data Engineering',
    'AI / ML Engineering Agent': 'AI/ML Modeling',
    'Solution Generator': 'Solutions',
    'Solution Critic': 'Solutions',
    'Solution Improver': 'Solutions',
    'Architecture Designer': 'Architecture',
    'Backend Engineering Agent': 'Code Explorer',
    'Frontend Engineering Agent': 'Code Explorer',
    'Code Generator': 'Code Explorer',
    'Sandbox Execution & Tester': 'Overview',
    'Self-Healing Debug Agent': 'Overview',
    'Security Auditor Agent': 'Security Audit',
    'Hackathon Judge': 'Judge'
  };
  return map[stage] || 'Overview';
}

const PRESETS = [
  {
    title: 'Road Hazard Detection System',
    problem: 'Build a system that detects road hazards using smartphone cameras and alerts drivers in real time.'
  },
  {
    title: 'Autonomous AI Code Reviewer',
    problem: 'Build an autonomous code review agent that analyzes pull requests, enforces security rules, and runs test simulations.'
  },
  {
    title: 'Smart Contract Security Auditor',
    problem: 'Build a multi-agent vulnerability scanner for Solidity smart contracts with automated exploit vector testing.'
  },
  {
    title: 'Personalized Health Agent',
    problem: 'Build an AI health agent that analyzes dietary logs, fitness tracking metrics, and blood reports to issue personalized recommendations.'
  }
];

function formatJSON(val: any) {
  return JSON.stringify(val, null, 2);
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLLMModal, setShowLLMModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  // Command palette keyboard listener
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

  const [title, setTitle] = useState('Road Hazard Detection System');
  const [problem, setProblem] = useState('Build a system that detects road hazards using smartphone cameras and alerts drivers in real time.');

  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState('Overview');
  const [error, setError] = useState('');

  // Load auth token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('hackforge_token');
    const savedUser = localStorage.getItem('hackforge_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch projects list
  async function fetchProjects() {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API}/projects`, { headers });
      if (res.ok) {
        const list = await res.json();
        setProjectsList(list);
        if (list.length > 0 && !project) {
          setProject(list[0]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch projects', e);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, [token]);

  // Auth logout
  function handleLogout() {
    localStorage.removeItem('hackforge_token');
    localStorage.removeItem('hackforge_user');
    setToken('');
    setUser(null);
  }

  // Auth success
  function handleAuthSuccess(userData: any, userToken: string) {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('hackforge_token', userToken);
    localStorage.setItem('hackforge_user', JSON.stringify(userData));
  }

  // Create project with optional auto-run
  async function createProject(t = title, p = problem, autoRun = false) {
    setError('');
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API}/projects`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: t, problem_statement: p }),
      });

      if (!res.ok) {
        const errText = await res.text();
        setError(errText);
        return;
      }

      const newProj = await res.json();
      setProject(newProj);
      setTab('Overview');
      fetchProjects();

      if (autoRun) {
        setTimeout(() => runPipeline(newProj), 250);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    }
  }

  // Trigger pipeline
  async function runPipeline(targetProject = project) {
    if (!targetProject) return;
    setBusy(true);
    setError('');
    // Provide instant visual responsiveness
    setProject((prev: any) => ({
      ...(prev || targetProject),
      status: 'RUNNING',
      current_stage: 'Problem Analyst',
      logs: [
        {
          time: new Date().toISOString(),
          agent: 'System Orchestrator',
          status: 'INITIALIZED',
          summary: `Starting 16-stage autonomous AI multi-agent pipeline for '${targetProject.title}'...`
        }
      ]
    }));

    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API}/projects/${targetProject.id}/run`, {
        method: 'POST',
        headers
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setProject(data);
    } catch (err: any) {
      setError(err.message || 'Failed to start pipeline');
      setBusy(false);
    }
  }

  // Delete project
  async function deleteProject(id: number) {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${API}/projects/${id}`, { method: 'DELETE', headers });
      if (project?.id === id) {
        setProject(null);
      }
      fetchProjects();
    } catch (err) {
      console.error('Delete failed', err);
    }
  }

  // Poll project updates actively whenever project is running or busy
  useEffect(() => {
    if (!project?.id) return;
    const isRunning = project.status === 'RUNNING' || project.status === 'QUEUED' || busy;
    if (!isRunning) return;

    const timer = setInterval(async () => {
      try {
        const res = await fetch(`${API}/projects/${project.id}`);
        if (res.ok) {
          const updated = await res.json();
          setProject(updated);
          if (updated.status === 'READY' || updated.status === 'FAILED') {
            setBusy(false);
            fetchProjects();
          }
        }
      } catch (e) {
        console.error(e);
      }
    }, 600);

    return () => clearInterval(timer);
  }, [project?.id, project?.status, busy]);

  const artifacts = project?.artifacts || {};
  const codeFiles = artifacts?.code_generator?.files || [];
  const entrypoint = artifacts?.code_generator?.entrypoint || 'test_app.py';

  return (
    <div className="app-container">
      {/* Interactive WebGL 3D Background */}
      <ThreeDBackgroundCanvas />

      {/* Luxury Enterprise Sidebar */}
      <Sidebar onOpenCommandPalette={() => setShowCommandPalette(true)} />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <Header 
          user={user} 
          onOpenAuth={() => setShowAuthModal(true)} 
          onOpenLLMSettings={() => setShowLLMModal(true)}
          onLogout={handleLogout}
          onNewProject={() => setProject(null)}
          activeProjectTitle={project?.title}
          onOpenCommandPalette={() => setShowCommandPalette(true)}
          onOpenNotifications={() => setShowNotifDrawer(true)}
        />

        <div className="dashboard-body">
          <div className="hero-banner">
            <div>
              <div className="hero-tag">
                <Sparkles size={14} /> ANIMATED 3D AGENT MESH WORKSPACE
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Autonomous Engineering Workspace</h1>
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                16 Specialized Domain Agents &bull; Pydantic Contract Flow &bull; Isolated Docker Sandbox &bull; Automated Judge
              </div>
            </div>

            {project ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button 
                  className="btn btn-primary" 
                  onClick={() => runPipeline()}
                  disabled={busy}
                  style={{ minWidth: 220, boxShadow: '0 0 25px rgba(99, 102, 241, 0.45)' }}
                >
                  {busy ? <RefreshCw size={16} className="spin text-cyan-300" /> : <Play size={16} />}
                  <span>
                    {busy 
                      ? `Running: ${project.current_stage || '16 Agents'}...` 
                      : project.status === 'READY' 
                      ? 'Re-run 16-Agent Pipeline' 
                      : 'Run 16-Agent Pipeline'}
                  </span>
                </button>

                <button 
                  className="btn"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                  onClick={() => setProject(null)}
                  title="Create new project"
                >
                  <FolderPlus size={16} /> New Project
                </button>
              </div>
            ) : null}
          </div>

          {!project ? (
            /* Create Project Form & Templates */
            <ThreeDCard>
              <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={18} className="text-cyan-400" />
                  <span style={{ fontSize: 16, fontWeight: 700 }}>Launch New Autonomous Project</span>
                </div>
                <span className="muted" style={{ fontSize: 12 }}>Select a verified preset to auto-run, or design a custom challenge</span>
              </div>

              <div className="presets-grid" style={{ marginTop: 14 }}>
                {PRESETS.map((preset) => (
                  <div 
                    key={preset.title} 
                    className="preset-card"
                    style={{ cursor: 'pointer', position: 'relative' }}
                    onClick={() => {
                      setTitle(preset.title);
                      setProblem(preset.problem);
                      createProject(preset.title, preset.problem, true);
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div className="preset-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Sparkles size={14} className="text-purple-400" />
                        {preset.title}
                      </div>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 6, background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', fontWeight: 600 }}>
                        ⚡ Auto-Run
                      </span>
                    </div>
                    <div className="preset-desc">{preset.problem}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                <div className="input-group">
                  <label style={{ fontWeight: 600, fontSize: 12 }}>Custom Project Title</label>
                  <input 
                    className="input" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="e.g. Real-time Fraud Detection Pipeline"
                  />
                </div>

                <div className="input-group" style={{ marginTop: 12 }}>
                  <label style={{ fontWeight: 600, fontSize: 12 }}>Problem Statement & Architecture Requirements</label>
                  <textarea 
                    className="textarea" 
                    rows={3}
                    value={problem} 
                    onChange={(e) => setProblem(e.target.value)} 
                    placeholder="Describe the problem, constraints, target users, and desired MVP capabilities..."
                  />
                </div>

                {error && <div className="auth-error-banner" style={{ marginTop: 12 }}>{error}</div>}

                <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1, boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }} 
                    onClick={() => createProject(title, problem, true)}
                  >
                    <Zap size={16} /> Create & Run 16 Agents
                  </button>
                  <button 
                    className="btn" 
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    onClick={() => createProject(title, problem, false)}
                  >
                    <FolderPlus size={16} /> Save Draft Project
                  </button>
                </div>
              </div>
            </ThreeDCard>
          ) : (
            /* Active Project Workspace View */
            <div className="grid-main">
              <div>
                {/* Agent Pipeline Visualizer */}
                <ThreeDCard>
                  <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Activity size={18} className="text-cyan-400" />
                      <span style={{ fontSize: 15, fontWeight: 700 }}>16-Stage Autonomous AI Loop</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        project.status === 'READY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        project.status === 'RUNNING' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {project.status === 'READY' ? '✓ READY' : project.status}
                      </span>
                      <span className="muted" style={{ fontSize: 12 }}>
                        Stage: {project.current_stage || 'Queued'}
                      </span>
                    </div>
                  </div>
                  <PipelineProgress 
                    stages={STAGES} 
                    currentStage={project.current_stage} 
                    status={project.status} 
                    onSelectStage={(s) => setTab(stageToTab(s))}
                    selectedStage={STAGES.find(s => stageToTab(s) === tab)}
                  />
                </ThreeDCard>

                {/* Live Cyberpunk Agent Console */}
                <div style={{ 
                  marginTop: 16, 
                  borderRadius: 14, 
                  border: '1px solid rgba(6, 182, 212, 0.25)', 
                  background: 'rgba(5, 7, 13, 0.85)', 
                  padding: '14px 18px', 
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid rgba(34, 37, 54, 0.8)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></div>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }}></div>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></div>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#22d3ee', marginLeft: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Terminal size={14} /> AUTONOMOUS AI AGENT CONSOLE
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11 }}>
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        Active: <strong style={{ color: '#67e8f9' }}>{project.current_stage || 'IDLE'}</strong>
                      </span>
                      {busy && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#34d399', fontWeight: 600 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'ping 1s infinite' }}></span> STREAMING
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: 10, maxHeight: 180, overflowY: 'auto', fontFamily: 'monospace', fontSize: 11, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {project.logs && project.logs.length > 0 ? (
                      project.logs.map((log: any, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ color: 'var(--text-dim)', flexShrink: 0 }}>
                            [{log.time ? log.time.split('T')[1]?.slice(0, 8) : '00:00:00'}]
                          </span>
                          <span style={{ 
                            padding: '1px 6px', 
                            borderRadius: 4, 
                            fontSize: 10, 
                            fontWeight: 700, 
                            flexShrink: 0,
                            background: log.status === 'COMPLETED' || log.status === 'FINAL_VERDICT' ? 'rgba(16, 185, 129, 0.15)' :
                                        log.status === 'RUNNING' ? 'rgba(6, 182, 212, 0.15)' :
                                        log.status === 'FAILED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.06)',
                            color: log.status === 'COMPLETED' || log.status === 'FINAL_VERDICT' ? '#34d399' :
                                   log.status === 'RUNNING' ? '#22d3ee' :
                                   log.status === 'FAILED' ? '#f87171' : '#9ca3af',
                            border: `1px solid ${
                              log.status === 'COMPLETED' || log.status === 'FINAL_VERDICT' ? 'rgba(16, 185, 129, 0.3)' :
                              log.status === 'RUNNING' ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255,255,255,0.08)'
                            }`
                          }}>
                            {log.agent}
                          </span>
                          {log.model && (
                            <span style={{
                              padding: '1px 6px',
                              borderRadius: 4,
                              fontSize: 9,
                              fontWeight: 700,
                              fontFamily: 'monospace',
                              flexShrink: 0,
                              background: 'rgba(139, 92, 246, 0.15)',
                              color: '#c084fc',
                              border: '1px solid rgba(139, 92, 246, 0.35)'
                            }}>
                              {log.model}
                            </span>
                          )}
                          <span style={{ color: 'var(--text-main)', wordBreak: 'break-word' }}>
                            {log.summary || log.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: 'var(--text-dim)', fontStyle: 'italic', padding: '6px 0' }}>
                        Ready for execution. Click "Run 16-Agent Pipeline" to begin autonomous orchestration.
                      </div>
                    )}
                  </div>
                </div>

                {/* Tabs & Artifact Explorer */}
                <ThreeDCard style={{ marginTop: 16 }}>
                  <div className="tabs-nav">
                    {['Overview', 'Code Explorer', 'Security Audit', 'Problem', 'Research', 'Data Engineering', 'AI/ML Modeling', 'Solutions', 'Architecture', 'Judge', 'Logs'].map((t) => (
                      <button 
                        key={t} 
                        className={`tab-btn ${tab === t ? 'active' : ''}`}
                        onClick={() => setTab(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {tab === 'Code Explorer' ? (
                    <CodeWorkspaceExplorer files={codeFiles} entrypoint={entrypoint} />
                  ) : tab === 'Security Audit' ? (
                    <SecurityAuditCard audit={artifacts.security_audit} />
                  ) : (
                    <ArtifactDetailViewer 
                      tab={tab} 
                      artifact={
                        tab === 'Overview' ? null :
                        tab === 'Logs' ? project.logs :
                        (artifacts[tab.toLowerCase().replace(/ /g, '_')] || 
                         artifacts[tab === 'Data Engineering' ? 'data_engineering_agent' : 
                                   tab === 'AI/ML Modeling' ? 'ai___ml_engineering_agent' : 
                                   tab === 'Solutions' ? 'solution_generator' : 
                                   tab === 'Judge' ? 'hackathon_judge' : 
                                   tab === 'Architecture' ? 'architecture_designer' : 
                                   tab === 'Problem' ? 'problem_analyst' : 
                                   tab === 'Research' ? 'research_agent' : ''] || 
                         artifacts[tab === 'AI/ML Modeling' ? 'ai_/_ml_engineering_agent' : ''] ||
                         artifacts[tab.toLowerCase().replace(/ /g, '_').replace(/&/g, 'and').replace(/\//g, '_')])
                      } 
                      project={project} 
                    />
                  )}
                </ThreeDCard>
              </div>

              {/* Right Column: Scorecard & Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <ThreeDCard>
                  <div className="card-title">
                    <span>Hackathon Evaluation</span>
                  </div>
                  <ScoreBreakdown 
                    score={project.score} 
                    judgeArtifact={artifacts.hackathon_judge} 
                  />
                </ThreeDCard>

                <SecurityAuditCard audit={artifacts.security_audit} />

                <ThreeDCard>
                  <div className="card-title">
                    <span>Project Vision</span>
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, color: 'var(--text-muted)' }}>
                    {project.problem_statement}
                  </p>
                </ThreeDCard>

                <ThreeDCard>
                  <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Project Repository</span>
                    <span style={{ fontSize: 11, color: 'var(--primary)' }}>{projectsList.length} items</span>
                  </div>
                  <div className="projects-list-drawer">
                    {projectsList.map((p) => (
                      <div 
                        key={p.id} 
                        className={`project-item-btn ${project?.id === p.id ? 'selected' : ''}`}
                        onClick={() => setProject(p)}
                      >
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, fontWeight: 600 }}>
                          {p.title}
                        </div>
                        <button 
                          className="icon-button" 
                          onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                          title="Delete project"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </ThreeDCard>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette 
        isOpen={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)} 
        onNewProject={() => setProject(null)}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onSuccess={handleAuthSuccess}
        apiBase={API}
      />

      {/* LLM Settings Modal */}
      <LLMSettingsModal 
        isOpen={showLLMModal} 
        onClose={() => setShowLLMModal(false)} 
        apiBase={API}
      />

      {/* Notification Drawer */}
      <NotificationDrawer 
        isOpen={showNotifDrawer} 
        onClose={() => setShowNotifDrawer(false)} 
      />
    </div>
  );
}
