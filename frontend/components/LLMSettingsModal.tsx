'use client';
import { useState, useEffect } from 'react';
import { Cpu, X, Server, Key, Sliders, CheckCircle2 } from 'lucide-react';

interface LLMSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
}

export default function LLMSettingsModal({ isOpen, onClose, apiBase }: LLMSettingsModalProps) {
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('qwen/qwen3-70b-instruct');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch(`${apiBase}/settings/llm`)
        .then((res) => res.json())
        .then((data) => {
          setBaseUrl(data.base_url || '');
          setModelName(data.model_name || 'qwen/qwen3-70b-instruct');
        })
        .catch(console.error);
    }
  }, [isOpen, apiBase]);

  if (!isOpen) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${apiBase}/settings/llm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_url: baseUrl,
          api_key: apiKey,
          model_name: modelName
        })
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="modal-header">
          <div className="auth-icon-badge" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
            <Cpu size={28} className="text-purple-400" />
          </div>
          <h2>LLM Provider Settings</h2>
          <p className="muted">
            Configure Open-Weight inference servers (vLLM, llama.cpp, Ollama, Qwen3) or OpenAI-compatible endpoints.
          </p>
        </div>

        {saved && (
          <div className="auth-error-banner" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981', color: '#10b981' }}>
            <CheckCircle2 size={16} /> Provider configuration saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="auth-form">
          <div className="input-group">
            <label>OpenAI-Compatible Base URL</label>
            <div className="input-with-icon">
              <Server size={16} className="input-icon" />
              <input 
                type="text" 
                className="input" 
                placeholder="http://localhost:8000/v1 (vLLM / llama.cpp / Ollama)" 
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
            </div>
            <span className="muted" style={{ fontSize: 11 }}>Leave empty to use deterministic offline demo mode.</span>
          </div>

          <div className="input-group">
            <label>Model Identifier</label>
            <div className="input-with-icon">
              <Sliders size={16} className="input-icon" />
              <input 
                type="text" 
                className="input" 
                placeholder="qwen/qwen3-70b-instruct" 
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label>API Key / Bearer Token (Optional)</label>
            <div className="input-with-icon">
              <Key size={16} className="input-icon" />
              <input 
                type="password" 
                className="input" 
                placeholder="••••••••" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Saving Settings...' : 'Save LLM Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
