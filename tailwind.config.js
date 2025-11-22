/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 파스텔 옐로우 브랜드 컬러
        primary: {
          50: '#fffef0',
          100: '#fffbd1',
          200: '#fff6a3',
          300: '#ffed6b',
          400: '#ffdd33',
          500: '#ffd000', // 메인 브랜드 컬러
          600: '#e6b800',
          700: '#cc9f00',
          800: '#b38900',
          900: '#997300',
        },
        secondary: {
          50: '#fef8f0',
          100: '#fdefd1',
          200: '#fbdfa3',
          300: '#f8ca6b',
          400: '#f5b033',
          500: '#f29100',
          600: '#da8200',
          700: '#c17300',
          800: '#a96400',
          900: '#905500',
        },
        accent: {
          50: '#fff9f0',
          100: '#fff0d1',
          200: '#ffe1a3',
          300: '#ffcb6b',
          400: '#ffb033',
          500: '#ff8f00',
          600: '#e68000',
          700: '#cc7100',
          800: '#b36300',
          900: '#995400',
        },
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-in',
        'scale-in': 'scale-in 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
      },
    },
  },
  plugins: [],
}
