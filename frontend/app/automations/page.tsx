'use client';
import { useState, useEffect } from 'react';
import { 
  Sparkles, RefreshCw, Clock, CheckCircle2, AlertTriangle, 
  ToggleLeft, ToggleRight, Play, Server, Database, Shield
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CommandPalette from '@/components/CommandPalette';
import AuthModal from '@/components/AuthModal';
import LLMSettingsModal from '@/components/LLMSettingsModal';
import ThreeDBackgroundCanvas from '@/components/ThreeDBackgroundCanvas';
import { getApiBase } from '@/lib/api';

const API = getApiBase();

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Command Palette & Modals
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showLLMModal, setShowLLMModal] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadAutomations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/automations`);
      if (res.ok) {
        setAutomations(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAutomations();
  }, []);

  const handleToggle = async (id: number) => {
    try {
      const res = await fetch(`${API}/automations/${id}/toggle`, { method: 'POST' });
      if (res.ok) {
        setAutomations(prev => prev.map(a => a.id === id ? { ...a, is_enabled: !a.is_enabled } : a));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app-container">
      <ThreeDBackgroundCanvas />
      
      <Sidebar onOpenCommandPalette={() => setShowCommandPalette(true)} />

      <div className="main-content-wrapper">
        <Header
          user={user}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenLLMSettings={() => setShowLLMModal(true)}
          onLogout={() => setUser(null)}
          activeProjectTitle="Scheduled Automations Hub"
          onOpenCommandPalette={() => setShowCommandPalette(true)}
        />

        <main className="dashboard-content">
          <div className="database-hero-banner">
            <div className="db-banner-left">
              <div className="db-badge">
                <Sparkles size={16} className="text-amber-400" />
                <span>CRON JOBS & SCHEDULED ENGINEERING TASKS</span>
              </div>
              <h1 className="db-hero-title">Automations Hub</h1>
              <p className="db-hero-subtitle">
                Scheduled background maintenance, model health heartbeats, continuous security audits, and database vacuuming.
              </p>
            </div>
            <div className="db-banner-right">
              <button className="btn btn-secondary btn-sm" onClick={loadAutomations}>
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Jobs
              </button>
            </div>
          </div>

          <div className="automations-grid">
            {automations.map((auto: any) => (
              <div key={auto.id} className={`automation-card ${auto.is_enabled ? 'enabled' : 'disabled'}`}>
                <div className="auto-card-header">
                  <div className="auto-header-left">
                    <span className="auto-cron-badge font-mono">{auto.cron_expression}</span>
                    <span className={`status-pill ${auto.last_status === 'SUCCESS' ? 'allowed' : 'pending'}`}>
                      {auto.last_status}
                    </span>
                  </div>
                  <button 
                    className="policy-toggle-btn"
                    onClick={() => handleToggle(auto.id)}
                    title={auto.is_enabled ? 'Disable Automation' : 'Enable Automation'}
                  >
                    {auto.is_enabled ? (
                      <ToggleRight size={26} className="text-emerald-400" />
                    ) : (
                      <ToggleLeft size={26} className="text-dim" />
                    )}
                  </button>
                </div>

                <div className="auto-name">{auto.name}</div>
                
                <div className="auto-meta-row">
                  <span className="auto-agent-target">
                    <strong>Agent:</strong> {auto.agent_target}
                  </span>
                </div>

                <div className="auto-payload-box">
                  <span className="text-xs text-dim font-mono">Payload:</span>
                  <code className="font-mono text-xs text-cyan-300">
                    {JSON.stringify(auto.input_payload)}
                  </code>
                </div>

                <div className="auto-footer-times">
                  <span>Last Run: {new Date(auto.last_run_at).toLocaleTimeString()}</span>
                  <span className="text-dim">Next Run: {new Date(auto.next_run_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <CommandPalette 
        isOpen={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)} 
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(userData: any) => {
          setUser(userData);
          setShowAuthModal(false);
        }}
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
