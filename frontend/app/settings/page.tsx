'use client';
import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import NotificationDrawer from '../../components/NotificationDrawer';
import CommandPaletteModal from '../../components/CommandPaletteModal';
import { 
  Settings as SettingsIcon, Cpu, Shield, Database, Lock, Key, Check, Server, Save
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'ROUTING' | 'SECURITY' | 'STORAGE'>('GENERAL');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  // Settings State
  const [autoRouting, setAutoRouting] = useState(true);
  const [preferLocal, setPreferLocal] = useState(true);
  const [strictAST, setStrictAST] = useState(true);
  const [secretInterception, setSecretInterception] = useState(true);
  const [autoApprovalThreshold, setAutoApprovalThreshold] = useState(90);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
          activeProjectTitle="Operating System Settings"
          onOpenCommandPalette={() => setIsCmdOpen(true)}
          onOpenNotifications={() => setIsNotifOpen(true)}
        />

        <div className="dashboard-scrollable-body p-6">
          {/* Top Headline */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <SettingsIcon size={20} className="text-violet-400" />
                <h1 className="text-xl font-bold text-white tracking-wide">Operating System Settings & Policies</h1>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Configure compute routing heuristics, zero-trust sandbox rules, and local runtime persistence.
              </p>
            </div>

            <button 
              onClick={handleSave}
              className="btn btn-primary btn-sm glow-btn flex items-center gap-1.5"
            >
              {saved ? <Check size={14} /> : <Save size={14} />}
              <span>{saved ? 'Settings Saved' : 'Save Policies'}</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-white/5 pb-3 mb-6">
            {(['GENERAL', 'ROUTING', 'SECURITY', 'STORAGE'] as const).map(tab => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab 
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Settings Content */}
          <div className="bg-[#0E1118]/80 border border-white/5 rounded-2xl p-6 max-w-3xl">
            {activeTab === 'GENERAL' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Operating Node Identity</h3>
                  <p className="text-xs text-gray-400 mb-3">Unique identifier for this local hybrid node deployment.</p>
                  <input 
                    type="text" 
                    readOnly 
                    value="hackforge-hybrid-node-01 (127.0.0.1:8000)" 
                    className="bg-[#090B11] border border-white/10 rounded-xl px-4 py-2 text-xs text-cyan-400 font-mono w-full"
                  />
                </div>

                <div className="border-t border-white/5 pt-4">
                  <h3 className="text-sm font-bold text-white mb-1">GitHub Integration</h3>
                  <p className="text-xs text-gray-400 mb-3">Target repository for autonomous code sync and release deployments.</p>
                  <input 
                    type="text" 
                    readOnly 
                    value="https://github.com/AlibabaSN/hackforge-ai.git" 
                    className="bg-[#090B11] border border-white/10 rounded-xl px-4 py-2 text-xs text-gray-200 font-mono w-full"
                  />
                </div>
              </div>
            )}

            {activeTab === 'ROUTING' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Prefer Local Ollama Mesh</h3>
                    <p className="text-xs text-gray-400">Default to locally loaded models (Qwen 2.5 Coder, Gemma 3) for zero cost and total privacy.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={preferLocal} 
                    onChange={e => setPreferLocal(e.target.checked)}
                    className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
                  />
                </div>

                <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Dynamic Latency-Optimized Fallback</h3>
                    <p className="text-xs text-gray-400">Automatically route to cloud providers (Groq, Anthropic, OpenAI) if local response exceeds 1500ms.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={autoRouting} 
                    onChange={e => setAutoRouting(e.target.checked)}
                    className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {activeTab === 'SECURITY' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Strict AST Safety Interceptor</h3>
                    <p className="text-xs text-gray-400">Block any generated code containing dangerous system calls or shell execution before runtime.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={strictAST} 
                    onChange={e => setStrictAST(e.target.checked)}
                    className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
                  />
                </div>

                <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Secret Leak Prevention Shield</h3>
                    <p className="text-xs text-gray-400">Intercept and mask environment secrets, private keys, and API tokens from agent output traces.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={secretInterception} 
                    onChange={e => setSecretInterception(e.target.checked)}
                    className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {activeTab === 'STORAGE' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Primary Relational Storage</h3>
                  <p className="text-xs text-gray-400 mb-3">Configured via SQLAlchemy with automated migration support.</p>
                  <input 
                    type="text" 
                    readOnly 
                    value="sqlite:///./hackforge.db (SQLAlchemy Driver Active)" 
                    className="bg-[#090B11] border border-white/10 rounded-xl px-4 py-2 text-xs text-emerald-400 font-mono w-full"
                  />
                </div>
              </div>
            )}
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
