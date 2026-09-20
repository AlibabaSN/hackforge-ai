'use client';
import React, { useState, useEffect } from 'react';
import { 
  Bot, Cpu, Database, Shield, Rocket, Network, Sparkles, Terminal, Activity
} from 'lucide-react';

interface OrbitNode {
  id: string;
  label: string;
  category: string;
  status: 'ONLINE' | 'ACTIVE' | 'ARMED' | 'STANDBY';
  icon: any;
  color: string;
  glow: string;
  angle: number; // in degrees
  radius: number; // in px
  speed: number;
}

export default function SystemOrbitCanvas() {
  const [rotation, setRotation] = useState(0);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const nodes: OrbitNode[] = [
    { id: 'agents', label: '16 Domain Agents', category: 'Autonomous Agents', status: 'ACTIVE', icon: Bot, color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)', angle: 0, radius: 170, speed: 1 },
    { id: 'models', label: 'Local Mesh & Cloud', category: 'Model Mesh', status: 'ONLINE', icon: Cpu, color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', angle: 45, radius: 240, speed: -0.7 },
    { id: 'knowledge', label: 'Knowledge & RAG', category: 'Vector Index', status: 'ONLINE', icon: Network, color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', angle: 90, radius: 170, speed: 1 },
    { id: 'tools', label: 'MCP & Sandbox', category: 'Docker & AST', status: 'ONLINE', icon: Terminal, color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', angle: 135, radius: 240, speed: -0.7 },
    { id: 'workflows', label: 'Autonomous Pipelines', category: 'Workflow Engine', status: 'ACTIVE', icon: Sparkles, color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', angle: 180, radius: 170, speed: 1 },
    { id: 'security', label: 'Zero-Trust SOC', category: 'Threat Interceptor', status: 'ARMED', icon: Shield, color: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)', angle: 225, radius: 240, speed: -0.7 },
    { id: 'database', label: 'SQL & Event Ledger', category: 'Storage Engine', status: 'ONLINE', icon: Database, color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', angle: 270, radius: 170, speed: 1 },
    { id: 'deployments', label: 'Continuous Delivery', category: 'K8s & Hybrid', status: 'ACTIVE', icon: Rocket, color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)', angle: 315, radius: 240, speed: -0.7 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.2) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="system-orbit-container">
      <div className="system-orbit-viewport">
        {/* Orbital Track 1 */}
        <div className="orbit-track orbit-track-inner"></div>
        {/* Orbital Track 2 */}
        <div className="orbit-track orbit-track-outer"></div>

        {/* Central Core */}
        <div className="orbit-center-core">
          <div className="core-glow-pulse"></div>
          <div className="core-inner-gem">
            <Activity size={26} className="text-cyan-400" />
            <div className="core-title">HACKFORGE</div>
            <div className="core-subtitle">CORE OS v1.5</div>
          </div>
          <div className="core-metric-tag">ALL SYSTEMS OPTIMAL</div>
        </div>

        {/* Orbiting Satellite Nodes */}
        {nodes.map(node => {
          const currentAngle = (node.angle + (rotation * node.speed)) * (Math.PI / 180);
          const x = Math.cos(currentAngle) * node.radius;
          const y = Math.sin(currentAngle) * node.radius;
          const Icon = node.icon;
          const isSelected = selectedNode === node.id;

          return (
            <div 
              key={node.id}
              className={`orbit-satellite-node ${isSelected ? 'selected' : ''}`}
              style={{
                transform: `translate(${x}px, ${y}px)`,
                borderColor: isSelected ? '#fff' : node.color,
                boxShadow: `0 0 16px ${node.glow}`
              }}
              onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
            >
              <div className="satellite-icon-circle" style={{ background: `rgba(14, 17, 24, 0.9)` }}>
                <Icon size={16} style={{ color: node.color }} />
              </div>
              <div className="satellite-label-pill">
                <span className="satellite-name">{node.label}</span>
                <span className="satellite-status" style={{ color: node.color }}>● {node.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail HUD if node is selected */}
      {selectedNode && (
        <div className="orbit-node-hud-overlay">
          {(() => {
            const active = nodes.find(n => n.id === selectedNode);
            if (!active) return null;
            const ActiveIcon = active.icon;
            return (
              <div className="hud-card">
                <div className="hud-header">
                  <div className="hud-icon" style={{ color: active.color }}>
                    <ActiveIcon size={18} />
                  </div>
                  <div>
                    <div className="hud-title">{active.label}</div>
                    <div className="hud-cat">{active.category}</div>
                  </div>
                  <button className="hud-close" onClick={() => setSelectedNode(null)}>✕</button>
                </div>
                <div className="hud-body">
                  <div className="hud-stat-row">
                    <span className="hud-label">Subsystem Status:</span>
                    <span className="hud-val" style={{ color: active.color }}>● {active.status}</span>
                  </div>
                  <div className="hud-stat-row">
                    <span className="hud-label">Protocol:</span>
                    <span className="hud-val font-mono">Zero-Latency Mesh</span>
                  </div>
                  <div className="hud-stat-row">
                    <span className="hud-label">Verification:</span>
                    <span className="hud-val font-mono text-emerald-400">Cryptographically Signed</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
