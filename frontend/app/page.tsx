'use client';
import { useEffect, useState } from 'react';
import { 
  Sparkles, Play, RefreshCw, Trash2, FolderPlus, 
  Bot, Layout, Settings, BookOpen, ShieldCheck, FileCode, Cpu, Server, Sliders
} from 'lucide-react';
import Header from '../components/Header';
import AuthModal from '../components/AuthModal';
import LLMSettingsModal from '../components/LLMSettingsModal';
import PipelineProgress from '../components/PipelineProgress';
import ScoreBreakdown from '../components/ScoreBreakdown';
import CodeWorkspaceExplorer from '../components/CodeWorkspaceExplorer';
import SecurityAuditCard from '../components/SecurityAuditCard';
import ThreeDBackgroundCanvas from '../components/ThreeDBackgroundCanvas';
import ThreeDCard from '../components/ThreeDCard';

const API = 'http://localhost:8000/api';
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

  // Create project
  async function createProject(t = title, p = problem) {
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
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    }
  }

  // Trigger pipeline
  async function runPipeline() {
    if (!project) return;
    setBusy(true);
    setError('');
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API}/projects/${project.id}/run`, {
        method: 'POST',
        headers
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
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

  // Poll project updates
  useEffect(() => {
    if (!project?.id) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`${API}/projects/${project.id}`);
        if (res.ok) {
          const updated = await res.json();
          setProject(updated);
          if (updated.status === 'READY' || updated.status === 'FAILED') {
            setBusy(false);
            clearInterval(timer);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [project?.id]);

  const artifacts = project?.artifacts || {};
  const codeFiles = artifacts?.code_generator?.files || [];
  const entrypoint = artifacts?.code_generator?.entrypoint || 'test_app.py';

  return (
    <div className="app-container">
      {/* Interactive WebGL 3D Background */}
      <ThreeDBackgroundCanvas />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Bot size={22} />
          </div>
          <div>
            <div className="brand-title">HackForge AI</div>
            <div className="brand-tag">3D Autonomous Platform</div>
          </div>
        </div>

        <nav className="nav-menu">
          <a href="/" className="nav-item active"><Cpu size={17} /> Workspace</a>
          <a href="/agents" className="nav-item"><Bot size={17} /> Agent Team (16)</a>
          <a href="/servers" className="nav-item"><Server size={17} /> AI Server Control</a>
          <a href="/settings/routing" className="nav-item"><ShieldCheck size={17} /> Privacy Routing</a>
          <a href="/models" className="nav-item"><Sliders size={17} /> Model Mesh</a>
        </nav>

        {/* Projects List Drawer */}
        <div style={{ marginTop: 'auto' }}>
          <div className="muted" style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, letterSpacing: 0.5 }}>
            MY PROJECTS ({projectsList.length})
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
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <Header 
          user={user} 
          onOpenAuth={() => setShowAuthModal(true)} 
          onOpenLLMSettings={() => setShowLLMModal(true)}
          onLogout={handleLogout}
          onNewProject={() => setProject(null)}
          activeProjectTitle={project?.title}
        />

        <div className="dashboard-body">
          <div className="hero-banner">
            <div>
              <div className="hero-tag">
                <Sparkles size={14} /> ANIMATED 3D AGENT MESH WORKSPACE
              </div>
              <h1>Autonomous Engineering Workspace</h1>
              <div className="muted">
                Problem → Research → Data & AI Pipeline → Solutions → Critic → Architecture → Code → Sandbox → Security → Judge
              </div>
            </div>

            {project && (
              <button 
                className="btn btn-primary" 
                onClick={runPipeline}
                disabled={busy || project.status === 'READY'}
              >
                {busy ? <RefreshCw size={16} className="spin" /> : <Play size={16} />}
                {busy ? 'Running Pipeline...' : project.status === 'READY' ? 'Pipeline Complete' : 'Run Pipeline'}
              </button>
            )}
          </div>

          {!project ? (
            /* Create Project Form & Templates */
            <ThreeDCard>
              <div className="card-title">
                <span>Start a New Hackathon Project</span>
                <span className="muted" style={{ fontSize: 12 }}>Select a preset or enter your custom goal</span>
              </div>

              <div className="presets-grid">
                {PRESETS.map((preset) => (
                  <div 
                    key={preset.title} 
                    className="preset-card"
                    onClick={() => {
                      setTitle(preset.title);
                      setProblem(preset.problem);
                      createProject(preset.title, preset.problem);
                    }}
                  >
                    <div className="preset-title">
                      <Sparkles size={14} className="text-purple-400" />
                      {preset.title}
                    </div>
                    <div className="preset-desc">{preset.problem}</div>
                  </div>
                ))}
              </div>

              <div className="input-group">
                <label>Project Title</label>
                <input 
                  className="input" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Real-time Hazard Detection"
                />
              </div>

              <div className="input-group" style={{ marginTop: 12 }}>
                <label>Problem Statement & Vision</label>
                <textarea 
                  className="textarea" 
                  value={problem} 
                  onChange={(e) => setProblem(e.target.value)} 
                  placeholder="Describe the problem, target users, and desired MVP capabilities..."
                />
              </div>

              {error && <div className="auth-error-banner" style={{ marginTop: 12 }}>{error}</div>}

              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => createProject()}>
                <FolderPlus size={16} /> Create Hackathon Project
              </button>
            </ThreeDCard>
          ) : (
            /* Active Project Workspace View */
            <div className="grid-main">
              <div>
                {/* Agent Pipeline Visualizer */}
                <ThreeDCard>
                  <div className="card-title">
                    <span>16-Stage Autonomous Loop</span>
                    <span className="muted" style={{ fontSize: 12 }}>
                      {project.status} · {project.current_stage}
                    </span>
                  </div>
                  <PipelineProgress 
                    stages={STAGES} 
                    currentStage={project.current_stage} 
                    status={project.status} 
                  />
                </ThreeDCard>

                {/* Tabs & Artifact Explorer */}
                <ThreeDCard style={{ marginTop: 20 }}>
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
                    <>
                      <div className="card-title">
                        <span>Artifact Details — {tab}</span>
                      </div>
                      <pre className="artifact-box">
                        {tab === 'Overview' 
                          ? formatJSON({
                              id: project.id,
                              title: project.title,
                              status: project.status,
                              current_stage: project.current_stage,
                              score: project.score,
                              sandbox: artifacts.sandbox_execution,
                              security: artifacts.security_audit,
                              artifacts_generated: Object.keys(artifacts).length,
                              created_at: project.created_at
                            })
                          : tab === 'Logs' 
                          ? formatJSON(project.logs)
                          : formatJSON(
                              artifacts[tab.toLowerCase().replace(/ /g, '_')] || 
                              artifacts[tab === 'Data Engineering' ? 'data_engineering_agent' : 
                                        tab === 'AI/ML Modeling' ? 'ai_/_ml_engineering_agent' : 
                                        tab === 'Solutions' ? 'solution_generator' : 
                                        tab === 'Judge' ? 'hackathon_judge' : 
                                        tab === 'Architecture' ? 'architecture_designer' : 
                                        tab === 'Problem' ? 'problem_analyst' : 
                                        tab === 'Research' ? 'research_agent' : ''] || 
                              { message: 'Waiting for this stage to complete...' }
                            )
                        }
                      </pre>
                    </>
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
              </div>
            </div>
          )}
        </div>
      </main>

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
    </div>
  );
}
