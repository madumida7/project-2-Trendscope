import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Sparkles, 
  Award, 
  TrendingUp, 
  Layers, 
  ShieldCheck
} from 'lucide-react';
import { Dataset, ThemePalette } from '../types';
import { exportToCSV } from '../utils/exportUtils';
import { generatePredictions, generateInsightCards } from '../utils/dataAnalyzer';
import { getPalette } from '../utils/themeConfig';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: Dataset;
  darkMode?: boolean;
  themePalette?: ThemePalette;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  dataset,
  darkMode = true,
  themePalette = 'indigo',
}) => {
  if (!isOpen) return null;

  const activePalette = getPalette(themePalette);
  const predictions = generatePredictions(dataset, 1.0);
  const insightCards = generateInsightCards(dataset);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 sm:p-10 space-y-8 print:p-0 print:border-0 print:bg-white print:text-slate-900 print:shadow-none transition-all ${
        darkMode 
          ? 'bg-[#0d1424] border-slate-800 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.6)]' 
          : 'bg-white border-slate-200 text-slate-900 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.15)]'
      }`}>
        
        {/* Header Controls (Hidden during print) */}
        <div className={`flex items-center justify-between no-print border-b pb-4 ${
          darkMode ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
            darkMode ? activePalette.textAccentDark : activePalette.textAccentLight
          }`}>
            <Sparkles className="w-4 h-4" />
            Executive Intelligence Briefing
          </div>

          <div className="flex items-center gap-3">
            <button
              id="print-report-btn"
              onClick={handlePrint}
              className={`px-4 py-2 rounded-xl bg-gradient-to-r ${activePalette.accentGradient} text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all`}
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={() => exportToCSV(dataset)}
              className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                darkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Export Raw CSV</span>
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl cursor-pointer ${
                darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT BODY */}
        <div className="space-y-8 font-sans">
          
          {/* Document Header */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b print:border-slate-300 ${
            darkMode ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs uppercase font-extrabold tracking-widest print:text-indigo-600 ${
                  darkMode ? activePalette.textAccentDark : activePalette.textAccentLight
                }`}>
                  TrendScope Intelligence
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded font-bold uppercase print:bg-slate-100 print:text-slate-700 ${
                  darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}>
                  {dataset.category}
                </span>
              </div>
              <h1 className={`text-2xl sm:text-3xl font-black tracking-tight print:text-slate-900 ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {dataset.name}
              </h1>
              <p className={`text-xs mt-1 print:text-slate-600 ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {dataset.description}
              </p>
            </div>

            <div className={`text-right text-xs space-y-1 print:text-slate-600 ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <div className={`font-bold print:text-slate-900 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Generated: {new Date().toLocaleDateString()}
              </div>
              <div>Analyst: {dataset.uploadedBy}</div>
              <div>Data Volume: {dataset.rowCount} Observations</div>
            </div>
          </div>

          {/* Section 1: Executive Highlights */}
          <div className="space-y-3">
            <h2 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 print:text-indigo-700 ${
              darkMode ? activePalette.textAccentDark : activePalette.textAccentLight
            }`}>
              <Award className="w-4 h-4" />
              1. Executive Insights & Anomaly Profiling
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {insightCards.map((card) => (
                <div 
                  key={card.id}
                  className={`p-4 rounded-2xl border space-y-2 print:bg-slate-50 print:border-slate-200 ${
                    darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded print:bg-indigo-100 print:text-indigo-800 ${
                      darkMode ? activePalette.badgeClassDark : activePalette.badgeClassLight
                    }`}>
                      {card.title}
                    </span>
                    <span className="text-xs font-bold text-emerald-500 print:text-emerald-700">{card.delta}</span>
                  </div>
                  <p className={`text-xs leading-relaxed print:text-slate-800 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {card.description}
                  </p>
                  <div className={`text-[11px] pt-1 print:text-slate-600 ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Recorded Metric: <strong className={darkMode ? 'text-white' : 'text-slate-900'}>{card.value}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Forward Predictive Narratives */}
          <div className={`space-y-3 pt-4 border-t print:border-slate-300 ${
            darkMode ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <h2 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 print:text-indigo-700 ${
              darkMode ? activePalette.textAccentDark : activePalette.textAccentLight
            }`}>
              <TrendingUp className="w-4 h-4" />
              2. Storytelling Predictions & Horizons
            </h2>

            <div className="space-y-3">
              {predictions.map((p) => (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border space-y-2 print:bg-slate-50 print:border-slate-200 ${
                    darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className={`font-bold text-sm print:text-slate-900 ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>{p.title}</h3>
                    <span className={`text-xs font-mono font-bold print:text-indigo-700 ${
                      darkMode ? activePalette.textAccentDark : activePalette.textAccentLight
                    }`}>
                      {p.confidence}% Confidence
                    </span>
                  </div>
                  <p className={`text-xs italic print:text-slate-800 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    “{p.story}”
                  </p>
                  <div className={`flex items-center justify-between text-[11px] pt-1 border-t print:border-slate-200 ${
                    darkMode ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-500'
                  }`}>
                    <span>Baseline: {p.baselineAvg} → Projected: <strong className="text-emerald-500 print:text-emerald-700">{p.projectedValue}</strong></span>
                    <span>Action: {p.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Data Excerpt Table */}
          <div className={`space-y-3 pt-4 border-t print:border-slate-300 ${
            darkMode ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <h2 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 print:text-indigo-700 ${
              darkMode ? activePalette.textAccentDark : activePalette.textAccentLight
            }`}>
              <Layers className="w-4 h-4" />
              3. Sample Historical Records
            </h2>

            <div className={`overflow-x-auto rounded-xl border print:border-slate-300 ${
              darkMode ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <table className="w-full text-left text-xs font-mono">
                <thead className={`uppercase text-[10px] font-bold ${
                  darkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-700'
                }`}>
                  <tr>
                    {dataset.columns.slice(0, 5).map((col) => (
                      <th key={col.name} className="px-3 py-2">{col.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y text-[11px] ${
                  darkMode ? 'divide-slate-800 text-slate-300' : 'divide-slate-200 text-slate-700'
                }`}>
                  {dataset.data.slice(0, 6).map((row, idx) => (
                    <tr key={idx}>
                      {dataset.columns.slice(0, 5).map((col) => (
                        <td key={col.name} className="px-3 py-1.5 truncate max-w-[160px]">
                          {String(row[col.name] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Verification Footer */}
          <div className={`pt-6 border-t print:border-slate-300 flex items-center justify-between text-[11px] ${
            darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-500'
          }`}>
            <span>TrendScope Automated Intelligence System • Certified Confidential</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Verified Authenticated Report
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
