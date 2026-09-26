import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Target, 
  Clock, 
  Compass, 
  HelpCircle, 
  BarChart3, 
  LineChart, 
  PieChart, 
  Check, 
  ArrowRight, 
  X,
  Layers,
  ShieldAlert,
  TrendingUp,
  BrainCircuit,
  Building2,
  GraduationCap,
  HeartPulse,
  Briefcase,
  Laptop,
  Landmark,
  Users,
  Factory,
  Globe
} from 'lucide-react';
import { ColumnProfile, Dataset, PredictionGoal, ChartType, ThemePalette, SectorType } from '../types';
import { getPalette } from '../utils/themeConfig';
import { SECTOR_DEFINITIONS, detectSectorDetails } from '../utils/dataAnalyzer';

interface PredictionIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetName: string;
  category: SectorType | string;
  columns: ColumnProfile[];
  initialGoal?: PredictionGoal;
  onApplyGoal: (goal: PredictionGoal) => void;
  darkMode?: boolean;
  themePalette?: ThemePalette;
}

export const PredictionIntentModal: React.FC<PredictionIntentModalProps> = ({
  isOpen,
  onClose,
  datasetName,
  category,
  columns,
  initialGoal,
  onApplyGoal,
  darkMode = true,
  themePalette = 'indigo',
}) => {
  if (!isOpen) return null;

  const activePalette = getPalette(themePalette);

  // Run deep sector inspection
  const sectorDetection = useMemo(() => {
    return detectSectorDetails(columns, datasetName);
  }, [columns, datasetName]);

  // Active sector state (defaults to detected sector or prop category)
  const [activeSector, setActiveSector] = useState<SectorType>(() => {
    const validSectors: SectorType[] = ['hospital', 'student', 'business', 'saas', 'finance', 'hr', 'supply_chain', 'general'];
    if (validSectors.includes(category as SectorType)) {
      return category as SectorType;
    }
    return sectorDetection.sector;
  });

  const activeSectorDef = SECTOR_DEFINITIONS[activeSector] || SECTOR_DEFINITIONS.general;
  const domainObjectives = activeSectorDef.objectives;

  const numericColumns = columns.filter((c) => c.type === 'numeric');

  // Sort numeric columns to place sector-relevant metrics first
  const sortedNumericColumns = useMemo(() => {
    if (!activeSectorDef.keywords.length) return numericColumns;
    return [...numericColumns].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aMatch = activeSectorDef.keywords.some((kw) => aName.includes(kw));
      const bMatch = activeSectorDef.keywords.some((kw) => bName.includes(kw));
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
  }, [numericColumns, activeSectorDef]);

  // Pre-select target metric
  const [selectedMetric, setSelectedMetric] = useState<string>(
    initialGoal?.primaryTargetMetric || (sortedNumericColumns.length > 0 ? sortedNumericColumns[0].name : '')
  );

  const [selectedObjective, setSelectedObjective] = useState<string>(
    initialGoal?.businessObjective || domainObjectives[0].id
  );

  const [selectedHorizon, setSelectedHorizon] = useState<'next_month' | 'next_quarter' | 'six_months' | 'one_year'>(
    initialGoal?.predictionHorizon || 'next_quarter'
  );

  const [selectedPriority, setSelectedPriority] = useState<'high_accuracy' | 'aggressive_growth' | 'conservative_defense' | 'balanced'>(
    initialGoal?.decisionPriority || 'balanced'
  );

  const [customQuestion, setCustomQuestion] = useState<string>(
    initialGoal?.customQuestion || ''
  );

  const [preferredChart, setPreferredChart] = useState<ChartType>(
    initialGoal?.recommendedChartType || 'line'
  );

  // Sync state whenever modal is opened or initialGoal changes
  useEffect(() => {
    if (isOpen) {
      const detected = detectSectorDetails(columns, datasetName);
      const chosenSector = (category in SECTOR_DEFINITIONS) ? (category as SectorType) : detected.sector;
      setActiveSector(chosenSector);

      if (initialGoal?.primaryTargetMetric) {
        setSelectedMetric(initialGoal.primaryTargetMetric);
      } else if (sortedNumericColumns.length > 0 && !selectedMetric) {
        setSelectedMetric(sortedNumericColumns[0].name);
      }

      if (initialGoal?.businessObjective) {
        setSelectedObjective(initialGoal.businessObjective);
      } else {
        const objs = SECTOR_DEFINITIONS[chosenSector]?.objectives || SECTOR_DEFINITIONS.general.objectives;
        setSelectedObjective(objs[0].id);
      }

      if (initialGoal?.predictionHorizon) {
        setSelectedHorizon(initialGoal.predictionHorizon);
      }
      if (initialGoal?.decisionPriority) {
        setSelectedPriority(initialGoal.decisionPriority);
      }
      if (initialGoal?.customQuestion !== undefined) {
        setCustomQuestion(initialGoal.customQuestion);
      }
      if (initialGoal?.recommendedChartType) {
        setPreferredChart(initialGoal.recommendedChartType);
      }
    }
  }, [isOpen, initialGoal, datasetName]);

  // Switch sector handler
  const handleSwitchSector = (sec: SectorType) => {
    setActiveSector(sec);
    const newObjs = SECTOR_DEFINITIONS[sec]?.objectives || SECTOR_DEFINITIONS.general.objectives;
    setSelectedObjective(newObjs[0].id);
    
    // Auto-select best matching column for the new sector
    const def = SECTOR_DEFINITIONS[sec];
    if (def.keywords.length > 0) {
      const match = sortedNumericColumns.find((c) => 
        def.keywords.some((kw) => c.name.toLowerCase().includes(kw))
      );
      if (match) {
        setSelectedMetric(match.name);
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const goal: PredictionGoal = {
      primaryTargetMetric: selectedMetric || (sortedNumericColumns.length > 0 ? sortedNumericColumns[0].name : undefined),
      businessObjective: selectedObjective,
      predictionHorizon: selectedHorizon,
      decisionPriority: selectedPriority,
      customQuestion: customQuestion.trim() || undefined,
      recommendedChartType: preferredChart,
    };

    onApplyGoal(goal);
    onClose();
  };

  const sectorIcons: Record<SectorType, any> = {
    hospital: HeartPulse,
    student: GraduationCap,
    business: Briefcase,
    saas: Laptop,
    finance: Landmark,
    hr: Users,
    supply_chain: Factory,
    general: Globe,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className={`w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl p-5 sm:p-8 space-y-6 transition-all ${
        darkMode 
          ? 'bg-[#0d1424] border-slate-800 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.6)]' 
          : 'bg-white border-slate-200 text-slate-900 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.15)]'
      }`}>
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className={`inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
              darkMode ? activePalette.badgeClassDark : activePalette.badgeClassLight
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              Tailored Sector & Prediction Intelligence
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              What Specific Predictions Do You Need?
            </h2>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              TrendScope automatically detects your dataset's industry domain to calibrate questions, moving averages, and decision guidance for <strong className={darkMode ? 'text-white' : 'text-slate-900'}>{datasetName}</strong>.
            </p>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl cursor-pointer ${
              darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SECTOR DETECTION & CUSTOMIZATION BAR                                      */}
        {/* ========================================================================= */}
        <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
          darkMode 
            ? 'bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/40 border-indigo-500/40 shadow-inner' 
            : 'bg-gradient-to-r from-indigo-50 via-white to-indigo-50/60 border-indigo-200 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{activeSectorDef.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                    Active Dataset Sector:
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {sectorDetection.confidence}% Match
                  </span>
                </div>
                <h3 className={`text-sm font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {activeSectorDef.name}
                </h3>
              </div>
            </div>

            {sectorDetection.matchedKeywords.length > 0 && (
              <div className={`text-[11px] font-mono ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Detected indicators: <span className="font-semibold text-indigo-400">{sectorDetection.matchedKeywords.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Sector Switcher Pills */}
          <div className="space-y-1.5 pt-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Switch Sector (Updates Questions & Models Instantly):
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(Object.keys(SECTOR_DEFINITIONS) as SectorType[]).map((sec) => {
                const def = SECTOR_DEFINITIONS[sec];
                const isSelected = activeSector === sec;
                const IconComponent = sectorIcons[sec];

                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => handleSwitchSector(sec)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 font-black shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                        : darkMode
                        ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{def.icon}</span>
                    <span>{def.name.split('&')[0].trim()}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Question 1: Target Metric to Forecast */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                <Target className="w-4 h-4" />
                1. Which Primary Metric Should TrendScope Predict?
              </label>
              <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Sector-relevant metrics listed first
              </span>
            </div>

            {sortedNumericColumns.length === 0 ? (
              <div className="p-3 rounded-xl border border-amber-500/30 text-amber-400 text-xs">
                No numeric columns detected; TrendScope will predict record frequency and category distributions.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {sortedNumericColumns.map((col) => {
                  const isSelected = selectedMetric.toLowerCase() === col.name.toLowerCase();
                  const isSectorRecommended = activeSectorDef.keywords.some((kw) => col.name.toLowerCase().includes(kw));

                  return (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => setSelectedMetric(col.name)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400'
                          : darkMode
                          ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs truncate font-bold">{col.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </div>
                      <div className="flex items-center justify-between text-[10px] mt-1 opacity-80">
                        <span>Mean: {col.mean !== undefined ? col.mean.toLocaleString() : 'N/A'}</span>
                        {isSectorRecommended && (
                          <span className={`px-1 py-0.2 rounded font-bold ${isSelected ? 'bg-white/20 text-white' : 'text-cyan-400'}`}>
                            ★ Relevant
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Question 2: Sector-Specific Decision Objective */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Compass className="w-4 h-4" />
                2. What is Your Main {activeSectorDef.name.split('&')[0]} Objective?
              </label>
              <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Calibrated for {activeSectorDef.name}
              </span>
            </div>

            <div className="space-y-2">
              {domainObjectives.map((obj) => {
                const isSelected = selectedObjective === obj.id;
                return (
                  <div
                    key={obj.id}
                    onClick={() => setSelectedObjective(obj.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? darkMode
                          ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/50'
                          : 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400'
                        : darkMode
                        ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-400'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${isSelected ? (darkMode ? 'text-emerald-300' : 'text-emerald-900') : ''}`}>
                        {obj.id}
                      </div>
                      <p className={`text-[11px] mt-0.5 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {obj.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question 3 & 4: Horizon & Decision Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Horizon */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-400">
                <Clock className="w-4 h-4" />
                3. Forecast Timeframe
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'next_month', label: 'Next Month (30d)' },
                  { id: 'next_quarter', label: 'Next Quarter (90d)' },
                  { id: 'six_months', label: '6 Months (Mid-term)' },
                  { id: 'one_year', label: '1 Year (Annual)' },
                ].map((hz) => (
                  <button
                    key={hz.id}
                    type="button"
                    onClick={() => setSelectedHorizon(hz.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all text-center ${
                      selectedHorizon === hz.id
                        ? 'bg-violet-600 text-white border-violet-500 font-extrabold shadow-sm'
                        : darkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {hz.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Decision Priority */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <ShieldAlert className="w-4 h-4" />
                4. Strategic Posture
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'balanced', label: '⚖️ Neutral Baseline' },
                  { id: 'aggressive_growth', label: '🚀 Growth Push' },
                  { id: 'conservative_defense', label: '🛡️ Downside Defense' },
                  { id: 'high_accuracy', label: '🎯 High Confidence' },
                ].map((pr) => (
                  <button
                    key={pr.id}
                    type="button"
                    onClick={() => setSelectedPriority(pr.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all text-center ${
                      selectedPriority === pr.id
                        ? 'bg-amber-600 text-white border-amber-500 font-extrabold shadow-sm'
                        : darkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pr.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question 5: Specific Custom Question (With Sector Quick-Prompt Chips) */}
          <div className="space-y-2.5">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <HelpCircle className="w-4 h-4" />
              5. Do You Have a Specific Question for {activeSectorDef.name}?
            </label>

            {/* Quick-Prompt Question Chips for this Sector */}
            {activeSectorDef.sampleQuestions.length > 0 && (
              <div className="space-y-1.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Quick-Click Sector Questions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeSectorDef.sampleQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomQuestion(q)}
                      className={`text-left px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                        customQuestion === q
                          ? 'bg-cyan-600 text-white border-cyan-500 font-bold'
                          : darkMode
                          ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300'
                          : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-cyan-400 hover:text-cyan-800'
                      }`}
                    >
                      "{q}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder={activeSectorDef.sampleQuestions[0] || 'e.g. What is our projected trajectory next cycle?'}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-all ${
                darkMode
                  ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-cyan-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600'
              }`}
            />
          </div>

          {/* Question 6: Preferred Default Visualization */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <BarChart3 className="w-4 h-4" />
              6. Preferred Visual Perspective
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'line', label: 'Trend Line', icon: LineChart },
                { id: 'bar', label: 'Bar Compare', icon: BarChart3 },
                { id: 'area', label: 'Area Surge', icon: Layers },
                { id: 'pie', label: 'Distribution', icon: PieChart },
              ].map((ch) => {
                const Icon = ch.icon;
                const isSelected = preferredChart === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setPreferredChart(ch.id as ChartType)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 font-extrabold shadow-sm'
                        : darkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] font-bold">{ch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Skip & Use Defaults
            </button>

            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl bg-gradient-to-r ${activePalette.accentGradient} text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg ${activePalette.glowShadow} hover:scale-[1.02] active:scale-[0.98] transition-all`}
            >
              <span>Generate Tailored Predictions & Charts</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
