/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
    "./src/**/**/*.{html,ts,scss}",
    "./src/**/**/**/*.{html,ts,scss}",
    "./src/**/**/**/**/*.{html,ts,scss}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        dark: {
          primary: '#121212',    // Very dark gray, almost black
          secondary: '#1E1E1E',  // Slightly lighter black
          surface: '#242424',    // Surface color
          text: '#E0E0E0',       // Light gray for text
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          200: '#fde68a',
          500: '#f59e0b',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      backgroundColor: {
        dark: '#121212',  // Very dark gray, almost black
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: '100%',
            color: theme('colors.gray.700'),
          },
        },
        xs: {
          css: {
            fontSize: '0.75rem',
            lineHeight: '1rem',
            p: {
              marginTop: '0.75em',
              marginBottom: '0.75em',
            },
            h1: {
              fontSize: '1.5rem',
              marginTop: '1em',
              marginBottom: '0.5em',
            },
            h2: {
              fontSize: '1.25rem',
              marginTop: '1em',
              marginBottom: '0.5em',
            },
            h3: {
              fontSize: '1.125rem',
              marginTop: '1em',
              marginBottom: '0.5em',
            },
          },
        },
      }),
    },
  },
  safelist: [
    'bg-primary-50',
    'bg-primary-500',
    'border-primary-200',
    'border-primary-300',
    'border-primary-500',
    'text-primary-900',
    'ring-primary-500',
    'focus:ring-secondary-500',
    'focus:border-secondary-500',
    'hover:border-secondary-300',
    'text-secondary-500',
    'border-secondary-500',
    'border-secondary-300',
    'border-success-300',
    'text-success-700',
    'bg-success-50',
    'bg-success-500',
    'bg-success-600',
    'hover:bg-success-600',
    'border-error-300',
    'text-error-600',
    'focus:ring-error-500',
    'focus-within:ring-error-500',
    'focus-within:border-error-500',
    'bg-info-500',
    'prose',
    'prose-sm',
    'prose-xs',
    'prose-base',
    'prose-lg',
    'prose-xl',
    'prose-2xl',
  ],
  plugins: [
    require('@tailwindcss/typography')({
      modifiers: ['xs', 'sm', 'lg', 'xl', '2xl'],
    }),
  ],
}