/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        duo: {
          green: '#58cc02',
          darkGreen: '#46a302',
          lightGreen: '#d7ffb8',
          blue: '#1cb0f6',
          yellow: '#ffc800',
          red: '#ff4b4b',
          card: '#18181b'
        }
      },
      animation: {
        'bounce-short': 'bounce 0.4s ease-in-out 1',
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'pop': 'pop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
