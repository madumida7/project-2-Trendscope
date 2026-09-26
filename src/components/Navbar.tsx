import React, { useState } from 'react';
import { 
  Sparkles, 
  Moon, 
  Sun, 
  Download, 
  Search, 
  Bell, 
  Database, 
  CheckCircle2, 
  LogOut, 
  ChevronDown,
  Palette,
  Check,
  ExternalLink
} from 'lucide-react';
import { Dataset, User, UserRole, ThemePalette, AppNotification } from '../types';
import { THEME_PALETTES, getPalette } from '../utils/themeConfig';
import { NavTab } from './Sidebar';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  themePalette: ThemePalette;
  setThemePalette: (val: ThemePalette) => void;
  currentUser: User | null;
  onLogout: () => void;
  datasets: Dataset[];
  currentDataset: Dataset;
  onSelectDataset: (dataset: Dataset) => void;
  onOpenReportModal: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeTab?: NavTab;
  notifications?: AppNotification[];
  onNotificationClick?: (notif: AppNotification) => void;
  onMarkAllNotificationsRead?: () => void;
  onClearNotifications?: () => void;
  onSwitchRole?: (newRole: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  setDarkMode,
  themePalette,
  setThemePalette,
  currentUser,
  onLogout,
  datasets,
  currentDataset,
  onSelectDataset,
  onOpenReportModal,
  searchTerm,
  setSearchTerm,
  activeTab = 'dashboard',
  notifications = [],
  onNotificationClick,
  onMarkAllNotificationsRead,
  onClearNotifications,
  onSwitchRole,
}) => {
  const [showDatasetDropdown, setShowDatasetDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);

  const activePalette = getPalette(themePalette);

  return (
    <header className={`sticky top-0 z-40 border-b transition-all duration-300 ${
      darkMode 
        ? 'bg-[#090d18]/85 border-slate-800/80 backdrop-blur-xl text-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.35)]' 
        : 'bg-white/90 border-slate-200/90 backdrop-blur-xl text-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]'
    }`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Brand Logo & Active Dataset Selector */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${activePalette.swatchGradient} flex items-center justify-center shadow-lg ${activePalette.glowShadow} ring-1 ring-white/25 shrink-0 transition-all duration-300`}>
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <span className={`font-extrabold text-lg tracking-tight bg-gradient-to-r ${activePalette.swatchGradient} bg-clip-text text-transparent`}>
                TrendScope
              </span>
              <span className={`block text-[10px] uppercase tracking-widest font-semibold ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Predictive Intelligence
              </span>
            </div>
          </div>

          {/* Dataset Switcher Pill */}
          <div className="relative">
            <button
              id="dataset-selector-btn"
              onClick={() => setShowDatasetDropdown(!showDatasetDropdown)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                darkMode
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-200 shadow-inner'
                  : 'bg-slate-100/90 border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm'
              }`}
            >
              <Database className={`w-3.5 h-3.5 ${darkMode ? activePalette.textAccentDark : activePalette.textAccentLight}`} />
              <span className="max-w-[130px] sm:max-w-[160px] truncate font-semibold">
                {currentDataset.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
            </button>

            {showDatasetDropdown && (
              <div 
                className={`absolute left-0 mt-2 w-72 rounded-2xl shadow-2xl border p-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                  darkMode ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className={`px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Select Active Workspace Dataset
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {datasets.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        onSelectDataset(d);
                        setShowDatasetDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        d.id === currentDataset.id
                          ? darkMode 
                            ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30' 
                            : 'bg-indigo-50 text-indigo-800 font-bold border border-indigo-200'
                          : darkMode 
                            ? 'hover:bg-slate-800/80 text-slate-300' 
                            : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <div className="truncate font-semibold">{d.name}</div>
                        <div className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {d.rowCount} records • {d.category}
                        </div>
                      </div>
                      {d.id === currentDataset.id && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xs relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search variables, metrics, trends..."
            className={`w-full pl-9 pr-4 py-1.5 rounded-xl text-xs border outline-none transition-all ${
              darkMode
                ? 'bg-slate-900/80 border-slate-800 focus:border-indigo-500 text-slate-200 placeholder:text-slate-500 shadow-inner'
                : 'bg-slate-100/90 border-slate-200 focus:border-indigo-400 text-slate-800 placeholder:text-slate-400 shadow-sm'
            }`}
          />
        </div>

        {/* Right Tools: Export, Palette Customizer, Light/Dark Switcher, Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Direct Link to MySQL Database Studio (Admin & Analyst only) */}
          {currentUser?.role !== 'user' && (
            <a
              id="nav-db-studio-link"
              href="/database"
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                darkMode
                  ? 'bg-indigo-950/40 border-indigo-800/60 hover:bg-indigo-900/50 text-indigo-300'
                  : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-700'
              }`}
              title="Open MySQL Database Studio Individually in Browser"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden lg:inline">SQL Studio</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}

          {/* Palette Customizer Menu Button */}
          <div className="relative">
            <button
              id="theme-palette-btn"
              onClick={() => {
                setShowPaletteMenu(!showPaletteMenu);
                setShowUserDropdown(false);
                setShowNotifications(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                darkMode
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-200 shadow-inner'
                  : 'bg-slate-100 border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm'
              }`}
              title="Change Color Atmosphere & Palette"
            >
              <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${activePalette.swatchGradient} ring-1 ring-white/30 shadow-xs`} />
              <span className="hidden xl:inline text-[11px] font-medium">{activePalette.name}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {/* Palette Selection Popover */}
            {showPaletteMenu && (
              <div className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl border p-3 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                darkMode ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b mb-2 border-slate-700/40">
                  <div className="flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-xs">Color Atmospheres</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 font-semibold uppercase">5 Unique Themes</span>
                </div>

                <div className="space-y-1.5">
                  {THEME_PALETTES.map((palette) => {
                    const isSelected = themePalette === palette.id;
                    return (
                      <button
                        key={palette.id}
                        onClick={() => {
                          setThemePalette(palette.id);
                          setShowPaletteMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? darkMode
                              ? 'bg-indigo-500/20 border border-indigo-500/40 text-white'
                              : 'bg-indigo-50 border border-indigo-300 text-indigo-900 font-semibold'
                            : darkMode
                              ? 'hover:bg-slate-800/80 text-slate-300'
                              : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${palette.swatchGradient} ring-1 ring-white/30 shadow-md shrink-0`} />
                          <div className="truncate">
                            <div className="text-xs font-bold truncate">{palette.name}</div>
                            <div className={`text-[10px] truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              {palette.tagline}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Aesthetic Light / Dark Mode Toggle with Visual Pill */}
          <button
            id="theme-toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer group ${
              darkMode
                ? 'bg-slate-900 border-slate-800 text-amber-300 hover:bg-slate-800 hover:border-amber-500/30 shadow-inner'
                : 'bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200 hover:border-indigo-300 shadow-sm'
            }`}
            title={`Switch to ${darkMode ? 'Luminous Light' : 'Cosmic Dark'} Mode`}
          >
            {darkMode ? (
              <>
                <Moon className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                <span className="hidden lg:inline text-[11px] font-semibold text-slate-300">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="hidden lg:inline text-[11px] font-semibold text-slate-700">Light</span>
              </>
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              id="notifications-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowPaletteMenu(false);
                setShowUserDropdown(false);
              }}
              className={`p-2 rounded-xl border relative transition-all cursor-pointer ${
                darkMode
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
              title="Workspace Intelligence Alerts"
            >
              <Bell className="w-4 h-4" />
              {(notifications && notifications.filter(n => !n.read).length > 0) && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div 
                className={`absolute right-0 mt-2 w-84 sm:w-96 rounded-2xl shadow-2xl border p-3 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                  darkMode ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className={`flex items-center justify-between pb-2 border-b ${
                  darkMode ? 'border-slate-800' : 'border-slate-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">Intelligence Alerts</span>
                    {(notifications && notifications.filter(n => !n.read).length > 0) ? (
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                        {notifications.filter(n => !n.read).length} New
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                        Caught Up
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {onMarkAllNotificationsRead && notifications && notifications.some(n => !n.read) && (
                      <button
                        onClick={onMarkAllNotificationsRead}
                        className="text-[10px] text-indigo-400 hover:underline font-semibold cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                    {onClearNotifications && notifications && notifications.length > 0 && (
                      <button
                        onClick={onClearNotifications}
                        className="text-[10px] text-slate-400 hover:text-slate-200 font-semibold cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-2 space-y-2 max-h-80 overflow-y-auto pr-1">
                  {(!notifications || notifications.length === 0) ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      🎉 All caught up! No active notifications.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (onNotificationClick) {
                            onNotificationClick(notif);
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2.5 ${
                          !notif.read
                            ? darkMode
                              ? 'bg-indigo-950/30 border-indigo-500/40 text-slate-100 hover:border-indigo-400'
                              : 'bg-indigo-50/70 border-indigo-200 text-slate-900 hover:border-indigo-300'
                            : darkMode
                              ? 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          !notif.read ? 'bg-indigo-500 ring-2 ring-indigo-400/30' : 'bg-slate-600'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[11px] truncate">{notif.title}</span>
                            <span className="text-[9px] text-slate-400 shrink-0">{notif.timestamp}</span>
                          </div>
                          <p className="text-[10px] mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
                          {notif.targetTab && (
                            <span className="text-[9px] font-bold text-indigo-400 mt-1 inline-flex items-center gap-1 hover:underline">
                              Open View →
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account Menu with Role Switcher */}
          {currentUser && (
            <div className="relative">
              <button
                id="user-profile-btn"
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowPaletteMenu(false);
                  setShowNotifications(false);
                }}
                className={`flex items-center gap-2 p-1.5 pl-2 pr-2.5 rounded-xl border transition-all cursor-pointer ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-100 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${activePalette.swatchGradient} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left text-xs leading-none">
                  <div className={`font-bold truncate max-w-[100px] ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    {currentUser.name}
                  </div>
                  <div className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${darkMode ? activePalette.textAccentDark : activePalette.textAccentLight}`}>
                    {currentUser.role === 'admin' ? '👑 Admin' : currentUser.role === 'analyst' ? '🔬 Analyst' : '👤 User'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-50 shrink-0" />
              </button>

              {showUserDropdown && (
                <div 
                  className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl border p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                    darkMode ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className={`px-3 py-2 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className="font-bold text-xs">{currentUser.name}</div>
                    <div className={`text-[11px] truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{currentUser.email}</div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${darkMode ? activePalette.badgeClassDark : activePalette.badgeClassLight}`}>
                        {currentUser.role.toUpperCase()} ROLE
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold">● Active</span>
                    </div>
                  </div>

                  {/* Instant Role Preview Switcher */}
                  <div className={`py-2 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1.5">
                      Switch Role Mode:
                    </div>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (onSwitchRole) onSwitchRole('admin');
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          currentUser.role === 'admin'
                            ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/40'
                            : 'hover:bg-slate-500/10 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>👑</span>
                          <span>Administrator</span>
                        </div>
                        {currentUser.role === 'admin' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onSwitchRole) onSwitchRole('analyst');
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          currentUser.role === 'analyst'
                            ? 'bg-emerald-600/20 text-emerald-300 font-bold border border-emerald-500/40'
                            : 'hover:bg-slate-500/10 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>🔬</span>
                          <span>Data Analyst</span>
                        </div>
                        {currentUser.role === 'analyst' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onSwitchRole) onSwitchRole('user');
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          currentUser.role === 'user'
                            ? 'bg-violet-600/20 text-violet-300 font-bold border border-violet-500/40'
                            : 'hover:bg-slate-500/10 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>👤</span>
                          <span>Standard User</span>
                        </div>
                        {currentUser.role === 'user' && <Check className="w-3.5 h-3.5 text-violet-400" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out / Change Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
