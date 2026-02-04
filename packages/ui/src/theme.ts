import { colors, typography, spacing, borderRadius, shadows, breakpoints } from './tokens';

// Tailwind CSS theme extension
export const tailwindTheme = {
  colors: {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    surface: colors.surface,
    danger: colors.danger,
    warning: colors.warning,
    success: colors.success,
    info: colors.info,
    border: colors.border,
  },
  fontFamily: typography.fontFamily,
  fontSize: typography.fontSize,
  fontWeight: typography.fontWeight,
  spacing: spacing,
  borderRadius: borderRadius,
  boxShadow: shadows,
  screens: breakpoints,
  extend: {
    colors: {
      background: colors.background,
      text: colors.text,
    },
    backdropBlur: {
      xs: '2px',
    },
    animation: {
      'slide-in': 'slideIn 200ms ease-out',
      'slide-out': 'slideOut 200ms ease-out',
      'fade-in': 'fadeIn 200ms ease-out',
      'fade-out': 'fadeOut 200ms ease-out',
      'scale-in': 'scaleIn 200ms ease-out',
      'scale-out': 'scaleOut 200ms ease-out',
      'spin-slow': 'spin 3s linear infinite',
    },
    keyframes: {
      slideIn: {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(0)' },
      },
      slideOut: {
        '0%': { transform: 'translateX(0)' },
        '100%': { transform: 'translateX(-100%)' },
      },
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      fadeOut: {
        '0%': { opacity: '1' },
        '100%': { opacity: '0' },
      },
      scaleIn: {
        '0%': { transform: 'scale(0.95)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
      scaleOut: {
        '0%': { transform: 'scale(1)', opacity: '1' },
        '100%': { transform: 'scale(0.95)', opacity: '0' },
      },
    },
  },
} as const;

// Component style variants
export const componentStyles = {
  button: {
    base: 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    sizes: {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-md',
      lg: 'px-6 py-3 text-base rounded-md',
    },
    variants: {
      primary:
        'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 active:bg-primary-700',
      secondary:
        'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500 active:bg-secondary-700',
      accent:
        'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-500 active:bg-accent-700',
      outline:
        'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 focus:ring-primary-500 dark:hover:bg-primary-900/20',
      ghost:
        'text-text-primary hover:bg-surface-100 focus:ring-primary-500 dark:text-white dark:hover:bg-surface-800',
      danger:
        'bg-danger-DEFAULT text-white hover:bg-danger-dark focus:ring-danger-DEFAULT active:bg-red-800',
    },
  },

  input: {
    base: 'w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-surface-dark dark:border-surface-600 dark:text-white',
    error: 'border-danger-DEFAULT focus:border-danger-DEFAULT focus:ring-danger-DEFAULT/20',
    sizes: {
      sm: 'px-2.5 py-1.5 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    },
  },

  card: {
    base: 'rounded-lg border border-border bg-white shadow-sm dark:bg-surface-dark dark:border-surface-700',
    padding: {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    },
    hover: 'hover:shadow-md transition-shadow duration-200',
  },

  badge: {
    base: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
    variants: {
      primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
      secondary:
        'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300',
      accent: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300',
      success: 'bg-success-light text-success-dark dark:bg-green-900/30 dark:text-green-300',
      warning: 'bg-warning-light text-warning-dark dark:bg-yellow-900/30 dark:text-yellow-300',
      danger: 'bg-danger-light text-danger-dark dark:bg-red-900/30 dark:text-red-300',
      neutral: 'bg-surface-100 text-text-secondary dark:bg-surface-700 dark:text-surface-300',
    },
  },

  modal: {
    overlay: 'fixed inset-0 z-70 bg-black/50 backdrop-blur-sm',
    content:
      'fixed left-1/2 top-1/2 z-80 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl dark:bg-surface-dark',
    glass:
      'backdrop-filter backdrop-blur-lg bg-white/85 dark:bg-surface-dark/85 border border-white/20',
  },

  dropdown: {
    content:
      'z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-white p-1 shadow-md dark:bg-surface-dark dark:border-surface-700',
    item: 'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-surface-100 focus:bg-surface-100 dark:hover:bg-surface-700 dark:focus:bg-surface-700',
  },

  avatar: {
    base: 'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700',
    sizes: {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl',
    },
  },

  table: {
    wrapper: 'w-full overflow-auto',
    table: 'w-full caption-bottom text-sm',
    header:
      'border-b border-border bg-surface-50 dark:bg-surface-800 dark:border-surface-700',
    headerCell: 'h-12 px-4 text-left align-middle font-medium text-text-secondary',
    body: 'divide-y divide-border dark:divide-surface-700',
    row: 'border-b border-border transition-colors hover:bg-surface-50 dark:border-surface-700 dark:hover:bg-surface-800',
    cell: 'p-4 align-middle',
  },

  tabs: {
    list: 'inline-flex h-10 items-center justify-center rounded-md bg-surface-100 p-1 dark:bg-surface-800',
    trigger:
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-text-primary data-[state=active]:shadow-sm dark:data-[state=active]:bg-surface-700',
    content: 'mt-2',
  },

  toast: {
    base: 'pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border border-border p-4 shadow-lg dark:border-surface-700',
    variants: {
      default: 'bg-white dark:bg-surface-dark',
      success: 'bg-success-light border-success-DEFAULT dark:bg-green-900/30',
      error: 'bg-danger-light border-danger-DEFAULT dark:bg-red-900/30',
      warning: 'bg-warning-light border-warning-DEFAULT dark:bg-yellow-900/30',
    },
  },
} as const;

// Animation presets for Framer Motion
export const motionPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  slideUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
    transition: { duration: 0.2 },
  },
  slideDown: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 },
  },
  slideInFromRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.2 },
  },
  slideInFromLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.2 },
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },
  staggerItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  },
} as const;
