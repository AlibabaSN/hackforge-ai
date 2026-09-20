'use client';
import { User, LogOut, Plus, FolderGit2, Cpu, Github, Search, Activity, Shield } from 'lucide-react';

interface HeaderProps {
  user: any;
  onOpenAuth: () => void;
  onOpenLLMSettings: () => void;
  onLogout: () => void;
  onNewProject?: () => void;
  activeProjectTitle?: string;
  onOpenCommandPalette?: () => void;
}

export default function Header({ 
  user, 
  onOpenAuth, 
  onOpenLLMSettings, 
  onLogout, 
  onNewProject, 
  activeProjectTitle,
  onOpenCommandPalette
}: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="project-breadcrumbs">
          <FolderGit2 size={16} className="text-violet-400" />
          <span className="breadcrumb-path">HackForge AI</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{activeProjectTitle || 'Autonomous Workspace'}</span>
        </div>

        <div className="header-environment-badge">
          <span className="pulse-indicator"></span>
          <span className="env-label">LOCAL HYBRID NODE</span>
        </div>
      </div>

      <div className="header-right">
        {/* Command Palette Trigger */}
        {onOpenCommandPalette && (
          <button 
            className="command-bar-pill" 
            onClick={onOpenCommandPalette}
            title="Search & Dispatch Commands (Ctrl+K)"
          >
            <Search size={14} className="text-violet-400" />
            <span className="command-bar-text">Search systems...</span>
            <kbd className="command-bar-kbd">Ctrl+K</kbd>
          </button>
        )}

        <a 
          href="https://github.com/AlibabaSN/hackforge-ai" 
          target="_blank" 
          rel="noreferrer" 
          className="btn btn-secondary btn-sm github-header-btn"
          title="View Source on GitHub (AlibabaSN/hackforge-ai)"
        >
          <Github size={15} className="text-cyan-400" />
          <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }}>AlibabaSN</span>
        </a>

        <button className="btn btn-secondary btn-sm" onClick={onOpenLLMSettings} title="Model Configuration & Routing">
          <Cpu size={15} className="text-violet-400" /> Model Config
        </button>

        {onNewProject && (
          <button className="btn btn-primary btn-sm glow-btn" onClick={onNewProject}>
            <Plus size={15} /> New Synthesis
          </button>
        )}

        {user ? (
          <div className="user-profile-badge">
            <div className="avatar">
              {user.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{user.full_name}</span>
              <span className="user-email">{user.email}</span>
            </div>
            <button className="icon-button" onClick={onLogout} title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button className="btn btn-secondary btn-sm" onClick={onOpenAuth}>
            <User size={15} /> Sign In
          </button>
        )}
      </div>
    </header>
  );
}
