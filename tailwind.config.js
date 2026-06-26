/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        surface: {
          DEFAULT: '#F8FAFC',
          secondary: '#F1F5F9',
          sidebar: '#FCFCFD',
          card: '#FFFFFF',
        },
        ink: {
          DEFAULT: '#0F172A',
          secondary: '#334155',
          muted: '#64748B',
          disabled: '#94A3B8',
        },
        border: {
          DEFAULT: '#E2E8F0',
          hover: '#CBD5E1',
          focus: '#93C5FD',
        },
        success: { DEFAULT: '#16A34A', light: '#DCFCE7' },
        warning: { DEFAULT: '#D97706', light: '#FEF3C7' },
        danger: { DEFAULT: '#DC2626', light: '#FEE2E2' },
        info: { DEFAULT: '#0891B2', light: '#CFFAFE' },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.04), 0 8px 24px rgba(15,23,42,.06)',
        'card-hover': '0 1px 3px rgba(15,23,42,.06), 0 12px 32px rgba(15,23,42,.08)',
        sidebar: '1px 0 0 0 #E2E8F0',
        modal: '0 20px 60px rgba(15,23,42,.12), 0 8px 20px rgba(15,23,42,.08)',
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
        input: '12px',
      },
      spacing: {
        section: '32px',
        grid: '24px',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-in-up': 'fadeInUp 0.3s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-6px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
