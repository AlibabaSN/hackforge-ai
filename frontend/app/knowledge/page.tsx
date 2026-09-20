'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import NotificationDrawer from '../../components/NotificationDrawer';
import CommandPaletteModal from '../../components/CommandPaletteModal';
import { 
  BookOpen, Search, Network, CheckCircle2, Layers, Cpu, Database, 
  RefreshCw, FileText, ArrowRight, ShieldAlert, Sparkles
} from 'lucide-react';
import { getApiBase } from '@/lib/api';

const API = getApiBase();

export default function KnowledgePage() {
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [testQueryResult, setTestQueryResult] = useState<string | null>(null);
  const [querying, setQuerying] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const fetchKnowledge = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/knowledge`);
      if (res.ok) {
        const data = await res.json();
        setKnowledgeBases(data.knowledge_bases || []);
      }
    } catch (e) {
      console.error('Failed to load knowledge bases', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const handleTestQuery = () => {
    if (!searchQuery.trim()) return;
    setQuerying(true);
    setTimeout(() => {
      setTestQueryResult(`[VECTOR MATCH - Cosine 0.942] Matched 3 chunks in 'enterprise-code-standards' and 'hackathon-winning-patterns':
- Strict input validation enforced across boundary layers.
- Production error envelopes adhere to RFC 7807 problem details.`);
      setQuerying(false);
    }, 450);
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
          activeProjectTitle="Vector Knowledge Bases & RAG"
          onOpenCommandPalette={() => setIsCmdOpen(true)}
          onOpenNotifications={() => setIsNotifOpen(true)}
        />

        <div className="dashboard-scrollable-body p-6">
          {/* Top Headline */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen size={20} className="text-cyan-400" />
                <h1 className="text-xl font-bold text-white tracking-wide">Vector Knowledge Bases & RAG Index</h1>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Embedded corporate heuristics, security signatures, and architectural patterns ingested into the autonomous agent context.
              </p>
            </div>

            <button 
              onClick={fetchKnowledge}
              className="btn btn-secondary btn-sm flex items-center gap-1.5"
              disabled={loading}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Sync Index</span>
            </button>
          </div>

          {/* RAG Vector Query Test Box */}
          <div className="bg-[#0E1118]/80 border border-white/5 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-violet-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Semantic Vector Retrieval Simulator</h2>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Simulate a query to retrieve contextual knowledge chunks (e.g. 'OWASP SQL injection prevention')..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTestQuery()}
                className="bg-[#090B11] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 w-full outline-none focus:border-violet-500/50"
              />
              <button 
                className="btn btn-primary btn-sm glow-btn px-4"
                disabled={querying || !searchQuery.trim()}
                onClick={handleTestQuery}
              >
                {querying ? 'Searching...' : 'Simulate RAG'}
              </button>
            </div>

            {testQueryResult && (
              <div className="mt-4 p-4 rounded-xl bg-[#05060A] border border-violet-500/30 text-xs font-mono text-gray-300">
                <div className="text-[10px] text-violet-400 font-bold uppercase mb-1">RAG Context Injection</div>
                <pre className="whitespace-pre-wrap">{testQueryResult}</pre>
              </div>
            )}
          </div>

          {/* Knowledge Bases Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {knowledgeBases.map((kb: any) => (
              <div key={kb.id} className="bg-[#0E1118]/80 border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-500/30 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center">
                      <Network size={20} className="text-cyan-400" />
                    </div>
                    <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                      {kb.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5">{kb.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-6 font-mono">{kb.id}</p>

                  <div className="space-y-2.5 text-xs border-t border-white/5 pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Vector Chunks:</span>
                      <span className="font-mono text-white font-bold">{kb.chunks_count} chunks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Embedding Model:</span>
                      <span className="font-mono text-cyan-400 font-semibold">{kb.embedding_model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dimensions:</span>
                      <span className="font-mono text-gray-300 font-semibold">{kb.dimensions} dims</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                  <span>Updated: {new Date(kb.last_updated).toLocaleDateString()}</span>
                  <span className="text-cyan-400 flex items-center gap-1 font-semibold cursor-pointer hover:underline">
                    Inspect Chunks <ArrowRight size={10} />
                  </span>
                </div>
              </div>
            ))}
          </div>
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
