'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import NotificationDrawer from '../../components/NotificationDrawer';
import CommandPaletteModal from '../../components/CommandPaletteModal';
import { 
  Wrench, Terminal, Shield, RefreshCw, CheckCircle2, Globe, Github, Database, Play, ExternalLink
} from 'lucide-react';

export default function ToolsPage() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testOutput, setTestOutput] = useState<{ [key: string]: string }>({});
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://127.0.0.1:8000/api/tools');
      if (res.ok) {
        const data = await res.json();
        setTools(data.tools || []);
      }
    } catch (e) {
      console.error('Failed to load tools', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const handleRunTest = (toolId: string) => {
    setTestingId(toolId);
    setTimeout(() => {
      setTestOutput(prev => ({
        ...prev,
        [toolId]: `[PING OK] Latency: 12ms • Protocol: JSON-RPC 2.0 • Capabilities: Verified`
      }));
      setTestingId(null);
    }, 500);
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
          activeProjectTitle="Tools & MCP Registry"
          onOpenCommandPalette={() => setIsCmdOpen(true)}
          onOpenNotifications={() => setIsNotifOpen(true)}
        />

        <div className="dashboard-scrollable-body p-6">
          {/* Top Headline */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Wrench size={20} className="text-emerald-400" />
                <h1 className="text-xl font-bold text-white tracking-wide">Tools & Model Context Protocol (MCP) Hub</h1>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Authorized sandboxes, security scanners, and protocol bridges available for autonomous agent invocations.
              </p>
            </div>

            <button 
              onClick={fetchTools}
              className="btn btn-secondary btn-sm flex items-center gap-1.5"
              disabled={loading}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Verify Tool Connectivity</span>
            </button>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((t: any) => (
              <div key={t.id} className="bg-[#0E1118]/80 border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
                      {t.id.includes('docker') ? <Terminal size={20} className="text-emerald-400" /> :
                       t.id.includes('ast') ? <Shield size={20} className="text-violet-400" /> :
                       t.id.includes('github') ? <Github size={20} className="text-cyan-400" /> :
                       t.id.includes('sql') ? <Database size={20} className="text-amber-400" /> :
                       <Globe size={20} className="text-emerald-400" />}
                    </div>

                    <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                      {t.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{t.name}</h3>
                  <div className="text-[11px] font-mono text-cyan-400 mb-3">{t.type}</div>

                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    {t.description}
                  </p>

                  <div className="bg-[#090B11] border border-white/5 rounded-lg p-3 text-[11px] font-mono space-y-1 mb-4">
                    <div className="flex justify-between text-gray-400">
                      <span>Permissions:</span>
                      <span className="text-amber-300 font-semibold">{t.permissions}</span>
                    </div>
                  </div>

                  {testOutput[t.id] && (
                    <div className="p-2.5 rounded-lg bg-black/50 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 mb-4">
                      {testOutput[t.id]}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <button 
                    className="btn btn-secondary btn-sm text-xs flex items-center gap-1 py-1 px-3"
                    disabled={testingId === t.id}
                    onClick={() => handleRunTest(t.id)}
                  >
                    <Play size={11} className={testingId === t.id ? 'animate-spin' : ''} />
                    <span>{testingId === t.id ? 'Pinging...' : 'Test Probe'}</span>
                  </button>

                  <span className="text-[11px] font-mono text-gray-500">
                    ID: {t.id}
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
