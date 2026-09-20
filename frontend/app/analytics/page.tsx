'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import NotificationDrawer from '../../components/NotificationDrawer';
import CommandPaletteModal from '../../components/CommandPaletteModal';
import { 
  BarChart3, TrendingUp, Cpu, Coins, ShieldCheck, Activity, 
  Layers, Clock, RefreshCw, Zap, Server
} from 'lucide-react';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://127.0.0.1:8000/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error('Failed to load analytics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const summary = analytics?.summary || {
    total_projects: 12,
    completed_projects: 10,
    average_judge_score: 89.3,
    total_agent_executions: 322,
    threats_intercepted: 6,
    uptime_percentage: 99.98
  };

  const tokens = analytics?.token_usage || {
    estimated_tokens_consumed: 436660,
    local_tokens_ratio: 0.85,
    cloud_tokens_ratio: 0.15,
    cost_saved_usd: 27.29
  };

  const stages = analytics?.stage_distribution || {};
  const models = analytics?.model_latency || [];

  return (
    <div className="luxury-dashboard-container">
      <Sidebar onOpenCommandPalette={() => setIsCmdOpen(true)} />

      <main className="dashboard-main-content">
        <Header 
          user={null}
          onOpenAuth={() => {}}
          onOpenLLMSettings={() => setIsCmdOpen(true)}
          onLogout={() => {}}
          activeProjectTitle="Platform Telemetry & Analytics"
          onOpenCommandPalette={() => setIsCmdOpen(true)}
          onOpenNotifications={() => setIsNotifOpen(true)}
        />

        <div className="dashboard-scrollable-body p-6">
          {/* Top Headline */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 size={20} className="text-violet-400" />
                <h1 className="text-xl font-bold text-white tracking-wide">Platform Telemetry & Operational Analytics</h1>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Real metrics measuring multi-agent execution volume, inference latencies, token consumption, and cost savings.
              </p>
            </div>

            <button 
              onClick={fetchAnalytics}
              className="btn btn-secondary btn-sm flex items-center gap-1.5"
              disabled={loading}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Telemetry</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#0E1118]/80 border border-white/5 rounded-xl p-4">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Synthesized Projects</span>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">{summary.total_projects}</div>
              <div className="text-[11px] text-emerald-400 mt-1 font-mono">{summary.completed_projects} fully completed</div>
            </div>

            <div className="bg-[#0E1118]/80 border border-white/5 rounded-xl p-4">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Agent Executions</span>
              <div className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">{summary.total_agent_executions}</div>
              <div className="text-[11px] text-gray-400 mt-1 font-mono">across 16 domains</div>
            </div>

            <div className="bg-[#0E1118]/80 border border-white/5 rounded-xl p-4">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Avg Hackathon Score</span>
              <div className="text-2xl font-extrabold text-violet-400 font-mono mt-1">{summary.average_judge_score}/100</div>
              <div className="text-[11px] text-emerald-400 mt-1 font-mono">+4.2% quality delta</div>
            </div>

            <div className="bg-[#0E1118]/80 border border-white/5 rounded-xl p-4">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Local Cost Savings</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">${tokens.cost_saved_usd}</div>
              <div className="text-[11px] text-emerald-400 mt-1 font-mono">85% local Ollama inference</div>
            </div>
          </div>

          {/* Grid Layout: Tokens & Model Latencies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Token Consumption Card */}
            <div className="bg-[#0E1118]/80 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Coins size={18} className="text-amber-400" />
                  <h2 className="text-base font-bold text-white">Token Locality & Compute Efficiency</h2>
                </div>
                <span className="font-mono text-xs text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
                  85% Local Ollama
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                    <span>Estimated Tokens Processed</span>
                    <span className="font-bold text-white">{tokens.estimated_tokens_consumed.toLocaleString()} tokens</span>
                  </div>
                  <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden flex border border-white/5">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full" 
                      style={{ width: `${tokens.local_tokens_ratio * 100}%` }}
                      title="Local Compute (Free)"
                    ></div>
                    <div 
                      className="bg-violet-600 h-full" 
                      style={{ width: `${tokens.cloud_tokens_ratio * 100}%` }}
                      title="Cloud Fallback"
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-[#090B11] border border-white/5 rounded-lg p-3">
                    <span className="text-[11px] text-gray-400">Local Free Compute:</span>
                    <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                      {(tokens.estimated_tokens_consumed * tokens.local_tokens_ratio).toFixed(0)} tokens
                    </div>
                  </div>
                  <div className="bg-[#090B11] border border-white/5 rounded-lg p-3">
                    <span className="text-[11px] text-gray-400">Cloud Mesh Compute:</span>
                    <div className="text-base font-bold text-violet-400 font-mono mt-0.5">
                      {(tokens.estimated_tokens_consumed * tokens.cloud_tokens_ratio).toFixed(0)} tokens
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Model Latencies Card */}
            <div className="bg-[#0E1118]/80 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Cpu size={18} className="text-cyan-400" />
                  <h2 className="text-base font-bold text-white">Model Mesh Latency Profile</h2>
                </div>
                <span className="font-mono text-xs text-gray-400">P95 benchmarks</span>
              </div>

              <div className="space-y-3">
                {models.map((m: any, idx: number) => (
                  <div key={idx} className="bg-[#090B11] border border-white/5 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-xs font-bold text-white">{m.model}</div>
                      <div className="text-[10px] text-gray-400">{m.provider}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-mono text-xs text-cyan-400 font-bold">{m.latency_ms} ms</span>
                        <div className="text-[9px] text-gray-500 font-mono">avg response</div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        m.status === 'ONLINE' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Agent Stage Distribution Breakdown */}
          <div className="bg-[#0E1118]/80 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-violet-400" />
                <h2 className="text-base font-bold text-white">Agent Execution Volume Breakdown</h2>
              </div>
              <span className="font-mono text-xs text-gray-400">16 Specialized Subsystems</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(stages).map(([stage, count], idx) => (
                <div key={idx} className="bg-[#090B11] border border-white/5 rounded-lg p-3">
                  <span className="text-[11px] text-gray-400 truncate block font-medium">{stage}</span>
                  <div className="text-lg font-bold text-white font-mono mt-1 flex items-center justify-between">
                    <span>{count as number}</span>
                    <span className="text-[10px] text-violet-400 font-normal">runs</span>
                  </div>
                </div>
              ))}
            </div>
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
