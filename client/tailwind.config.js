/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Oxford Blue palette
        'oxford-blue': {
          50: '#e6eaf0',
          100: '#ccd5e0',
          200: '#99abc1',
          300: '#6681a2',
          400: '#335783',
          500: '#002d64',
          600: '#002147', // Main Oxford Blue
          700: '#001a38',
          800: '#00132a',
          900: '#000c1b',
          950: '#00060d',
        },
        // Tan/Beige palette
        'tan': {
          50: '#faf9f7',
          100: '#f5f2ed',
          200: '#ebe4d9',
          300: '#ddd1c0',
          400: '#d4a574', // Main Tan
          500: '#c8956a',
          600: '#b8845c',
          700: '#9a6d4d',
          800: '#7d5a42',
          900: '#654a37',
          950: '#352620',
        },
        // Keep existing primary/secondary for backward compatibility
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6ff',
          300: '#a5b8ff',
          400: '#8191ff',
          500: '#5d6aff',
          600: '#4c52f5',
          700: '#3d42e1',
          800: '#3238b6',
          900: '#1e3a8a',
          950: '#1a2e73',
        },
        secondary: {
          50: '#faf9f7',
          100: '#f5f2ed',
          200: '#ebe4d9',
          300: '#ddd1c0',
          400: '#d4a574',
          500: '#c8956a',
          600: '#b8845c',
          700: '#9a6d4d',
          800: '#7d5a42',
          900: '#654a37',
          950: '#352620',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        'xs': '475px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}