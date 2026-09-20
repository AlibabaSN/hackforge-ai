'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import NotificationDrawer from '../../components/NotificationDrawer';
import CommandPaletteModal from '../../components/CommandPaletteModal';
import { 
  FileText, Shield, Key, RefreshCw, CheckCircle2, Lock, AlertTriangle, Filter, Search
} from 'lucide-react';

export default function AuditPage() {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'SECURITY' | 'DEPLOYMENT' | 'ROUTING'>('ALL');

  const auditEvents = [
    {
      id: 'aud-9812',
      timestamp: '2026-09-20T07:42:00Z',
      actor: 'Lead System Architect',
      action: 'DEPLOYMENT_TRIGGER',
      category: 'DEPLOYMENT',
      details: 'Dispatched commit 386f762 to Staging node k8s-staging-node-02',
      signature: 'sha256:4a8b9...c3ef',
      status: 'VERIFIED'
    },
    {
      id: 'aud-9811',
      timestamp: '2026-09-20T07:35:12Z',
      actor: 'Zero-Trust SOC Guard',
      action: 'SECURITY_INTERCEPT',
      category: 'SECURITY',
      details: 'Blocked AST unsafe eval invocation in generated test script',
      signature: 'sha256:7f12e...b90a',
      status: 'BLOCKED'
    },
    {
      id: 'aud-9810',
      timestamp: '2026-09-20T07:15:00Z',
      actor: 'Lead System Architect',
      action: 'PRODUCTION_AUTHORIZE',
      category: 'DEPLOYMENT',
      details: 'Signed production release v1.4.2 to k8s-us-east-cluster-01',
      signature: 'sha256:889aa...44bb',
      status: 'VERIFIED'
    },
    {
      id: 'aud-9809',
      timestamp: '2026-09-20T06:50:20Z',
      actor: 'Model Routing Engine',
      action: 'ROUTING_FALLBACK',
      category: 'ROUTING',
      details: 'Auto-routed prompt to Ollama local qwen2.5-coder (latency: 142ms)',
      signature: 'sha256:22ef1...67d8',
      status: 'VERIFIED'
    },
    {
      id: 'aud-9808',
      timestamp: '2026-09-20T06:20:15Z',
      actor: 'Safe SQL Console',
      action: 'SCHEMA_INSPECTION',
      category: 'SECURITY',
      details: 'Read-only PRAGMA schema query executed on SQLite datastore',
      signature: 'sha256:bb312...990f',
      status: 'VERIFIED'
    }
  ];

  const filtered = auditEvents.filter(e => {
    if (categoryFilter === 'ALL') return true;
    return e.category === categoryFilter;
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
          activeProjectTitle="Cryptographic Audit Trail"
          onOpenCommandPalette={() => setIsCmdOpen(true)}
          onOpenNotifications={() => setIsNotifOpen(true)}
        />

        <div className="dashboard-scrollable-body p-6">
          {/* Top Headline */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-violet-400" />
                <h1 className="text-xl font-bold text-white tracking-wide">Cryptographic Audit Trail & Governance</h1>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Tamper-evident operational ledger recording all human authorizations, agent actions, and security gate decisions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(['ALL', 'SECURITY', 'DEPLOYMENT', 'ROUTING'] as const).map(tab => (
                <button
                  key={tab}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    categoryFilter === tab 
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30' 
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setCategoryFilter(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Trail Table */}
          <div className="traces-table-wrapper">
            <table className="traces-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action Type</th>
                  <th>Details</th>
                  <th>Cryptographic Signature</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <td className="font-mono text-cyan-400 text-xs">{item.id}</td>
                    <td className="font-mono text-xs text-gray-400">
                      {new Date(item.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="font-semibold text-white text-xs">{item.actor}</td>
                    <td>
                      <span className="font-mono text-xs text-violet-300 font-bold bg-violet-950/30 border border-violet-500/20 px-2 py-0.5 rounded">
                        {item.action}
                      </span>
                    </td>
                    <td className="text-xs text-gray-300 max-w-[280px]">{item.details}</td>
                    <td className="font-mono text-[11px] text-gray-500">{item.signature}</td>
                    <td>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'VERIFIED' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' :
                        'bg-red-950/40 text-red-400 border border-red-500/20'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
