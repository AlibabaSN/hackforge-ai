'use client';
import { useEffect, useState } from 'react';
import { Bot, Cpu, Server, Sliders, Shield, Lock, CheckCircle2 } from 'lucide-react';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import CommandPalette from '../../../components/CommandPalette';
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
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  useEffect(() => {
    fetch(`${API}/routing/settings`)
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(console.error);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

      {/* Luxury Enterprise Sidebar */}
      <Sidebar onOpenCommandPalette={() => setShowCommandPalette(true)} />

      {/* Main Content */}
      <div className="main-content-wrapper">
        <Header 
          user={null} 
          onOpenAuth={() => {}} 
          onOpenLLMSettings={() => {}}
          onLogout={() => {}}
          onNewProject={() => window.location.href = '/'}
          activeProjectTitle="Data Locality & Routing Rules"
          onOpenCommandPalette={() => setShowCommandPalette(true)}
        />

        <div className="dashboard-content">
          <div className="database-hero-banner">
            <div className="db-banner-left">
              <div className="db-badge">
                <Lock size={16} className="text-emerald-400" />
                <span>SECURITY & PRIVACY POLICY ENGINE</span>
              </div>
              <h1 className="db-hero-title">Model Routing & Data Locality Settings</h1>
              <p className="db-hero-subtitle">
                Control routing boundaries, data privacy rules, and model selection preferences across local and cloud layers.
              </p>
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
      </div>

      <CommandPalette 
        isOpen={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)} 
      />
    </div>
  );
}
