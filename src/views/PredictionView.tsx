import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Sliders, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Share2,
  BrainCircuit,
  Award,
  DollarSign,
  Users,
  GraduationCap,
  Activity,
  HeartPulse,
  Database,
  FileText,
  Star,
  Volume2,
  Square,
  AlertTriangle,
  GitCompare,
  X,
  Filter,
  CheckCircle2,
  Layers,
  ArrowRight,
  Target,
  Compass,
  HelpCircle,
  Clock,
  Check,
  Landmark,
  Factory,
  Laptop
} from 'lucide-react';
import { Dataset, PredictionInsight, InsightCardItem, ThemePalette, PredictionGoal } from '../types';
import { NavTab } from '../components/Sidebar';
import { 
  generatePredictions, 
  generateInsightCards, 
  detectDatasetOutliers, 
  OutlierRecord, 
  compareTwoDatasets 
} from '../utils/dataAnalyzer';
import { exportPredictionsJSON } from '../utils/exportUtils';
import { getPalette } from '../utils/themeConfig';
import { PredictionIntentModal } from '../components/PredictionIntentModal';

interface PredictionViewProps {
  dataset: Dataset;
  datasets?: Dataset[];
  onSelectDataset?: (ds: Dataset) => void;
  darkMode: boolean;
  themePalette?: ThemePalette;
  onOpenReportModal: () => void;
  triggerCelebration?: () => void;
  onUpdateDatasetGoal?: (goal: PredictionGoal) => void;
  onNavigate?: (tab: NavTab) => void;
}

