import React, { useState } from 'react';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  User as UserIcon, 
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
  Palette,
  AlertCircle,
  Check,
  CheckCircle2,
  Users
} from 'lucide-react';
import { User, UserRole, ThemePalette } from '../types';
import { THEME_PALETTES, getPalette } from '../utils/themeConfig';
import { registerNewUser, loginUser, getRegisteredUsers, DEFAULT_USERS } from '../utils/userStorage';

interface AuthViewProps {
  onLoginSuccess: (user: User) => void;
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);

  // Field-specific validation errors
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-300' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-indigo-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const validateForm = () => {
    const errors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (isRegister) {
      if (!name.trim()) {
        errors.name = 'Full name is required.';
      } else if (name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters.';
      }
    }

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Enter a valid email address (e.g. name@domain.com).';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (isRegister) {
      if (!confirmPassword) {
        errors.confirmPassword = 'Confirm your password.';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        // Register flow
        const result = registerNewUser(name, email, password, role);
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }

        // Try syncing with server backend as well
        try {
          await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), role, password }),
          });
        } catch (serverErr) {
          // Local storage fallback succeeded
        }

        setSuccessMessage(`Account created successfully! Welcome, ${result.user.name}.`);
        setTimeout(() => {
          onLoginSuccess(result.user);
        }, 600);
      } else {
        // Login flow
        const result = loginUser(email, password, role);
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }

        try {
          await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim().toLowerCase(), password, role }),
          });
        } catch (serverErr) {
          // Local storage authentication succeeded
        }

        onLoginSuccess(result.user);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoRole: 'admin' | 'analyst' | 'user') => {
    setError(null);
    setFieldErrors({});
    if (demoRole === 'admin') {
      const admin = DEFAULT_USERS[0];
      onLoginSuccess(admin);
    } else if (demoRole === 'analyst') {
      const analyst = DEFAULT_USERS[1];
      onLoginSuccess(analyst);
    } else {
      const user = DEFAULT_USERS[2];
      onLoginSuccess(user);
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
      </div>

      {/* Floating Theme / Light-Dark Quick Bar (Top Right) */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        {onChangeThemePalette && (
          <div className="relative">
            <button
              onClick={() => setShowPaletteMenu(!showPaletteMenu)}
              className={`p-2 rounded-xl border backdrop-blur-md flex items-center gap-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                darkMode 
                  ? 'bg-slate-900/80 border-slate-800 text-slate-200 hover:bg-slate-800' 
                  : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-tr ${activePalette.swatchGradient}`} />
            </button>

            {showPaletteMenu && (
              <div className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl border p-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                darkMode ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="space-y-1">
                  {THEME_PALETTES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onChangeThemePalette(p.id);
                        setShowPaletteMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-500/10 cursor-pointer"
                    >
                      <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${p.swatchGradient}`} />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            className={`p-2 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
              darkMode 
                ? 'bg-slate-900/80 border-slate-800 text-amber-300 hover:bg-slate-800' 
                : 'bg-white/80 border-slate-200 text-indigo-600 hover:bg-slate-100'
            }`}
          >
            {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>
        )}
      </div>

      {/* LEFT COLUMN: Hero Brand Narrative */}
      <div className={`lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between relative z-10 border-b lg:border-b-0 lg:border-r ${
        darkMode ? 'border-slate-800/80' : 'border-slate-200/80'
      }`}>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-xl text-white shadow-xl bg-gradient-to-tr ${activePalette.swatchGradient}`}>
              TS
            </div>
            <div>
              <span className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Trend<span className={`bg-gradient-to-r ${activePalette.swatchGradient} bg-clip-text text-transparent`}>Scope</span>
              </span>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Automated Predictive Intelligence Platform
              </p>
            </div>
          </div>

          <div className="space-y-4 max-w-lg pt-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${
              darkMode ? activePalette.badgeClassDark : activePalette.badgeClassLight
            }`}>
              <BrainCircuit className="w-3.5 h-3.5" />
              Role-Tailored Analytics: Admin, Analyst & User
            </div>
            
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Predictive Insights. <br />
              <span className={`bg-gradient-to-r ${activePalette.swatchGradient} bg-clip-text text-transparent`}>
                Human Understandable.
              </span>
            </h2>

            <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              TrendScope automates statistical trend modeling, anomaly detection, and forward projections into natural narrative stories for everyone.
            </p>
          </div>

          {/* 3 Role Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className={`p-3 rounded-2xl border ${
              darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Administrator
              </div>
              <p className="text-[11px] text-slate-400">
                Full telemetry, dataset limits, and platform configuration.
              </p>
            </div>

            <div className={`p-3 rounded-2xl border ${
              darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
                <BarChart2 className="w-3.5 h-3.5" />
                Data Analyst
              </div>
              <p className="text-[11px] text-slate-400">
                Statistical modeling, moving averages, and model diagnostics.
              </p>
            </div>

            <div className={`p-3 rounded-2xl border ${
              darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center gap-1.5 text-violet-400 text-xs font-bold mb-1">
                <Users className="w-3.5 h-3.5" />
                Standard User
              </div>
              <p className="text-[11px] text-slate-400">
                Friendly business dashboard, plain-English stories & guide.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className={`flex items-center justify-between text-xs pt-6 border-t ${
          darkMode ? 'text-slate-500 border-slate-800/60' : 'text-slate-500 border-slate-200'
        }`}>
          <span>TrendScope Predictive Engine v3.8</span>
          <span className="flex items-center gap-1 text-emerald-500 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Client & Local Storage Secure
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: Auth Form */}
      <div className={`lg:w-1/2 p-6 sm:p-12 lg:p-16 flex flex-col justify-center relative z-10 backdrop-blur-xl ${
        darkMode ? 'bg-slate-950/60' : 'bg-white/60'
      }`}>
        <div className="max-w-md w-full mx-auto space-y-6">
          
          {/* Form Header Tabs */}
          <div className="space-y-2">
            <div className={`flex p-1 border rounded-2xl ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                id="tab-sign-in"
                onClick={() => { setIsRegister(false); setError(null); setFieldErrors({}); }}
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
                id="tab-create-account"
                onClick={() => { setIsRegister(true); setError(null); setFieldErrors({}); }}
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
              {isRegister ? 'Create Your Workstation Account' : 'Sign in to TrendScope'}
            </h3>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {isRegister 
                ? 'Register with full validations. Your credentials will be saved in user details.' 
                : 'Enter your credentials or choose a 1-click test role below.'}
            </p>
          </div>

          {/* Quick 1-Click Demo Logins for all 3 roles */}
          <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
            darkMode ? 'bg-[#0d1424]/90 border-indigo-500/30' : 'bg-white border-indigo-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                darkMode ? activePalette.textAccentDark : activePalette.textAccentLight
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
                1-Click Instant Role Demo Access
              </span>
              <span className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No typing needed</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                id="quick-login-admin"
                onClick={() => handleQuickLogin('admin')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex flex-col justify-between ${
                  darkMode 
                    ? 'bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-500/40 text-indigo-300' 
                    : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800'
                }`}
              >
                <div className="font-bold">M. Janani</div>
                <div className="text-[10px] uppercase font-bold text-indigo-400 mt-1">👑 Admin</div>
              </button>

              <button
                type="button"
                id="quick-login-analyst"
                onClick={() => handleQuickLogin('analyst')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex flex-col justify-between ${
                  darkMode 
                    ? 'bg-emerald-600/20 hover:bg-emerald-600/30 border-emerald-500/40 text-emerald-300' 
                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                }`}
              >
                <div className="font-bold">D. Madhumitha</div>
                <div className="text-[10px] uppercase font-bold text-emerald-400 mt-1">🔬 Analyst</div>
              </button>

              <button
                type="button"
                id="quick-login-user"
                onClick={() => handleQuickLogin('user')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex flex-col justify-between ${
                  darkMode 
                    ? 'bg-violet-600/20 hover:bg-violet-600/30 border-violet-500/40 text-violet-300' 
                    : 'bg-violet-50 hover:bg-violet-100 border-violet-200 text-violet-800'
                }`}
              >
                <div className="font-bold">G. Nandhini</div>
                <div className="text-[10px] uppercase font-bold text-violet-400 mt-1">👤 Standard User</div>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Field (Register only) */}
            {isRegister && (
              <div>
                <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="register-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined });
                    }}
                    placeholder="e.g. Kavita Sundaram"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                      fieldErrors.name
                        ? 'border-rose-500 bg-rose-500/5'
                        : darkMode 
                          ? 'bg-slate-900/90 border-slate-800 text-slate-100 focus:border-indigo-500' 
                          : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                  }}
                  placeholder="name@domain.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                    fieldErrors.email
                      ? 'border-rose-500 bg-rose-500/5'
                      : darkMode 
                        ? 'bg-slate-900/90 border-slate-800 text-slate-100 focus:border-indigo-500' 
                        : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`block text-xs font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Password <span className="text-rose-500">*</span>
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
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                  }}
                  placeholder="Min. 6 characters"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                    fieldErrors.password
                      ? 'border-rose-500 bg-rose-500/5'
                      : darkMode 
                        ? 'bg-slate-900/90 border-slate-800 text-slate-100 focus:border-indigo-500' 
                        : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter (Register only) */}
              {isRegister && password && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Password Strength:</span>
                    <span className="font-bold text-slate-300">{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 rounded-full transition-all ${
                          strength.score >= step ? strength.color : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {fieldErrors.password && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field (Register only) */}
            {isRegister && (
              <div>
                <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: undefined });
                    }}
                    placeholder="Re-enter your password"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                      fieldErrors.confirmPassword
                        ? 'border-rose-500 bg-rose-500/5'
                        : darkMode 
                          ? 'bg-slate-900/90 border-slate-800 text-slate-100 focus:border-indigo-500' 
                          : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Role Picker (Register only: All 3 roles: User, Analyst, Admin) */}
            {isRegister && (
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Select Your Account Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      role === 'user'
                        ? darkMode ? 'bg-violet-600/25 border-violet-500 text-violet-300 ring-1 ring-violet-500' : 'bg-violet-50 border-violet-400 text-violet-800 ring-1 ring-violet-400 font-bold'
                        : darkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Users className="w-4 h-4 text-violet-400" />
                    <span>Standard User</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('analyst')}
                    className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      role === 'analyst'
                        ? darkMode ? 'bg-emerald-600/25 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500' : 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-1 ring-emerald-400 font-bold'
                        : darkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BarChart2 className="w-4 h-4 text-emerald-400" />
                    <span>Data Analyst</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      role === 'admin'
                        ? darkMode ? 'bg-indigo-600/25 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500' : 'bg-indigo-50 border-indigo-400 text-indigo-800 ring-1 ring-indigo-400 font-bold'
                        : darkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Administrator</span>
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
                Keep me signed in on this workstation
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
                <span>Validating & Storing...</span>
              ) : isRegister ? (
                <>
                  <span>Create Account & Save Details</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h4 className="font-bold text-base">Reset Workstation Password</h4>
            <p className="text-xs text-slate-400">
              Enter your registered email address to receive password reset verification:
            </p>
            {forgotSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                Verification link generated! In demo mode, use password: <strong>password123</strong>
              </div>
            ) : (
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full px-3 py-2 rounded-xl border text-xs outline-none bg-transparent"
              />
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setForgotPasswordModal(false); setForgotSuccess(false); }}
                className="px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              {!forgotSuccess && (
                <button
                  type="button"
                  onClick={() => setForgotSuccess(true)}
                  className={`px-4 py-1.5 rounded-xl bg-gradient-to-r ${activePalette.accentGradient} text-white text-xs font-bold cursor-pointer`}
                >
                  Send Reset Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
