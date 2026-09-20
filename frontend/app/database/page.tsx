'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Database, Play, RefreshCw, Table, Terminal, FileCode, CheckCircle2, 
  AlertTriangle, Shield, Download, HardDrive, Cpu, Layers, ExternalLink, ArrowRight, Lock
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CommandPalette from '@/components/CommandPalette';
import AuthModal from '@/components/AuthModal';
import LLMSettingsModal from '@/components/LLMSettingsModal';
import ThreeDBackgroundCanvas from '@/components/ThreeDBackgroundCanvas';
import { getApiBase } from '@/lib/api';

const API = getApiBase();

export default function DatabasePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'console' | 'schema'>('overview');
  const [overview, setOverview] = useState<any>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('projects');
  const [tableData, setTableData] = useState<any>(null);
  const [schemaGraph, setSchemaGraph] = useState<any>(null);

  // SQL Console state
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT id, title, status, current_stage, score, created_at FROM projects ORDER BY id DESC LIMIT 10;');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryLoading, setQueryLoading] = useState<boolean>(false);
  const [queryError, setQueryError] = useState<string>('');

  // Modals & Command Palette
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showLLMModal, setShowLLMModal] = useState<boolean>(false);
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Handle Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch Overview and Tables
  const loadDatabaseData = async () => {
    setLoading(true);
    try {
      const [overRes, tablesRes, schemaRes] = await Promise.all([
        fetch(`${API}/database/overview`),
        fetch(`${API}/database/tables`),
        fetch(`${API}/database/schema`)
      ]);

      if (overRes.ok) {
        const overData = await overRes.json();
        setOverview(overData);
      }
      if (tablesRes.ok) {
        const tData = await tablesRes.json();
        setTables(tData);
        if (tData.length > 0 && !selectedTable) {
          setSelectedTable(tData[0].table_name);
        }
      }
      if (schemaRes.ok) {
        const sData = await schemaRes.json();
        setSchemaGraph(sData);
      }
    } catch (err) {
      console.error('Failed to fetch database telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseData();
  }, []);

  // Fetch table data when selectedTable changes
  useEffect(() => {
    if (selectedTable) {
      fetch(`${API}/database/tables/${selectedTable}`)
        .then(res => res.json())
        .then(data => setTableData(data))
        .catch(err => console.error(err));
    }
  }, [selectedTable]);

  // Execute safe query
  const handleExecuteQuery = async (queryToRun?: string) => {
    const q = queryToRun || sqlQuery;
    setQueryLoading(true);
    setQueryError('');
    setQueryResult(null);

    try {
      const res = await fetch(`${API}/database/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        setQueryError(data.error || 'Query execution failed');
      } else {
        setQueryResult(data);
      }
    } catch (err: any) {
      setQueryError(err.message || 'Network error executing SQL');
    } finally {
      setQueryLoading(false);
    }
  };

  // Export Results
  const exportQueryResults = (format: 'json' | 'csv') => {
    if (!queryResult || !queryResult.rows || queryResult.rows.length === 0) return;

    let content = '';
    let mimeType = 'application/json';
    let fileName = `query_export_${Date.now()}.${format}`;

    if (format === 'json') {
      content = JSON.stringify(queryResult.rows, null, 2);
    } else {
      mimeType = 'text/csv';
      const headers = queryResult.columns.join(',');
      const rows = queryResult.rows.map((row: any) => 
        queryResult.columns.map((col: string) => {
          const val = row[col] === null || row[col] === undefined ? '' : String(row[col]);
          return `"${val.replace(/"/g, '""')}"`;
        }).join(',')
      );
      content = [headers, ...rows].join('\n');
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sampleQueries = [
    { label: 'Recent Projects', sql: 'SELECT id, title, status, current_stage, score, created_at FROM projects ORDER BY id DESC LIMIT 10;' },
    { label: 'Security Events Log', sql: 'SELECT id, event_type, severity, source_ip, status, action_attempted, created_at FROM security_events ORDER BY id DESC LIMIT 15;' },
    { label: 'Active Security Policies', sql: 'SELECT id, name, category, severity, is_active, description FROM security_policies;' },
    { label: 'Registered AI Models', sql: 'SELECT id, name, model_name, provider, is_enabled, benchmark_score FROM model_configs;' },
    { label: 'Secret Vault Status', sql: 'SELECT id, name, key_type, masked_value, service_provider, is_valid FROM secret_vault_items;' }
  ];

  return (
    <div className="app-container">
      <ThreeDBackgroundCanvas />
      
      <Sidebar onOpenCommandPalette={() => setShowCommandPalette(true)} />

      <div className="main-content-wrapper">
        <Header
          user={user}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenLLMSettings={() => setShowLLMModal(true)}
          onLogout={() => setUser(null)}
          activeProjectTitle="Database Command Center"
          onOpenCommandPalette={() => setShowCommandPalette(true)}
        />

        <main className="dashboard-content">
          {/* Subheader & Navigation Pills */}
          <div className="database-hero-banner">
            <div className="db-banner-left">
              <div className="db-badge">
                <Database size={16} className="text-cyan-400" />
                <span>DATA STORE TELEMETRY & SQL ENGINE</span>
              </div>
              <h1 className="db-hero-title">Database Command Center</h1>
              <p className="db-hero-subtitle">
                Inspect real relational schemas, run read-only SQL queries with zero-trust safety guards, and verify connection pooling metrics in real time.
              </p>
            </div>
            <div className="db-banner-right">
              <button className="btn btn-secondary btn-sm" onClick={loadDatabaseData}>
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Telemetry
              </button>
            </div>
          </div>

          {/* Module Navigation Tabs */}
          <div className="database-nav-tabs">
            <button 
              className={`db-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <HardDrive size={15} /> Overview & Health
            </button>
            <button 
              className={`db-tab-btn ${activeTab === 'tables' ? 'active' : ''}`}
              onClick={() => setActiveTab('tables')}
            >
              <Table size={15} /> Tables Explorer ({tables.length})
            </button>
            <button 
              className={`db-tab-btn ${activeTab === 'console' ? 'active' : ''}`}
              onClick={() => setActiveTab('console')}
            >
              <Terminal size={15} /> Safe SQL Console
            </button>
            <button 
              className={`db-tab-btn ${activeTab === 'schema' ? 'active' : ''}`}
              onClick={() => setActiveTab('schema')}
            >
              <Layers size={15} /> Schema Visualizer
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="db-tab-content">
              {/* Telemetry Cards Grid */}
              <div className="db-telemetry-grid">
                <div className="db-metric-card">
                  <div className="metric-header">
                    <span className="metric-label">DATABASE ENGINE</span>
                    <span className="engine-pill-active">{overview?.engine || 'SQLITE'}</span>
                  </div>
                  <div className="metric-value">{overview?.engine || 'SQLITE'}</div>
                  <div className="metric-footer">
                    <span className="text-emerald-400">● {overview?.status || 'HEALTHY'}</span>
                    <span className="text-dim">Latency: {overview?.latency_ms || 0.45}ms</span>
                  </div>
                </div>

                <div className="db-metric-card">
                  <div className="metric-header">
                    <span className="metric-label">CONNECTION POOL</span>
                    <span className="pool-badge">POOLED</span>
                  </div>
                  <div className="metric-value">
                    {overview?.pool_status?.checked_out ?? 0} <span className="text-sm text-dim">/ {overview?.pool_status?.size ?? 5} active</span>
                  </div>
                  <div className="metric-footer">
                    <span>Available: {overview?.pool_status?.checked_in ?? 5}</span>
                    <span>Overflow: {overview?.pool_status?.overflow ?? 0}</span>
                  </div>
                </div>

                <div className="db-metric-card">
                  <div className="metric-header">
                    <span className="metric-label">RELATIONAL SCHEMA</span>
                    <Table size={16} className="text-cyan-400" />
                  </div>
                  <div className="metric-value">
                    {overview?.total_tables ?? 10} <span className="text-sm text-dim">tables</span>
                  </div>
                  <div className="metric-footer">
                    <span>Total Rows: {overview?.total_rows ?? 0}</span>
                    <span>Size: {overview?.size_human || 'Dynamic'}</span>
                  </div>
                </div>

                <div className="db-metric-card">
                  <div className="metric-header">
                    <span className="metric-label">SAFETY & PRIVACY GUARD</span>
                    <Shield size={16} className="text-violet-400" />
                  </div>
                  <div className="metric-value text-emerald-400">ENFORCED</div>
                  <div className="metric-footer">
                    <span>Read-Only Console</span>
                    <span>Sensitive Data Masking</span>
                  </div>
                </div>
              </div>

              {/* Engine Details and Table Counts */}
              <div className="db-details-row">
                <div className="db-section-card flex-1">
                  <div className="section-card-title">
                    <Database size={16} className="text-cyan-400" />
                    <span>Database Configuration & Connection Parameters</span>
                  </div>
                  <div className="db-param-list">
                    <div className="db-param-item">
                      <span className="param-key">Target URI (Masked):</span>
                      <code className="param-val font-mono">{overview?.database_url_masked || 'sqlite:///./hackforge.db'}</code>
                    </div>
                    <div className="db-param-item">
                      <span className="param-key">Physical Disk Location:</span>
                      <code className="param-val font-mono">{overview?.location || 'Local Workspace'}</code>
                    </div>
                    <div className="db-param-item">
                      <span className="param-key">Data Locality Policy:</span>
                      <span className="param-val text-emerald-400">STRICT LOCAL RETENTION (Zero External Leakage)</span>
                    </div>
                    <div className="db-param-item">
                      <span className="param-key">Sensitive Column Masking:</span>
                      <span className="param-val text-cyan-400">Enabled (hashed_password, api_key, secrets redacted)</span>
                    </div>
                  </div>
                </div>

                <div className="db-section-card" style={{ minWidth: 320 }}>
                  <div className="section-card-title">
                    <Table size={16} className="text-violet-400" />
                    <span>Table Row Distribution</span>
                  </div>
                  <div className="table-distribution-list">
                    {overview?.table_counts && Object.entries(overview.table_counts).map(([name, count]: any) => (
                      <div key={name} className="table-dist-item" onClick={() => { setSelectedTable(name); setActiveTab('tables'); }}>
                        <span className="dist-name">{name}</span>
                        <div className="dist-bar-wrap">
                          <span className="dist-count">{count} rows</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TABLES EXPLORER */}
          {activeTab === 'tables' && (
            <div className="db-tab-content">
              <div className="tables-explorer-layout">
                {/* Tables Sidebar */}
                <div className="tables-list-panel">
                  <div className="tables-panel-header">
                    <Table size={15} className="text-cyan-400" />
                    <span>DATABASE TABLES</span>
                  </div>
                  <div className="tables-selector-list">
                    {tables.map(t => (
                      <button
                        key={t.table_name}
                        className={`table-selector-btn ${selectedTable === t.table_name ? 'active' : ''}`}
                        onClick={() => setSelectedTable(t.table_name)}
                      >
                        <span className="table-btn-name">{t.table_name}</span>
                        <span className="table-btn-count">{t.row_count} rows</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table Schema & Data Viewer */}
                <div className="table-data-panel">
                  {tableData ? (
                    <>
                      <div className="table-data-header">
                        <div>
                          <h2 className="current-table-title">{tableData.table_name}</h2>
                          <span className="current-table-meta">
                            {tableData.columns?.length || 0} columns &bull; {tableData.total_returned || 0} sample rows rendered
                          </span>
                        </div>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSqlQuery(`SELECT * FROM ${tableData.table_name} LIMIT 25;`);
                            setActiveTab('console');
                            handleExecuteQuery(`SELECT * FROM ${tableData.table_name} LIMIT 25;`);
                          }}
                        >
                          <Terminal size={14} /> Open in SQL Console
                        </button>
                      </div>

                      {/* Columns definition pills */}
                      <div className="columns-schema-badges">
                        {tableData.columns?.map((col: any) => (
                          <div key={col.name} className="col-schema-pill">
                            <span className="col-name">{col.name}</span>
                            <span className="col-type">{col.type}</span>
                            {col.name.toLowerCase().includes('password') || col.name.toLowerCase().includes('key') ? (
                              <span className="col-mask-tag">MASKED</span>
                            ) : null}
                          </div>
                        ))}
                      </div>

                      {/* Table rows rendering */}
                      <div className="table-scroll-container">
                        {tableData.rows && tableData.rows.length > 0 ? (
                          <table className="luxury-data-table">
                            <thead>
                              <tr>
                                {tableData.columns.map((c: any) => (
                                  <th key={c.name}>{c.name}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {tableData.rows.map((row: any, rIdx: number) => (
                                <tr key={rIdx}>
                                  {tableData.columns.map((c: any) => {
                                    const val = row[c.name];
                                    const displayVal = typeof val === 'object' && val !== null 
                                      ? JSON.stringify(val) 
                                      : String(val ?? 'NULL');
                                    const isMasked = String(displayVal).includes('REDACTED') || String(displayVal).includes('MASKED');
                                    return (
                                      <td key={c.name} className={isMasked ? 'cell-masked' : ''}>
                                        {displayVal}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="empty-table-state">
                            Table contains 0 rows or is currently empty.
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="loading-state">Loading table data...</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SAFE SQL CONSOLE */}
          {activeTab === 'console' && (
            <div className="db-tab-content">
              {/* Query Templates */}
              <div className="sql-templates-bar">
                <span className="templates-label">Quick Queries:</span>
                {sampleQueries.map((sq, sIdx) => (
                  <button
                    key={sIdx}
                    className="template-pill-btn"
                    onClick={() => {
                      setSqlQuery(sq.sql);
                      handleExecuteQuery(sq.sql);
                    }}
                  >
                    {sq.label}
                  </button>
                ))}
              </div>

              {/* SQL Editor Area */}
              <div className="sql-editor-container">
                <div className="sql-editor-header">
                  <div className="editor-badge">
                    <Terminal size={14} className="text-cyan-400" />
                    <span>SQL QUERY CONSOLE (READ-ONLY ENFORCED)</span>
                  </div>
                  <div className="editor-actions">
                    <button 
                      className="btn btn-primary btn-sm glow-btn"
                      onClick={() => handleExecuteQuery()}
                      disabled={queryLoading}
                    >
                      <Play size={14} /> {queryLoading ? 'Executing...' : 'Run Query'}
                    </button>
                  </div>
                </div>
                <textarea
                  className="sql-code-editor font-mono"
                  rows={4}
                  value={sqlQuery}
                  onChange={e => setSqlQuery(e.target.value)}
                  placeholder="SELECT * FROM projects WHERE status = 'COMPLETED';"
                />
              </div>

              {/* Error or Guardrail Alert */}
              {queryError && (
                <div className="sql-error-alert">
                  <AlertTriangle size={18} className="text-rose-400 flex-shrink-0" />
                  <div className="error-text-content">
                    <div className="error-title">Execution Error / Security Block</div>
                    <div className="error-desc">{queryError}</div>
                  </div>
                </div>
              )}

              {/* Results Table */}
              {queryResult && (
                <div className="sql-results-panel">
                  <div className="results-header">
                    <div className="results-meta">
                      <span className="meta-pill success">
                        <CheckCircle2 size={13} /> {queryResult.row_count} rows returned
                      </span>
                      <span className="meta-pill">
                        Latency: {queryResult.execution_time_ms} ms
                      </span>
                    </div>
                    <div className="results-export-actions">
                      <button className="btn btn-secondary btn-xs" onClick={() => exportQueryResults('csv')}>
                        <Download size={13} /> CSV
                      </button>
                      <button className="btn btn-secondary btn-xs" onClick={() => exportQueryResults('json')}>
                        <Download size={13} /> JSON
                      </button>
                    </div>
                  </div>

                  <div className="table-scroll-container">
                    {queryResult.rows && queryResult.rows.length > 0 ? (
                      <table className="luxury-data-table">
                        <thead>
                          <tr>
                            {queryResult.columns.map((c: string) => (
                              <th key={c}>{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {queryResult.rows.map((row: any, rIdx: number) => (
                            <tr key={rIdx}>
                              {queryResult.columns.map((c: string) => {
                                const val = row[c];
                                const displayVal = typeof val === 'object' && val !== null 
                                  ? JSON.stringify(val) 
                                  : String(val ?? 'NULL');
                                const isMasked = String(displayVal).includes('MASKED');
                                return (
                                  <td key={c} className={isMasked ? 'cell-masked' : ''}>
                                    {displayVal}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="empty-table-state">
                        {queryResult.message || '0 rows matched your query.'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SCHEMA VISUALIZER */}
          {activeTab === 'schema' && (
            <div className="db-tab-content">
              <div className="schema-visualizer-card">
                <div className="schema-card-header">
                  <Layers size={16} className="text-cyan-400" />
                  <span>Entity-Relationship Architecture Diagram</span>
                </div>
                <div className="schema-models-grid">
                  {schemaGraph?.nodes?.map((node: any) => (
                    <div key={node.id} className="er-table-card">
                      <div className="er-table-header">
                        <Table size={14} className="text-cyan-400" />
                        <span className="er-table-name">{node.label}</span>
                      </div>
                      <div className="er-table-columns">
                        {node.columns?.map((col: any) => (
                          <div key={col.name} className="er-column-row">
                            <span className={`er-col-name ${col.is_pk ? 'is-pk' : ''}`}>
                              {col.is_pk ? '🔑 ' : ''}{col.name}
                            </span>
                            <span className="er-col-type">{col.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <CommandPalette 
        isOpen={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)} 
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(userData: any) => {
          setUser(userData);
          setShowAuthModal(false);
        }}
        apiBase={API}
      />

      <LLMSettingsModal
        isOpen={showLLMModal}
        onClose={() => setShowLLMModal(false)}
        apiBase={API}
      />
    </div>
  );
}
