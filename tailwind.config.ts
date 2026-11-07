import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

/** Colours are CSS variables (RGB channels) so they swap with the `.dark` class
 *  and still support Tailwind opacity modifiers, e.g. `bg-primary/10`. */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        'surface-2': token('surface-2'),
        ink: token('ink'),
        muted: token('muted'),
        border: token('border'),
        primary: {
          DEFAULT: token('primary'),
          fg: token('primary-fg'),
          soft: token('primary-soft'),
        },
        accent: { DEFAULT: token('accent'), fg: token('accent-fg'), soft: token('accent-soft') },
        danger: { DEFAULT: token('danger'), soft: token('danger-soft') },
        success: { DEFAULT: token('success'), soft: token('success-soft') },
        warning: { DEFAULT: token('warning'), soft: token('warning-soft') },
      },
      fontFamily: {
        // One family. Geist: neutral and precise without being the default every generated page reaches for.
        display: ['Geist', '-apple-system', 'BlinkMacSystemFont', ...defaultTheme.fontFamily.sans],
        sans: ['Geist', '-apple-system', 'BlinkMacSystemFont', ...defaultTheme.fontFamily.sans],
      },
      borderRadius: { '2xl': '1.125rem', '3xl': '1.75rem' },
      transitionTimingFunction: { apple: 'cubic-bezier(0.23, 1, 0.32, 1)' },
      boxShadow: {
        soft: '0 1px 2px rgb(0 0 0 / 0.04), 0 2px 8px -2px rgb(0 0 0 / 0.05)',
        lift: '0 2px 6px rgb(0 0 0 / 0.04), 0 16px 40px -12px rgb(0 0 0 / 0.14)',
      },
      maxWidth: { content: '80rem' },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: { shimmer: 'shimmer 1.5s infinite' },
    },
  },
  plugins: [],
} satisfies Config;
