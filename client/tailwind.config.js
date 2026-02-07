/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0066ff",
        "accent": "#35b2ff",
        "primary-light": "#38b6ff",
        "background-light": "#f9f9f9",
        "background-dark": "#121212",
        "surface-light": "#ffffff",
        "surface-dark": "#1e1e1e",
        "text-light": "#252627",
        "text-dark": "#dee1e7",
        "text-secondary-light": "#6b7280",
        "text-secondary-dark": "#9ca3af",
        "border-light": "#e5e7eb",
        "border-dark": "#374151",
        "success-light": "#22c55e",
        "success-dark": "#4ade80",
        "error-light": "#ef4444",
        "error-dark": "#f87171",
        "electric-blue": "#00f0ff",
        "neon-purple": "#b026ff",
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        grotesk: ["Space Grotesk", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        '2xl': "1.5rem",
      },
      boxShadow: {
        'card-light': '0 10px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
        'card-dark': '0 10px 25px -5px rgb(0 0 0 / 0.2), 0 8px 10px -6px rgb(0 0 0 / 0.2)',
      },
      animation: {
        'scroll': 'scroll 40s linear infinite',
        'shimmer': 'shimmer 2s infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'pulse-glow': 'pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flow-down': 'flow-down 3s linear infinite',
        'bubble-rise': 'bubble-rise 4s ease-in infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(19, 127, 236, 0.3)' },
          '50%': { opacity: '.9', boxShadow: '0 0 40px rgba(19, 127, 236, 0.6)' },
        },
        'flow-down': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
        'bubble-rise': {
          '0%': { transform: 'translateY(100%) scale(0.5)', opacity: '0' },
          '50%': { opacity: '0.8' },
          '100%': { transform: 'translateY(-20%) scale(1.2)', opacity: '0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
