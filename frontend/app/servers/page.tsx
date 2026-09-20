'use client';
import { useEffect, useState } from 'react';
import { Bot, Cpu, Server, Sliders, Shield, RefreshCw, Activity, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import CommandPalette from '../../components/CommandPalette';
import AuthModal from '../../components/AuthModal';
import LLMSettingsModal from '../../components/LLMSettingsModal';
import ThreeDBackgroundCanvas from '../../components/ThreeDBackgroundCanvas';
import ThreeDCard from '../../components/ThreeDCard';
import { getApiBase } from '@/lib/api';

const API = getApiBase();

export default function ServersPage() {
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLLMModal, setShowLLMModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const [servers, setServers] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchServers();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function fetchServers() {
    try {
      const res = await fetch(`${API}/servers`);
      if (res.ok) {
        setServers(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function triggerScan() {
    setScanning(true);
    try {
      const res = await fetch(`${API}/servers/scan`);
      if (res.ok) {
        setServers(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="app-container">
      {/* 3D Background */}
      <ThreeDBackgroundCanvas />

      {/* Luxury Enterprise Sidebar */}
      <Sidebar onOpenCommandPalette={() => setShowCommandPalette(true)} />

      {/* Main Content */}
      <div className="main-content-wrapper">
        <Header 
          user={user} 
          onOpenAuth={() => setShowAuthModal(true)} 
          onOpenLLMSettings={() => setShowLLMModal(true)}
          onLogout={() => setUser(null)}
          onNewProject={() => window.location.href = '/'}
          activeProjectTitle="Distributed Inference Clusters"
          onOpenCommandPalette={() => setShowCommandPalette(true)}
        />

        <div className="dashboard-content">
          <div className="database-hero-banner">
            <div className="db-banner-left">
              <div className="db-badge">
                <Server size={16} className="text-cyan-400" />
                <span>DISTRIBUTED AI INFERENCE CLUSTERS</span>
              </div>
              <h1 className="db-hero-title">AI Server Control Center</h1>
              <p className="db-hero-subtitle">
                Monitor live cluster nodes, local Ollama endpoints, GPU latency metrics, and network connection health in real time.
              </p>
            </div>

            <div className="db-banner-right">
              <button className="btn btn-secondary btn-sm" onClick={triggerScan} disabled={scanning}>
                <RefreshCw size={14} className={scanning ? 'animate-spin' : ''} />
                {scanning ? 'Discovering Nodes...' : 'Scan Local Network'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
            {servers.map((s) => {
              const isOnline = s.status === 'ONLINE';
              return (
                <ThreeDCard key={s.id || s.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{s.name}</div>
                      <div className="muted" style={{ fontSize: 11, fontFamily: 'monospace' }}>
                        {s.base_url || 'Embedded Provider'}
                      </div>
                    </div>
                    <span className={`status-badge ${isOnline ? 'done' : 'error'}`}>
                      {isOnline ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                      {s.status}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '14px 0', fontSize: 12 }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 8 }}>
                      <span className="muted" style={{ display: 'block', fontSize: 10 }}>TYPE</span>
                      <strong>{s.provider_type}</strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 8 }}>
                      <span className="muted" style={{ display: 'block', fontSize: 10 }}>PING LATENCY</span>
                      <strong style={{ color: s.latency_ms > 500 ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
                        {s.latency_ms ? `${s.latency_ms} ms` : 'Offline'}
                      </strong>
                    </div>
                  </div>

                  {s.models && s.models.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                      <div className="muted" style={{ fontSize: 10, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>
                        SERVED MODELS ({s.models.length})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {s.models.map((m: any) => (
                          <span key={typeof m === 'string' ? m : m.name} className="tab-btn" style={{ padding: '2px 6px', fontSize: 10 }}>
                            {typeof m === 'string' ? m : m.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </ThreeDCard>
              );
            })}
          </div>
        </div>
      </div>

      <CommandPalette 
        isOpen={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)} 
      />

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={() => {}} apiBase={API} />
      <LLMSettingsModal isOpen={showLLMModal} onClose={() => setShowLLMModal(false)} apiBase={API} />
    </div>
  );
}
