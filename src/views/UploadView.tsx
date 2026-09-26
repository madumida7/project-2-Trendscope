import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Table as TableIcon, 
  Database, 
  ArrowRight, 
  Search,
  BrainCircuit,
  BarChart3,
  Target,
  Sliders
} from 'lucide-react';
import { ColumnProfile, Dataset, ThemePalette, PredictionGoal, SectorType } from '../types';
import { profileColumns, detectDatasetDomain, SECTOR_DEFINITIONS } from '../utils/dataAnalyzer';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';
import { getPalette } from '../utils/themeConfig';
import { NavTab } from '../components/Sidebar';
import { PredictionIntentModal } from '../components/PredictionIntentModal';

interface UploadViewProps {
  onDatasetLoaded: (dataset: Dataset, targetTab?: NavTab) => void;
  datasets?: Dataset[];
  currentDataset?: Dataset;
  onSelectDataset?: (dataset: Dataset) => void;
  darkMode: boolean;
  themePalette?: ThemePalette;
}

export const UploadView: React.FC<UploadViewProps> = ({ 
  onDatasetLoaded, 
  datasets,
  currentDataset,
  onSelectDataset,
  darkMode,
  themePalette = 'indigo'
}) => {
  const activePalette = getPalette(themePalette);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'samples'>('samples');
  const [dragOver, setDragOver] = useState(false);
  const [datasetName, setDatasetName] = useState('');
  const [datasetDesc, setDatasetDesc] = useState('');
  const [pastedCSV, setPastedCSV] = useState('');
  const [parsedRows, setParsedRows] = useState<Record<string, any>[] | null>(null);
  const [detectedColumns, setDetectedColumns] = useState<ColumnProfile[]>([]);
  const [detectedDomain, setDetectedDomain] = useState<SectorType>('general');
  const [searchFilter, setSearchFilter] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Prediction Intent state
  const [pendingGoal, setPendingGoal] = useState<PredictionGoal | null>(null);
  const [showIntentModal, setShowIntentModal] = useState<boolean>(false);

  // Parse CSV text into array of row objects
  const parseCSVText = (csvString: string) => {
    const lines = csvString.trim().split('\n').filter((l) => l.trim().length > 0);
    if (lines.length < 2) return null;

    // Helper to handle commas inside quotes
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]).map((h) => h.replace(/^["']|["']$/g, '').trim());
    const rows: Record<string, any>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]).map((v) => v.replace(/^["']|["']$/g, '').trim());
      const row: Record<string, any> = {};
      headers.forEach((header, idx) => {
        const val = values[idx];
        const num = Number(val);
        row[header] = !isNaN(num) && val !== '' ? num : val;
      });
      rows.push(row);
    }

    return { headers, rows };
  };

  const handleFileUpload = (file: File) => {
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(content);
          const rows = Array.isArray(parsed) ? parsed : [parsed];
          processRawData(rows, file.name.replace(/\.[^/.]+$/, ''));
        } catch (err) {
          setErrorMessage('Invalid JSON format. Please upload valid array-of-objects JSON.');
        }
      } else {
        const parsed = parseCSVText(content);
        if (parsed && parsed.rows.length > 0) {
          processRawData(parsed.rows, file.name.replace(/\.[^/.]+$/, ''));
        } else {
          setErrorMessage('Unable to parse CSV. Ensure it has headers on line 1 and at least one data row.');
        }
      }
    };
    reader.onerror = () => setErrorMessage('Error reading uploaded file.');
    reader.readAsText(file);
  };

  const handleApplyPastedCSV = () => {
    setErrorMessage(null);
    if (!pastedCSV.trim()) {
      setErrorMessage('Please paste comma-separated values into the box.');
      return;
    }
    const parsed = parseCSVText(pastedCSV);
    if (parsed && parsed.rows.length > 0) {
      processRawData(parsed.rows, datasetName || 'Pasted Custom Dataset');
    } else {
      setErrorMessage('Could not parse CSV. Header row followed by data lines is required.');
    }
  };

  const processRawData = (rows: Record<string, any>[], defaultName: string) => {
    if (!rows || rows.length === 0) {
      setErrorMessage('Dataset is empty.');
      return;
    }

    const profiles = profileColumns(rows);
    const domain = detectDatasetDomain(profiles, defaultName);

    setDetectedColumns(profiles);
    setDetectedDomain(domain);
    setParsedRows(rows);
    setDatasetName(defaultName);
    setDatasetDesc(`Ingested ${rows.length} records across ${profiles.length} attributes.`);
    // Automatically bring up the tailored prediction questions screen!
    setShowIntentModal(true);
  };

  const handleLoadSample = (sample: Dataset) => {
    onDatasetLoaded(sample);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const handleCommitDataset = (targetTab: NavTab = 'predictions', overrideGoal?: PredictionGoal) => {
    if (!parsedRows || parsedRows.length === 0) return;

    const goalToUse = overrideGoal || pendingGoal || undefined;

    const newDataset: Dataset = {
      id: `custom_${Date.now()}`,
      name: datasetName || 'Custom Ingested Dataset',
      description: datasetDesc || 'Imported dataset analyzed by TrendScope',
      category: detectedDomain,
      rowCount: parsedRows.length,
      columnCount: detectedColumns.length,
      columns: detectedColumns,
      data: parsedRows,
      uploadedAt: new Date().toLocaleString(),
      uploadedBy: 'Current Analyst',
      tags: [detectedDomain.toUpperCase(), 'Custom Upload'],
      predictionGoal: goalToUse,
    };

    onDatasetLoaded(newDataset, targetTab);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const filteredPreviewRows = parsedRows?.filter((row) => {
    if (!searchFilter) return true;
    return Object.values(row).some((val) => 
      String(val).toLowerCase().includes(searchFilter.toLowerCase())
    );
  }) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold flex items-center gap-3 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <UploadCloud className={`w-8 h-8 ${darkMode ? activePalette.textAccentDark : activePalette.textAccentLight}`} />
            Upload & Auto-Profile Datasets
          </h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Drop CSV/JSON files, paste records, or choose verified benchmark datasets. TrendScope automatically infers datatypes and context.
          </p>
        </div>

        {uploadSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>Workspace Updated Successfully!</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold animate-pulse">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Tabs for Ingestion Mode */}
      <div className={`flex items-center gap-2 border-b pb-2 ${
        darkMode ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <button
          id="tab-samples-btn"
          onClick={() => setActiveTab('samples')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'samples'
              ? `bg-gradient-to-r ${activePalette.accentGradient} text-white shadow-md ${activePalette.glowShadow}`
              : darkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Preloaded Smart Benchmarks</span>
        </button>

        <button
          id="tab-upload-btn"
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'upload'
              ? `bg-gradient-to-r ${activePalette.accentGradient} text-white shadow-md ${activePalette.glowShadow}`
              : darkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Drag & Drop File</span>
        </button>

        <button
          id="tab-paste-btn"
          onClick={() => setActiveTab('paste')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'paste'
              ? `bg-gradient-to-r ${activePalette.accentGradient} text-white shadow-md ${activePalette.glowShadow}`
              : darkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Paste Raw CSV Text</span>
        </button>
      </div>

      {/* TAB 1: Datasets Registry & Benchmarks */}
      {activeTab === 'samples' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className={`text-xs font-semibold uppercase tracking-wider ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Available Workspace & Benchmark Datasets ({datasets && datasets.length > 0 ? datasets.length : SAMPLE_DATASETS.length}):
            </div>
            {currentDataset && (
              <span className="text-xs text-slate-400 font-mono">
                Active: <strong className={darkMode ? 'text-indigo-300' : 'text-indigo-600'}>{currentDataset.name}</strong>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(datasets && datasets.length > 0 ? datasets : SAMPLE_DATASETS).map((sample) => {
              const isActive = currentDataset?.id === sample.id;
              const isCustomUpload = !SAMPLE_DATASETS.some((s) => s.id === sample.id);

              return (
                <div
                  key={sample.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isActive
                      ? darkMode
                        ? 'bg-[#101a33] border-indigo-500/50 shadow-[0_0_25px_rgba(99,102,241,0.2)] ring-1 ring-indigo-500/40'
                        : 'bg-indigo-50/70 border-indigo-300 shadow-md ring-1 ring-indigo-300'
                      : darkMode 
                        ? 'bg-[#0d1424]/80 border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
                        : 'bg-white/95 border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]'
                  } glass-card-hover flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${
                          darkMode ? activePalette.badgeClassDark : activePalette.badgeClassLight
                        }`}>
                          {sample.category}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                            ✓ ACTIVE NOW
                          </span>
                        )}
                        {isCustomUpload && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                            Custom Upload
                          </span>
                        )}
                      </div>
                      <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {sample.rowCount} records • {sample.columnCount} columns
                      </span>
                    </div>

                    <h3 className={`text-base font-bold mb-1.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {sample.name}
                    </h3>
                    <p className={`text-xs leading-relaxed mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {sample.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {sample.tags.map((tag) => (
                        <span key={tag} className={`text-[10px] px-2 py-0.5 rounded ${
                          darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                        }`}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={`pt-3 border-t flex flex-wrap items-center justify-between gap-2 ${
                    darkMode ? 'border-slate-800' : 'border-slate-200'
                  }`}>
                    <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Owner: {sample.uploadedBy}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDetectedColumns(sample.columns);
                          setDetectedDomain(sample.category);
                          setParsedRows(sample.data);
                          setDatasetName(sample.name);
                          setDatasetDesc(sample.description);
                          setPendingGoal(sample.predictionGoal || null);
                          setShowIntentModal(true);
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                          darkMode ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                        title="Ask specific prediction questions and customize goals for this benchmark"
                      >
                        <Target className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Tailor Questions</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectDataset ? onSelectDataset(sample) : handleLoadSample(sample)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-md cursor-default'
                            : `bg-gradient-to-r ${activePalette.accentGradient} text-white shadow-md ${activePalette.glowShadow} hover:scale-[1.02] active:scale-[0.98]`
                        }`}
                      >
                        <span>{isActive ? 'Active in Workspace' : 'Switch to this Dataset'}</span>
                        {!isActive && <ArrowRight className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Drag & Drop File */}
      {activeTab === 'upload' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          className={`p-12 rounded-3xl border-2 border-dashed text-center transition-all ${
            dragOver 
              ? 'border-indigo-500 bg-indigo-500/10' 
              : darkMode 
                ? 'border-slate-800 bg-slate-900/40 hover:border-slate-700' 
                : 'border-slate-300 bg-slate-50 hover:border-indigo-300'
          }`}
        >
          <div className="max-w-md mx-auto space-y-4">
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg ${
              darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
            }`}>
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Drag & drop your dataset here
              </h3>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Supports standard <strong>CSV</strong>, <strong>TSV</strong>, or <strong>JSON</strong> files up to 25MB.
              </p>
            </div>

            <div>
              <label className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${activePalette.accentGradient} text-white text-xs font-bold shadow-lg ${activePalette.glowShadow} transition-all cursor-pointer`}>
                <span>Browse Files on Computer</span>
                <input
                  type="file"
                  accept=".csv,.tsv,.json,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>

            <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Columns and numbers will be automatically validated without exposing raw credentials.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: Paste CSV */}
      {activeTab === 'paste' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className={`block text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>
              Paste Comma-Separated Values (CSV)
            </label>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              First line must contain headers (e.g. <code>Date, Category, Sales, Profit</code>).
            </p>
          </div>

          <textarea
            rows={8}
            value={pastedCSV}
            onChange={(e) => setPastedCSV(e.target.value)}
            placeholder={`Month, Product_Line, Sales_Revenue_K, Units_Sold\nJan, Cloud Software, 220, 1420\nFeb, Cloud Software, 245, 1610\nMar, Cloud Software, 278, 1890`}
            className={`w-full p-4 rounded-2xl border text-xs font-mono outline-none transition-colors ${
              darkMode 
                ? 'bg-slate-900 border-slate-800 text-slate-200 focus:border-indigo-500' 
                : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'
            }`}
          />

          <div className="flex justify-end">
            <button
              onClick={handleApplyPastedCSV}
              className={`px-5 py-2.5 rounded-xl bg-gradient-to-r ${activePalette.accentGradient} text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Parse & Profile Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Auto-Detection & Column Profiling Review */}
      {parsedRows && (
        <div className={`space-y-6 pt-6 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'} animate-in fade-in duration-300`}>
          
          {/* Detected Domain Banner */}
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            darkMode 
              ? 'bg-[#0d1424]/85 border-indigo-500/30' 
              : 'bg-white/95 border-indigo-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold ${
                darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
              }`}>
                {SECTOR_DEFINITIONS[detectedDomain]?.icon || '🧠'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Detected Sector:
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                    darkMode ? activePalette.badgeClassDark : activePalette.badgeClassLight
                  }`}>
                    {SECTOR_DEFINITIONS[detectedDomain]?.name || detectedDomain}
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Automated heuristics recognized <strong>{detectedColumns.filter(c => c.type === 'numeric').length} numeric metrics</strong> and <strong>{detectedColumns.filter(c => c.type !== 'numeric').length} categorical dimensions</strong>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => handleCommitDataset('predictions')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="Activate this dataset and immediately view statistical predictions"
              >
                <BrainCircuit className="w-4 h-4" />
                <span>Activate & View Predictions</span>
              </button>

              <button
                onClick={() => handleCommitDataset('visualizations')}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  darkMode 
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200' 
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-sm'
                }`}
                title="Activate this dataset and view multi-modal charts"
              >
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                <span>View Charts</span>
              </button>

              <button
                onClick={() => handleCommitDataset('dashboard')}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Activate this dataset and go to main executive dashboard"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>

          {/* Tailored Prediction Intent Banner */}
          <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
            pendingGoal
              ? darkMode 
                ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200' 
                : 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm'
              : darkMode 
                ? 'bg-slate-900/80 border-slate-800 text-slate-300' 
                : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            <div className="flex items-start sm:items-center gap-3">
              <div className={`p-2.5 rounded-xl shrink-0 ${
                pendingGoal 
                  ? 'bg-indigo-500/20 text-indigo-400' 
                  : darkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-600 shadow-xs'
              }`}>
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    {pendingGoal ? 'Tailored Prediction Intent Configured' : 'Prediction Intent Setup'}
                  </span>
                  {pendingGoal && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase">
                      Customized
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5 font-medium leading-relaxed">
                  {pendingGoal ? (
                    <>
                      Objective: <strong className={darkMode ? 'text-white' : 'text-slate-900'}>{pendingGoal.businessObjective}</strong> • Primary Target: <span className="underline font-bold">{pendingGoal.primaryTargetMetric || 'Auto-detected'}</span> • Horizon: <strong className={darkMode ? 'text-white' : 'text-slate-900'}>{pendingGoal.predictionHorizon.replace('_', ' ')}</strong>
                      {pendingGoal.customQuestion && (
                        <span className="italic block text-[11px] mt-0.5 opacity-90">"{pendingGoal.customQuestion}"</span>
                      )}
                    </>
                  ) : (
                    'Configure specific target metrics, decision posture, and business questions to customize your storytelling predictions and chart perspectives.'
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIntentModal(true)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                pendingGoal
                  ? darkMode ? 'bg-indigo-900/60 hover:bg-indigo-900 text-indigo-200 border border-indigo-500/40' : 'bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-300 shadow-sm'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
              }`}
            >
              {pendingGoal ? 'Edit Prediction Goals' : 'Customize Goals & Questions'}
            </button>
          </div>

          {/* Column Profiling Cards */}
          <div className="space-y-2">
            <h3 className={`text-sm font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              <Database className={`w-4 h-4 ${darkMode ? activePalette.textAccentDark : activePalette.textAccentLight}`} />
              Auto-Profiled Attributes ({detectedColumns.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {detectedColumns.map((col) => (
                <div
                  key={col.name}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    darkMode 
                      ? 'bg-slate-900/80 border-slate-800' 
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold truncate max-w-[140px] ${darkMode ? 'text-slate-200' : 'text-slate-800'}`} title={col.name}>
                      {col.name}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      col.type === 'numeric' 
                        ? darkMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-800'
                        : col.type === 'date' 
                        ? darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-800'
                        : darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {col.type}
                    </span>
                  </div>

                  <div className={`text-[11px] flex items-center justify-between ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <span>{col.distinctCount} unique</span>
                    {col.mean !== undefined && (
                      <span className="font-mono text-emerald-500 font-semibold">Mean: {col.mean}</span>
                    )}
                  </div>

                  {col.min !== undefined && col.max !== undefined && (
                    <div className={`text-[10px] pt-1 border-t flex items-center justify-between ${
                      darkMode ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-500'
                    }`}>
                      <span>Min: {col.min}</span>
                      <span>Max: {col.max}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Preview Table with Search */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <TableIcon className={`w-4 h-4 ${darkMode ? activePalette.textAccentDark : activePalette.textAccentLight}`} />
                Raw Data Preview ({parsedRows.length} Rows)
              </h3>

              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter preview rows..."
                  className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-none transition-colors ${
                    darkMode 
                      ? 'bg-slate-900 border-slate-800 text-slate-200 focus:border-indigo-500' 
                      : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

            <div className={`overflow-x-auto rounded-2xl border max-h-72 ${
              darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white shadow-xs'
            }`}>
              <table className="w-full text-left text-xs">
                <thead className={`uppercase text-[10px] font-bold tracking-wider sticky top-0 border-b ${
                  darkMode 
                    ? 'bg-slate-950/90 text-slate-400 border-slate-800' 
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  <tr>
                    <th className="px-4 py-2.5">#</th>
                    {detectedColumns.map((col) => (
                      <th key={col.name} className={`px-4 py-2.5 font-bold ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y font-mono text-[11px] ${
                  darkMode ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-200 text-slate-700'
                }`}>
                  {filteredPreviewRows.slice(0, 15).map((row, idx) => (
                    <tr key={idx} className={darkMode ? 'hover:bg-slate-800/40 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                      <td className={`px-4 py-2 font-sans ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{idx + 1}</td>
                      {detectedColumns.map((col) => (
                        <td key={col.name} className="px-4 py-2 truncate max-w-[200px]">
                          {row[col.name] !== undefined ? String(row[col.name]) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredPreviewRows.length > 15 && (
              <p className={`text-[11px] text-center italic ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Showing first 15 of {filteredPreviewRows.length} matching rows. Full dataset will be available in charts and predictions.
              </p>
            )}
          </div>

        </div>
      )}

      {/* Prediction Intent & Questions Screen Modal */}
      <PredictionIntentModal
        isOpen={showIntentModal}
        onClose={() => setShowIntentModal(false)}
        datasetName={datasetName || 'Custom Ingested Dataset'}
        category={detectedDomain}
        columns={detectedColumns}
        initialGoal={pendingGoal || undefined}
        onApplyGoal={(goal) => {
          setPendingGoal(goal);
          // Commit immediately with the customized predictions & target visual perspective
          const targetTab = goal.recommendedChartType ? 'visualizations' : 'predictions';
          handleCommitDataset(targetTab, goal);
        }}
        darkMode={darkMode}
        themePalette={themePalette}
      />

    </div>
  );
};
