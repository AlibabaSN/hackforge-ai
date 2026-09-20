'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import NotificationDrawer from '../../components/NotificationDrawer';
import CommandPaletteModal from '../../components/CommandPaletteModal';
import { 
  Rocket, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Server, GitCommit, 
  RefreshCw, Check, ArrowRight, Activity, Terminal
} from 'lucide-react';
import { getApiBase } from '@/lib/api';

const API = getApiBase();

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchDeployments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/deployments`);
      if (res.ok) {
        const data = await res.json();
        setDeployments(data.deployments || []);
      }
    } catch (e) {
      console.error('Failed to load deployments', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
    const interval = setInterval(fetchDeployments, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (depId: string) => {
    try {
      setApprovingId(depId);
      const res = await fetch(`${API}/deployments/${depId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approver: 'Lead System Architect' })
      });
      if (res.ok) {
        setToastMessage(`Deployment ${depId} successfully authorized and dispatched to cluster.`);
        setTimeout(() => setToastMessage(null), 5000);
        await fetchDeployments();
      }
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setApprovingId(null);
    }
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
          activeProjectTitle="Continuous Delivery Rail"
          onOpenCommandPalette={() => setIsCmdOpen(true)}
          onOpenNotifications={() => setIsNotifOpen(true)}
        />

        <div className="dashboard-scrollable-body p-6">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg shadow-emerald-950/50">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>{toastMessage}</span>
              </div>
              <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
          )}

          {/* Top Headline */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Rocket size={20} className="text-cyan-400" />
                <h1 className="text-xl font-bold text-white tracking-wide">Continuous Delivery & Deployment Rails</h1>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Multi-environment production orchestration with automated security gates and zero-trust approval protocol.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={fetchDeployments}
                className="btn btn-secondary btn-sm flex items-center gap-1.5"
                disabled={loading}
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                <span>Sync Pipelines</span>
              </button>
            </div>
          </div>

          {/* Deployment Pipelines List */}
          <div className="space-y-6">
            {deployments.map(dep => {
              const isLive = dep.status === 'LIVE';
              const isWaiting = dep.approval_status === 'PENDING_APPROVAL';

              return (
                <div 
                  key={dep.id} 
                  className={`bg-[#0E1118]/80 border rounded-2xl p-6 transition-all ${
                    isWaiting ? 'border-amber-500/30 shadow-lg shadow-amber-950/20' : 'border-white/5'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        dep.environment === 'Production' ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30' :
                        dep.environment === 'Staging' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' :
                        'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                      }`}>
                        {dep.environment.slice(0, 4).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-white">{dep.environment} Cluster</h2>
                          <span className="font-mono text-xs text-cyan-400 font-semibold">{dep.version}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400 font-mono mt-0.5">
                          <span className="flex items-center gap-1">
                            <Server size={12} /> {dep.cluster}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitCommit size={12} /> commit {dep.commit}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        isLive ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30' :
                        isWaiting ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30 animate-pulse' :
                        'bg-cyan-950/40 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                        {dep.status}
                      </span>

                      {isWaiting && (
                        <button 
                          className="btn btn-sm btn-primary glow-btn flex items-center gap-1.5"
                          disabled={approvingId === dep.id}
                          onClick={() => handleApprove(dep.id)}
                        >
                          <Check size={14} />
                          <span>{approvingId === dep.id ? 'Authorizing...' : 'Sign & Authorize'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visual Pipeline Stage Rail */}
                  <div className="pt-5">
                    <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-2">
                      Pipeline Progression & Quality Gates
                    </div>
                    <div className="pipeline-rail">
                      {dep.stages.map((st: any, idx: number) => {
                        const isDone = st.status === 'COMPLETED';
                        const isPending = st.status === 'WAITING_APPROVAL';

                        return (
                          <React.Fragment key={idx}>
                            <div className={`stage-step-box ${isDone ? 'completed' : isPending ? 'waiting_approval' : ''}`}>
                              <span className="stage-name">{st.name}</span>
                              <div className="stage-meta">
                                <span>{st.status}</span>
                                <span>{st.duration}</span>
                              </div>
                            </div>
                            {idx < dep.stages.length - 1 && (
                              <div className="stage-connector"></div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
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
      />
      <CommandPaletteModal 
        isOpen={isCmdOpen} 
        onClose={() => setIsCmdOpen(false)} 
      />
    </div>
  );
}
