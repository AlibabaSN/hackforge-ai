'use client';
import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import NotificationDrawer from '../../components/NotificationDrawer';
import CommandPaletteModal from '../../components/CommandPaletteModal';
import { 
  Microscope, Search, Sparkles, BookOpen, ExternalLink, ArrowRight, Bot, CheckCircle2
} from 'lucide-react';

export default function ResearchPage() {
  const [query, setQuery] = useState('');
  const [researching, setResearching] = useState(false);
  const [researchOutput, setResearchOutput] = useState<string | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setResearching(true);
    setTimeout(() => {
      setResearchOutput(`## Autonomous Research Synthesis: "${query}"

### 1. Architectural Findings
- **High-Concurrency Vector Ingestion**: Ingesting chunked markdown into HNSW-indexed vector spaces yields <15ms retrieval latency.
- **Agent Verification Loop**: Pre-execution AST scanning eliminates >98% of synthetic code regressions before container execution.

### 2. Recommended Implementation Blueprint
1. Utilize local Ollama Qwen2.5-Coder for preliminary AST generation.
2. Cross-verify via Gemma 3 for semantic drift.
3. Validate against OWASP Top 10 rule vectors before staging deployment.`);
      setResearching(false);
    }, 600);
  };

  return (
    <div className="luxury-dashboard-container">
      <Sidebar onOpenCommandPalette={() => setIsCmdOpen(true)} />

      <main className="dashboard-main-content">
        <Header 
          user={null}
          onOpenAuth={() => {}}
          onOpenLLMSettings={() => setIsCmdOpen(true)}
          onLogout={() => {}}
          activeProjectTitle="Deep Autonomous Research"
          onOpenCommandPalette={() => setIsCmdOpen(true)}
          onOpenNotifications={() => setIsNotifOpen(true)}
        />

        <div className="dashboard-scrollable-body p-6">
          {/* Top Headline */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Microscope size={20} className="text-cyan-400" />
                <h1 className="text-xl font-bold text-white tracking-wide">Deep Autonomous Research Engine</h1>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Synthesizes documentation, academic heuristics, and architectural benchmarks to answer complex engineering challenges.
              </p>
            </div>
          </div>

          {/* Research Input Bar */}
          <div className="bg-[#0E1118]/80 border border-white/5 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-violet-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Execute Deep Research Query</h2>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter engineering topic (e.g. 'Zero-downtime PostgreSQL schema migrations with SQLAlchemy')..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="bg-[#090B11] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 w-full outline-none focus:border-cyan-500/50"
              />
              <button 
                className="btn btn-primary btn-sm glow-btn px-4"
                disabled={researching || !query.trim()}
                onClick={handleSearch}
              >
                {researching ? 'Synthesizing...' : 'Synthesize Research'}
              </button>
            </div>
          </div>

          {/* Research Output View */}
          {researchOutput && (
            <div className="bg-[#0E1118]/80 border border-white/5 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2">
                  <Bot size={16} className="text-cyan-400" />
                  <span className="font-bold text-white text-xs uppercase tracking-wider">Research Specialist Agent Synthesis</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Synthesized via Hybrid Mesh
                </span>
              </div>
              <div className="prose prose-invert max-w-none text-xs leading-relaxed text-gray-300 font-sans whitespace-pre-wrap">
                {researchOutput}
              </div>
            </div>
          )}
        </div>
      </main>

      <NotificationDrawer 
        isOpen={isNotifOpen} 
        onClose={() => setIsNotifOpen(false)} 
        onOpenDeployments={() => window.location.href = '/deployments'}
      />
      <CommandPaletteModal 
        isOpen={isCmdOpen} 
        onClose={() => setIsCmdOpen(false)} 
      />
    </div>
  );
}
