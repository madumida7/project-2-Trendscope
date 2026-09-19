import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  BarChart3, 
  TrendingUp, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight,
  Activity,
  Layers,
  Database
} from 'lucide-react';
import { Dataset, User, ThemePalette } from '../types';
import { getPalette } from '../utils/themeConfig';

export type NavTab = 'dashboard' | 'upload' | 'visualizations' | 'predictions' | 'admin' | 'database';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  darkMode: boolean;
  themePalette?: ThemePalette;
  currentDataset: Dataset;
  currentUser: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  darkMode,
  themePalette = 'indigo',
  currentDataset,
  currentUser,
}) => {
  const activePalette = getPalette(themePalette);

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      badge: null,
      description: 'KPIs, trend pulses & highlights',
    },
    {
      id: 'upload' as NavTab,
      label: 'Upload & Profile Data',
      icon: UploadCloud,
      badge: `${currentDataset.rowCount} rows`,
      description: 'CSV, spreadsheets & profiling',
    },
    {
      id: 'visualizations' as NavTab,
      label: 'Interactive Charts',
      icon: BarChart3,
      badge: '5 Views',
      description: 'Line, Bar, Area, Pie, Donut',
    },
    {
      id: 'predictions' as NavTab,
      label: 'Prediction Storytelling',
      icon: TrendingUp,
      badge: 'Unique',
      badgeColor: darkMode ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      description: 'Human-narrative forecasts & what-if',
    },
    {
      id: 'admin' as NavTab,
      label: 'Admin Control Hub',
      icon: ShieldAlert,
      badge: currentUser?.role === 'admin' ? 'Super' : 'Portal',
      description: 'Users, datasets, platform logs',
    },
    {
      id: 'database' as NavTab,
      label: 'MySQL Database',
      icon: Database,
      badge: 'SQL Studio',
      badgeColor: darkMode ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      description: 'Open source browser DB studio',
    },
  ];

  return (
    <aside
      className={`relative border-r transition-all duration-300 flex flex-col justify-between shrink-0 select-none ${
        collapsed ? 'w-20' : 'w-64'
      } ${
        darkMode
          ? 'bg-[#090d18]/90 border-slate-800/80 text-slate-300'
          : 'bg-white/90 border-slate-200/90 text-slate-700'
      } backdrop-blur-xl shadow-sm`}
    >
      {/* Top Section */}
      <div className="p-3 space-y-4">
        {/* Toggle Collapse Button */}
        <div className="flex items-center justify-between px-2">
          {!collapsed && (
            <span className={`text-[11px] font-bold uppercase tracking-widest ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Workspace
            </span>
          )}
          <button
            id="toggle-sidebar-btn"
            onClick={() => setCollapsed(!collapsed)}
            className={`p-1.5 rounded-xl border transition-all ml-auto cursor-pointer ${
              darkMode
                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative group cursor-pointer ${
                  isActive
                    ? `bg-gradient-to-r ${activePalette.accentGradient} text-white shadow-md ${activePalette.glowShadow} ring-1 ring-white/20`
                    : darkMode
                    ? 'hover:bg-slate-900/90 hover:text-white text-slate-400'
                    : 'hover:bg-slate-100/90 hover:text-slate-900 text-slate-600'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-white' : darkMode ? activePalette.textAccentDark : activePalette.textAccentLight
                }`} />
                
                {!collapsed && (
                  <div className="flex-1 text-left truncate flex items-center justify-between">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-1.5 shrink-0 ${
                        item.badgeColor || (isActive 
                          ? 'bg-white/20 text-white' 
                          : darkMode 
                            ? 'bg-slate-800 text-slate-300' 
                            : 'bg-slate-200/80 text-slate-700')
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className={`absolute left-full ml-2 px-3 py-2 rounded-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-2xl z-50 border text-xs ${
                    darkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-slate-800 border-slate-200'
                  }`}>
                    <div className="font-bold">{item.label}</div>
                    <div className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.description}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Active Dataset & System Health */}
      <div className={`p-3 border-t space-y-2 ${
        darkMode ? 'border-slate-800/80' : 'border-slate-200/90'
      }`}>
        {!collapsed ? (
          <div className={`p-3 rounded-2xl border text-xs transition-colors ${
            darkMode 
              ? 'bg-slate-900/60 border-slate-800/80 text-slate-200 shadow-inner' 
              : 'bg-slate-50 border-slate-200/80 text-slate-800 shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] uppercase font-bold flex items-center gap-1.5 ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <Layers className={`w-3.5 h-3.5 ${darkMode ? activePalette.textAccentDark : activePalette.textAccentLight}`} />
                Active Dataset
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                darkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {currentDataset.category}
              </span>
            </div>
            <div className={`font-bold truncate mb-1 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`} title={currentDataset.name}>
              {currentDataset.name}
            </div>
            <div className={`flex items-center justify-between text-[10px] ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <span>{currentDataset.rowCount} data points</span>
              <span>{currentDataset.columnCount} attributes</span>
            </div>

            <div className={`mt-3 pt-2 border-t flex items-center justify-between text-[10px] ${
              darkMode ? 'border-slate-800/60' : 'border-slate-200'
            }`}>
              <span className={`flex items-center gap-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                Engine Active
              </span>
              <span className="font-mono font-bold text-emerald-500">99.98%</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-2" title="Engine Online: 99.98%">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
        )}
      </div>
    </aside>
  );
};
