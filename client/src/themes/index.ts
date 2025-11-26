import type { Theme, CustomColors, FontFamily } from '../types';

// Font family CSS values
export const fontFamilies: Record<FontFamily, string> = {
  system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  serif: 'Georgia, "Times New Roman", Times, serif',
  mono: '"SF Mono", Menlo, Monaco, "Courier New", monospace',
  inter: '"Inter", system-ui, sans-serif',
  playfair: '"Playfair Display", Georgia, serif',
  roboto: '"Roboto", system-ui, sans-serif',
  opensans: '"Open Sans", system-ui, sans-serif',
  lato: '"Lato", system-ui, sans-serif',
  poppins: '"Poppins", system-ui, sans-serif',
  montserrat: '"Montserrat", system-ui, sans-serif',
  raleway: '"Raleway", system-ui, sans-serif',
  merriweather: '"Merriweather", Georgia, serif',
  sourcecode: '"Source Code Pro", "SF Mono", monospace',
  nunito: '"Nunito", system-ui, sans-serif',
  oswald: '"Oswald", system-ui, sans-serif',
};

// Font family display names
export const fontFamilyNames: Record<FontFamily, string> = {
  system: 'System Default',
  serif: 'Serif',
  mono: 'Monospace',
  inter: 'Inter',
  playfair: 'Playfair Display',
  roboto: 'Roboto',
  opensans: 'Open Sans',
  lato: 'Lato',
  poppins: 'Poppins',
  montserrat: 'Montserrat',
  raleway: 'Raleway',
  merriweather: 'Merriweather',
  sourcecode: 'Source Code Pro',
  nunito: 'Nunito',
  oswald: 'Oswald',
};

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

export const applyTheme = (theme: Theme, customColors?: CustomColors): void => {
  const root = document.documentElement;
  const colors = customColors || theme.colors;
  root.style.setProperty('--theme-primary', colors.primary);
  root.style.setProperty('--theme-secondary', colors.secondary);
  root.style.setProperty('--theme-accent', colors.accent);
  root.style.setProperty('--theme-background', colors.background);
  root.style.setProperty('--theme-surface', colors.surface);
  root.style.setProperty('--theme-text', colors.text);
  root.style.setProperty('--theme-text-muted', colors.textMuted);
  root.style.setProperty('--theme-border', colors.border);
};

export const applyFontFamily = (fontFamily: FontFamily): void => {
  const root = document.documentElement;
  root.style.setProperty('--theme-font-family', fontFamilies[fontFamily]);
};
