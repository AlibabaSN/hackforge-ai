'use client';
import { useEffect, useState } from 'react';
import { Bot, Cpu, Server, Sliders, Shield, Lock, CheckCircle2 } from 'lucide-react';
import Header from '../../../components/Header';
import ThreeDBackgroundCanvas from '../../../components/ThreeDBackgroundCanvas';
import ThreeDCard from '../../../components/ThreeDCard';
import { getApiBase } from '@/lib/api';

const API = getApiBase();

const MODES = [
  { value: 'HYBRID', title: 'Hybrid Routing (Default)', desc: 'Intelligently routes tasks to local or cloud models based on performance, cost, and privacy rules.' },
  { value: 'LOCAL_ONLY', title: 'Local Only (Strict Offline)', desc: 'Enforces strict 100% offline execution using local Ollama, vLLM, or llama.cpp. Zero data leaves your machine.' },
  { value: 'PRIVACY_FIRST', title: 'Privacy First', desc: 'Automatically blocks cloud routing if confidential code, secret tokens, or private credentials are detected.' },
  { value: 'FASTEST', title: 'Fastest Response', desc: 'Routes tasks to the provider with lowest latency.' },
  { value: 'CHEAPEST', title: 'Cheapest Cost', desc: 'Prefers zero-cost local inference before commercial cloud APIs.' },
  { value: 'BEST_QUALITY', title: 'Best Quality', desc: 'Prefers state-of-the-art reasoning models (Qwen 70B, Claude 3.5 Sonnet, GPT-4o).' }
];

export default function RoutingSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API}/routing/settings`)
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(console.error);
  }, []);

  async function updateMode(mode: string) {
    setSaving(true);
    try {
      const res = await fetch(`${API}/routing/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      if (res.ok) {
        setSettings(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-container">
      {/* 3D Canvas Background */}
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
          <a href="/servers" className="nav-item"><Server size={17} /> AI Server Control Center</a>
          <a href="/settings/routing" className="nav-item active"><Shield size={17} /> Routing & Privacy</a>
          <a href="/models" className="nav-item"><Sliders size={17} /> Model Mesh</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Header 
          user={null} 
          onOpenAuth={() => {}} 
          onOpenLLMSettings={() => {}}
          onLogout={() => {}}
          onNewProject={() => window.location.href = '/'}
          activeProjectTitle="Routing & Privacy Settings"
        />

        <div className="dashboard-body">
          <div className="hero-banner">
            <div>
              <div className="hero-tag">
                <Lock size={14} /> SECURITY & PRIVACY POLICY ENGINE
              </div>
              <h1>Model Routing & Data Locality Settings</h1>
              <div className="muted">
                Control routing boundaries, data privacy rules, and model selection preferences across local and cloud layers.
              </div>
            </div>
          </div>

          {/* Mode Selector Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
            {MODES.map((m) => {
              const selected = settings?.current_mode === m.value;
              return (
                <ThreeDCard 
                  key={m.value}
                  className={selected ? 'border-purple-500' : ''}
                  onClick={() => updateMode(m.value)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{m.title}</div>
                    {selected && <CheckCircle2 size={18} className="text-purple-400" />}
                  </div>
                  <p className="muted" style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                    {m.desc}
                  </p>
                </ThreeDCard>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
