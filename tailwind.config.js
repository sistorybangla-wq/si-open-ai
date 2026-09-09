module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9' },
        accent: { 400: '#f472b6', 500: '#ec4899', 600: '#db2777' },
        dark: { 800: '#1f2937', 900: '#111827', 950: '#0a0a1a' },
        gold: { 400: '#fbbf24', 500: '#f59e0b' }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s',
        'slide-up': 'slideUp 0.3s',
        'pulse-slow': 'pulse 3s infinite',
        'gradient': 'gradient 4s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        gradient: { '0%,100%': { 'background-position': '0% 50%' }, '50%': { 'background-position': '100% 50%' } },
        float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-20px)' } },
        glow: { '0%': { boxShadow: '0 0 20px rgba(167,139,250,0.5)' }, '100%': { boxShadow: '0 0 40px rgba(236,72,153,0.8)' } }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: []
};
