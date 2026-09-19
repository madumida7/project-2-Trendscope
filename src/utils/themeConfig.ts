import { ThemePalette } from '../types';

export interface PaletteDefinition {
  id: ThemePalette;
  name: string;
  tagline: string;
  swatchGradient: string;
  primaryColor: string;
  accentGradient: string;
  glowShadow: string;
  badgeClassDark: string;
  badgeClassLight: string;
  textAccentDark: string;
  textAccentLight: string;
  borderAccentDark: string;
  borderAccentLight: string;
}

export const THEME_PALETTES: PaletteDefinition[] = [
  {
    id: 'indigo',
    name: 'Cosmic Indigo',
    tagline: 'Deep space violet with electric cyan highlights',
    swatchGradient: 'from-indigo-600 via-violet-600 to-cyan-400',
    primaryColor: '#6366f1',
    accentGradient: 'from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-violet-500',
    glowShadow: 'shadow-indigo-500/25',
    badgeClassDark: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    badgeClassLight: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    textAccentDark: 'text-indigo-400',
    textAccentLight: 'text-indigo-600',
    borderAccentDark: 'border-indigo-500/40',
    borderAccentLight: 'border-indigo-300',
  },
  {
    id: 'emerald',
    name: 'Aurora Emerald',
    tagline: 'Luminescent mint, deep teal, and crystalline jade',
    swatchGradient: 'from-emerald-500 via-teal-500 to-cyan-400',
    primaryColor: '#10b981',
    accentGradient: 'from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-teal-500',
    glowShadow: 'shadow-emerald-500/25',
    badgeClassDark: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    badgeClassLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    textAccentDark: 'text-emerald-400',
    textAccentLight: 'text-emerald-600',
    borderAccentDark: 'border-emerald-500/40',
    borderAccentLight: 'border-emerald-300',
  },
  {
    id: 'sunset',
    name: 'Solar Flare',
    tagline: 'Warm amber glow, radiant rose, and twilight purple',
    swatchGradient: 'from-amber-500 via-rose-500 to-violet-600',
    primaryColor: '#f59e0b',
    accentGradient: 'from-amber-500 via-rose-600 to-violet-600 hover:from-amber-400 hover:to-rose-500',
    glowShadow: 'shadow-rose-500/25',
    badgeClassDark: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    badgeClassLight: 'bg-amber-50 text-amber-800 border-amber-200',
    textAccentDark: 'text-amber-400',
    textAccentLight: 'text-amber-600',
    borderAccentDark: 'border-amber-500/40',
    borderAccentLight: 'border-amber-300',
  },
  {
    id: 'azure',
    name: 'Cyber Azure',
    tagline: 'Hyper-focused electric cyan and royal sapphire',
    swatchGradient: 'from-cyan-400 via-sky-500 to-blue-600',
    primaryColor: '#0ea5e9',
    accentGradient: 'from-cyan-500 via-sky-600 to-blue-600 hover:from-cyan-400 hover:to-sky-500',
    glowShadow: 'shadow-sky-500/25',
    badgeClassDark: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    badgeClassLight: 'bg-sky-50 text-sky-700 border-sky-200',
    textAccentDark: 'text-sky-400',
    textAccentLight: 'text-sky-600',
    borderAccentDark: 'border-sky-500/40',
    borderAccentLight: 'border-sky-300',
  },
  {
    id: 'luxe',
    name: 'Midnight Luxe',
    tagline: 'Warm titanium champagne and refined obsidian',
    swatchGradient: 'from-slate-700 via-amber-600 to-amber-300',
    primaryColor: '#d97706',
    accentGradient: 'from-slate-800 via-amber-700 to-stone-800 hover:from-slate-700 hover:to-amber-600',
    glowShadow: 'shadow-amber-500/20',
    badgeClassDark: 'bg-amber-400/15 text-amber-200 border-amber-400/30',
    badgeClassLight: 'bg-stone-100 text-stone-800 border-stone-300',
    textAccentDark: 'text-amber-300',
    textAccentLight: 'text-amber-700',
    borderAccentDark: 'border-amber-500/30',
    borderAccentLight: 'border-stone-400',
  },
];

export const getPalette = (id: ThemePalette): PaletteDefinition => {
  return THEME_PALETTES.find((p) => p.id === id) || THEME_PALETTES[0];
};
