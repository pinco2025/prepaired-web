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
        "accent" : "#35b2ff",
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
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        serif: ["Space Grotesk"]
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
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
