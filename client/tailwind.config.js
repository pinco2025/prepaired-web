/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    fontSize: {
      sm: '0.750rem',
      base: '1rem',
      xl: '1.333rem',
      '2xl': '1.777rem',
      '3xl': '2.369rem',
      '4xl': '3.158rem',
      '5xl': '4.210rem',
    },
    fontFamily: {
      heading: '',
      body: 'Inter',
    },
    fontWeight: {
      normal: '400',
      bold: '700',
    },
    extend: {
      colors: {
        primary: "var(--primary)",
        "background-light": "var(--background)",
        "background-dark": "var(--background)",
        "surface-light": "#ffffff", // Keeping these as hex as user didn't specify surface color, or should I map to background? Usually surface is different.
        "surface-dark": "#1e1e1e",
        "text-light": "var(--text)",
        "text-dark": "var(--text)",
        "text-secondary-light": "var(--secondary)",
        "text-secondary-dark": "var(--secondary)",
        "border-light": "#e5e7eb", // Keeping as is
        "border-dark": "#374151", // Keeping as is
        "success-light": "#22c55e",
        "success-dark": "#4ade80",
        "error-light": "#ef4444",
        "error-dark": "#f87171",
        accent: "var(--accent)",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        '2xl': "1.5rem",
      },
      boxShadow: {
          'card-light': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
          'card-dark': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          'glow': '0 0 15px rgba(0, 102, 255, 0.2)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
