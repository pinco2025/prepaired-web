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
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
      },
      boxShadow: {
          'card-light': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
          'card-dark': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
}
