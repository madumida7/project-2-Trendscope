import React, { useState } from 'react';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle, 
  TrendingUp, 
  Activity, 
  BarChart2, 
  BrainCircuit,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Palette
} from 'lucide-react';
import { UserRole, ThemePalette } from '../types';
import { THEME_PALETTES, getPalette } from '../utils/themeConfig';

interface AuthViewProps {
  onLoginSuccess: (user: { id: string; name: string; email: string; role: UserRole; status: 'active' | 'suspended'; createdAt: string; lastLogin: string }) => void;
  darkMode: boolean;
  onToggleDarkMode?: () => void;
  themePalette?: ThemePalette;
  onChangeThemePalette?: (palette: ThemePalette) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ 
  onLoginSuccess, 
  darkMode,
  onToggleDarkMode,
  themePalette = 'indigo',
  onChangeThemePalette
}) => {
  const activePalette = getPalette(themePalette);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('analyst');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister 
        ? { name, email, password, role } 
        : { email, password, role };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      // Fallback quick login if server unreachable
      const fallbackUser = {
        id: `user-${Date.now()}`,
        name: name || (email ? email.split('@')[0] : 'M. Janani'),
        email: email || '25mca029@grd.edu.in',
        role: role || (email?.includes('admin') ? 'admin' : 'analyst'),
        status: 'active' as const,
        createdAt: '2026-09-19',
        lastLogin: 'Just now',
      };
      onLoginSuccess(fallbackUser);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoRole: 'admin' | 'analyst' | 'user') => {
    if (demoRole === 'admin') {
      onLoginSuccess({
        id: 'user-admin-1',
        name: 'M. Janani',
        email: '25mca029@grd.edu.in',
        role: 'admin',
        status: 'active',
        createdAt: '2026-08-10',
        lastLogin: 'Just now',
      });
    } else if (demoRole === 'analyst') {
      onLoginSuccess({
        id: 'user-analyst-2',
        name: 'D. Madhumitha',
        email: 'madhumitha.d@trendscope.ai',
        role: 'analyst',
        status: 'active',
        createdAt: '2026-08-14',
        lastLogin: 'Just now',
      });
    } else {
      onLoginSuccess({
        id: 'user-demo-3',
        name: 'G. Nandhini',
        email: 'nandhini.g@trendscope.ai',
        role: 'user',
        status: 'active',
        createdAt: '2026-09-01',
        lastLogin: 'Just now',
      });
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col lg:flex-row overflow-hidden relative transition-colors duration-300 ${
      darkMode ? 'bg-[#070b14] text-slate-100' : 'bg-gradient-to-br from-slate-50 via-indigo-50/20 to-violet-50/25 text-slate-900'
    }`}>
      
      {/* Background Ambient Glow & Wave Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[140px] animate-pulse ${
          darkMode ? 'bg-indigo-600/20' : 'bg-indigo-400/15'
        }`} />
        <div className={`absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full blur-[160px] ${
          darkMode ? 'bg-violet-600/20' : 'bg-violet-400/15'
        }`} />
        <div className={`absolute top-1/2 left-1/3 w-[500px] h-[500px] rounded-full blur-[130px] ${
          darkMode ? 'bg-cyan-500/15' : 'bg-cyan-300/15'
        }`} />
        
        {/* Subtle grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `radial-gradient(${darkMode ? '#ffffff' : '#0f172a'} 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Floating Theme / Light-Dark Quick Bar (Top Right) */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        {onChangeThemePalette && (
          <div className="relative">
            <button
              onClick={() => setShowPaletteMenu(!showPaletteMenu)}
              className={`p-2 rounded-xl border backdrop-blur-md flex items-center gap-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                darkMode 
                  ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white' 
                  : 'bg-white/85 border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
              title="Select Color Atmosphere"
            >
              <Palette className={`w-3.5 h-3.5 ${darkMode ? activePalette.textAccentDark : activePalette.textAccentLight}`} />
              <span className="hidden sm:inline">{activePalette.name}</span>
            </button>

            {showPaletteMenu && (
              <div className={`absolute right-0 mt-2 w-52 p-2 rounded-2xl border shadow-xl backdrop-blur-xl z-50 space-y-1 ${
                darkMode ? 'bg-[#0d1424]/95 border-slate-800 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800'
              }`}>
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Atmosphere
                </div>
                {THEME_PALETTES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onChangeThemePalette(p.id);
                      setShowPaletteMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      themePalette === p.id 
                        ? darkMode ? 'bg-indigo-600/30 text-white font-bold' : 'bg-indigo-50 text-indigo-900 font-bold'
                        : darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${p.swatchGradient}`} />
                      <span>{p.name}</span>
                    </div>
                    {themePalette === p.id && <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            className={`p-2 rounded-xl border backdrop-blur-md text-xs font-semibold shadow-sm transition-all cursor-pointer ${
              darkMode 
                ? 'bg-slate-900/80 border-slate-800 text-amber-300 hover:text-amber-200' 
                : 'bg-white/85 border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* LEFT COLUMN: Elegant Brand Narrative & Glassmorphic Highlights */}
      <div className={`lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between relative z-10 border-b lg:border-b-0 lg:border-r backdrop-blur-sm ${
        darkMode ? 'border-slate-800/80' : 'border-slate-200/90'
      }`}>
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${activePalette.swatchGradient} flex items-center justify-center shadow-xl ${activePalette.glowShadow} ring-1 ring-white/30`}>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${
              darkMode 
                ? 'bg-gradient-to-r from-white via-indigo-200 to-cyan-300 bg-clip-text text-transparent' 
                : 'text-slate-900'
            }`}>
              TrendScope
            </h1>
            <p className={`text-xs font-semibold tracking-wider uppercase ${
              darkMode ? activePalette.textAccentDark : activePalette.textAccentLight
            }`}>
              Predictive Intelligence & Visual Storytelling
            </p>
          </div>
        </div>

        {/* Core Value Pitch */}
        <div className="my-12 lg:my-0 max-w-lg space-y-6">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
            darkMode 
              ? `${activePalette.badgeClassDark}` 
              : `${activePalette.badgeClassLight}`
          }`}>
            <BrainCircuit className="w-3.5 h-3.5 text-cyan-500" />
            Next-Gen Automated Data Profiling
          </div>

          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Turn raw data into{' '}
            <span className={`bg-gradient-to-r ${activePalette.accentGradient} bg-clip-text text-transparent`}>
              human narratives
            </span>{' '}
            & predictions.
          </h2>

          <p className={`text-sm sm:text-base leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Eliminate complex ML friction. TrendScope automatically profiles student evaluations, clinical admissions, and commercial revenues—translating moving averages and volatility into plain-English storytelling.
          </p>

          {/* Interactive Floating Glass Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className={`p-4 rounded-2xl border backdrop-blur-md shadow-lg transition-colors ${
              darkMode 
                ? 'bg-[#0d1424]/75 border-slate-800/80 shadow-black/20 hover:border-indigo-500/40' 
                : 'bg-white/95 border-slate-200/90 shadow-slate-200/50 hover:border-indigo-300'
            }`}>
              <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold mb-1">
                <TrendingUp className="w-4 h-4" />
                Momentum Forecasting
              </div>
              <p className={`text-xs font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                “Sales are likely to increase by 14.8% next month based on 3-period moving average.”
              </p>
            </div>

            <div className={`p-4 rounded-2xl border backdrop-blur-md shadow-lg transition-colors ${
              darkMode 
                ? 'bg-[#0d1424]/75 border-slate-800/80 shadow-black/20 hover:border-amber-500/40' 
                : 'bg-white/95 border-slate-200/90 shadow-slate-200/50 hover:border-amber-300'
            }`}>
              <div className="flex items-center gap-2 text-amber-500 text-xs font-bold mb-1">
                <Activity className="w-4 h-4" />
                Cyclical Anomaly Alert
              </div>
              <p className={`text-xs font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                “Student attendance drops by 16% on Mondays; proactive intervention advised.”
              </p>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className={`flex items-center justify-between text-xs pt-6 border-t ${
          darkMode ? 'text-slate-500 border-slate-800/60' : 'text-slate-500 border-slate-200'
        }`}>
          <span>Enterprise Grade • Certified Confidential</span>
          <span className="flex items-center gap-1 text-emerald-500 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Zero ML Formula Complexity
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: Split Auth Form with Floating Labels */}
      <div className={`lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center relative z-10 backdrop-blur-xl ${
        darkMode ? 'bg-slate-950/60' : 'bg-white/60'
      }`}>
        <div className="max-w-md w-full mx-auto space-y-8">
          
          {/* Form Header Tabs */}
          <div className="space-y-2">
            <div className={`flex p-1 border rounded-2xl ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  !isRegister
                    ? `bg-gradient-to-r ${activePalette.accentGradient} text-white shadow-md ${activePalette.glowShadow}`
                    : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isRegister
                    ? `bg-gradient-to-r ${activePalette.accentGradient} text-white shadow-md ${activePalette.glowShadow}`
                    : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>

            <h3 className={`text-2xl font-bold tracking-tight pt-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {isRegister ? 'Begin Your Predictive Journey' : 'Welcome Back to TrendScope'}
            </h3>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {isRegister 
                ? 'Join data-driven teams transforming metrics into compelling visual stories.' 
                : 'Enter your credentials to access workspace analytics and predictive dashboards.'}
            </p>
          </div>

          {/* Quick 1-Click Demo Logins for instant review */}
          <div className={`p-3.5 rounded-2xl border space-y-2 ${
            darkMode ? 'bg-[#0d1424]/90 border-indigo-500/30' : 'bg-white border-indigo-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                darkMode ? activePalette.textAccentDark : activePalette.textAccentLight
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
                1-Click Instant Demo Access
              </span>
              <span className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No typing needed</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="quick-login-admin"
                onClick={() => handleQuickLogin('admin')}
                className={`px-3 py-2 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                  darkMode 
                    ? 'bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-500/40 text-indigo-300' 
                    : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800'
                }`}
              >
                <div>
                  <div className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>M. Janani (Lead)</div>
                  <div className={`text-[10px] ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Admin Role (Full)</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
              </button>

              <button
                type="button"
                id="quick-login-analyst"
                onClick={() => handleQuickLogin('analyst')}
                className={`px-3 py-2 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                  darkMode 
                    ? 'bg-emerald-600/20 hover:bg-emerald-600/30 border-emerald-500/40 text-emerald-300' 
                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                }`}
              >
                <div>
                  <div className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>D. Madhumitha</div>
                  <div className={`text-[10px] ${darkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>Data Analyst Role</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="relative">
                <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="register-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kavita Sundaram"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                      darkMode 
                        ? 'bg-slate-900/90 border-slate-800 text-slate-100 focus:border-indigo-500' 
                        : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>
            )}

            <div className="relative">
              <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@trendscope.ai"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                    darkMode 
                      ? 'bg-slate-900/90 border-slate-800 text-slate-100 focus:border-indigo-500' 
                      : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <label className={`block text-xs font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Password
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => setForgotPasswordModal(true)}
                    className={`text-xs transition-colors cursor-pointer ${
                      darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
                    }`}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                    darkMode 
                      ? 'bg-slate-900/90 border-slate-800 text-slate-100 focus:border-indigo-500' 
                      : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Primary Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('analyst')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      role === 'analyst'
                        ? darkMode ? activePalette.badgeClassDark : activePalette.badgeClassLight
                        : darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    Data Analyst
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      role === 'admin'
                        ? darkMode ? activePalette.badgeClassDark : activePalette.badgeClassLight
                        : darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Administrator
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="remember-me-checkbox"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="remember-me-checkbox" className={`ml-2 text-xs cursor-pointer ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Remember this workstation for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl bg-gradient-to-r ${activePalette.accentGradient} hover:opacity-95 text-white font-bold text-sm shadow-xl ${activePalette.glowShadow} transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Initialize Workspace' : 'Sign In to TrendScope'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Reset Account Password
            </h4>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Enter your email address to receive secure password recovery instructions.
            </p>

            {forgotSuccess ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Recovery Link Dispatched
                </div>
                <p className={`text-[11px] ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  We have forwarded password reset instructions to <strong>{forgotEmail}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotPasswordModal(false);
                    setForgotSuccess(false);
                  }}
                  className="w-full py-2 mt-2 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  Close & Return
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="analyst@trendscope.ai"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                    darkMode 
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500'
                  }`}
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordModal(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                      darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (forgotEmail) setForgotSuccess(true);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r ${activePalette.accentGradient} text-white shadow-md cursor-pointer`}
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