export const PredictionView: React.FC<PredictionViewProps> = ({
  dataset,
  datasets,
  onSelectDataset,
  darkMode,
  themePalette = 'indigo',
  onOpenReportModal,
  triggerCelebration,
  onUpdateDatasetGoal,
  onNavigate,
}) => {
  const activePalette = getPalette(themePalette);
  const [scenarioBoost, setScenarioBoost] = useState<number>(0); // -50% to +50%
  const [predictions, setPredictions] = useState<PredictionInsight[]>([]);
  const [insightCards, setInsightCards] = useState<InsightCardItem[]>([]);

  // Feature: Prediction Intent Modal
  const [showIntentModal, setShowIntentModal] = useState<boolean>(false);

  // Feature 1: Outlier Filter state
  const [outliers, setOutliers] = useState<OutlierRecord[]>([]);
  const [showOutlierPanel, setShowOutlierPanel] = useState<boolean>(false);
  const [outlierColumnFilter, setOutlierColumnFilter] = useState<string>('all');

  // Feature 2: Side-by-Side Dataset Comparator state
  const [showComparator, setShowComparator] = useState<boolean>(false);
  const [compareDatasetId, setCompareDatasetId] = useState<string>(() => {
    const other = datasets?.find((d) => d.id !== dataset.id);
    return other ? other.id : dataset.id;
  });

  // Feature 3: Audio Storytelling (Text-to-Speech) state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeAudioIndex, setActiveAudioIndex] = useState<number | null>(null);

  // Recalculate predictions & outliers whenever scenario slider or dataset changes
  useEffect(() => {
    const factor = 1 + scenarioBoost / 100;
    const preds = generatePredictions(dataset, factor);
    const cards = generateInsightCards(dataset);
    setPredictions(preds);
    setInsightCards(cards);

    const detected = detectDatasetOutliers(dataset, 2.0);
    setOutliers(detected);
  }, [dataset, scenarioBoost]);

  // Audio Speech Synthesis cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [dataset]);

  const stopAudioNarration = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setActiveAudioIndex(null);
  };

  const startAudioNarration = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    stopAudioNarration();
    if (predictions.length === 0) return;

    setIsPlayingAudio(true);
    let currentIdx = 0;

    const speakItem = () => {
      if (currentIdx >= predictions.length) {
        setIsPlayingAudio(false);
        setActiveAudioIndex(null);
        return;
      }

      setActiveAudioIndex(currentIdx);
      const p = predictions[currentIdx];
      const speechText = `Story ${currentIdx + 1}: ${p.title}. ${p.story}. Target value projected at ${p.projectedValue}. Strategic recommendation: ${p.recommendation}.`;

      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        currentIdx++;
        speakItem();
      };

      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setActiveAudioIndex(null);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakItem();
  };

  // Compare datasets
  const compareTargetDataset = datasets?.find((d) => d.id === compareDatasetId) || dataset;
  const comparisonSummary = compareTwoDatasets(dataset, compareTargetDataset);

  // Filtered outliers
  const filteredOutliers = outlierColumnFilter === 'all'
    ? outliers
    : outliers.filter((o) => o.columnName.toLowerCase() === outlierColumnFilter.toLowerCase());

  const outlierColumnsList = Array.from(new Set(outliers.map((o) => o.columnName)));

  const getDirectionIcon = (direction: string) => {
    if (direction === 'up' || direction === 'rising' || direction === 'spike') {
      return (
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
          <TrendingUp className="w-4 h-4" />
        </div>
      );
    }
    if (direction === 'down' || direction === 'falling') {
      return (
        <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
          <TrendingDown className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4" />
      </div>
    );
  };

  const getContextGraphic = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'hospital':
      case 'health':
      case 'medical':
      case 'fitness':
        return <HeartPulse className="w-5 h-5 text-rose-500" />;
      case 'student':
      case 'education':
      case 'academic':
        return <GraduationCap className="w-5 h-5 text-cyan-500" />;
      case 'business':
      case 'sales':
      case 'ecommerce':
      case 'retail':
        return <DollarSign className="w-5 h-5 text-emerald-500" />;
      case 'saas':
      case 'tech':
      case 'software':
        return <Laptop className="w-5 h-5 text-blue-500" />;
      case 'finance':
      case 'financial':
      case 'banking':
        return <Landmark className="w-5 h-5 text-amber-500" />;
      case 'hr':
      case 'workforce':
        return <Users className="w-5 h-5 text-violet-500" />;
      case 'supply_chain':
      case 'manufacturing':
      case 'logistics':
        return <Factory className="w-5 h-5 text-orange-500" />;
      default:
        return <BrainCircuit className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Narrative Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden transition-all ${
        darkMode 
          ? 'bg-gradient-to-r from-[#0d1424] via-[#121c33] to-[#0d1424] border-slate-800 shadow-[0_12px_36px_rgba(0,0,0,0.4)]' 
          : 'bg-gradient-to-r from-white via-indigo-50/40 to-white border-slate-200/90 shadow-[0_8px_30px_-6px_rgba(15,23,42,0.06)]'
      }`}>
        <div className={`absolute -right-10 -bottom-10 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
          darkMode ? 'bg-indigo-500/10' : 'bg-indigo-500/5'
        }`} />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              darkMode ? activePalette.badgeClassDark : activePalette.badgeClassLight
            }`}>
              <BrainCircuit className="w-3.5 h-3.5" />
              Algorithmic Narrative Storytelling
            </div>

            <h1 className={`text-2xl sm:text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Human-Understandable Predictions
            </h1>
            
            <p className={`text-sm max-w-2xl ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              No confusing math jargon. TrendScope interprets trends into plain-language stories, forecasted outcomes, baseline comparisons, and actionable recommendations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Customize Prediction Goals & Specific Questions */}
            <button
              id="tailor-prediction-intent-btn"
              onClick={() => {
                setShowIntentModal(true);
                if (showOutlierPanel) setShowOutlierPanel(false);
                if (showComparator) setShowComparator(false);
              }}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                dataset.predictionGoal
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-600/30'
                  : darkMode
                  ? 'bg-indigo-950/40 hover:bg-indigo-900/50 border-indigo-800/60 text-indigo-300'
                  : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
              }`}
              title="Select target metric, forecast horizon, decision posture, and ask specific prediction questions"
            >
              <Target className="w-4 h-4 text-cyan-400" />
              <span>{dataset.predictionGoal ? 'Customized Goals' : 'Customize Goals & Questions'}</span>
              {dataset.predictionGoal && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-400 text-slate-950">
                  Active
                </span>
              )}
            </button>

            {/* Feature 3: Audio Narration (Read Aloud) */}
            {isPlayingAudio ? (
              <button
                id="stop-audio-btn"
                onClick={stopAudioNarration}
                className="px-3.5 py-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md animate-pulse hover:bg-rose-500/30"
                title="Stop Audio Narration"
              >
                <Square className="w-4 h-4 fill-rose-400" />
                <span>Stop Narration</span>
              </button>
            ) : (
              <button
                id="start-audio-btn"
                onClick={startAudioNarration}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                  darkMode 
                    ? 'bg-indigo-950/40 hover:bg-indigo-900/50 border-indigo-800/60 text-indigo-300' 
                    : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
                }`}
                title="Listen to all prediction stories read aloud with browser speech"
              >
                <Volume2 className="w-4 h-4 text-indigo-400" />
                <span>Listen to Briefing</span>
              </button>
            )}

            {/* Feature 1: One-Click Outlier Filter */}
            <button
              id="outlier-filter-btn"
              onClick={() => {
                setShowOutlierPanel(!showOutlierPanel);
                if (showComparator) setShowComparator(false);
              }}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                showOutlierPanel
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-amber-500/20 shadow-lg'
                  : darkMode
                  ? 'bg-amber-950/30 hover:bg-amber-900/40 border-amber-800/50 text-amber-300'
                  : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
              }`}
              title="Isolate statistical anomalies & outliers exceeding ±2.0σ Z-Score"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Outlier Filter</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                showOutlierPanel ? 'bg-slate-900 text-amber-300' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {outliers.length}
              </span>
            </button>

            {/* Feature 2: Side-by-Side Dataset Comparator */}
            {datasets && datasets.length > 1 && (
              <button
                id="dataset-comparator-btn"
                onClick={() => {
                  setShowComparator(!showComparator);
                  if (showOutlierPanel) setShowOutlierPanel(false);
                }}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                  showComparator
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold shadow-cyan-500/20 shadow-lg'
                    : darkMode
                    ? 'bg-cyan-950/30 hover:bg-cyan-900/40 border-cyan-800/50 text-cyan-300'
                    : 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200 text-cyan-800'
                }`}
                title="Compare two datasets side-by-side with delta analysis"
              >
                <GitCompare className="w-4 h-4 text-cyan-400" />
                <span>Compare Datasets</span>
              </button>
            )}

            <button
              id="export-forecast-json-btn"
              onClick={() => exportPredictionsJSON(dataset, predictions)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                darkMode 
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200' 
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-sm'
              }`}
            >
              <Download className={`w-4 h-4 ${darkMode ? activePalette.textAccentDark : activePalette.textAccentLight}`} />
              <span className="hidden sm:inline">JSON</span>
            </button>

            <button
              id="export-predictions-report-btn"
              onClick={onOpenReportModal}
              className={`px-4 py-2.5 rounded-xl bg-gradient-to-r ${activePalette.accentGradient} text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg ${activePalette.glowShadow} hover:scale-[1.02] active:scale-[0.98]`}
              title="Download or print complete predictive intelligence report"
            >
              <FileText className="w-4 h-4" />
              <span>Export Predictions Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tailored Prediction Needs Banner (or prompt if not yet set) */}
      {dataset.predictionGoal ? (
        <div className={`p-5 sm:p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-md ${
          darkMode 
            ? 'bg-gradient-to-r from-indigo-950/70 via-slate-900 to-indigo-950/50 border-indigo-500/40 shadow-indigo-950/20' 
            : 'bg-gradient-to-r from-indigo-50 via-white to-indigo-50/60 border-indigo-300 shadow-indigo-100/50'
        }`}>
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
              <Target className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Customized Prediction Goal Active
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Target: {dataset.predictionGoal.primaryTargetMetric || 'Primary Dimension'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Horizon: {dataset.predictionGoal.predictionHorizon.replace('_', ' ')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Posture: {dataset.predictionGoal.decisionPriority.replace('_', ' ')}
                </span>
              </div>
              <h3 className={`text-base font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {dataset.predictionGoal.businessObjective}
              </h3>
              {dataset.predictionGoal.customQuestion && (
                <div className={`text-xs mt-1 p-3 rounded-xl border flex items-start gap-2.5 ${
                  darkMode ? 'bg-slate-950/70 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-cyan-400">User Question: </span>
                    <span className="italic">"{dataset.predictionGoal.customQuestion}"</span>
                    <span className="block text-[11px] text-emerald-400 font-semibold mt-1">
                      ✓ Models & narrative forecasts below have been calibrated to solve this specific question.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
            {onNavigate && (
              <button
                onClick={() => onNavigate('visualizations')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  darkMode ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200' : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-xs'
                }`}
                title="View interactive charts formatted for this prediction goal"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>View Goal Charts</span>
              </button>
            )}
            <button
              onClick={() => setShowIntentModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Refine Questions</span>
            </button>
          </div>
        </div>
      ) : (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-indigo-50/50 border-indigo-200 text-indigo-900'
        }`}>
          <div className="flex items-center gap-2.5">
            <Target className="w-5 h-5 text-indigo-400 shrink-0" />
            <span className="text-xs">
              <strong>Need predictions tailored to your specific questions?</strong> Select a primary target metric, decision objective, and forecast horizon.
            </span>
          </div>
          <button
            onClick={() => setShowIntentModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Customize Predictions</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 1: OUTLIER & ANOMALY INSPECTOR PANEL                              */}
      {/* ========================================================================= */}
      {showOutlierPanel && (
        <div className={`p-6 rounded-3xl border space-y-5 transition-all animate-in fade-in slide-in-from-top-4 duration-200 ${
          darkMode 
            ? 'bg-[#141208]/90 border-amber-500/40 shadow-[0_12px_40px_rgba(245,158,11,0.15)]' 
            : 'bg-amber-50/70 border-amber-300 shadow-[0_8px_30px_rgba(245,158,11,0.08)]'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-base font-extrabold flex items-center gap-2 ${darkMode ? 'text-amber-200' : 'text-amber-950'}`}>
                  Statistical Outliers & Anomaly Inspector (|Z| ≥ 2.0σ)
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold">
                    {filteredOutliers.length} Isolated
                  </span>
                </h3>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-amber-300/80' : 'text-amber-800'}`}>
                  Data points located in the extreme tails beyond 2 standard deviations from the dataset mean baseline.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowOutlierPanel(false)}
              className={`p-2 rounded-xl cursor-pointer self-start sm:self-center ${
                darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-amber-200/50'
              }`}
              title="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Outlier Column Filter Chips */}
          {outlierColumnsList.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Filter Column:
              </span>
              <button
                onClick={() => setOutlierColumnFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  outlierColumnFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : darkMode ? 'bg-slate-900 text-slate-300 hover:bg-slate-800' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                All Series ({outliers.length})
              </button>
              {outlierColumnsList.map((col) => (
                <button
                  key={col}
                  onClick={() => setOutlierColumnFilter(col)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    outlierColumnFilter === col
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : darkMode ? 'bg-slate-900 text-slate-300 hover:bg-slate-800' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {col} ({outliers.filter((o) => o.columnName === col).length})
                </button>
              ))}
            </div>
          )}

          {/* Outliers Table */}
          {filteredOutliers.length === 0 ? (
            <div className="py-8 text-center text-xs text-amber-500 font-semibold">
              🎉 No anomalous records detected in this selection. All observations reside within standard 2.0σ bounds.
            </div>
          ) : (
            <div className={`overflow-x-auto rounded-2xl border ${darkMode ? 'border-amber-500/20 bg-slate-950/60' : 'border-amber-200 bg-white'}`}>
              <table className="w-full text-left text-xs font-sans">
                <thead className={`uppercase text-[10px] font-extrabold tracking-wider border-b ${
                  darkMode ? 'bg-slate-900/90 text-amber-400 border-amber-500/20' : 'bg-amber-100/50 text-amber-900 border-amber-200'
                }`}>
                  <tr>
                    <th className="px-4 py-3">Row #</th>
                    <th className="px-4 py-3">Metric Column</th>
                    <th className="px-4 py-3">Observed Value</th>
                    <th className="px-4 py-3">Baseline Mean</th>
                    <th className="px-4 py-3">Spread (σ)</th>
                    <th className="px-4 py-3">Z-Score Deviation</th>
                    <th className="px-4 py-3">Classification</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-xs ${
                  darkMode ? 'divide-slate-800 text-slate-200' : 'divide-slate-200 text-slate-700'
                }`}>
                  {filteredOutliers.map((outlier, i) => (
                    <tr key={i} className={darkMode ? 'hover:bg-amber-500/5' : 'hover:bg-amber-50/60'}>
                      <td className="px-4 py-3 font-mono font-bold text-amber-500">#{outlier.rowIndex}</td>
                      <td className="px-4 py-3 font-bold">{outlier.columnName}</td>
                      <td className="px-4 py-3 font-mono font-extrabold text-sm">{outlier.value.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{outlier.mean.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">±{outlier.stdDev.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded-md ${
                          outlier.direction === 'spike'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        }`}>
                          {outlier.zScore > 0 ? `+${outlier.zScore}σ` : `${outlier.zScore}σ`}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold">
                        {outlier.direction === 'spike' ? (
                          <span className="text-rose-500 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" /> High Volume Spike
                          </span>
                        ) : (
                          <span className="text-cyan-500 flex items-center gap-1">
                            <TrendingDown className="w-3.5 h-3.5" /> Severe Drop / Dip
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 2: SIDE-BY-SIDE DATASET COMPARATOR STUDIO                         */}
      {/* ========================================================================= */}
      {showComparator && (
        <div className={`p-6 sm:p-7 rounded-3xl border space-y-6 transition-all animate-in fade-in slide-in-from-top-4 duration-200 ${
          darkMode 
            ? 'bg-[#0a1524]/90 border-cyan-500/40 shadow-[0_12px_40px_rgba(6,182,212,0.15)]' 
            : 'bg-cyan-50/60 border-cyan-300 shadow-[0_8px_30px_rgba(6,182,212,0.08)]'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400">
                <GitCompare className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-base font-extrabold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Side-by-Side Dataset Comparator Studio
                </h3>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-cyan-300/80' : 'text-cyan-800'}`}>
                  Cross-examine operational scale, metric performance, and momentum between two datasets.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="compare-select" className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Compare with:
                </label>
                <select
                  id="compare-select"
                  value={compareDatasetId}
                  onChange={(e) => setCompareDatasetId(e.target.value)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer outline-none ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                >
                  {datasets?.map((d) => (
                    <option key={d.id} value={d.id} disabled={d.id === dataset.id}>
                      {d.name} {d.id === dataset.id ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowComparator(false)}
                className={`p-2 rounded-xl cursor-pointer ${
                  darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-cyan-200/50'
                }`}
                title="Close comparator"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Split Profile Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dataset A */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              darkMode ? 'bg-slate-950/70 border-indigo-500/30' : 'bg-white border-indigo-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Dataset A (Current Active)
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase">
                  {dataset.category}
                </span>
              </div>
              <h4 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {dataset.name}
              </h4>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400">Observations:</span>{' '}
                  <strong className={darkMode ? 'text-white' : 'text-slate-900'}>{dataset.rowCount} rows</strong>
                </div>
                <div>
                  <span className="text-slate-400">Attributes:</span>{' '}
                  <strong className={darkMode ? 'text-white' : 'text-slate-900'}>{dataset.columnCount} columns</strong>
                </div>
              </div>
            </div>

            {/* Dataset B */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              darkMode ? 'bg-slate-950/70 border-cyan-500/30' : 'bg-white border-cyan-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Dataset B (Benchmark / Comparison)
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold uppercase">
                  {compareTargetDataset.category}
                </span>
              </div>
              <h4 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {compareTargetDataset.name}
              </h4>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400">Observations:</span>{' '}
                  <strong className={darkMode ? 'text-white' : 'text-slate-900'}>{compareTargetDataset.rowCount} rows</strong>
                </div>
                <div>
                  <span className="text-slate-400">Attributes:</span>{' '}
                  <strong className={darkMode ? 'text-white' : 'text-slate-900'}>{compareTargetDataset.columnCount} columns</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Automated Takeaway Narrative */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            darkMode ? 'bg-slate-900/80 border-cyan-500/30 text-slate-200' : 'bg-white border-cyan-200 text-slate-800'
          }`}>
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-extrabold uppercase tracking-wide text-cyan-400">Comparative Intelligence Synthesis: </span>
              {comparisonSummary.takeawayStory}
            </div>
          </div>

          {/* Metrics Comparison Table */}
          {comparisonSummary.metricsComparison.length > 0 && (
            <div className={`overflow-x-auto rounded-2xl border ${darkMode ? 'border-cyan-500/20 bg-slate-950/60' : 'border-cyan-200 bg-white'}`}>
              <table className="w-full text-left text-xs font-sans">
                <thead className={`uppercase text-[10px] font-extrabold tracking-wider border-b ${
                  darkMode ? 'bg-slate-900 text-cyan-400 border-cyan-500/20' : 'bg-cyan-100/50 text-cyan-900 border-cyan-200'
                }`}>
                  <tr>
                    <th className="px-4 py-3">Metric Dimension</th>
                    <th className="px-4 py-3">Dataset A Mean</th>
                    <th className="px-4 py-3">Dataset B Mean</th>
                    <th className="px-4 py-3">Variance Delta</th>
                    <th className="px-4 py-3">Leading Dataset</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-xs ${
                  darkMode ? 'divide-slate-800 text-slate-200' : 'divide-slate-200 text-slate-700'
                }`}>
                  {comparisonSummary.metricsComparison.map((m, idx) => (
                    <tr key={idx} className={darkMode ? 'hover:bg-cyan-500/5' : 'hover:bg-cyan-50/60'}>
                      <td className="px-4 py-3 font-bold">{m.name}</td>
                      <td className="px-4 py-3 font-mono font-semibold">{m.meanA.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono font-semibold">{m.meanB.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono font-extrabold">
                        <span className={`px-2 py-0.5 rounded-md ${
                          m.deltaPercent > 0
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : m.deltaPercent < 0
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {m.deltaPercent > 0 ? `+${m.deltaPercent}%` : `${m.deltaPercent}%`}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold">
                        {m.winner === 'A' ? (
                          <span className="text-indigo-400">Dataset A ({dataset.name.slice(0, 16)}...)</span>
                        ) : m.winner === 'B' ? (
                          <span className="text-cyan-400">Dataset B ({compareTargetDataset.name.slice(0, 16)}...)</span>
                        ) : (
                          <span className="text-slate-400">Equally Matched</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Active Dataset Indicator & Quick Switcher */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
        darkMode 
          ? 'bg-[#0d1424]/90 border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.25)]' 
          : 'bg-white border-slate-200 shadow-[0_2px_12px_rgba(15,23,42,0.04)]'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
          }`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Active Forecasting Dataset:
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                darkMode ? activePalette.badgeClassDark : activePalette.badgeClassLight
              }`}>
                {dataset.category.toUpperCase()}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                ({dataset.rowCount} rows · {dataset.columnCount} columns)
              </span>
            </div>
            <div className={`text-base font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {dataset.name}
            </div>
          </div>
        </div>

        {datasets && datasets.length > 1 && onSelectDataset && (
          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            <label htmlFor="pred-dataset-select" className={`text-xs font-semibold ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Select Dataset:
            </label>
            <select
              id="pred-dataset-select"
              value={dataset.id}
              onChange={(e) => {
                const found = datasets.find((d) => d.id === e.target.value);
                if (found) onSelectDataset(found);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer outline-none transition-all ${
                darkMode 
                  ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-indigo-500' 
                  : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-indigo-600 shadow-sm'
              }`}
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.rowCount} rows)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Interactive "What-If" Scenario Simulator */}
      <div className={`p-6 rounded-3xl border backdrop-blur-xl space-y-4 transition-all ${
        darkMode 
          ? 'bg-[#0d1424]/85 border-indigo-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.35)]' 
          : 'bg-white/95 border-indigo-200 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${
              darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
            }`}>
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Interactive Scenario & What-If Simulator
              </h3>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Adjust baseline trajectory momentum (-50% to +50%) to observe dynamic recalculations across all forecasts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-extrabold px-3 py-1 rounded-lg font-mono border ${
              scenarioBoost > 0 
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500' 
                : scenarioBoost < 0 
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-500' 
                : darkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-300' 
                  : 'bg-slate-100 border-slate-300 text-slate-700'
            }`}>
              {scenarioBoost > 0 ? `+${scenarioBoost}% Boost` : scenarioBoost < 0 ? `${scenarioBoost}% Stress Test` : 'Baseline (0%)'}
            </span>

            {scenarioBoost !== 0 && (
              <button
                onClick={() => setScenarioBoost(0)}
                className={`text-xs font-bold underline cursor-pointer ${
                  darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <input
            id="scenario-slider"
            type="range"
            min="-50"
            max="50"
            step="5"
            value={scenarioBoost}
            onChange={(e) => {
              setScenarioBoost(Number(e.target.value));
              if (Number(e.target.value) === 30 || Number(e.target.value) === 50) {
                triggerCelebration?.();
              }
            }}
            className={`w-full cursor-pointer h-2 rounded-lg ${
              darkMode ? 'bg-slate-800 accent-indigo-500' : 'bg-slate-200 accent-indigo-600'
            }`}
          />
          <div className={`flex justify-between text-[11px] font-mono ${
            darkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <span>-50% Adverse Shock</span>
            <span>0% Normal Trend</span>
            <span>+50% Optimistic Surge</span>
          </div>
        </div>
      </div>

      {/* Main Storytelling Prediction Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Generated Narrative Projections ({predictions.length})
          </h2>
          <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Calculated via Moving Average & Cyclical Pattern Detection
          </span>
        </div>

        {predictions.length === 0 ? (
          <div className={`p-8 text-center rounded-3xl border ${
            darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
          }`}>
            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2 animate-bounce" />
            <h3 className="font-bold text-sm">Synthesizing Predictive Projections...</h3>
            <p className="text-xs text-slate-400 mt-1">Select a dataset with numerical observations or customize your prediction questions above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {predictions.map((pred, idx) => {
              const isPositive = pred.changeRate >= 0;
              const borderCol = darkMode
                ? pred.colorHighlight === 'emerald' ? 'border-emerald-500/30 hover:border-emerald-500/50' :
                  pred.colorHighlight === 'rose' ? 'border-rose-500/30 hover:border-rose-500/50' :
                  pred.colorHighlight === 'amber' ? 'border-amber-500/30 hover:border-amber-500/50' :
                  'border-indigo-500/30 hover:border-indigo-500/50'
                : pred.colorHighlight === 'emerald' ? 'border-emerald-200 hover:border-emerald-300' :
                  pred.colorHighlight === 'rose' ? 'border-rose-200 hover:border-rose-300' :
                  pred.colorHighlight === 'amber' ? 'border-amber-200 hover:border-amber-300' :
                  'border-indigo-200 hover:border-indigo-300';

              const badgeBg = darkMode
                ? pred.colorHighlight === 'emerald' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  pred.colorHighlight === 'rose' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                  pred.colorHighlight === 'amber' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                  'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                : pred.colorHighlight === 'emerald' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                  pred.colorHighlight === 'rose' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                  pred.colorHighlight === 'amber' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                  'bg-indigo-50 text-indigo-800 border-indigo-200';

              return (
                <div
                  key={pred.id}
                  className={`p-6 sm:p-7 rounded-3xl border ${borderCol} transition-all glass-card-hover space-y-5 ${
                    activeAudioIndex === idx ? 'ring-2 ring-indigo-500 shadow-2xl scale-[1.01]' : ''
                  } ${
                    darkMode 
                      ? 'bg-[#0d1424]/85 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl' 
                      : 'bg-white/95 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] backdrop-blur-xl'
                  }`}
                >
                  {/* Top Row: Context & Badges */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {getContextGraphic(dataset.category)}
                      <div>
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${
                          darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {pred.categoryContext}
                        </span>
                        <h3 className={`text-lg font-bold leading-tight ${
                          darkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          {pred.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeAudioIndex === idx && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 animate-pulse">
                          <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                          Speaking...
                        </span>
                      )}

                      <button
                        onClick={() => {
                          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                            window.speechSynthesis.cancel();
                            setActiveAudioIndex(idx);
                            setIsPlayingAudio(true);
                            const text = `${pred.title}. ${pred.story}. Target value projected at ${pred.projectedValue}. Strategic recommendation: ${pred.recommendation}.`;
                            const utterance = new SpeechSynthesisUtterance(text);
                            utterance.onend = () => {
                              setActiveAudioIndex(null);
                              setIsPlayingAudio(false);
                            };
                            window.speechSynthesis.speak(utterance);
                          }
                        }}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                        }`}
                        title="Read this story aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      <span className={`text-xs px-3 py-1 rounded-full font-bold border ${badgeBg}`}>
                        {pred.badgeText}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold font-mono border ${
                        darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {pred.confidence}% Reliability
                      </span>
                    </div>
                  </div>

                  {/* Narrative Quotation Box */}
                  <div className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 ${
                    darkMode 
                      ? 'bg-slate-950/70 border-slate-800/90' 
                      : 'bg-indigo-50/60 border-indigo-200'
                  }`}>
                    <div className="mt-0.5 shrink-0">
                      {getDirectionIcon(pred.direction)}
                    </div>
                    <div className="space-y-1">
                      <div className={`text-[11px] font-bold uppercase tracking-wider ${
                        darkMode ? 'text-indigo-400' : 'text-indigo-700'
                      }`}>
                        Plain-English Story
                      </div>
                      <p className={`text-base sm:text-lg font-medium leading-relaxed ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        “{pred.story}”
                      </p>
                    </div>
                  </div>

                  {/* Metrics Breakdown Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div className={`p-3.5 rounded-2xl border ${
                      darkMode ? 'bg-slate-950/50 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className={`text-[10px] font-semibold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Target Metric
                      </div>
                      <div className={`text-xs font-bold mt-1 truncate ${darkMode ? 'text-white' : 'text-slate-900'}`} title={pred.metricName}>
                        {pred.metricName}
                      </div>
                    </div>

                    <div className={`p-3.5 rounded-2xl border ${
                      darkMode ? 'bg-slate-950/50 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className={`text-[10px] font-semibold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Historic Baseline
                      </div>
                      <div className={`text-base font-extrabold mt-0.5 font-mono ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {typeof pred.baselineAvg === 'number' && !isNaN(pred.baselineAvg) ? pred.baselineAvg.toLocaleString() : (pred.baselineAvg ?? 'N/A')}
                      </div>
                    </div>

                    <div className={`p-3.5 rounded-2xl border ${
                      darkMode ? 'bg-slate-950/50 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className={`text-[10px] font-semibold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Projected Outcome
                      </div>
                      <div className="text-base font-extrabold text-emerald-500 mt-0.5 font-mono flex items-center gap-1">
                        <span>{typeof pred.projectedValue === 'number' && !isNaN(pred.projectedValue) ? pred.projectedValue.toLocaleString() : (pred.projectedValue ?? 'N/A')}</span>
                        {isPositive ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-rose-500" />}
                      </div>
                    </div>

                    <div className={`p-3.5 rounded-2xl border ${
                      darkMode ? 'bg-slate-950/50 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className={`text-[10px] font-semibold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Expected Horizon
                      </div>
                      <div className={`text-xs font-bold mt-1 ${darkMode ? activePalette.textAccentDark : activePalette.textAccentLight}`}>
                        {pred.timeframe}
                      </div>
                    </div>
                  </div>

                  {/* Actionable Executive Guidance */}
                  <div className={`pt-3 border-t flex items-start gap-2.5 text-xs ${
                    darkMode ? 'border-slate-800' : 'border-slate-200'
                  }`}>
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        Recommended Next Step: 
                      </span>
                      <span className={`ml-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {pred.recommendation}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4 Dedicated Storytelling Insight Cards */}
      <div className={`space-y-4 pt-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <h2 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          <Award className={`w-5 h-5 ${darkMode ? activePalette.textAccentDark : activePalette.textAccentLight}`} />
          Key Operational Insights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insightCards.map((card) => (
            <div
              key={card.id}
              className={`p-5 rounded-2xl border space-y-3 transition-all ${
                darkMode 
                  ? 'border-slate-800 bg-[#0d1424]/80 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
                  : 'border-slate-200 bg-white/90 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  darkMode ? activePalette.badgeClassDark : activePalette.badgeClassLight
                }`}>
                  {card.type.replace('_', ' ')}
                </span>
                <span className={`text-xs font-bold ${card.color === 'rose' ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {card.delta}
                </span>
              </div>
              <div>
                <h4 className={`font-bold text-sm mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {card.title}
                </h4>
                <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {card.description}
                </p>
              </div>
              <div className={`pt-2 border-t text-[11px] font-medium ${
                darkMode ? 'border-slate-800/80 text-slate-300' : 'border-slate-200 text-slate-700'
              }`}>
                {card.metric}: <strong className={darkMode ? 'text-white' : 'text-slate-900'}>{card.value}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tailored Prediction Questions & Needs Modal */}
      <PredictionIntentModal
        isOpen={showIntentModal}
        onClose={() => setShowIntentModal(false)}
        datasetName={dataset.name}
        category={dataset.category}
        columns={dataset.columns}
        initialGoal={dataset.predictionGoal}
        onApplyGoal={(goal) => {
          onUpdateDatasetGoal?.(goal);
          setShowIntentModal(false);
        }}
        darkMode={darkMode}
        themePalette={themePalette}
      />

    </div>
  );
};
