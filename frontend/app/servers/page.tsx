'use client';
import { useEffect, useState } from 'react';
import { Bot, Cpu, Server, Sliders, Shield, RefreshCw, Activity, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import Header from '../../components/Header';
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

  const [servers, setServers] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchServers();
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

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Bot size={22} />
          </div>
          <div>
            <div className="brand-title">HackForge AI</div>
            <div className="brand-tag">Hybrid AI Infrastructure</div>
          </div>
        </div>

        <nav className="nav-menu">
          <a href="/" className="nav-item"><Cpu size={17} /> Workspace</a>
          <a href="/agents" className="nav-item"><Bot size={17} /> Agent Team (16)</a>
          <a href="/servers" className="nav-item active"><Server size={17} /> AI Server Control Center</a>
          <a href="/settings/routing" className="nav-item"><Shield size={17} /> Routing & Privacy</a>
          <a href="/models" className="nav-item"><Sliders size={17} /> Model Mesh</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Header 
          user={user} 
          onOpenAuth={() => setShowAuthModal(true)} 
          onOpenLLMSettings={() => setShowLLMModal(true)}
          onLogout={() => setUser(null)}
          onNewProject={() => window.location.href = '/'}
          activeProjectTitle="AI Server Control Center"
        />

        <div className="dashboard-body">
          <div className="hero-banner">
            <div>
              <div className="hero-tag">
                <Activity size={14} /> HYBRID INFRASTRUCTURE CONTROL CENTER
              </div>
              <h1>AI Server Control Center</h1>
              <div className="muted">
                Manage local inference engines (Ollama, vLLM, llama.cpp), remote servers, and cloud APIs (OpenAI, Anthropic).
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" onClick={triggerScan} disabled={scanning}>
                <RefreshCw size={16} className={scanning ? 'spin' : ''} /> {scanning ? 'Scanning Ports...' : 'Scan Local Ports'}
              </button>
              <button className="btn btn-primary" onClick={() => setShowLLMModal(true)}>
                <Plus size={16} /> Add Custom Server
              </button>
            </div>
          </div>

          {/* Server Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18, marginBottom: 28 }}>
            {servers.map((s) => {
              const isOnline = s.status === 'ONLINE';
              return (
                <ThreeDCard key={s.provider}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{s.provider}</div>
                      <div className="muted" style={{ fontSize: 12 }}>{s.base_url}</div>
                    </div>
                    <span className={`status-badge ${isOnline ? 'done' : 'failed'}`}>
                      {isOnline ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                      {s.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, fontSize: 12 }}>
                    <span className="muted">Provider Type: <strong>{s.type}</strong></span>
                    <span className="muted">Latency: <strong>{s.latency_ms} ms</strong></span>
                  </div>

                  {s.models && s.models.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                      <div className="muted" style={{ fontSize: 11, marginBottom: 6, fontWeight: 700 }}>
                        MODELS DISCOVERED ({s.models.length})
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
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={() => {}} apiBase={API} />
      <LLMSettingsModal isOpen={showLLMModal} onClose={() => setShowLLMModal(false)} apiBase={API} />
    </div>
  );
}
