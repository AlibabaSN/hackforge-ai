'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, Terminal, Bot, Compass, Sparkles, Database, Shield, 
  Cpu, Sliders, Server, Lock, ChevronLeft, ChevronRight, Search, 
  Code2, FolderGit2, BookOpen, Layers, Rocket, FileText, BarChart3,
  Wrench, Settings as SettingsIcon, Microscope
} from 'lucide-react';

interface SidebarProps {
  onOpenCommandPalette?: () => void;
}

export default function Sidebar({ onOpenCommandPalette }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Keyboard shortcut: Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navGroups = [
    {
      group: 'WORKSPACE',
      items: [
        { label: 'Command Center', href: '/dashboard', icon: Activity, badge: 'Live' },
        { label: 'Projects', href: '/projects', icon: FolderGit2 },
        { label: 'AI Workspace', href: '/', icon: Terminal }
      ]
    },
    {
      group: 'BUILD',
      items: [
        { label: '16 Domain Agents', href: '/agents', icon: Bot, badge: '16' },
        { label: 'Workflows', href: '/workflows', icon: Compass },
        { label: 'Automations', href: '/automations', icon: Sparkles, badge: 'Cron' }
      ]
    },
    {
      group: 'KNOWLEDGE',
      items: [
        { label: 'Knowledge Bases', href: '/knowledge', icon: BookOpen, badge: 'RAG' },
        { label: 'Deep Research', href: '/research', icon: Microscope }
      ]
    },
    {
      group: 'INFRASTRUCTURE',
      items: [
        { label: 'Model Mesh', href: '/models', icon: Cpu },
        { label: 'Model Benchmarks', href: '/models/compare', icon: Sliders },
        { label: 'Inference Clusters', href: '/servers', icon: Server },
        { label: 'Tools & MCP', href: '/tools', icon: Wrench, badge: '5 MCP' }
      ]
    },
    {
      group: 'ENGINEERING',
      items: [
        { label: 'Execution Traces', href: '/executions', icon: Layers, badge: 'Real-time' },
        { label: 'Deployment CI/CD', href: '/deployments', icon: Rocket }
      ]
    },
    {
      group: 'CONTROL',
      items: [
        { label: 'Security SOC', href: '/security', icon: Shield, badge: 'Zero-Trust' },
        { label: 'Database Center', href: '/database', icon: Database, badge: 'SQL' },
        { label: 'Platform Analytics', href: '/analytics', icon: BarChart3 },
        { label: 'Audit Trail', href: '/audit', icon: FileText }
      ]
    },
    {
      group: 'SYSTEM',
      items: [
        { label: 'Operating Settings', href: '/settings', icon: SettingsIcon },
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
          title={collapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
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
        {navGroups.map((group, gIdx) => (
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
                      <Icon size={16} />
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
              OPTIMAL
            </span>
          </div>
          <div className="cluster-engine-list">
            <div className="cluster-engine-item">
              <span className="engine-name">Ollama Local Mesh</span>
              <span className="engine-val text-emerald-400">ONLINE</span>
            </div>
            <div className="cluster-engine-item">
              <span className="engine-name">SQL Database Core</span>
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
