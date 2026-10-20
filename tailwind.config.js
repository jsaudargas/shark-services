/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        label: ['"Barlow Condensed"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: { DEFAULT: '#0B0D10', 2: '#15191E', 3: '#1D2228', 4: '#272D34' },
        paper: { DEFAULT: '#F2F2EF', 2: '#E9E9E5', card: '#FFFFFF' },
        line: { DEFAULT: '#E1E1DC', dark: 'rgba(255,255,255,0.09)' },
        fg: { DEFAULT: '#F5F5F5', mute: '#AAB0B7' },
        mute: { DEFAULT: '#5B6168', 2: '#8A9097' },
        red: { DEFAULT: '#E52329', 600: '#C81B21', 700: '#A3151A', tint: 'rgba(229,35,41,0.12)' },
      },
      maxWidth: { site: '1320px' },
      letterSpacing: { tightest: '-0.045em' },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: { marquee: 'marquee 48s linear infinite' },
    },
  },
  plugins: [],
}
