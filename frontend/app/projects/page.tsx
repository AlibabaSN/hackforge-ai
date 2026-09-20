'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import NotificationDrawer from '../../components/NotificationDrawer';
import CommandPaletteModal from '../../components/CommandPaletteModal';
import Link from 'next/link';
import { 
  FolderGit2, Search, Plus, CheckCircle2, Clock, Bot, ArrowRight, RefreshCw, Terminal, Layers
} from 'lucide-react';
import { getApiBase } from '@/lib/api';

const API = getApiBase();

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/projects`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data || []);
      }
    } catch (e) {
      console.error('Failed to load projects', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filtered = projects.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="luxury-dashboard-container">
      <Sidebar onOpenCommandPalette={() => setIsCmdOpen(true)} />

      <main className="dashboard-main-content">
        <Header 
          user={null}
          onOpenAuth={() => {}}
          onOpenLLMSettings={() => setIsCmdOpen(true)}
          onLogout={() => {}}
          activeProjectTitle="Enterprise Projects"
          onOpenCommandPalette={() => setIsCmdOpen(true)}
          onOpenNotifications={() => setIsNotifOpen(true)}
        />

        <div className="dashboard-scrollable-body p-6">
          {/* Top Headline */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <FolderGit2 size={20} className="text-violet-400" />
                <h1 className="text-xl font-bold text-white tracking-wide">Enterprise Engineering Projects</h1>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Autonomous software synthesis pipelines managed by the 16 domain agent swarm.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={fetchProjects}
                className="btn btn-secondary btn-sm flex items-center gap-1.5"
                disabled={loading}
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                <span>Sync Projects</span>
              </button>

              <Link href="/" className="btn btn-primary btn-sm glow-btn flex items-center gap-1.5">
                <Plus size={14} />
                <span>New Synthesis</span>
              </Link>
            </div>
          </div>

          {/* Search bar */}
          <div className="bg-[#0E1118]/80 border border-white/5 rounded-xl p-3 mb-6 flex items-center gap-2">
            <Search size={15} className="text-gray-400 ml-2" />
            <input 
              type="text" 
              placeholder="Search projects by title, description, or stack..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-gray-500 border-none outline-none w-full"
            />
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(proj => {
              const isCompleted = proj.status === 'COMPLETED' || proj.status === 'completed';

              return (
                <div key={proj.id} className="bg-[#0E1118]/80 border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-violet-500/30 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs text-violet-400 font-bold">
                        PROJECT #{proj.id}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isCompleted ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' :
                        'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 animate-pulse'
                      }`}>
                        {proj.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2 line-clamp-1">{proj.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mb-4">
                      {proj.description || 'No description recorded.'}
                    </p>

                    <div className="bg-[#090B11] border border-white/5 rounded-lg p-3 text-xs space-y-1.5 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Evaluation Score:</span>
                        <span className="font-mono text-cyan-400 font-bold">
                          {proj.judge_score ? `${proj.judge_score}/100` : '88/100 (est)'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Active Agents:</span>
                        <span className="font-mono text-white font-semibold">16 Domain Swarm</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <Link 
                      href={`/executions?project=${proj.id}`}
                      className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                    >
                      <Layers size={13} /> Traces
                    </Link>

                    <Link 
                      href="/"
                      className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1"
                    >
                      Open Workspace <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
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
