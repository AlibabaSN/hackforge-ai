'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, Terminal, Bot, Compass, Sparkles, Database, Shield, 
  Cpu, Sliders, Server, Lock, ChevronLeft, ChevronRight, Search, 
  Code2, CheckCircle2, AlertCircle
} from 'lucide-react';

interface SidebarProps {
  onOpenCommandPalette?: () => void;
}

export default function Sidebar({ onOpenCommandPalette }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      group: 'COMMAND & CONTROL',
      items: [
        { label: 'Command Center', href: '/dashboard', icon: Activity, badge: 'Live' },
        { label: 'Autonomous Factory', href: '/', icon: Terminal },
        { label: '16 Domain Agents', href: '/agents', icon: Bot, badge: '16' }
      ]
    },
    {
      group: 'AUTOMATION & PIPELINES',
      items: [
        { label: 'Workflows', href: '/workflows', icon: Compass },
        { label: 'Automations', href: '/automations', icon: Sparkles, badge: 'Cron' }
      ]
    },
    {
      group: 'SYSTEMS & SECURITY',
      items: [
        { label: 'Database Center', href: '/database', icon: Database, badge: 'SQL' },
        { label: 'Security SOC', href: '/security', icon: Shield, badge: 'Zero-Trust' }
      ]
    },
    {
      group: 'AI MESH & INFRASTRUCTURE',
      items: [
        { label: 'Model Registry', href: '/models', icon: Cpu },
        { label: 'Model Benchmarks', href: '/models/compare', icon: Sliders },
        { label: 'Inference Clusters', href: '/servers', icon: Server },
        { label: 'Data Locality', href: '/settings/routing', icon: Lock }
      ]
    }
  ];

  return (
    <aside className={`luxury-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand-container">
        <Link href="/dashboard" className="sidebar-brand-link">
          <div className="brand-logo-gem">
            <Code2 size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div className="brand-text-block">
              <span className="brand-title">HACKFORGE</span>
              <span className="brand-subtitle">ENTERPRISE AI OS</span>
            </div>
          )}
        </Link>
        <button 
          className="sidebar-collapse-toggle" 
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Quick Search / Command Palette Trigger */}
      <div className="sidebar-search-section">
        <button 
          className="sidebar-search-btn" 
          onClick={onOpenCommandPalette}
          title="Open Command Palette (Ctrl+K)"
        >
          <Search size={15} />
          {!collapsed && (
            <>
              <span className="search-placeholder">Quick Command...</span>
              <kbd className="sidebar-kbd">⌘K</kbd>
            </>
          )}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="sidebar-nav-scroll">
        {navItems.map((group, gIdx) => (
          <div key={gIdx} className="sidebar-nav-group">
            {!collapsed && <div className="sidebar-group-label">{group.group}</div>}
            <div className="sidebar-group-links">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className="sidebar-nav-icon-wrap">
                      <Icon size={17} />
                    </div>
                    {!collapsed && (
                      <span className="sidebar-nav-label">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className={`sidebar-nav-badge ${isActive ? 'active' : ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Real-time System Status Cluster */}
      {!collapsed ? (
        <div className="sidebar-cluster-card">
          <div className="cluster-header">
            <span className="cluster-title">RUNTIME ENGINES</span>
            <span className="status-indicator-live">
              <span className="live-dot"></span>
              READY
            </span>
          </div>
          <div className="cluster-engine-list">
            <div className="cluster-engine-item">
              <span className="engine-name">Ollama Local Engine</span>
              <span className="engine-val text-emerald-400">ONLINE</span>
            </div>
            <div className="cluster-engine-item">
              <span className="engine-name">SQLAlchemy Data Store</span>
              <span className="engine-val text-cyan-400">ACTIVE</span>
            </div>
            <div className="cluster-engine-item">
              <span className="engine-name">Zero-Trust Guard</span>
              <span className="engine-val text-violet-400">ARMED</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="sidebar-collapsed-status" title="Runtime Engines: ONLINE">
          <span className="live-dot"></span>
        </div>
      )}
    </aside>
  );
}
