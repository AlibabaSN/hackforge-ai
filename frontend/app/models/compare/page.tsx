'use client';
import { useEffect, useState } from 'react';
import { Bot, Sliders, Cpu, Server, Award } from 'lucide-react';
import Header from '../../../components/Header';
import ThreeDBackgroundCanvas from '../../../components/ThreeDBackgroundCanvas';
import ThreeDCard from '../../../components/ThreeDCard';
import { getApiBase } from '@/lib/api';

const API = getApiBase();

export default function ModelComparePage() {
  const [comparison, setComparison] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/models/compare`)
      .then((res) => res.json())
      .then((data) => setComparison(data))
      .catch(console.error);
  }, []);

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
            <div className="brand-tag">Model Mesh Dashboard</div>
          </div>
        </div>

        <nav className="nav-menu">
          <a href="/" className="nav-item"><Cpu size={17} /> Workspace</a>
          <a href="/agents" className="nav-item"><Bot size={17} /> Agent Team (16)</a>
          <a href="/servers" className="nav-item"><Server size={17} /> AI Server Control</a>
          <a href="/models" className="nav-item"><Sliders size={17} /> Model Control Center</a>
          <a href="/models/compare" className="nav-item active"><Award size={17} /> Model Comparison</a>
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
          activeProjectTitle="Model Comparison"
        />

        <div className="dashboard-body">
          <div className="hero-banner">
            <div>
              <div className="hero-tag">
                <Award size={14} /> MULTI-MODEL PERFORMANCE MATRIX
              </div>
              <h1>Model Comparison Matrix</h1>
              <div className="muted">
                Compare open-weight models across Reasoning, Coding, Latency, Cost Efficiency, and Tool Calling capability.
              </div>
            </div>
          </div>

          <ThreeDCard style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>Model Name</th>
                  <th style={{ padding: '12px 16px' }}>Reasoning Score</th>
                  <th style={{ padding: '12px 16px' }}>Coding Score</th>
                  <th style={{ padding: '12px 16px' }}>Latency Rating</th>
                  <th style={{ padding: '12px 16px' }}>Cost Efficiency</th>
                  <th style={{ padding: '12px 16px' }}>Tool Calling</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.model} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>{row.model}</td>
                    <td style={{ padding: '14px 16px' }}><span className="score-green">{row.reasoning}/10</span></td>
                    <td style={{ padding: '14px 16px' }}><span className="score-green">{row.coding}/10</span></td>
                    <td style={{ padding: '14px 16px' }}><span className="score-yellow">{row.latency}/10</span></td>
                    <td style={{ padding: '14px 16px' }}><span className="score-green">{row.cost}/10</span></td>
                    <td style={{ padding: '14px 16px' }}><span className="score-green">{row.tool_use}/10</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ThreeDCard>
        </div>
      </main>
    </div>
  );
}
