'use client';
import { useEffect, useState } from 'react';
import { Bot, Sliders, Cpu, Server, Award } from 'lucide-react';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import CommandPalette from '../../../components/CommandPalette';
import ThreeDBackgroundCanvas from '../../../components/ThreeDBackgroundCanvas';
import ThreeDCard from '../../../components/ThreeDCard';
import { getApiBase } from '@/lib/api';

const API = getApiBase();

export default function ModelComparePage() {
  const [comparison, setComparison] = useState<any[]>([]);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  useEffect(() => {
    fetch(`${API}/models/compare`)
      .then((res) => res.json())
      .then((data) => setComparison(data))
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

  return (
    <div className="app-container">
      {/* 3D Background */}
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
          activeProjectTitle="Model Comparison Matrix"
          onOpenCommandPalette={() => setShowCommandPalette(true)}
        />

        <div className="dashboard-content">
          <div className="database-hero-banner">
            <div className="db-banner-left">
              <div className="db-badge">
                <Award size={16} className="text-amber-400" />
                <span>MULTI-MODEL PERFORMANCE MATRIX</span>
              </div>
              <h1 className="db-hero-title">Model Comparison Matrix</h1>
              <p className="db-hero-subtitle">
                Compare open-weight models across Reasoning, Coding, Latency, Cost Efficiency, and Tool Calling capability.
              </p>
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
      </div>

      <CommandPalette 
        isOpen={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)} 
      />
    </div>
  );
}
