// Fixly Design Tokens
// Based on brand guidelines

export const colors = {
  // Primary colors
  primary: {
    DEFAULT: '#6C3BF5',
    light: '#8B66F7',
    dark: '#5028C6',
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#6C3BF5',
    600: '#5028C6',
    700: '#4C1D95',
    800: '#3B1578',
    900: '#2E1065',
  },

  // Secondary (Success/Positive)
  secondary: {
    DEFAULT: '#00D4AA',
    light: '#34E0BD',
    dark: '#00B894',
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#00D4AA',
    600: '#00B894',
    700: '#059669',
    800: '#047857',
    900: '#065F46',
  },

  // Accent (Urgent/Warning)
  accent: {
    DEFAULT: '#FF6B35',
    light: '#FF8A5C',
    dark: '#E55A26',
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#FF6B35',
    600: '#E55A26',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },

  // Surface colors
  surface: {
    DEFAULT: '#FAFBFC',
    dark: '#1A1D26',
    50: '#FAFBFC',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Text colors
  text: {
    primary: '#1A1D26',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    muted: '#9CA3AF',
  },

  // Border colors
  border: {
    DEFAULT: '#E5E7EB',
    light: '#F3F4F6',
    dark: '#D1D5DB',
  },

  // Status colors
  danger: {
    DEFAULT: '#EF4444',
    light: '#FEE2E2',
    dark: '#DC2626',
  },

  warning: {
    DEFAULT: '#F59E0B',
    light: '#FEF3C7',
    dark: '#D97706',
  },

  success: {
    DEFAULT: '#10B981',
    light: '#D1FAE5',
    dark: '#059669',
  },

  info: {
    DEFAULT: '#3B82F6',
    light: '#DBEAFE',
    dark: '#2563EB',
  },

  // Background
  background: {
    DEFAULT: '#FFFFFF',
    secondary: '#FAFBFC',
    tertiary: '#F3F4F6',
    dark: '#0F1117',
    darkSecondary: '#1A1D26',
    darkTertiary: '#24272F',
  },
} as const;

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
  },

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
    base: ['1rem', { lineHeight: '1.5rem' }], // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
    xl: ['1.5rem', { lineHeight: '2rem' }], // 24px
    '2xl': ['2rem', { lineHeight: '2.5rem' }], // 32px
    '3xl': ['2.5rem', { lineHeight: '3rem' }], // 40px
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
} as const;

export const borderRadius = {
  none: '0px',
  sm: '4px',
  DEFAULT: '6px', // Inputs
  md: '8px', // Buttons
  lg: '12px', // Cards
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  // Glassmorphism
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
} as const;

export const transitions = {
  DEFAULT: '200ms ease-out',
  fast: '150ms ease-out',
  slow: '300ms ease-out',
  none: '0ms',
} as const;

export const zIndex = {
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50, // Dropdowns
  60: 60, // Sticky headers
  70: 70, // Modals backdrop
  80: 80, // Modals
  90: 90, // Notifications/Toasts
  100: 100, // Maximum
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// CSS Custom Properties for runtime theming
export const cssVariables = {
  light: {
    '--color-primary': colors.primary.DEFAULT,
    '--color-primary-light': colors.primary.light,
    '--color-primary-dark': colors.primary.dark,
    '--color-secondary': colors.secondary.DEFAULT,
    '--color-accent': colors.accent.DEFAULT,
    '--color-surface': colors.surface.DEFAULT,
    '--color-background': colors.background.DEFAULT,
    '--color-background-secondary': colors.background.secondary,
    '--color-text-primary': colors.text.primary,
    '--color-text-secondary': colors.text.secondary,
    '--color-border': colors.border.DEFAULT,
    '--color-danger': colors.danger.DEFAULT,
    '--color-success': colors.success.DEFAULT,
    '--color-warning': colors.warning.DEFAULT,
    '--shadow-default': shadows.DEFAULT,
    '--shadow-glass': shadows.glass,
    '--radius-input': borderRadius.DEFAULT,
    '--radius-button': borderRadius.md,
    '--radius-card': borderRadius.lg,
  },
  dark: {
    '--color-primary': colors.primary.light,
    '--color-primary-light': colors.primary.DEFAULT,
    '--color-primary-dark': colors.primary.dark,
    '--color-secondary': colors.secondary.light,
    '--color-accent': colors.accent.light,
    '--color-surface': colors.surface.dark,
    '--color-background': colors.background.dark,
    '--color-background-secondary': colors.background.darkSecondary,
    '--color-text-primary': '#FFFFFF',
    '--color-text-secondary': '#9CA3AF',
    '--color-border': '#374151',
    '--color-danger': colors.danger.DEFAULT,
    '--color-success': colors.success.DEFAULT,
    '--color-warning': colors.warning.DEFAULT,
    '--shadow-default': '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
    '--shadow-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
    '--radius-input': borderRadius.DEFAULT,
    '--radius-button': borderRadius.md,
    '--radius-card': borderRadius.lg,
  },
} as const;
