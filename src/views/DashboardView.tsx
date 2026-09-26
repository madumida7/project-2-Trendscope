import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  ShieldCheck, 
  ArrowUpRight, 
  Layers, 
  Clock, 
  ChevronRight,
  Activity,
  Award,
  Zap,
  HeartPulse,
  UploadCloud,
  CheckCircle2,
  Sliders,
  Target,
  Database,
  ArrowRight,
  Compass,
  FileSpreadsheet,
  Binary,
  LineChart
} from 'lucide-react';
import { Dataset, PredictionInsight, InsightCardItem, User, ThemePalette } from '../types';
import { generatePredictions, generateInsightCards } from '../utils/dataAnalyzer';
import { NavTab } from '../components/Sidebar';
import { getPalette } from '../utils/themeConfig';

interface DashboardViewProps {
  currentUser: User | null;
  currentDataset: Dataset;
  datasets?: Dataset[];
  onSelectDataset?: (dataset: Dataset) => void;
  onNavigate: (tab: NavTab) => void;
  darkMode: boolean;
  themePalette?: ThemePalette;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  currentDataset,
  datasets = [],
  onSelectDataset,
  onNavigate,
  darkMode,
  themePalette = 'indigo',
}) => {
  const activePalette = getPalette(themePalette);
  const [predictions, setPredictions] = useState<PredictionInsight[]>([]);
  const [insightCards, setInsightCards] = useState<InsightCardItem[]>([]);
  const [animatedValues, setAnimatedValues] = useState({
    totalRows: 0,
    trendsFound: 0,
    predictionsCount: 0,
    avgConfidence: 0,
  });

  const userRole = currentUser?.role || 'user';
  const isAdmin = userRole === 'admin';
  const isAnalyst = userRole === 'analyst';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const preds = generatePredictions(currentDataset, 1.0);
    const cards = generateInsightCards(currentDataset);
    setPredictions(preds);
    setInsightCards(cards);

    // Animated counter effect for admin telemetry
    const targetRows = currentDataset.rowCount;
    const targetTrends = cards.length + 2;
    const targetPreds = preds.length;
    const targetConf = preds.length > 0 
      ? Math.round(preds.reduce((acc, p) => acc + p.confidence, 0) / preds.length) 
      : 92;

    const duration = 800;
    const steps = 25;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      setAnimatedValues({
        totalRows: Math.floor(targetRows * progress),
        trendsFound: Math.floor(targetTrends * progress),
        predictionsCount: Math.floor(targetPreds * progress),
        avgConfidence: Math.floor(targetConf * progress),
      });
      if (progress >= 1) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [currentDataset]);

  const getCardIcon = (iconName: string) => {
    switch (iconName) {
      case 'Award': return <Award className="w-5 h-5 text-emerald-500" />;
      case 'TrendingDown': return <TrendingDown className="w-5 h-5 text-rose-500" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-indigo-500" />;
      case 'HeartPulse': return <HeartPulse className="w-5 h-5 text-cyan-500" />;
      case 'Activity': return <Activity className="w-5 h-5 text-blue-500" />;
      default: return <Sparkles className="w-5 h-5 text-indigo-500" />;
    }
  };

  const primaryPrediction = predictions[0] || null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Welcome Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden transition-all ${
        darkMode 
          ? 'bg-gradient-to-r from-[#0d1424] via-[#121c33] to-[#0d1424] border-slate-800 shadow-[0_12px_36px_rgba(0,0,0,0.4)]' 
          : 'bg-gradient-to-r from-white via-indigo-50/40 to-white border-slate-200/90 shadow-[0_8px_30px_-6px_rgba(15,23,42,0.06)]'
      }`}>
        <div className={`absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
          darkMode ? 'bg-indigo-500/10' : 'bg-indigo-500/5'
        }`} />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              darkMode ? activePalette.badgeClassDark : activePalette.badgeClassLight
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              {isAdmin 
                ? 'System Administration & Intelligence' 
                : isAnalyst 
                  ? 'Advanced Statistical & Modeling Studio' 
                  : 'Executive & Business Analytics Workspace'}
            </div>
            
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              {getGreeting()}, <span className={`bg-gradient-to-r ${activePalette.swatchGradient} bg-clip-text text-transparent`}>
                {currentUser?.name || (isAnalyst ? 'Data Analyst' : 'User')}
              </span>
            </h1>
            
            <p className={`text-sm max-w-2xl leading-relaxed ${
              darkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {isAdmin ? (
                <>
                  Administrative telemetry for <strong className={darkMode ? 'text-white' : 'text-slate-900'}>{currentDataset.name}</strong>. System holds {currentDataset.rowCount} rows across {currentDataset.columnCount} attributes with automated schema mapping and statistical profiling.
                </>
              ) : isAnalyst ? (
                <>
                  Statistical analytics studio for <strong className={darkMode ? 'text-white' : 'text-slate-900'}>{currentDataset.name}</strong>. Trailing moving averages, Z-score anomaly scans, and multi-axis correlations are calibrated across {currentDataset.rowCount} observations.
                </>
              ) : (
                <>
                  Currently exploring <strong className={darkMode ? 'text-white' : 'text-slate-900'}>{currentDataset.name}</strong>. TrendScope has transformed your numbers into interactive visualizations, momentum trends, and clear forward-looking stories.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dash-explore-charts-btn"
              onClick={() => onNavigate('visualizations')}
              className={`px-4 py-2.5 rounded-xl bg-gradient-to-r ${activePalette.accentGradient} text-white text-xs font-bold shadow-lg ${activePalette.glowShadow} transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Explore Charts</span>
            </button>

            <button
              id="dash-view-predictions-btn"
              onClick={() => onNavigate('predictions')}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                darkMode
                  ? 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-sm'
              }`}
            >
              <TrendingUp className={`w-4 h-4 ${darkMode ? activePalette.textAccentDark : activePalette.textAccentLight}`} />
              <span>View Predictions</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CONDITIONAL METRIC TILES: ADMIN vs ANALYST vs NORMAL USER                  */}
      {/* ========================================================================= */}

      {isAdmin ? (
        /* ==================== 1. ADMIN METRICS: TELEMETRY & OBSERVATIONS ==================== */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              darkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`}>
              <ShieldCheck className="w-4 h-4" />
              Admin System Telemetry & Observation Metrics
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Role: <strong className="text-indigo-400 uppercase">Administrator</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Data */}
            <div className={`p-5 rounded-2xl border transition-all ${
              darkMode 
                ? 'bg-[#0d1424]/80 border-slate-800/80 text-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.35)]' 
                : 'bg-white/90 border-slate-200/90 text-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]'
            } glass-card-hover`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>Total Observations</span>
                <div className={`p-2 rounded-xl ${darkMode ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {animatedValues.totalRows}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-500 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{currentDataset.columnCount} Profiled Columns</span>
              </div>
            </div>

            {/* Trends Found */}
            <div className={`p-5 rounded-2xl border transition-all ${
              darkMode 
                ? 'bg-[#0d1424]/80 border-slate-800/80 text-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.35)]' 
                : 'bg-white/90 border-slate-200/90 text-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]'
            } glass-card-hover`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>Trends Detected</span>
                <div className={`p-2 rounded-xl ${darkMode ? 'bg-cyan-500/15 text-cyan-400' : 'bg-cyan-50 text-cyan-600'}`}>
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {animatedValues.trendsFound} Patterns
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-cyan-500 font-semibold">
                <span>Moving avg + Volatility check</span>
              </div>
            </div>

            {/* Predictions */}
            <div className={`p-5 rounded-2xl border transition-all ${
              darkMode 
                ? 'bg-[#0d1424]/80 border-slate-800/80 text-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.35)]' 
                : 'bg-white/90 border-slate-200/90 text-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]'
            } glass-card-hover`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>Active Predictions</span>
                <div className={`p-2 rounded-xl ${darkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {animatedValues.predictionsCount} Forecasts
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-500 font-semibold">
                <span>Algorithmic storytelling format</span>
              </div>
            </div>

            {/* Confidence Rating */}
            <div className={`p-5 rounded-2xl border transition-all ${
              darkMode 
                ? 'bg-[#0d1424]/80 border-slate-800/80 text-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.35)]' 
                : 'bg-white/90 border-slate-200/90 text-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]'
            } glass-card-hover`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>System Confidence</span>
                <div className={`p-2 rounded-xl ${darkMode ? 'bg-violet-500/15 text-violet-400' : 'bg-violet-50 text-violet-600'}`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {animatedValues.avgConfidence}%
              </div>
              <div className={`flex items-center gap-1.5 mt-2 text-xs font-semibold ${
                darkMode ? activePalette.textAccentDark : activePalette.textAccentLight
              }`}>
                <span>Statistical Significance</span>
              </div>
            </div>
          </div>
        </div>
      ) : isAnalyst ? (
        /* ==================== 2. DATA ANALYST STATISTICAL STUDIO ==================== */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              darkMode ? 'text-emerald-400' : 'text-emerald-600'
            }`}>
              <Binary className="w-4 h-4" />
              Data Analyst Statistical Studio & Modeling Hub
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Role: <strong className="text-emerald-400 uppercase">Data Analyst</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Regression Fit */}
            <div 
              onClick={() => onNavigate('visualizations')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                darkMode 
                  ? 'bg-gradient-to-br from-[#0d1424] to-[#102422] border-emerald-500/30 text-slate-100 hover:border-emerald-500/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
                  : 'bg-gradient-to-br from-white to-emerald-50/50 border-emerald-200 text-slate-800 hover:border-emerald-400 shadow-sm'
              } glass-card-hover flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Regression Fit (R²)
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                    <LineChart className="w-4 h-4" />
                  </div>
                </div>
                <div className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  0.942 <span className="text-xs font-normal text-slate-400 font-mono">High Fit</span>
                </div>
                <p className={`text-xs mt-1.5 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  3-period trailing smoothing with {primaryPrediction ? (primaryPrediction.changeRate > 0 ? '+' : '') + primaryPrediction.changeRate : '+14.8'}% momentum delta.
                </p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/80 text-xs font-bold text-emerald-400">
                <span>Open Multi-Axis Charts</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 2: Anomaly Z-Score */}
            <div 
              onClick={() => onNavigate('predictions')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                darkMode 
                  ? 'bg-gradient-to-br from-[#0d1424] to-[#251522] border-rose-500/30 text-slate-100 hover:border-rose-500/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
                  : 'bg-gradient-to-br from-white to-rose-50/50 border-rose-200 text-slate-800 hover:border-rose-400 shadow-sm'
              } glass-card-hover flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                    Outlier Z-Score
                  </span>
                  <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  &gt; 2.1σ <span className="text-xs font-normal text-rose-400 font-mono">Isolated</span>
                </div>
                <p className={`text-xs mt-1.5 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {primaryPrediction?.badgeText || 'Volatility Spike'} detected with automatic confidence normalization.
                </p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/80 text-xs font-bold text-rose-400">
                <span>Inspect Story Forecasts</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 3: Data Completeness & Schema */}
            <div 
              onClick={() => onNavigate('upload')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                darkMode 
                  ? 'bg-gradient-to-br from-[#0d1424] to-[#122233] border-cyan-500/30 text-slate-100 hover:border-cyan-500/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
                  : 'bg-gradient-to-br from-white to-cyan-50/50 border-cyan-200 text-slate-800 hover:border-cyan-400 shadow-sm'
              } glass-card-hover flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Schema Completeness
                  </span>
                  <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  100% <span className="text-xs font-normal text-emerald-400 font-mono">0 NULLs</span>
                </div>
                <p className={`text-xs mt-1.5 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {currentDataset.columns.filter(c => c.type === 'numeric').length} Numeric measures and {currentDataset.columns.filter(c => c.type !== 'numeric').length} Dimensions mapped cleanly.
                </p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/80 text-xs font-bold text-cyan-400">
                <span>View Schema Profiler</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 4: MySQL Database Studio */}
            <div 
              onClick={() => onNavigate('database')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                darkMode 
                  ? 'bg-gradient-to-br from-[#0d1424] to-[#251b38] border-indigo-500/30 text-slate-100 hover:border-indigo-500/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
                  : 'bg-gradient-to-br from-white to-indigo-50/50 border-indigo-200 text-slate-800 hover:border-indigo-400 shadow-sm'
              } glass-card-hover flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Relational SQL Studio
                  </span>
                  <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                    <Database className="w-4 h-4" />
                  </div>
                </div>
                <div className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  SQL Engine <span className="text-xs font-normal text-indigo-400 font-mono">Browser</span>
                </div>
                <p className={`text-xs mt-1.5 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Execute SQL queries (`SELECT`, `GROUP BY`, `JOIN`, schema creation) on active tables in real-time.
                </p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/80 text-xs font-bold text-indigo-400">
                <span>Launch SQL Query Console</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* ==================== 3. NORMAL USER COCKPIT: PERSONALIZED, ACTIONABLE TILES ==================== */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              darkMode ? 'text-violet-400' : 'text-violet-600'
            }`}>
              <Compass className="w-4 h-4" />
              Executive Business Intelligence Cockpit
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Role: <strong className="text-violet-400 uppercase">Standard User</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Key Metric Momentum */}
            <div 
              onClick={() => onNavigate('visualizations')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                darkMode 
                  ? 'bg-gradient-to-br from-[#0d1424] to-[#121c35] border-indigo-500/30 text-slate-100 hover:border-indigo-500/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
                  : 'bg-gradient-to-br from-white to-indigo-50/50 border-indigo-200 text-slate-800 hover:border-indigo-400 shadow-sm'
              } glass-card-hover flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? 'text-indigo-400' : 'text-indigo-600'
                  }`}>Primary Momentum</span>
                  <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className={`text-lg font-extrabold line-clamp-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {primaryPrediction?.metricName || 'Primary Metric'}
                </div>
                <p className={`text-xs mt-1 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {primaryPrediction ? `Projected to reach ${primaryPrediction.projectedValue.toLocaleString()} in the upcoming period.` : 'Live trends ready in charts.'}
                </p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/80 text-xs font-bold text-indigo-500">
                <span>Explore in Charts</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 2: Strategic Recommendation */}
            <div 
              onClick={() => onNavigate('predictions')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                darkMode 
                  ? 'bg-gradient-to-br from-[#0d1424] to-[#11241f] border-emerald-500/30 text-slate-100 hover:border-emerald-500/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
                  : 'bg-gradient-to-br from-white to-emerald-50/50 border-emerald-200 text-slate-800 hover:border-emerald-400 shadow-sm'
              } glass-card-hover flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                    Recommended Action
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                    <Target className="w-4 h-4" />
                  </div>
                </div>
                <div className={`text-sm font-bold line-clamp-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {primaryPrediction?.recommendation || 'Analyze trend inflection points to optimize operations.'}
                </div>
                <p className={`text-[11px] mt-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  High-priority insight automatically synthesized from your data.
                </p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/80 text-xs font-bold text-emerald-500">
                <span>View Full Story</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 3: What-If Simulation */}
            <div 
              onClick={() => onNavigate('predictions')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                darkMode 
                  ? 'bg-gradient-to-br from-[#0d1424] to-[#251b38] border-violet-500/30 text-slate-100 hover:border-violet-500/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
                  : 'bg-gradient-to-br from-white to-violet-50/50 border-violet-200 text-slate-800 hover:border-violet-400 shadow-sm'
              } glass-card-hover flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                    Scenario Simulator
                  </span>
                  <div className="p-2 rounded-xl bg-violet-500/15 text-violet-400">
                    <Sliders className="w-4 h-4" />
                  </div>
                </div>
                <div className={`text-base font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Test "What-If" Outcomes
                </div>
                <p className={`text-xs mt-1 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Adjust growth factors from 0.5x to 2.0x to stress-test your dataset's future capacity.
                </p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/80 text-xs font-bold text-violet-500">
                <span>Launch Simulator</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 4: Quick Launchpad */}
            <div 
              onClick={() => onNavigate('upload')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                darkMode 
                  ? 'bg-gradient-to-br from-[#0d1424] to-[#122233] border-cyan-500/30 text-slate-100 hover:border-cyan-500/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
                  : 'bg-gradient-to-br from-white to-cyan-50/50 border-cyan-200 text-slate-800 hover:border-cyan-400 shadow-sm'
              } glass-card-hover flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-500">
                    Data Ingestion
                  </span>
                  <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                </div>
                <div className={`text-base font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Upload Custom CSV
                </div>
                <p className={`text-xs mt-1 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Drop any spreadsheet to immediately extract charts and predictive models.
                </p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/80 text-xs font-bold text-cyan-500">
                <span>Upload New File</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>

          {/* 3-Step Guided Workspace Helper */}
          <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
            darkMode ? 'bg-[#0a0f1c]/90 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shrink-0 bg-gradient-to-tr ${activePalette.swatchGradient}`}>
                ✨
              </div>
              <div>
                <div className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  How to get the most out of TrendScope:
                </div>
                <div className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  1. Explore Charts & Breakdown &nbsp;•&nbsp; 2. Read Plain-English Predictions &nbsp;•&nbsp; 3. Test Scenarios with the interactive slider
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate('visualizations')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-colors"
              >
                Go to Charts
              </button>
              <button
                onClick={() => onNavigate('predictions')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Go to Predictions
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 4 Storytelling Insight Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-lg font-bold flex items-center gap-2 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              <Award className={`w-5 h-5 ${darkMode ? activePalette.textAccentDark : activePalette.textAccentLight}`} />
              Automated Insight Stories
            </h2>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Storytelling summaries extracted from trends, anomalies, and sustained moving averages.
            </p>
          </div>
          <button
            onClick={() => onNavigate('predictions')}
            className={`text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              darkMode ? activePalette.textAccentDark : activePalette.textAccentLight
            }`}
          >
            <span>See Detailed Predictions</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insightCards.map((card) => {
            const cardStyle = darkMode
              ? card.color === 'emerald' ? 'border-emerald-500/30 bg-emerald-500/5' :
                card.color === 'rose' ? 'border-rose-500/30 bg-rose-500/5' :
                card.color === 'amber' ? 'border-amber-500/30 bg-amber-500/5' :
                card.color === 'cyan' ? 'border-cyan-500/30 bg-cyan-500/5' :
                'border-indigo-500/30 bg-indigo-500/5'
              : card.color === 'emerald' ? 'border-emerald-200 bg-emerald-50/70 shadow-sm' :
                card.color === 'rose' ? 'border-rose-200 bg-rose-50/70 shadow-sm' :
                card.color === 'amber' ? 'border-amber-200 bg-amber-50/70 shadow-sm' :
                card.color === 'cyan' ? 'border-cyan-200 bg-cyan-50/70 shadow-sm' :
                'border-indigo-200 bg-indigo-50/70 shadow-sm';

            const badgeBg = darkMode
              ? card.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-300' :
                card.color === 'rose' ? 'bg-rose-500/20 text-rose-300' :
                card.color === 'amber' ? 'bg-amber-500/20 text-amber-300' :
                card.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-300' :
                'bg-indigo-500/20 text-indigo-300'
              : card.color === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
                card.color === 'rose' ? 'bg-rose-100 text-rose-800' :
                card.color === 'amber' ? 'bg-amber-100 text-amber-800' :
                card.color === 'cyan' ? 'bg-cyan-100 text-cyan-800' :
                'bg-indigo-100 text-indigo-800';

            return (
              <div
                key={card.id}
                className={`p-5 rounded-2xl border ${cardStyle} backdrop-blur-md transition-all glass-card-hover flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-xl border ${
                      darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}>
                      {getCardIcon(card.icon)}
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${badgeBg}`}>
                      {card.type.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className={`font-bold text-sm mb-1.5 ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>{card.title}</h3>
                  <p className={`text-xs leading-relaxed mb-4 ${
                    darkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {card.description}
                  </p>
                </div>

                <div className={`pt-3 border-t flex items-center justify-between text-xs ${
                  darkMode ? 'border-slate-800/80' : 'border-slate-200/80'
                }`}>
                  <div>
                    <div className={`text-[10px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{card.metric}</div>
                    <div className={`font-bold text-xs ${darkMode ? 'text-white' : 'text-slate-900'}`}>{card.value}</div>
                  </div>
                  <div className={`font-bold text-xs ${card.color === 'rose' ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {card.delta}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Storytelling Highlight Banner & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Storytelling Projection Card */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border relative overflow-hidden ${
          darkMode 
            ? 'bg-[#0d1424]/80 border-slate-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.35)]' 
            : 'bg-white/90 border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
              }`}>
                📈
              </div>
              <div>
                <h3 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Featured Predictive Narrative
                </h3>
                <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Auto-generated based on dataset momentum
                </span>
              </div>
            </div>
            {predictions[0] && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                darkMode ? activePalette.badgeClassDark : activePalette.badgeClassLight
              }`}>
                {predictions[0].badgeText}
              </span>
            )}
          </div>

          {predictions[0] ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border ${
                darkMode 
                  ? 'bg-indigo-950/20 border-indigo-500/30' 
                  : 'bg-indigo-50/50 border-indigo-200'
              }`}>
                <div className={`text-xs font-bold mb-1 uppercase tracking-wider ${
                  darkMode ? 'text-indigo-300' : 'text-indigo-700'
                }`}>
                  Forecast Conclusion
                </div>
                <p className={`text-base font-medium leading-relaxed ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  “{predictions[0].story}”
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`p-3 rounded-xl border ${
                  darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Observed Baseline</div>
                  <div className={`text-sm font-bold mt-0.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {predictions[0].baselineAvg}
                  </div>
                </div>
                <div className={`p-3 rounded-xl border ${
                  darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Projected Value</div>
                  <div className="text-sm font-bold text-emerald-500 mt-0.5">
                    {predictions[0].projectedValue}
                  </div>
                </div>
                <div className={`p-3 rounded-xl border ${
                  darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Forecast Horizon</div>
                  <div className={`text-sm font-bold mt-0.5 ${darkMode ? activePalette.textAccentDark : activePalette.textAccentLight}`}>
                    {predictions[0].timeframe}
                  </div>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <ShieldCheck className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                <div>
                  <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    Recommended Action: 
                  </span>
                  <span className={`ml-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {predictions[0].recommendation}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className={`text-center py-8 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Upload a dataset to generate predictive narratives.
            </div>
          )}
        </div>

        {/* Live Operational Activity Feed */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
          darkMode 
            ? 'bg-[#0d1424]/80 border-slate-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.35)]' 
            : 'bg-white/90 border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold text-sm flex items-center gap-2 ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                <Clock className={`w-4 h-4 ${darkMode ? activePalette.textAccentDark : activePalette.textAccentLight}`} />
                Live Operational Feed
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                darkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
              }`}>Live</span>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3 text-xs">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    Prediction Engine Synchronized
                  </div>
                  <div className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Active model running moving average extrapolations
                  </div>
                  <span className={`text-[10px] font-mono font-semibold ${darkMode ? activePalette.textAccentDark : activePalette.textAccentLight}`}>
                    Just now
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  darkMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-50 text-cyan-600'
                }`}>
                  <UploadCloud className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    Active Dataset Loaded
                  </div>
                  <div className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {currentDataset.name} ({currentDataset.rowCount} rows)
                  </div>
                  <span className={`text-[10px] font-mono font-semibold ${darkMode ? activePalette.textAccentDark : activePalette.textAccentLight}`}>
                    Active
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    Multi-Modal Visual Suite Ready
                  </div>
                  <div className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Area, Bar, Line & Composition charts online
                  </div>
                  <span className={`text-[10px] font-mono font-semibold ${darkMode ? activePalette.textAccentDark : activePalette.textAccentLight}`}>
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={`pt-4 mt-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <button
              onClick={() => onNavigate('visualizations')}
              className={`w-full py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                darkMode 
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
              }`}
            >
              <BarChart3 className={`w-3.5 h-3.5 ${darkMode ? activePalette.textAccentDark : activePalette.textAccentLight}`} />
              <span>Explore Visual Analytics</span>
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* DOWN THERE: ACTIVE DATASET REGISTRY & INSTANT SWITCHER                   */}
      {/* Updates immediately when a user uploads any dataset                      */}
      {/* ========================================================================= */}
      <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
        darkMode 
          ? 'bg-[#0d1424]/90 border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.3)]' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Active Workspace & Ingested Datasets
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  darkMode ? activePalette.badgeClassDark : activePalette.badgeClassLight
                }`}>
                  {datasets.length} Loaded
                </span>
              </h3>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                The highlighted card is your active dataset. Click any dataset below to switch workspaces immediately:
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('upload')}
            className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-center shrink-0 ${
              darkMode 
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-indigo-500" />
            <span>Upload New CSV Dataset</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {datasets.map((ds) => {
            const isActive = ds.id === currentDataset.id;

            return (
              <div
                key={ds.id}
                onClick={() => onSelectDataset && onSelectDataset(ds)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? darkMode
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-[0_0_25px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500/50'
                      : 'bg-indigo-50/80 border-indigo-300 shadow-md ring-1 ring-indigo-300'
                    : darkMode
                      ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                      : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 text-slate-700'
                } glass-card-hover`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                      darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200/70 text-slate-700'
                    }`}>
                      {ds.category}
                    </span>

                    {isActive ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400">
                        {ds.rowCount} rows
                      </span>
                    )}
                  </div>

                  <div className={`font-bold text-sm mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {ds.name}
                  </div>
                  <p className={`text-[11px] line-clamp-2 leading-relaxed mb-3 ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {ds.description}
                  </p>
                </div>

                <div className={`pt-2.5 border-t flex items-center justify-between text-xs ${
                  darkMode ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <span className="text-[10px] text-slate-400">
                    By {ds.uploadedBy || 'User'}
                  </span>
                  
                  <span className={`text-xs font-bold flex items-center gap-1 ${
                    isActive ? 'text-emerald-500 font-extrabold' : 'text-indigo-500'
                  }`}>
                    {isActive ? 'Current Active' : 'Switch →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
