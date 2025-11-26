import type { Theme } from '../types';

export const themes: Theme[] = [
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#14b8a6',
      background: '#f0f9ff',
      surface: '#ffffff',
      text: '#0c4a6e',
      textMuted: '#64748b',
      border: '#bae6fd',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#f97316',
      secondary: '#fb923c',
      accent: '#a855f7',
      background: '#fff7ed',
      surface: '#ffffff',
      text: '#7c2d12',
      textMuted: '#78716c',
      border: '#fed7aa',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: '#22c55e',
      secondary: '#16a34a',
      accent: '#84cc16',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: '#14532d',
      textMuted: '#6b7280',
      border: '#bbf7d0',
    },
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    colors: {
      primary: '#374151',
      secondary: '#4b5563',
      accent: '#6b7280',
      background: '#f9fafb',
      surface: '#ffffff',
      text: '#111827',
      textMuted: '#6b7280',
      border: '#e5e7eb',
    },
  },
  {
    id: 'candy',
    name: 'Candy',
    colors: {
      primary: '#ec4899',
      secondary: '#f472b6',
      accent: '#a855f7',
      background: '#fdf2f8',
      surface: '#ffffff',
      text: '#831843',
      textMuted: '#9ca3af',
      border: '#fbcfe8',
    },
  },
  {
    id: 'corporate',
    name: 'Corporate',
    colors: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#ca8a04',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1e293b',
      textMuted: '#64748b',
      border: '#cbd5e1',
    },
  },
];

export const getThemeById = (id: string): Theme => {
  return themes.find((t) => t.id === id) || themes[0];
};

export const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;
  root.style.setProperty('--theme-primary', theme.colors.primary);
  root.style.setProperty('--theme-secondary', theme.colors.secondary);
  root.style.setProperty('--theme-accent', theme.colors.accent);
  root.style.setProperty('--theme-background', theme.colors.background);
  root.style.setProperty('--theme-surface', theme.colors.surface);
  root.style.setProperty('--theme-text', theme.colors.text);
  root.style.setProperty('--theme-text-muted', theme.colors.textMuted);
  root.style.setProperty('--theme-border', theme.colors.border);
};
