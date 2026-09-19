'use client';
import { useState } from 'react';
import { FileCode, Terminal, Copy, Check, Download } from 'lucide-react';

interface CodeFile {
  filepath: string;
  content: string;
  language: string;
}

interface CodeWorkspaceExplorerProps {
  files: CodeFile[];
  entrypoint: string;
}

export default function CodeWorkspaceExplorer({ files, entrypoint }: CodeWorkspaceExplorerProps) {
  const [selectedFile, setSelectedFile] = useState<string>(files[0]?.filepath || entrypoint);
  const [copied, setCopied] = useState(false);

  const activeFile = files.find((f) => f.filepath === selectedFile) || files[0];

  function copyCode() {
    if (activeFile?.content) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (!files || files.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <FileCode size={32} className="muted" />
        <p className="muted" style={{ marginTop: 12 }}>
          Waiting for Code Generator stage to produce files...
        </p>
      </div>
    );
  }

  return (
    <div className="code-explorer-container" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
      {/* File Tree List */}
      <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 0.5 }}>
          GENERATED FILES ({files.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {files.map((f) => (
            <button
              key={f.filepath}
              className={`project-item-btn ${selectedFile === f.filepath ? 'selected' : ''}`}
              style={{ fontSize: 12, padding: '8px 10px' }}
              onClick={() => setSelectedFile(f.filepath)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileCode size={14} className="text-purple-400" />
                <span>{f.filepath}</span>
              </div>
              {f.filepath === entrypoint && (
                <span className="status-badge done" style={{ fontSize: 9 }}>ENTRY</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Content View */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Terminal size={15} className="text-emerald-400" />
            <span>{activeFile?.filepath}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={copyCode}>
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy Code'}
          </button>
        </div>

        <pre className="artifact-box" style={{ margin: 0, minHeight: 320 }}>
          {activeFile?.content || '# No file content available.'}
        </pre>
      </div>
    </div>
  );
}
