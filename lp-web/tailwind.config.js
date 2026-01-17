/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
            DEFAULT: '#4285f4', // Google Blue
            foreground: '#ffffff',
        },
        secondary: {
            DEFAULT: '#34a853', // Google Green
            foreground: '#ffffff',
        },
        accent: {
            DEFAULT: '#ea4335', // Google Red
            foreground: '#ffffff',
        },
        warning: {
            DEFAULT: '#fbbc05', // Google Yellow
            foreground: '#ffffff',
        },
        dark: '#111827',
        text: {
            DEFAULT: '#1f2937',
            muted: '#64748b',
            light: '#94a3b8',
        },
        bg: {
            DEFAULT: '#f8fafc',
            white: '#fff',
        },
        border: '#f0f0f0',
      },
      fontFamily: {
        sans: ['Outfit', 'Noto Sans JP', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
        'gradient-bg-primary': 'linear-gradient(135deg, rgba(66, 133, 244, 0.1), transparent 40%)',
        'gradient-bg-secondary': 'linear-gradient(135deg, rgba(52, 168, 83, 0.1), transparent 40%)',
      },
      boxShadow: {
        'card': '0 10px 30px -10px rgb(0 0 0 / 10%)',
        'card-hover': '0 20px 40px rgb(0 0 0 / 10%)',
      }
    },
  },
  plugins: [],
}
