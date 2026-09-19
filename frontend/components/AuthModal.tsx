'use client';
import { useState } from 'react';
import { LogIn, UserPlus, X, Lock, Mail, User, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any, token: string) => void;
  apiBase: string;
}

export default function AuthModal({ isOpen, onClose, onSuccess, apiBase }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = mode === 'login' ? `${apiBase}/auth/login` : `${apiBase}/auth/register`;
    const payload = mode === 'login' 
      ? { email, password } 
      : { email, password, full_name: fullName };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      onSuccess(data.user, data.access_token);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="modal-header">
          <div className="auth-icon-badge">
            <ShieldCheck size={28} className="text-emerald-400" />
          </div>
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="muted">
            {mode === 'login' 
              ? 'Sign in to access your autonomous hackathon engineering workspace' 
              : 'Register to persist and manage your multi-agent projects'}
          </p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            <LogIn size={15} /> Sign In
          </button>
          <button 
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}
          >
            <UserPlus size={15} /> Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error-banner">{error}</div>}

          {mode === 'register' && (
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Jane Doe" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input 
                type="email" 
                className="input" 
                placeholder="developer@hackforge.ai" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input 
                type="password" 
                className="input" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
