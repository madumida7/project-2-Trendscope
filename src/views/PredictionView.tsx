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
  HeartPulse
} from 'lucide-react';
import { Dataset, PredictionInsight, InsightCardItem, ThemePalette } from '../types';
import { generatePredictions, generateInsightCards } from '../utils/dataAnalyzer';
import { exportPredictionsJSON } from '../utils/exportUtils';
import { getPalette } from '../utils/themeConfig';

interface PredictionViewProps {
  dataset: Dataset;
  darkMode: boolean;
  themePalette?: ThemePalette;
  onOpenReportModal: () => void;
  triggerCelebration?: () => void;
}

export const PredictionView: React.FC<PredictionViewProps> = ({
  dataset,
  darkMode,
  themePalette = 'indigo',
  onOpenReportModal,
  triggerCelebration,
}) => {
  const activePalette = getPalette(themePalette);
  const [scenarioBoost, setScenarioBoost] = useState<number>(0); // -50% to +50%
  const [predictions, setPredictions] = useState<PredictionInsight[]>([]);
  const [insightCards, setInsightCards] = useState<InsightCardItem[]>([]);

  // Recalculate predictions whenever scenario slider or dataset changes
  useEffect(() => {
    const factor = 1 + scenarioBoost / 100;
    const preds = generatePredictions(dataset, factor);
    const cards = generateInsightCards(dataset);
    setPredictions(preds);
    setInsightCards(cards);
  }, [dataset, scenarioBoost]);

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
      case 'financial':
      case 'sales':
        return <DollarSign className="w-5 h-5 text-emerald-500" />;
      case 'ecommerce':
        return <Activity className="w-5 h-5 text-amber-500" />;
      case 'health':
      case 'fitness':
        return <HeartPulse className="w-5 h-5 text-rose-500" />;
      case 'education':
        return <GraduationCap className="w-5 h-5 text-cyan-500" />;
      case 'hr':
        return <Users className="w-5 h-5 text-violet-500" />;
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
              <span>Export Forecast JSON</span>
            </button>

            <button
              onClick={onOpenReportModal}
              className={`px-4 py-2.5 rounded-xl bg-gradient-to-r ${activePalette.accentGradient} text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg ${activePalette.glowShadow}`}
            >
              <Share2 className="w-4 h-4" />
              <span>Executive Brief</span>
            </button>
          </div>
        </div>
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

        <div className="grid grid-cols-1 gap-5">
          {predictions.map((pred) => {
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
                      {pred.baselineAvg}
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${
                    darkMode ? 'bg-slate-950/50 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className={`text-[10px] font-semibold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Projected Outcome
                    </div>
                    <div className="text-base font-extrabold text-emerald-500 mt-0.5 font-mono flex items-center gap-1">
                      <span>{pred.projectedValue}</span>
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

    </div>
  );
};
