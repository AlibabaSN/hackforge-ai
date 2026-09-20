'use client';
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import CommandPaletteModal from '../../components/CommandPaletteModal';
import NotificationDrawer from '../../components/NotificationDrawer';
import AuthModal from '../../components/AuthModal';
import LLMSettingsModal from '../../components/LLMSettingsModal';
import ThreeDBackgroundCanvas from '../../components/ThreeDBackgroundCanvas';
import { 
  Bot, Cpu, Server, Shield, Code2, Database, Brain, Sparkles, CheckCircle2, 
  Award, Search, Play, RefreshCw, ArrowRight, Layers, Sliders, Activity, 
  MessageSquare, Compass, Terminal, ShieldAlert, Zap
} from 'lucide-react';
import { getApiBase } from '@/lib/api';

const API = getApiBase();

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState<'AGENTS' | 'TEAMS' | 'MATRIX' | 'AUTO_SELECT' | 'DEBATE'>('AGENTS');
  const [agents, setAgents] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [matrixData, setMatrixData] = useState<any | null>(null);
  const [familyFilter, setFamilyFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Dynamic selection state
  const [promptInput, setPromptInput] = useState('Build an autonomous computer vision system with RAG vector search and neural prediction');
  const [selectedTeamResult, setSelectedTeamResult] = useState<any | null>(null);
  const [selecting, setSelecting] = useState(false);

  // Debate state
  const [debateTopic, setDebateTopic] = useState('Zero-downtime database migration for high-concurrency e-commerce platform');
  const [debateResult, setDebateResult] = useState<any | null>(null);
  const [debating, setDebating] = useState(false);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLLMModal, setShowLLMModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [user, setUser] = useState<any>(null);

  const fetchMeshData = async () => {
    try {
      setLoading(true);
      const [agentsRes, teamsRes, matrixRes] = await Promise.all([
        fetch(`${API}/mesh/agents`).catch(() => null),
        fetch(`${API}/mesh/teams`).catch(() => null),
        fetch(`${API}/mesh/matrix`).catch(() => null)
      ]);

      if (agentsRes && agentsRes.ok) {
        const data = await agentsRes.json();
        setAgents(data.agents || []);
      }
      if (teamsRes && teamsRes.ok) {
        const data = await teamsRes.json();
        setTeams(data.teams || []);
      }
      if (matrixRes && matrixRes.ok) {
        const data = await matrixRes.json();
        setMatrixData(data);
      }
    } catch (e) {
      console.error('Failed to load mesh data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeshData();
  }, []);

  const handleAutoSelect = async () => {
    if (!promptInput.trim()) return;
    try {
      setSelecting(true);
      const res = await fetch(`${API}/mesh/orchestrate/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem_statement: promptInput })
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedTeamResult(data);
      }
    } catch (err) {
      console.error('Auto select failed', err);
    } finally {
      setSelecting(false);
    }
  };

  const handleRunDebate = async () => {
    if (!debateTopic.trim()) return;
    try {
      setDebating(true);
      const res = await fetch(`${API}/mesh/debate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: debateTopic })
      });
      if (res.ok) {
        const data = await res.json();
        setDebateResult(data);
      }
    } catch (err) {
      console.error('Debate failed', err);
    } finally {
      setDebating(false);
    }
  };

  const filteredAgents = agents.filter(a => {
    if (familyFilter !== 'ALL' && a.family !== familyFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.purpose.toLowerCase().includes(q) ||
      a.primary_model.toLowerCase().includes(q)
    );
  });

  const families = ['ALL', ...Array.from(new Set(agents.map(a => a.family)))];

  return (
    <div className="luxury-dashboard-container">
      <ThreeDBackgroundCanvas />
      <Sidebar onOpenCommandPalette={() => setShowCommandPalette(true)} />

      <main className="dashboard-main-content">
        <Header 
          user={user} 
          onOpenAuth={() => setShowAuthModal(true)} 
          onOpenLLMSettings={() => setShowLLMModal(true)}
          onLogout={() => setUser(null)}
          onNewProject={() => window.location.href = '/'}
          activeProjectTitle="Multi-Model Agent Mesh"
          onOpenCommandPalette={() => setShowCommandPalette(true)}
          onOpenNotifications={() => setShowNotifDrawer(true)}
        />

        <div className="dashboard-scrollable-body p-6">
          {/* Top Banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Bot size={22} className="text-violet-400" />
                <h1 className="text-xl font-bold text-white tracking-wide">Open-Source Multi-Model Agent Mesh</h1>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Decoupled architecture pairing specialized agents with specialized open-weight models (Qwen, Gemma, DeepSeek, Llama, Mistral).
              </p>
            </div>

            <button 
              onClick={fetchMeshData}
              className="btn btn-secondary btn-sm flex items-center gap-1.5"
              disabled={loading}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Sync Mesh Registry</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-white/5 pb-3 mb-6">
            {[
              { id: 'AGENTS', label: `Agent Catalog (${agents.length})`, icon: Bot },
              { id: 'TEAMS', label: `Agent Swarms (${teams.length})`, icon: Layers },
              { id: 'MATRIX', label: 'Model / Agent Matrix', icon: Sliders },
              { id: 'AUTO_SELECT', label: 'Dynamic Auto-Selection', icon: Sparkles },
              { id: 'DEBATE', label: 'Multi-Agent Debate Arena', icon: MessageSquare }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeTab === tab.id 
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-md shadow-violet-950/40' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: ALL AGENTS */}
          {activeTab === 'AGENTS' && (
            <div>
              {/* Filter Bar */}
              <div className="bg-[#0E1118]/80 border border-white/5 rounded-xl p-3 mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <Search size={15} className="text-gray-400 ml-2" />
                  <input 
                    type="text" 
                    placeholder="Search agents by name, purpose, or model..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-transparent text-xs text-white placeholder-gray-500 border-none outline-none w-full"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {families.slice(0, 8).map(fam => (
                    <button
                      key={fam}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                        familyFilter === fam 
                          ? 'bg-violet-600 text-white font-bold' 
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                      onClick={() => setFamilyFilter(fam)}
                    >
                      {fam}
                    </button>
                  ))}
                </div>
              </div>

              {/* Agent Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map(agent => (
                  <div key={agent.id} className="bg-[#0E1118]/80 border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-violet-500/30 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-[10px] text-violet-400 font-bold uppercase bg-violet-950/40 border border-violet-500/20 px-2 py-0.5 rounded">
                          {agent.family}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-500/20">
                          ● {agent.status}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white mb-2">{agent.name}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">
                        {agent.purpose}
                      </p>

                      <div className="bg-[#090B11] border border-white/5 rounded-lg p-3 text-xs space-y-1.5 mb-4 font-mono">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Primary Model:</span>
                          <span className="text-cyan-400 font-bold">{agent.primary_model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Fallback Model:</span>
                          <span className="text-gray-300">{agent.fallback_model}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {agent.capabilities.slice(0, 3).map((cap: string) => (
                          <span key={cap} className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400">
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-500">
                      <span>Tools: {agent.tools.length}</span>
                      <span className="text-violet-400 flex items-center gap-1 font-semibold cursor-pointer hover:underline">
                        Configure Model &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: AGENT SWARMS & TEAMS */}
          {activeTab === 'TEAMS' && (
            <div className="space-y-6">
              <div className="text-xs text-gray-400 mb-2">
                Pre-configured multi-agent swarms designed for specialized engineering domains.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teams.map(team => (
                  <div key={team.id} className="bg-[#0E1118]/80 border border-white/5 rounded-2xl p-6 hover:border-cyan-500/30 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center">
                        <Layers size={20} className="text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{team.name}</h3>
                        <span className="text-[11px] font-mono text-cyan-400 font-semibold">{team.agents.length} Specialized Agents</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      {team.description}
                    </p>

                    <div className="bg-[#090B11] border border-white/5 rounded-xl p-3 mb-4">
                      <div className="text-[10px] font-mono uppercase text-gray-500 mb-2">Assigned Agent Swarm:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {team.agents.map((agId: string) => (
                          <span key={agId} className="text-[10px] font-mono bg-white/5 text-gray-300 px-2 py-0.5 rounded border border-white/5">
                            {agId.replace('-agent', '')}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button 
                      className="btn btn-primary btn-sm glow-btn w-full flex items-center justify-center gap-1.5"
                      onClick={() => window.location.href = '/'}
                    >
                      <Play size={13} />
                      <span>Deploy Swarm into Workspace</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MODEL / AGENT MATRIX */}
          {activeTab === 'MATRIX' && matrixData && (
            <div className="space-y-6">
              <div className="text-xs text-gray-400 mb-2">
                Live capability matrix mapping specialized agent roles to verified open-source models.
              </div>
              <div className="traces-table-wrapper">
                <table className="traces-table">
                  <thead>
                    <tr>
                      <th>Specialized Agent</th>
                      <th>Family</th>
                      <th>Primary Model</th>
                      {matrixData.models.map((m: any) => (
                        <th key={m.name} className="text-center font-mono text-[11px]">
                          <div>{m.family}</div>
                          <div className="text-[9px] text-gray-500 font-normal">({m.type})</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixData.agents.map((row: any) => (
                      <tr key={row.agent_id}>
                        <td className="font-bold text-white text-xs">{row.agent_name}</td>
                        <td className="font-mono text-xs text-violet-400">{row.family}</td>
                        <td className="font-mono text-xs text-cyan-400 font-semibold">{row.assigned_primary}</td>
                        {matrixData.models.map((m: any) => {
                          const status = row.compatibility[m.family];
                          return (
                            <td key={m.name} className="text-center">
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                                status === 'OPTIMAL' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20' :
                                status === 'SUPPORTED' ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20' :
                                'bg-white/5 text-gray-500'
                              }`}>
                                {status}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DYNAMIC AUTO-SELECTION */}
          {activeTab === 'AUTO_SELECT' && (
            <div className="space-y-6">
              <div className="bg-[#0E1118]/80 border border-white/5 rounded-2xl p-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  Autonomous Swarm Formulator
                </h2>
                <p className="text-xs text-gray-400 mb-4">
                  Describe your problem statement. HackForge dynamically classifies the domain and selects the optimal agent team with assigned models.
                </p>

                <div className="flex flex-col md:flex-row gap-3 mb-4">
                  <input 
                    type="text" 
                    value={promptInput}
                    onChange={e => setPromptInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAutoSelect()}
                    className="bg-[#090B11] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 flex-1 outline-none focus:border-violet-500/50"
                  />
                  <button 
                    className="btn btn-primary btn-sm glow-btn px-6 py-3 font-bold text-xs"
                    disabled={selecting || !promptInput.trim()}
                    onClick={handleAutoSelect}
                  >
                    {selecting ? 'Analyzing...' : 'Synthesize Agent Swarm'}
                  </button>
                </div>
              </div>

              {selectedTeamResult && (
                <div className="bg-[#0E1118]/80 border border-violet-500/30 rounded-2xl p-6 shadow-xl shadow-violet-950/20">
                  <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
                        Detected Engineering Domain
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5">{selectedTeamResult.detected_category}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/20 px-3 py-1 rounded-full">
                        {selectedTeamResult.agent_count} Agents Selected
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedTeamResult.team.map((ag: any) => (
                      <div key={ag.id} className="bg-[#090B11] border border-white/5 rounded-xl p-4">
                        <div className="font-bold text-white text-xs mb-1">{ag.name}</div>
                        <div className="text-[10px] font-mono text-violet-400 mb-2">{ag.family}</div>
                        <div className="text-[11px] font-mono text-gray-400">
                          Model: <span className="text-cyan-400 font-bold">{ag.primary_model}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                    <button 
                      className="btn btn-primary btn-sm glow-btn flex items-center gap-1.5"
                      onClick={() => window.location.href = '/'}
                    >
                      <span>Launch Swarm in Workspace</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MULTI-AGENT DEBATE ARENA */}
          {activeTab === 'DEBATE' && (
            <div className="space-y-6">
              <div className="bg-[#0E1118]/80 border border-white/5 rounded-2xl p-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  Multi-Agent Debate & Consensus Arena
                </h2>
                <p className="text-xs text-gray-400 mb-4">
                  Runs a 4-stage adversarial deliberation loop: Solution Generator &rarr; Critic &rarr; Counter-Mitigator &rarr; Judge Verdict.
                </p>

                <div className="flex flex-col md:flex-row gap-3 mb-4">
                  <input 
                    type="text" 
                    value={debateTopic}
                    onChange={e => setDebateTopic(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRunDebate()}
                    className="bg-[#090B11] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 flex-1 outline-none focus:border-cyan-500/50"
                  />
                  <button 
                    className="btn btn-primary btn-sm glow-btn px-6 py-3 font-bold text-xs"
                    disabled={debating || !debateTopic.trim()}
                    onClick={handleRunDebate}
                  >
                    {debating ? 'Debating Across Mesh...' : 'Initiate Multi-Agent Debate'}
                  </button>
                </div>
              </div>

              {debateResult && (
                <div className="space-y-4">
                  {/* Step 1: Proposal */}
                  <div className="bg-[#0E1118]/80 border border-white/5 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                        <Bot size={15} className="text-violet-400" />
                        1. Architectural Proposal ({debateResult.proposal.agent})
                      </span>
                      <span className="font-mono text-[10px] text-cyan-400">{debateResult.proposal.model}</span>
                    </div>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {debateResult.proposal.output}
                    </pre>
                  </div>

                  {/* Step 2: Critique */}
                  <div className="bg-[#0E1118]/80 border border-amber-500/20 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-amber-300 uppercase tracking-wider flex items-center gap-2">
                        <ShieldAlert size={15} className="text-amber-400" />
                        2. Adversarial Critique & Failure Modes ({debateResult.critique.agent})
                      </span>
                      <span className="font-mono text-[10px] text-amber-400">{debateResult.critique.model}</span>
                    </div>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {debateResult.critique.output}
                    </pre>
                  </div>

                  {/* Step 3: Mitigation */}
                  <div className="bg-[#0E1118]/80 border border-white/5 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                        <Code2 size={15} className="text-emerald-400" />
                        3. Engineering Mitigations ({debateResult.mitigation.agent})
                      </span>
                      <span className="font-mono text-[10px] text-emerald-400">{debateResult.mitigation.model}</span>
                    </div>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {debateResult.mitigation.output}
                    </pre>
                  </div>

                  {/* Step 4: Consensus Verdict */}
                  <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-xl p-5 shadow-xl shadow-emerald-950/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                        <Award size={16} className="text-emerald-400" />
                        4. Final Consensus & Calibration Verdict ({debateResult.consensus_verdict.agent})
                      </span>
                      <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                        {debateResult.consensus_verdict.status}
                      </span>
                    </div>
                    <pre className="text-xs text-gray-200 whitespace-pre-wrap font-sans leading-relaxed font-medium">
                      {debateResult.consensus_verdict.decision}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <NotificationDrawer 
        isOpen={showNotifDrawer} 
        onClose={() => setShowNotifDrawer(false)} 
        onOpenDeployments={() => window.location.href = '/deployments'}
      />
      <CommandPaletteModal 
        isOpen={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)} 
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(u) => { setUser(u); setShowAuthModal(false); }}
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
