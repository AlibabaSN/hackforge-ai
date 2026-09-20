'use client';
import React from 'react';
import Link from 'next/link';
import { 
  Terminal, Activity, Shield, Cpu, Bot, Rocket, ArrowRight, Github, 
  CheckCircle2, Sparkles, Database, Layers, Lock, Compass, Code2
} from 'lucide-react';
import SystemOrbitCanvas from '../../components/SystemOrbitCanvas';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#05060A] text-[#F5F7FA] font-sans selection:bg-violet-600/40">
      {/* Top Navigation */}
      <nav className="border-b border-white/5 bg-[#090B11]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Code2 size={20} className="text-white" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-wider text-white">HACKFORGE</span>
            <span className="text-[10px] text-violet-400 font-mono block -mt-1 font-semibold">ENTERPRISE AI OS</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-medium text-gray-400">
          <Link href="/dashboard" className="hover:text-white transition-colors">Command Center</Link>
          <Link href="/agents" className="hover:text-white transition-colors">16 Agents</Link>
          <Link href="/deployments" className="hover:text-white transition-colors">Deployments</Link>
          <Link href="/security" className="hover:text-white transition-colors">Zero-Trust SOC</Link>
          <Link href="/models" className="hover:text-white transition-colors">Model Mesh</Link>
        </div>

        <div className="flex items-center gap-3">
          <a 
            href="https://github.com/hackforge-ai/hackforge-ai"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-cyan-400 hover:bg-white/5 transition-all"
          >
            <Github size={14} />
            <span>GitHub</span>
          </a>
          <Link 
            href="/" 
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-xs font-bold shadow-lg shadow-violet-600/30 hover:opacity-95 transition-opacity"
          >
            Launch OS <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-16 max-w-6xl mx-auto text-center">
        {/* Release badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/30 bg-violet-950/20 text-xs text-violet-300 mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="font-mono font-semibold">HACKFORGE APEX v1.5</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-300">Autonomous AI Engineering Operating System</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Build Anything. <br />
          <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Engineer Everything.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base md:text-lg text-gray-400 mb-10 leading-relaxed font-light">
          An enterprise-grade operating system coordinating 16 specialized AI agents, local and cloud model mesh, zero-trust security interceptors, and automated multi-environment delivery pipelines.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link 
            href="/" 
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-violet-600/30 transition-all hover:scale-[1.02]"
          >
            <Terminal size={18} /> Open Autonomous Workspace
          </Link>
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0E1118] border border-white/10 hover:border-violet-500/40 text-gray-200 font-semibold text-sm transition-all hover:bg-white/5"
          >
            <Activity size={18} className="text-cyan-400" /> Command Center HUD
          </Link>
        </div>

        {/* System Orbit Visualizer */}
        <div className="mt-8">
          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">
            Real-Time System Orchestration Topology
          </div>
          <SystemOrbitCanvas />
        </div>
      </section>

      {/* Live Telemetry Ticker */}
      <section className="border-y border-white/5 bg-[#090B11]/50 py-4 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>16 DOMAIN AGENTS ONLINE</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-cyan-400" />
            <span>LOCAL OLLAMA + REMOTE CLUSTER</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-violet-400" />
            <span>ZERO-TRUST SOC ARMED</span>
          </div>
          <div className="flex items-center gap-2">
            <Rocket size={14} className="text-amber-400" />
            <span>CONTINUOUS DEPLOYMENT RAIL</span>
          </div>
        </div>
      </section>

      {/* Feature Pillar Grid */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Architected for Mission-Critical Engineering
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            From problem decomposition to cryptographically signed deployments, every layer operates with high-precision enterprise rigor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#0E1118]/80 border border-white/10 rounded-2xl p-7 hover:border-violet-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/30 flex items-center justify-center mb-6 group-hover:bg-violet-600/20 transition-all">
              <Bot size={24} className="text-violet-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">16 Autonomous Agents</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              Collaborative multi-agent swarm: Analysts, Architects, Code Generators, Sandbox Testers, Hackathon Judges, and Self-Healing Debuggers.
            </p>
            <Link href="/agents" className="text-xs text-violet-400 font-semibold flex items-center gap-1 hover:text-violet-300">
              Inspect Agent Swarm <ArrowRight size={12} />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0E1118]/80 border border-white/10 rounded-2xl p-7 hover:border-cyan-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center mb-6 group-hover:bg-cyan-600/20 transition-all">
              <Shield size={24} className="text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Zero-Trust SOC Guard</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              Automated AST security analysis, prompt injection interceptors, credential leak shields, and strict sandbox container isolation.
            </p>
            <Link href="/security" className="text-xs text-cyan-400 font-semibold flex items-center gap-1 hover:text-cyan-300">
              Open SOC Center <ArrowRight size={12} />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0E1118]/80 border border-white/10 rounded-2xl p-7 hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center mb-6 group-hover:bg-emerald-600/20 transition-all">
              <Rocket size={24} className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Continuous Delivery Rails</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              Multi-environment deployments across Dev, Staging, and Production with automated security gates and Human-in-the-Loop executive approvals.
            </p>
            <Link href="/deployments" className="text-xs text-emerald-400 font-semibold flex items-center gap-1 hover:text-emerald-300">
              View Deployment Rail <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#090B11] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center text-white font-bold font-mono">H</div>
            <span className="text-gray-300 font-semibold">HackForge AI — Enterprise AI Operating System</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link href="/executions" className="hover:text-white">Executions</Link>
            <Link href="/analytics" className="hover:text-white">Analytics</Link>
            <Link href="/database" className="hover:text-white">Database</Link>
            <a href="https://github.com/hackforge-ai/hackforge-ai" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
              GitHub Repo
            </a>
          </div>
          <div className="font-mono text-[11px]">
            Engineered by <span className="text-white font-bold">HackForge AI Core Team</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
