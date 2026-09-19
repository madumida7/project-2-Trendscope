import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Table as TableIcon, 
  Terminal, 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  Play, 
  RefreshCw, 
  Search, 
  Layers, 
  Info, 
  FileCode, 
  ArrowRight,
  ShieldCheck,
  Server,
  Zap,
  Code
} from 'lucide-react';
import { ThemePalette } from '../types';
import { getPalette } from '../utils/themeConfig';

interface ColumnDef {
  field: string;
  type: string;
  null: 'YES' | 'NO';
  key: 'PRI' | 'UNI' | '';
  default: string | null;
  extra: string;
}

interface TableMetadata {
  name: string;
  rowCount: number;
  engine: string;
  collation: string;
  comment: string;
  columns: ColumnDef[];
}

interface DatabaseMetadata {
  databaseName: string;
  serverVersion: string;
  engine: string;
  uptime: number;
  tables: TableMetadata[];
}

interface QueryExecutionResult {
  success: boolean;
  sql: string;
  executionTimeMs: number;
  rowCount: number;
  columns: string[];
  rows: Record<string, any>[];
  message?: string;
  error?: string;
}

interface DatabaseStudioViewProps {
  darkMode: boolean;
  themePalette?: ThemePalette;
}

export const DatabaseStudioView: React.FC<DatabaseStudioViewProps> = ({
  darkMode,
  themePalette = 'indigo',
}) => {
  const activePalette = getPalette(themePalette);

  const [dbMeta, setDbMeta] = useState<DatabaseMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [activeSubTab, setActiveSubTab] = useState<'browse' | 'structure' | 'sql' | 'dump'>('browse');
  
  // Table rows state
  const [tableRows, setTableRows] = useState<Record<string, any>[]>([]);
  const [tableRowsLoading, setTableRowsLoading] = useState<boolean>(false);
  const [tableSearch, setTableSearch] = useState<string>('');

  // SQL Console state
  const [sqlInput, setSqlInput] = useState<string>('SELECT * FROM users ORDER BY created_at DESC;');
  const [queryResult, setQueryResult] = useState<QueryExecutionResult | null>(null);
  const [executingQuery, setExecutingQuery] = useState<boolean>(false);

  // SQL Dump state
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedDump, setCopiedDump] = useState<boolean>(false);
  const [sqlDumpText, setSqlDumpText] = useState<string>('');
  const [loadingDump, setLoadingDump] = useState<boolean>(false);

  const directBrowserLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/database`
    : '/database';

  // Load database metadata
  const fetchMetadata = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/database/meta');
      if (res.ok) {
        const data: DatabaseMetadata = await res.json();
        setDbMeta(data);
        if (data.tables.length > 0 && !data.tables.some((t) => t.name === selectedTable)) {
          setSelectedTable(data.tables[0].name);
        }
      }
    } catch (err) {
      console.error('Failed to load database metadata:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load table rows
  const fetchTableRows = async (tableName: string) => {
    setTableRowsLoading(true);
    try {
      const res = await fetch(`/api/database/tables/${tableName}`);
      if (res.ok) {
        const data: QueryExecutionResult = await res.json();
        if (data.success) {
          setTableRows(data.rows);
        }
      }
    } catch (err) {
      console.error('Failed to fetch table records:', err);
    } finally {
      setTableRowsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableRows(selectedTable);
    }
  }, [selectedTable]);

  // Execute SQL Query
  const handleExecuteQuery = async (queryToRun?: string) => {
    const query = queryToRun || sqlInput;
    if (!query.trim()) return;

    setExecutingQuery(true);
    try {
      const res = await fetch('/api/database/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: query }),
      });
      const data: QueryExecutionResult = await res.json();
      setQueryResult(data);
      if (data.success) {
        // Refresh tables count in background
        fetchMetadata();
      }
    } catch (err: any) {
      setQueryResult({
        success: false,
        sql: query,
        executionTimeMs: 0,
        rowCount: 0,
        columns: [],
        rows: [],
        error: err?.message || 'Network request failed',
      });
    } finally {
      setExecutingQuery(false);
    }
  };

  // Fetch SQL Dump for Preview
  const handleLoadDump = async () => {
    setLoadingDump(true);
    try {
      const res = await fetch('/api/database/dump.sql');
      if (res.ok) {
        const text = await res.text();
        setSqlDumpText(text);
      }
    } catch (err) {
      console.error('Failed to fetch SQL dump:', err);
    } finally {
      setLoadingDump(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'dump') {
      handleLoadDump();
    }
  }, [activeSubTab]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directBrowserLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyDump = () => {
    navigator.clipboard.writeText(sqlDumpText);
    setCopiedDump(true);
    setTimeout(() => setCopiedDump(false), 2500);
  };

  const currentTableMeta = dbMeta?.tables.find((t) => t.name === selectedTable);

  const filteredRows = tableRows.filter((row) => {
    if (!tableSearch.trim()) return true;
    const term = tableSearch.toLowerCase();
    return Object.values(row).some((val) => 
      String(val).toLowerCase().includes(term)
    );
  });

  const sampleQueries = [
    { label: 'All Users', sql: 'SELECT * FROM users ORDER BY created_at DESC;' },
    { label: 'Datasets by Category', sql: 'SELECT category, COUNT(*) AS total, SUM(row_count) AS rows_sum FROM datasets GROUP BY category;' },
    { label: 'High-Confidence Predictions', sql: 'SELECT metric_name, story, confidence, direction FROM predictions WHERE confidence >= 90;' },
    { label: 'Recent Activity Logs', sql: 'SELECT * FROM activity_logs ORDER BY timestamp DESC;' },
    { label: 'MySQL Server Tables', sql: 'SHOW TABLES;' },
    { label: 'Describe Table Schema', sql: `DESCRIBE ${selectedTable};` },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner: Database Studio Identification & Direct Browser Link */}
      <div className={`p-6 rounded-3xl border transition-all ${
        darkMode
          ? 'bg-[#0d1424]/90 border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl'
          : 'bg-white/95 border-slate-200/90 shadow-[0_4px_25px_-4px_rgba(15,23,42,0.06)] backdrop-blur-xl'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
                darkMode ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
              }`}>
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    MySQL Database Studio
                  </h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${
                    darkMode ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  }`}>
                    ● LIVE • 127.0.0.1:3306
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Dedicated Open-Source Web Relational Database Explorer for TrendScope. View, query, inspect tables, and export SQL dumps.
                </p>
              </div>
            </div>
          </div>

          {/* Action Hub & Direct Link Share */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Direct Browser Link Button */}
            <div className="flex items-center rounded-2xl border p-1 bg-slate-500/5">
              <button
                id="copy-db-link-btn"
                onClick={handleCopyLink}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-white text-slate-700 shadow-xs'
                }`}
                title="Copy Direct Link to Open Individually in Browser"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Link'}</span>
              </button>
              <a
                href={directBrowserLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  darkMode 
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                }`}
              >
                <span>Open Individually in Browser</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Export SQL Dump Direct Download */}
            <a
              id="export-mysql-dump-btn"
              href="/api/database/dump.sql"
              download="trendscope_mysql_dump.sql"
              className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                darkMode
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-sm'
              }`}
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Export .SQL Dump</span>
            </a>

            <button
              onClick={fetchMetadata}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                darkMode ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300' : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-600'
              }`}
              title="Refresh Database Connection"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Database Status Pills */}
        <div className={`mt-6 pt-5 border-t flex flex-wrap items-center gap-4 text-xs font-mono ${
          darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span>Database:</span>
            <span className={`font-bold ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>trendscope_mysql_db</span>
          </div>
          <div className="h-3 w-px bg-slate-700/50" />
          <div>
            <span>Engine:</span> <span className="font-semibold">{dbMeta?.engine || 'InnoDB'}</span>
          </div>
          <div className="h-3 w-px bg-slate-700/50" />
          <div>
            <span>Version:</span> <span className="font-semibold">{dbMeta?.serverVersion || 'MySQL 8.0.36'}</span>
          </div>
          <div className="h-3 w-px bg-slate-700/50" />
          <div>
            <span>Total Tables:</span> <span className="font-bold text-emerald-500">{dbMeta?.tables.length || 5}</span>
          </div>
        </div>
      </div>

      {/* Main Studio Frame: Left Table Navigation + Right Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Table Selector Sidebar (4 Cols) */}
        <div className={`lg:col-span-3 rounded-3xl border p-5 space-y-5 ${
          darkMode
            ? 'bg-[#0d1424]/90 border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.3)] backdrop-blur-xl'
            : 'bg-white/95 border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] backdrop-blur-xl'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h2 className={`text-sm font-bold uppercase tracking-wider ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Tables & Schema
              </h2>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-bold">
              {dbMeta?.tables.length || 0}
            </span>
          </div>

          {/* Tables List */}
          <div className="space-y-1.5">
            {dbMeta?.tables.map((tbl) => {
              const isSelected = selectedTable === tbl.name;
              return (
                <button
                  key={tbl.name}
                  onClick={() => {
                    setSelectedTable(tbl.name);
                    setActiveSubTab('browse');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-medium transition-all cursor-pointer text-left ${
                    isSelected
                      ? darkMode
                        ? 'bg-indigo-600/20 border border-indigo-500/40 text-white font-bold shadow-sm'
                        : 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold shadow-xs'
                      : darkMode
                        ? 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                        : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <TableIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span className="truncate font-mono">{tbl.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono shrink-0 ${
                    isSelected 
                      ? 'bg-indigo-500 text-white font-bold' 
                      : darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tbl.rowCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick SQL Console Trigger */}
          <div className="pt-3 border-t border-slate-800/60">
            <button
              onClick={() => setActiveSubTab('sql')}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeSubTab === 'sql'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : darkMode
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
              }`}
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>SQL Query Terminal</span>
            </button>
          </div>

          {/* Pre-built SQL Snippets */}
          <div className="space-y-2 pt-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Quick SQL Snippets
            </span>
            <div className="space-y-1">
              {sampleQueries.slice(0, 4).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSqlInput(q.sql);
                    setActiveSubTab('sql');
                    handleExecuteQuery(q.sql);
                  }}
                  className={`w-full text-left p-2 rounded-xl text-[11px] font-mono transition-colors cursor-pointer truncate ${
                    darkMode
                      ? 'hover:bg-slate-800/80 text-slate-400 hover:text-indigo-300'
                      : 'hover:bg-slate-100 text-slate-600 hover:text-indigo-700'
                  }`}
                  title={q.sql}
                >
                  › {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Main Display Panel (9 Cols) */}
        <div className={`lg:col-span-9 rounded-3xl border transition-all ${
          darkMode
            ? 'bg-[#0d1424]/90 border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.3)] backdrop-blur-xl'
            : 'bg-white/95 border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] backdrop-blur-xl'
        }`}>
          {/* Sub-Tabs Navigation (Browse / Structure / SQL Console / SQL Dump) */}
          <div className={`flex flex-wrap items-center justify-between border-b px-6 pt-4 pb-2 gap-4 ${
            darkMode ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveSubTab('browse')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeSubTab === 'browse'
                    ? darkMode
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-indigo-600 text-white shadow-sm'
                    : darkMode
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Browse Data ({selectedTable})</span>
              </button>

              <button
                onClick={() => setActiveSubTab('structure')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeSubTab === 'structure'
                    ? darkMode
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-indigo-600 text-white shadow-sm'
                    : darkMode
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Structure (Schema)</span>
              </button>

              <button
                onClick={() => setActiveSubTab('sql')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeSubTab === 'sql'
                    ? darkMode
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-emerald-600 text-white shadow-sm'
                    : darkMode
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>SQL Query Console</span>
              </button>

              <button
                onClick={() => setActiveSubTab('dump')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeSubTab === 'dump'
                    ? darkMode
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-indigo-600 text-white shadow-sm'
                    : darkMode
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>MySQL Dump</span>
              </button>
            </div>

            {/* Quick table search when browsing */}
            {activeSubTab === 'browse' && (
              <div className="relative">
                <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                  darkMode ? 'text-slate-500' : 'text-slate-400'
                }`} />
                <input
                  type="text"
                  placeholder={`Search ${selectedTable}...`}
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className={`pl-8 pr-3 py-1.5 rounded-xl text-xs border focus:outline-hidden transition-all ${
                    darkMode
                      ? 'bg-slate-900/90 border-slate-700 text-white focus:border-indigo-500'
                      : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-600'
                  }`}
                />
              </div>
            )}
          </div>

          {/* Sub-Tab 1: Browse Table Rows */}
          {activeSubTab === 'browse' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className={`flex items-center gap-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>Showing {filteredRows.length} of {tableRows.length} record(s)</span>
                  <span>•</span>
                  <span className="font-semibold text-indigo-400">TABLE `{selectedTable}`</span>
                </div>
                <button
                  onClick={() => fetchTableRows(selectedTable)}
                  className="hover:underline flex items-center gap-1 cursor-pointer text-indigo-400 font-bold"
                >
                  <RefreshCw className={`w-3 h-3 ${tableRowsLoading ? 'animate-spin' : ''}`} />
                  <span>Reload Rows</span>
                </button>
              </div>

              {/* Table Data Grid */}
              <div className="overflow-x-auto rounded-2xl border border-slate-700/50 max-h-[520px]">
                {tableRows.length === 0 ? (
                  <div className="p-12 text-center text-sm text-slate-500">
                    No rows present in table <span className="font-mono">{selectedTable}</span>.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead className={`sticky top-0 z-10 ${
                      darkMode ? 'bg-slate-900 text-slate-200 border-b border-slate-800' : 'bg-slate-100 text-slate-700 border-b border-slate-300'
                    }`}>
                      <tr>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] text-indigo-400">#</th>
                        {Object.keys(tableRows[0] || {}).map((col) => (
                          <th key={col} className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {filteredRows.map((row, idx) => (
                        <tr
                          key={idx}
                          className={`transition-colors ${
                            darkMode
                              ? 'hover:bg-slate-800/40 text-slate-300'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <td className="py-2.5 px-4 text-slate-500 font-bold">{idx + 1}</td>
                          {Object.keys(tableRows[0] || {}).map((col) => {
                            const val = row[col];
                            return (
                              <td key={col} className="py-2.5 px-4 whitespace-nowrap max-w-xs truncate">
                                {val === null || val === undefined ? (
                                  <span className="text-slate-500 italic">NULL</span>
                                ) : typeof val === 'number' ? (
                                  <span className="text-emerald-400 font-semibold">{val}</span>
                                ) : String(val).length > 60 ? (
                                  <span title={String(val)}>{String(val).slice(0, 60)}...</span>
                                ) : (
                                  String(val)
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Sub-Tab 2: Structure / Schema */}
          {activeSubTab === 'structure' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-mono ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  MySQL Schema Definition for Table: <strong className="text-indigo-400 font-bold">{selectedTable}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono font-bold text-xs">
                  Engine: InnoDB
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-700/50">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead className={darkMode ? 'bg-slate-900 text-slate-200 border-b border-slate-800' : 'bg-slate-100 text-slate-700 border-b border-slate-300'}>
                    <tr>
                      <th className="py-3 px-4 font-bold">Field</th>
                      <th className="py-3 px-4 font-bold">Type</th>
                      <th className="py-3 px-4 font-bold">Null</th>
                      <th className="py-3 px-4 font-bold">Key</th>
                      <th className="py-3 px-4 font-bold">Default</th>
                      <th className="py-3 px-4 font-bold">Extra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {currentTableMeta?.columns.map((col, idx) => (
                      <tr
                        key={idx}
                        className={darkMode ? 'hover:bg-slate-800/40 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}
                      >
                        <td className="py-2.5 px-4 font-bold text-indigo-400">{col.field}</td>
                        <td className="py-2.5 px-4 text-emerald-400">{col.type}</td>
                        <td className="py-2.5 px-4">{col.null}</td>
                        <td className="py-2.5 px-4">
                          {col.key === 'PRI' ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                              PRIMARY KEY
                            </span>
                          ) : col.key ? (
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                              {col.key}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-2.5 px-4">{col.default || 'NULL'}</td>
                        <td className="py-2.5 px-4 text-slate-500">{col.extra || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Interactive SQL Query Console */}
          {activeSubTab === 'sql' && (
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Run Custom SQL Query</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Press Ctrl+Enter to execute
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    id="sql-query-input"
                    rows={4}
                    value={sqlInput}
                    onChange={(e) => setSqlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        e.preventDefault();
                        handleExecuteQuery();
                      }
                    }}
                    placeholder="Enter SQL statement (e.g., SELECT * FROM datasets WHERE category = 'business';)"
                    className={`w-full p-4 rounded-2xl font-mono text-xs border focus:outline-hidden transition-all ${
                      darkMode
                        ? 'bg-slate-950 border-slate-800 text-emerald-300 focus:border-emerald-500'
                        : 'bg-slate-900 border-slate-800 text-emerald-400 focus:border-emerald-500 shadow-inner'
                    }`}
                  />
                </div>

                {/* Query Control Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-400">Suggestions:</span>
                    {sampleQueries.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSqlInput(q.sql);
                          handleExecuteQuery(q.sql);
                        }}
                        className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          darkMode
                            ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                            : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                        }`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>

                  <button
                    id="run-sql-btn"
                    onClick={() => handleExecuteQuery()}
                    disabled={executingQuery}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 fill-current ${executingQuery ? 'animate-spin' : ''}`} />
                    <span>{executingQuery ? 'Executing...' : 'Run SQL Query'}</span>
                  </button>
                </div>
              </div>

              {/* Execution Result Box */}
              {queryResult && (
                <div className="space-y-3 pt-2">
                  {/* Status Banner */}
                  <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-mono ${
                    queryResult.success
                      ? darkMode
                        ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : darkMode
                        ? 'bg-rose-950/30 border-rose-800 text-rose-300'
                        : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      {queryResult.success ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Info className="w-4 h-4 text-rose-400" />
                      )}
                      <span>
                        {queryResult.success 
                          ? queryResult.message || `Query OK: ${queryResult.rowCount} row(s) returned`
                          : `SQL Error: ${queryResult.error}`
                        }
                      </span>
                    </div>
                    <span className="font-bold">{queryResult.executionTimeMs} ms</span>
                  </div>

                  {/* Results Grid */}
                  {queryResult.success && queryResult.rows.length > 0 && (
                    <div className="overflow-x-auto rounded-2xl border border-slate-700/50 max-h-[400px]">
                      <table className="w-full text-left text-xs border-collapse font-mono">
                        <thead className={darkMode ? 'bg-slate-900 text-slate-200 border-b border-slate-800' : 'bg-slate-100 text-slate-700 border-b border-slate-300'}>
                          <tr>
                            {queryResult.columns.map((col) => (
                              <th key={col} className="py-2.5 px-4 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                          {queryResult.rows.map((r, rIdx) => (
                            <tr
                              key={rIdx}
                              className={darkMode ? 'hover:bg-slate-800/40 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}
                            >
                              {queryResult.columns.map((col) => {
                                const val = r[col];
                                return (
                                  <td key={col} className="py-2 px-4 whitespace-nowrap max-w-xs truncate">
                                    {val === null || val === undefined ? (
                                      <span className="text-slate-500 italic">NULL</span>
                                    ) : (
                                      String(val)
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 4: MySQL Dump & Export */}
          {activeSubTab === 'dump' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Full MySQL 8.0 Compatible Dump (.SQL)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ready to import into phpMyAdmin, MySQL Workbench, DBeaver, or any self-hosted MySQL server.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyDump}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                    }`}
                  >
                    {copiedDump ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDump ? 'Copied Script!' : 'Copy Script'}</span>
                  </button>
                  <a
                    href="/api/database/dump.sql"
                    download="trendscope_mysql_dump.sql"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .SQL</span>
                  </a>
                </div>
              </div>

              {/* Dump Code View */}
              <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-4 max-h-[480px] overflow-y-auto">
                <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">
                  {loadingDump ? 'Generating SQL dump from live tables...' : sqlDumpText}
                </pre>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
