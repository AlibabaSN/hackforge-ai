'use client';
import React, { useState, useEffect } from 'react';
import { 
  Bell, ShieldAlert, CheckCircle2, Rocket, AlertTriangle, X, Check, ArrowRight, Activity
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeployments?: () => void;
}

export default function NotificationDrawer({ isOpen, onClose, onOpenDeployments }: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'SECURITY' | 'DEPLOYMENTS' | 'SYSTEM'>('ALL');
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [notifsRes, depsRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/notifications').catch(() => null),
        fetch('http://127.0.0.1:8000/api/deployments').catch(() => null)
      ]);

      if (notifsRes && notifsRes.ok) {
        const data = await notifsRes.json();
        setNotifications(data.notifications || []);
      }
      if (depsRes && depsRes.ok) {
        const data = await depsRes.json();
        setDeployments(data.deployments || []);
      }
    } catch (e) {
      console.error('Failed to load notifications or deployments', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleApprove = async (depId: string) => {
    try {
      setApprovingId(depId);
      const res = await fetch(`http://127.0.0.1:8000/api/deployments/${depId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approver: 'Lead System Architect' })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to approve deployment', err);
    } finally {
      setApprovingId(null);
    }
  };

  if (!isOpen) return null;

  const pendingApprovals = deployments.filter(d => d.requires_approval && d.approval_status === 'PENDING_APPROVAL');

  const filteredNotifs = notifications.filter(n => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'SECURITY') return n.type === 'SECURITY_EVENT';
    if (activeTab === 'DEPLOYMENTS') return n.type === 'DEPLOYMENT_APPROVAL' || n.type === 'DEPLOYMENT_SUCCESS';
    if (activeTab === 'SYSTEM') return n.type === 'PROJECT_COMPLETED' || n.type === 'SYSTEM_UPDATE';
    return true;
  });

  return (
    <div className="notification-drawer-backdrop" onClick={onClose}>
      <div className="notification-drawer" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title-row">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-violet-400" />
              <h2 className="drawer-title">System Activity & Alerts</h2>
            </div>
            <button className="drawer-close-btn" onClick={onClose}>
              <X size={16} />
            </button>
          </div>

          {/* Pending Approval Alert Banner if any */}
          {pendingApprovals.length > 0 && (
            <div className="drawer-approval-banner">
              <div className="flex items-center gap-2">
                <span className="live-dot animate-pulse"></span>
                <span className="font-semibold text-amber-300 text-xs uppercase tracking-wider">
                  Action Required: {pendingApprovals.length} Pipeline Waiting Approval
                </span>
              </div>
              {pendingApprovals.map(dep => (
                <div key={dep.id} className="approval-card-item">
                  <div className="approval-info">
                    <span className="approval-env font-bold text-white">{dep.environment}</span>
                    <span className="approval-version text-xs text-cyan-400 font-mono">({dep.version})</span>
                    <span className="approval-cluster text-xs text-muted-foreground font-mono">Cluster: {dep.cluster}</span>
                  </div>
                  <button 
                    className="btn btn-sm btn-primary glow-btn text-xs py-1 px-3"
                    disabled={approvingId === dep.id}
                    onClick={() => handleApprove(dep.id)}
                  >
                    {approvingId === dep.id ? 'Authorizing...' : <><Check size={12} /> Sign & Authorize</>}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="drawer-tabs">
            {(['ALL', 'SECURITY', 'DEPLOYMENTS', 'SYSTEM'] as const).map(tab => (
              <button 
                key={tab} 
                className={`drawer-tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {tab === 'SECURITY' && notifications.filter(n => n.type === 'SECURITY_EVENT').length > 0 && (
                  <span className="drawer-tab-count text-red-400">
                    {notifications.filter(n => n.type === 'SECURITY_EVENT').length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notification List */}
        <div className="drawer-content-scroll">
          {filteredNotifs.length === 0 ? (
            <div className="drawer-empty-state">
              <Activity size={32} className="text-muted-foreground opacity-40 mb-2" />
              <p className="text-sm text-muted-foreground">All systems quiet. No recent alerts.</p>
            </div>
          ) : (
            filteredNotifs.map(n => {
              const isSecurity = n.type === 'SECURITY_EVENT';
              const isApproval = n.type === 'DEPLOYMENT_APPROVAL';
              const isDeploySuccess = n.type === 'DEPLOYMENT_SUCCESS';
              const isProject = n.type === 'PROJECT_COMPLETED';

              return (
                <div 
                  key={n.id} 
                  className={`drawer-notif-item ${isSecurity ? 'border-red-500/30 bg-red-950/10' : ''}`}
                >
                  <div className="notif-icon-col">
                    {isSecurity && <ShieldAlert size={16} className="text-red-400" />}
                    {isApproval && <Rocket size={16} className="text-amber-400" />}
                    {isDeploySuccess && <CheckCircle2 size={16} className="text-emerald-400" />}
                    {isProject && <Activity size={16} className="text-cyan-400" />}
                  </div>

                  <div className="notif-details">
                    <div className="notif-header-line">
                      <span className="notif-title">{n.title}</span>
                      <span className="notif-time">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="notif-message">{n.message}</p>
                    {n.metadata && (
                      <div className="notif-meta font-mono text-[10px] text-muted-foreground mt-1">
                        {n.metadata.ip && <span>IP: {n.metadata.ip} • </span>}
                        {n.metadata.threat && <span className="text-red-400 font-semibold">{n.metadata.threat}</span>}
                        {n.metadata.version && <span>Version: {n.metadata.version}</span>}
                        {n.metadata.project_id && <span>Project #{n.metadata.project_id}</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="drawer-footer">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-mono">Zero-Trust Telemetry Active</span>
            <button 
              className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1"
              onClick={() => {
                onClose();
                if (onOpenDeployments) onOpenDeployments();
              }}
            >
              Deployments Center <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
