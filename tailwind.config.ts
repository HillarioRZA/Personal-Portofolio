import type { Config } from 'tailwindcss';

/** Font families resolve to the next/font CSS variables set in layout.tsx. */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', '"Space Grotesk"', 'sans-serif'],
        sans: ['var(--font-sans)', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['var(--font-mono)', '"JetBrains Mono"', 'monospace'],
      },
      colors: {
        emeraldSignal: '#10B981',
        indigoPulse: '#6366F1',
      },
    },
  },
  plugins: [],
};

export default config;
