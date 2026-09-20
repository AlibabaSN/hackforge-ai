'use client';
import { User, LogOut, Plus, FolderGit2, Cpu, Github } from 'lucide-react';

interface HeaderProps {
  user: any;
  onOpenAuth: () => void;
  onOpenLLMSettings: () => void;
  onLogout: () => void;
  onNewProject: () => void;
  activeProjectTitle?: string;
}

export default function Header({ 
  user, 
  onOpenAuth, 
  onOpenLLMSettings, 
  onLogout, 
  onNewProject, 
  activeProjectTitle 
}: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="project-breadcrumbs">
          <FolderGit2 size={18} className="text-purple-400" />
          <span className="breadcrumb-path">Projects</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{activeProjectTitle || 'Workspace'}</span>
        </div>
      </div>

      <div className="header-right">
        <a 
          href="https://github.com/AlibabaSN/hackforge-ai" 
          target="_blank" 
          rel="noreferrer" 
          className="btn btn-secondary btn-sm"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
          title="View Source on GitHub (AlibabaSN/hackforge-ai)"
        >
          <Github size={15} className="text-cyan-400" />
          <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }}>AlibabaSN</span>
        </a>

        <button className="btn btn-secondary btn-sm" onClick={onOpenLLMSettings} title="LLM Provider Settings">
          <Cpu size={15} /> Model Settings
        </button>

        <button className="btn btn-secondary btn-sm" onClick={onNewProject}>
          <Plus size={16} /> New Project
        </button>

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
          <button className="btn btn-primary btn-sm" onClick={onOpenAuth}>
            <User size={15} /> Sign In
          </button>
        )}
      </div>
    </header>
  );
}
