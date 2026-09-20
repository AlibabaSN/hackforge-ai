'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Shield, Database, Cpu, Server, Bot, Sliders, Play, 
  Terminal, Sparkles, X, ChevronRight, Compass, Lock, Activity, ExternalLink
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewProject?: () => void;
}

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Actions' | 'Security & Systems';
  label: string;
  sublabel: string;
  icon: any;
  action: () => void;
  shortcut?: string;
  badge?: string;
}

export default function CommandPalette({ isOpen, onClose, onNewProject }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const items: CommandItem[] = [
    // Navigation
    {
      id: 'nav-dash',
      category: 'Navigation',
      label: 'Executive Command Center',
      sublabel: 'View system health, cluster status, and high-level telemetry',
      icon: Activity,
      action: () => { router.push('/dashboard'); onClose(); },
      shortcut: 'G D'
    },
    {
      id: 'nav-factory',
      category: 'Navigation',
      label: 'Autonomous Software Factory',
      sublabel: 'Full 16-stage multi-agent pipeline and project workspace',
      icon: Terminal,
      action: () => { router.push('/'); onClose(); },
      shortcut: 'G F'
    },
    {
      id: 'nav-db',
      category: 'Navigation',
      label: 'Database Command Center',
      sublabel: 'Inspect tables, run read-only queries, and visualize schemas',
      icon: Database,
      action: () => { router.push('/database'); onClose(); },
      badge: 'SQL Console',
      shortcut: 'G B'
    },
    {
      id: 'nav-sec',
      category: 'Navigation',
      label: 'Security Operations Center (SOC)',
      sublabel: 'Threat level radar, prompt injection firewall, zero-trust policies',
      icon: Shield,
      action: () => { router.push('/security'); onClose(); },
      badge: 'Protected',
      shortcut: 'G S'
    },
    {
      id: 'nav-agents',
      category: 'Navigation',
      label: '16 Domain-Specialized AI Agents',
      sublabel: 'Manage Problem Analysts, Code Synthesisers, Judges, and Architects',
      icon: Bot,
      action: () => { router.push('/agents'); onClose(); },
      shortcut: 'G A'
    },
    {
      id: 'nav-workflows',
      category: 'Navigation',
      label: 'Workflows & Pipeline Visualizer',
      sublabel: 'Autonomous multi-stage graph and execution workflows',
      icon: Compass,
      action: () => { router.push('/workflows'); onClose(); },
      shortcut: 'G W'
    },
    {
      id: 'nav-auto',
      category: 'Navigation',
      label: 'Scheduled Automations Hub',
      sublabel: 'Continuous cron jobs, automated container checks, and model pingers',
      icon: Sparkles,
      action: () => { router.push('/automations'); onClose(); }
    },
    {
      id: 'nav-models',
      category: 'Navigation',
      label: 'Model Registry & Benchmarks',
      sublabel: 'Local Ollama engines (Qwen, Gemma) and cloud providers',
      icon: Cpu,
      action: () => { router.push('/models'); onClose(); },
      shortcut: 'G M'
    },
    {
      id: 'nav-compare',
      category: 'Navigation',
      label: 'Model Comparison Matrix',
      sublabel: 'Side-by-side benchmark evaluation of reasoning speed and score',
      icon: Sliders,
      action: () => { router.push('/models/compare'); onClose(); }
    },
    {
      id: 'nav-servers',
      category: 'Navigation',
      label: 'Distributed Inference Clusters',
      sublabel: 'Hardware node latency, GPU availability, and server endpoints',
      icon: Server,
      action: () => { router.push('/servers'); onClose(); }
    },
    {
      id: 'nav-routing',
      category: 'Navigation',
      label: 'Data Locality & Routing Rules',
      sublabel: 'Configure strict offline privacy and intelligent hybrid routing',
      icon: Lock,
      action: () => { router.push('/settings/routing'); onClose(); }
    },
    // Actions
    {
      id: 'act-new-proj',
      category: 'Actions',
      label: 'Launch New AI Engineering Project',
      sublabel: 'Initialize new requirements and autonomous synthesis pipeline',
      icon: Play,
      action: () => { 
        if (onNewProject) onNewProject(); 
        else router.push('/');
        onClose(); 
      },
      shortcut: 'N'
    },
    {
      id: 'act-github',
      category: 'Actions',
      label: 'Open GitHub Repository (AlibabaSN/hackforge-ai)',
      sublabel: 'View open-source production source code and commits',
      icon: ExternalLink,
      action: () => { 
        window.open('https://github.com/AlibabaSN/hackforge-ai', '_blank');
        onClose();
      }
    }
  ];

  const filtered = items.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.sublabel.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="command-palette-backdrop" onClick={onClose}>
      <div 
        className="command-palette-modal" 
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="command-palette-header">
          <Search size={18} className="text-violet-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, navigate, or search systems (e.g. 'database', 'security', 'agents')..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="command-palette-input"
          />
          <button className="command-palette-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="command-palette-results">
          {filtered.length === 0 ? (
            <div className="command-palette-empty">
              No matching commands or destinations found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`command-palette-item ${isSelected ? 'selected' : ''}`}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="command-item-icon">
                    <Icon size={16} />
                  </div>
                  <div className="command-item-content">
                    <div className="command-item-title-row">
                      <span className="command-item-title">{item.label}</span>
                      {item.badge && (
                        <span className="command-item-badge">{item.badge}</span>
                      )}
                    </div>
                    <span className="command-item-sublabel">{item.sublabel}</span>
                  </div>
                  {item.shortcut && (
                    <div className="command-item-shortcut">{item.shortcut}</div>
                  )}
                  <ChevronRight size={14} className="command-item-arrow" />
                </div>
              );
            })
          )}
        </div>

        <div className="command-palette-footer">
          <div className="shortcut-legend">
            <span><kbd className="kbd-pill">↑</kbd> <kbd className="kbd-pill">↓</kbd> Navigate</span>
            <span><kbd className="kbd-pill">↵</kbd> Select</span>
            <span><kbd className="kbd-pill">Esc</kbd> Close</span>
          </div>
          <div className="engine-status-tag">
            <span className="status-dot-pulse"></span>
            HackForge AI Operating System
          </div>
        </div>
      </div>
    </div>
  );
}
