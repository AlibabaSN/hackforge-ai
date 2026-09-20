'use client';
import React, { useState, useEffect } from 'react';
import { 
  User, LogOut, Plus, FolderGit2, Cpu, Github, Search, Bell, CheckCircle2, ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { getApiBase } from '@/lib/api';

interface HeaderProps {
  user: any;
  onOpenAuth: () => void;
  onOpenLLMSettings: () => void;
  onLogout: () => void;
  onNewProject?: () => void;
  activeProjectTitle?: string;
  onOpenCommandPalette?: () => void;
  onOpenNotifications?: () => void;
}

export default function Header({ 
  user, 
  onOpenAuth, 
  onOpenLLMSettings, 
  onLogout, 
  onNewProject, 
  activeProjectTitle,
  onOpenCommandPalette,
  onOpenNotifications
}: HeaderProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll for notification count
  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const res = await fetch(`${getApiBase()}/notifications`);
        if (res.ok) {
          const data = await res.json();
          const count = (data.notifications || []).filter((n: any) => !n.read).length;
          setUnreadCount(count);
        }
      } catch (e) {
        // silent fallback
      }
    };
    checkAlerts();
    const interval = setInterval(checkAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="project-breadcrumbs">
          <FolderGit2 size={16} className="text-violet-400" />
          <Link href="/projects" className="breadcrumb-path hover:text-white transition-colors">
            HackForge AI
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{activeProjectTitle || 'Autonomous Workspace'}</span>
        </div>

        <div className="header-environment-badge">
          <span className="pulse-indicator"></span>
          <span className="env-label">LOCAL HYBRID CLUSTER</span>
        </div>

        {/* Global Operational Status Pill */}
        <div className="header-health-pill hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-950/30 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>All Systems Operational</span>
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
            <span className="command-bar-text">Search systems, models, agents...</span>
            <kbd className="command-bar-kbd">⌘K</kbd>
          </button>
        )}

        {/* Notification Bell Button */}
        {onOpenNotifications && (
          <button 
            className="header-icon-btn relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
            onClick={onOpenNotifications}
            title="Open Activity & Alerts"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        )}

        <a 
          href="https://github.com/hackforge-ai/hackforge-ai" 
          target="_blank" 
          rel="noreferrer" 
          className="btn btn-secondary btn-sm github-header-btn"
          title="View Source on GitHub"
        >
          <Github size={15} className="text-cyan-400" />
          <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }}>GitHub</span>
        </a>

        <button className="btn btn-secondary btn-sm" onClick={onOpenLLMSettings} title="Model Configuration & Routing">
          <Cpu size={15} className="text-violet-400" /> Model Mesh
        </button>

        {onNewProject && (
          <button className="btn btn-primary btn-sm glow-btn" onClick={onNewProject}>
            <Plus size={15} /> New Project
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
