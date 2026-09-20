'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import NotificationDrawer from '../../components/NotificationDrawer';
import CommandPaletteModal from '../../components/CommandPaletteModal';
import { 
  Layers, Search, Filter, RefreshCw, CheckCircle2, Clock, AlertCircle, 
  Terminal, ArrowUpRight, ChevronRight, X, Bot, Shield, Code2
} from 'lucide-react';

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'RUNNING' | 'FAILED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExecution, setSelectedExecution] = useState<any | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'ALL' 
        ? 'http://127.0.0.1:8000/api/executions'
        : `http://127.0.0.1:8000/api/executions?status=${statusFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setExecutions(data.executions || []);
      }
    } catch (err) {
      console.error('Error fetching executions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
    const interval = setInterval(fetchExecutions, 10000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const filtered = executions.filter(e => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (e.project_title && e.project_title.toLowerCase().includes(query)) ||
      (e.stage_name && e.stage_name.toLowerCase().includes(query)) ||
      (e.id && String(e.id).includes(query))
    );
  });

  const totalCount = executions.length;
  const completedCount = executions.filter(e => e.status === 'COMPLETED').length;
  const runningCount = executions.filter(e => e.status === 'RUNNING').length;
  const failedCount = executions.filter(e => e.status === 'FAILED').length;

  return (
    <div className="luxury-dashboard-container">
      <Sidebar onOpenCommandPalette={() => setIsCmdOpen(true)} />

      <main className="dashboard-main-content">
        <Header 
          user={null}
          onOpenAuth={() => {}}
          onOpenLLMSettings={() => setIsCmdOpen(true)}
          onLogout={() => {}}
          activeProjectTitle="Autonomous Execution Traces"
          onOpenCommandPalette={() => setIsCmdOpen(true)}
          onOpenNotifications={() => setIsNotifOpen(true)}
        />

        <div className="dashboard-scrollable-body p-6">
          {/* Top Headline & Quick Metrics */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Layers size={20} className="text-violet-400" />
                <h1 className="text-xl font-bold text-white tracking-wide">Autonomous Execution Traces</h1>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Real-time technical logs, stage outputs, and execution telemetry across the 16 domain agents.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={fetchExecutions}
                className="btn btn-secondary btn-sm flex items-center gap-1.5"
                disabled={loading}
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                <span>Refresh Traces</span>
              </button>
            </div>
          </div>

          {/* Metric Counter Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#0E1118]/80 border border-white/5 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Traces</span>
                <div className="text-2xl font-extrabold text-white font-mono mt-1">{totalCount}</div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                <Layers size={18} className="text-violet-400" />
              </div>
            </div>

            <div className="bg-[#0E1118]/80 border border-white/5 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Completed</span>
                <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">{completedCount}</div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 size={18} className="text-emerald-400" />
              </div>
            </div>

            <div className="bg-[#0E1118]/80 border border-white/5 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Active In-Flight</span>
                <div className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">{runningCount}</div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center">
                <Clock size={18} className="text-cyan-400" />
              </div>
            </div>

            <div className="bg-[#0E1118]/80 border border-white/5 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Anomalies / Failed</span>
                <div className="text-2xl font-extrabold text-rose-400 font-mono mt-1">{failedCount}</div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-rose-600/10 border border-rose-500/20 flex items-center justify-center">
                <AlertCircle size={18} className="text-rose-400" />
              </div>
            </div>
          </div>

          {/* Search & Status Filter Bar */}
          <div className="bg-[#0E1118]/70 border border-white/5 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search size={15} className="text-gray-400 ml-2" />
              <input 
                type="text" 
                placeholder="Filter by project title, agent name, or execution ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-gray-500 border-none outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              {(['ALL', 'COMPLETED', 'RUNNING', 'FAILED'] as const).map(tab => (
                <button
                  key={tab}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === tab 
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30' 
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setStatusFilter(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Traces Table */}
          <div className="traces-table-wrapper">
            <table className="traces-table">
              <thead>
                <tr>
                  <th>Trace ID</th>
                  <th>Project Context</th>
                  <th>Agent Specialist</th>
                  <th>Status</th>
                  <th>Execution Duration</th>
                  <th>Timestamp</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      {loading ? 'Retrieving execution traces from telemetry bus...' : 'No execution traces match the selected filter.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map(item => {
                    const isCompleted = item.status === 'COMPLETED';
                    const isRunning = item.status === 'RUNNING';
                    const isFailed = item.status === 'FAILED';

                    return (
                      <tr 
                        key={item.id}
                        className="cursor-pointer hover:bg-white/[0.02] transition-colors"
                        onClick={() => setSelectedExecution(item)}
                      >
                        <td className="font-mono text-cyan-400 text-xs">#{item.id}</td>
                        <td className="font-medium text-white max-w-[220px] truncate">
                          {item.project_title || `Project #${item.project_id}`}
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <Bot size={14} className="text-violet-400" />
                            <span className="font-semibold text-gray-200 text-xs">{item.stage_name}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isCompleted ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' :
                            isRunning ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 animate-pulse' :
                            'bg-rose-950/40 text-rose-400 border border-rose-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              isCompleted ? 'bg-emerald-400' : isRunning ? 'bg-cyan-400' : 'bg-rose-400'
                            }`}></span>
                            {item.status}
                          </span>
                        </td>
                        <td className="font-mono text-xs text-gray-300">
                          {item.duration_seconds ? `${item.duration_seconds}s` : '1.4s (est)'}
                        </td>
                        <td className="font-mono text-xs text-gray-400">
                          {new Date(item.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          <button 
                            className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-semibold"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedExecution(item);
                            }}
                          >
                            Inspect <ChevronRight size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Execution Trace Inspector */}
        {selectedExecution && (
          <div className="modal-backdrop" onClick={() => setSelectedExecution(null)}>
            <div className="modal-container max-w-2xl" onClick={e => e.stopPropagation()}>
              <div className="modal-header flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Terminal size={18} className="text-violet-400" />
                  <span className="font-bold text-white text-sm">
                    Trace #{selectedExecution.id} — {selectedExecution.stage_name}
                  </span>
                </div>
                <button className="icon-button" onClick={() => setSelectedExecution(null)}>
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body py-4 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-xs bg-[#090B11] p-3 rounded-lg border border-white/5">
                  <div>
                    <span className="text-gray-500">Project:</span>
                    <div className="font-semibold text-white truncate">{selectedExecution.project_title || `#${selectedExecution.project_id}`}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <div className="font-semibold text-emerald-400">{selectedExecution.status}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <div className="font-semibold font-mono text-cyan-400">{selectedExecution.duration_seconds || '1.4'} seconds</div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-2 font-mono uppercase tracking-wider">
                    Agent Output Payload
                  </label>
                  <pre className="bg-[#05060A] border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-300 overflow-x-auto max-h-80 leading-relaxed whitespace-pre-wrap">
                    {selectedExecution.output || 'No output recorded for this stage execution.'}
                  </pre>
                </div>
              </div>

              <div className="modal-footer pt-3 border-t border-white/10 flex justify-end">
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedExecution(null)}
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        )}
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
