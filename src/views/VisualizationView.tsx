import React, { useState, useEffect, useRef } from 'react';
import { 
  Chart as ChartJS, 
  registerables,
  ChartTypeRegistry
} from 'chart.js';
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  Layers, 
  Download, 
  Table as TableIcon,
  Maximize2,
  HelpCircle,
  TrendingUp,
  Filter
} from 'lucide-react';
import { Dataset, ChartType, ThemePalette } from '../types';
import { downloadCanvasAsImage } from '../utils/exportUtils';
import { getPalette } from '../utils/themeConfig';

// Register all chart elements, controllers, scales, and plugins
ChartJS.register(...registerables);

interface VisualizationViewProps {
  dataset: Dataset;
  darkMode: boolean;
  themePalette?: ThemePalette;
}

export const VisualizationView: React.FC<VisualizationViewProps> = ({
  dataset,
  darkMode,
  themePalette = 'indigo',
}) => {
  const activePalette = getPalette(themePalette);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  const [selectedChartType, setSelectedChartType] = useState<ChartType>('area');
  const [xAxisKey, setXAxisKey] = useState<string>('');
  const [yAxisKey, setYAxisKey] = useState<string>('');
  const [aggregation, setAggregation] = useState<'sum' | 'avg' | 'count'>('avg');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showDataTable, setShowDataTable] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Derive available columns
  const numericCols = dataset.columns.filter((c) => c.type === 'numeric');
  const categoricalCols = dataset.columns.filter((c) => c.type === 'categorical' || c.type === 'date');
  const filterCol = categoricalCols.find((c) => c.name.toLowerCase().includes('category') || c.name.toLowerCase().includes('department') || c.name.toLowerCase().includes('region') || c.name.toLowerCase().includes('grade')) || categoricalCols[0];

  // Auto-initialize default axes
  useEffect(() => {
    if (categoricalCols.length > 0 && (!xAxisKey || !dataset.columns.some((c) => c.name === xAxisKey))) {
      setXAxisKey(categoricalCols[0].name);
    }
    if (numericCols.length > 0 && (!yAxisKey || !dataset.columns.some((c) => c.name === yAxisKey))) {
      setYAxisKey(numericCols[0].name);
    }
  }, [dataset]);

  // Unique filter values
  const uniqueFilterValues = React.useMemo(() => {
    if (!filterCol) return [];
    const set = new Set<string>();
    dataset.data.forEach((r) => {
      if (r[filterCol.name]) set.add(String(r[filterCol.name]));
    });
    return Array.from(set);
  }, [dataset, filterCol]);

  // Re-render chart whenever configuration changes
  useEffect(() => {
    if (!canvasRef.current || !dataset.data.length) return;

    const currentX = xAxisKey || categoricalCols[0]?.name || dataset.columns[0]?.name;
    const currentY = yAxisKey || numericCols[0]?.name || dataset.columns[1]?.name;

    if (!currentX || !currentY) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Filter data
    let filteredData = dataset.data;
    if (categoryFilter !== 'all' && filterCol) {
      filteredData = filteredData.filter((r) => String(r[filterCol.name]) === categoryFilter);
    }

    // Aggregate data by X-axis
    const aggregatedMap = new Map<string, number[]>();
    filteredData.forEach((row) => {
      const xVal = String(row[currentX] || 'Unknown');
      const yVal = Number(row[currentY]) || 0;
      if (!aggregatedMap.has(xVal)) {
        aggregatedMap.set(xVal, []);
      }
      aggregatedMap.get(xVal)!.push(yVal);
    });

    const labels = Array.from(aggregatedMap.keys());
    const computedValues = labels.map((label) => {
      const arr = aggregatedMap.get(label)!;
      if (aggregation === 'sum') return Number(arr.reduce((a, b) => a + b, 0).toFixed(2));
      if (aggregation === 'count') return arr.length;
      return Number((arr.reduce((a, b) => a + b, 0) / (arr.length || 1)).toFixed(2));
    });

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let jsType: keyof ChartTypeRegistry = 'line';
    let fillOption = false;

    if (selectedChartType === 'bar') jsType = 'bar';
    else if (selectedChartType === 'pie') jsType = 'pie';
    else if (selectedChartType === 'donut') jsType = 'doughnut';
    else if (selectedChartType === 'area') {
      jsType = 'line';
      fillOption = true;
    }

    const vibrantColors = [
      activePalette.primaryColor, '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6'
    ];

    let backgroundStyling: any = activePalette.primaryColor;
    if (selectedChartType === 'area') {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, `${activePalette.primaryColor}66`);
      gradient.addColorStop(1, `${activePalette.primaryColor}00`);
      backgroundStyling = gradient;
    } else if (selectedChartType === 'pie' || selectedChartType === 'donut') {
      backgroundStyling = vibrantColors.slice(0, labels.length);
    } else if (selectedChartType === 'bar') {
      backgroundStyling = `${activePalette.primaryColor}cc`;
    }

    const textColor = darkMode ? '#94a3b8' : '#475569';
    const gridColor = darkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.07)';

    chartInstanceRef.current = new ChartJS(ctx, {
      type: jsType,
      data: {
        labels,
        datasets: [
          {
            label: `${currentY.replace(/_/g, ' ')} (${aggregation.toUpperCase()})`,
            data: computedValues,
            backgroundColor: backgroundStyling,
            borderColor: selectedChartType === 'pie' || selectedChartType === 'donut' 
              ? (darkMode ? '#0f172a' : '#ffffff') 
              : activePalette.primaryColor,
            borderWidth: selectedChartType === 'line' || selectedChartType === 'area' ? 3 : 1.5,
            fill: fillOption,
            tension: 0.38,
            pointBackgroundColor: activePalette.primaryColor,
            pointBorderColor: '#ffffff',
            pointHoverRadius: 6,
            pointRadius: selectedChartType === 'line' || selectedChartType === 'area' ? 4 : 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 750,
          easing: 'easeOutQuart',
        },
        plugins: {
          legend: {
            display: selectedChartType === 'pie' || selectedChartType === 'donut',
            position: 'right',
            labels: {
              color: textColor,
              font: { family: 'Plus Jakarta Sans', size: 11 },
              boxWidth: 12,
            },
          },
          tooltip: {
            backgroundColor: darkMode ? 'rgba(13, 20, 36, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            titleColor: darkMode ? '#ffffff' : '#0f172a',
            bodyColor: darkMode ? '#cbd5e1' : '#334155',
            borderColor: darkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              label: (context) => {
                const rawVal = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
                const valStr = rawVal !== null && rawVal !== undefined ? Number(rawVal).toLocaleString() : '0';
                return ` ${context.dataset.label || 'Value'}: ${valStr}`;
              },
            },
          },
        },
        scales: selectedChartType === 'pie' || selectedChartType === 'donut' ? {} : {
          x: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { family: 'Plus Jakarta Sans', size: 10 },
              maxRotation: 45,
            },
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { family: 'Plus Jakarta Sans', size: 10 },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [selectedChartType, xAxisKey, yAxisKey, aggregation, categoryFilter, dataset, darkMode, themePalette]);

  const chartTypes: { id: ChartType; label: string; icon: any }[] = [
    { id: 'line', label: 'Line Chart', icon: LineChartIcon },
    { id: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { id: 'area', label: 'Area Chart', icon: Layers },
    { id: 'pie', label: 'Pie Chart', icon: PieChartIcon },
    { id: 'donut', label: 'Donut Chart', icon: PieChartIcon },
  ];

  return (
    <div className={`space-y-6 animate-in fade-in duration-300 ${
      isFullscreen 
        ? `fixed inset-0 z-50 p-6 overflow-y-auto ${darkMode ? 'bg-[#060913]' : 'bg-[#f8fafc]'}` 
        : ''
    }`}>
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold flex items-center gap-3 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <BarChart3 className={`w-8 h-8 ${darkMode ? activePalette.textAccentDark : activePalette.textAccentLight}`} />
            Interactive Visualization Suite
          </h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Dynamic multidimensional rendering with real-time variance calculations and statistical tooltips.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            id="download-chart-btn"
            onClick={() => downloadCanvasAsImage('trendscope-main-chart', `${dataset.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_chart.png`)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              darkMode 
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200' 
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-sm'
            }`}
            title="Download chart as high-resolution PNG"
          >
            <Download className={`w-3.5 h-3.5 ${darkMode ? activePalette.textAccentDark : activePalette.textAccentLight}`} />
            <span>Download PNG</span>
          </button>

          <button
            onClick={() => setShowDataTable(!showDataTable)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              showDataTable
                ? `bg-gradient-to-r ${activePalette.accentGradient} text-white shadow-md`
                : darkMode
                  ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>{showDataTable ? 'Hide Data' : 'View Data'}</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-2 rounded-xl border cursor-pointer transition-all ${
              darkMode
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-sm'
            }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart Type Selector Switcher */}
      <div className={`flex flex-wrap items-center gap-2 p-1.5 rounded-2xl border w-fit ${
        darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-200/90 shadow-sm'
      }`}>
        {chartTypes.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedChartType === item.id;
          return (
            <button
              key={item.id}
              id={`chart-type-${item.id}`}
              onClick={() => setSelectedChartType(item.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? `bg-gradient-to-r ${activePalette.accentGradient} text-white shadow-md ${activePalette.glowShadow}`
                  : darkMode
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Filters & Axis Controls Bar */}
      <div className={`p-4 rounded-2xl border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs ${
        darkMode 
          ? 'bg-[#0d1424]/80 border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
          : 'bg-white/90 border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]'
      }`}>
        
        {/* X-Axis Dimension */}
        <div>
          <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            X-Axis Dimension (Category/Date)
          </label>
          <select
            id="select-xaxis"
            value={xAxisKey}
            onChange={(e) => setXAxisKey(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border outline-none font-semibold transition-colors ${
              darkMode 
                ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-indigo-500' 
                : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-indigo-500 focus:bg-white'
            }`}
          >
            {categoricalCols.map((col) => (
              <option key={col.name} value={col.name}>{col.name}</option>
            ))}
          </select>
        </div>

        {/* Y-Axis Metric */}
        <div>
          <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Y-Axis Metric (Quantitative)
          </label>
          <select
            id="select-yaxis"
            value={yAxisKey}
            onChange={(e) => setYAxisKey(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border outline-none font-semibold transition-colors ${
              darkMode 
                ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-indigo-500' 
                : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-indigo-500 focus:bg-white'
            }`}
          >
            {numericCols.map((col) => (
              <option key={col.name} value={col.name}>{col.name}</option>
            ))}
          </select>
        </div>

        {/* Aggregation Method */}
        <div>
          <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Aggregation Method
          </label>
          <select
            id="select-aggregation"
            value={aggregation}
            onChange={(e) => setAggregation(e.target.value as any)}
            className={`w-full px-3 py-2 rounded-xl border outline-none font-semibold transition-colors ${
              darkMode 
                ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-indigo-500' 
                : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-indigo-500 focus:bg-white'
            }`}
          >
            <option value="avg">Average (Mean)</option>
            <option value="sum">Cumulative Sum</option>
            <option value="count">Count of Records</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Filter by {filterCol?.name || 'Category'}
          </label>
          <select
            id="select-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border outline-none font-semibold transition-colors ${
              darkMode 
                ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-indigo-500' 
                : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-indigo-500 focus:bg-white'
            }`}
          >
            <option value="all">All Records (Unfiltered)</option>
            {uniqueFilterValues.map((val) => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Main Canvas Chart Stage */}
      <div className={`p-6 rounded-3xl border relative transition-all ${
        darkMode 
          ? 'bg-[#0d1424]/85 border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl' 
          : 'bg-white/95 border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] backdrop-blur-xl'
      }`}>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              {dataset.name} — {yAxisKey.replace(/_/g, ' ')} by {xAxisKey.replace(/_/g, ' ')}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
              darkMode ? activePalette.badgeClassDark : activePalette.badgeClassLight
            }`}>
              Live Canvas
            </span>
          </div>

          <div className={`text-[11px] flex items-center gap-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <HelpCircle className="w-3.5 h-3.5 text-cyan-500" />
            <span>Hover points for baseline variance & insights</span>
          </div>
        </div>

        {/* Canvas container */}
        <div className="h-[420px] w-full relative">
          <canvas id="trendscope-main-chart" ref={canvasRef} />
        </div>
      </div>

      {/* Optional Data Table View */}
      {showDataTable && (
        <div className={`space-y-3 p-6 rounded-3xl border animate-in fade-in duration-200 ${
          darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white/90 border-slate-200/90 shadow-sm'
        }`}>
          <h3 className={`text-sm font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <TableIcon className={`w-4 h-4 ${darkMode ? activePalette.textAccentDark : activePalette.textAccentLight}`} />
            Tabular Underlying Data ({dataset.data.length} records)
          </h3>
          <div className={`overflow-x-auto rounded-2xl border max-h-64 ${
            darkMode ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <table className="w-full text-left text-xs">
              <thead className={`uppercase text-[10px] font-bold sticky top-0 border-b ${
                darkMode ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                <tr>
                  <th className="px-4 py-2.5">#</th>
                  {dataset.columns.map((c) => (
                    <th key={c.name} className="px-4 py-2.5">{c.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y font-mono text-[11px] ${
                darkMode ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-200 text-slate-700'
              }`}>
                {dataset.data.map((row, idx) => (
                  <tr key={idx} className={darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                    <td className={`px-4 py-1.5 font-sans ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{idx + 1}</td>
                    {dataset.columns.map((c) => (
                      <td key={c.name} className="px-4 py-1.5 truncate max-w-[200px]">
                        {row[c.name] !== undefined ? String(row[c.name]) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
