/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
    "./utils/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      screens: {
        "2xl": "1536px",
        "3xl": "1920px",
        "4xl": "2560px",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
        "10xl": "104rem",
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "2rem",
          lg: "4rem",
          xl: "5rem",
          "2xl": "6rem",
          "3xl": "8rem",
        },
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1536px",
          "3xl": "1920px",
        },
      },
      colors: {
        // Base colors for shadcn/ui
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Custom colors mapped to Tailwind default scale
        // Your custom colors are now mapped to standard Tailwind scale (50, 100, 200, etc.)
        // Using Tailwind's default slate colors (closer to your original design)
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },

        // Primary brand colors mapped to Tailwind scale
        indigo: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },

        // Semantic colors mapped to Tailwind scale
        green: {
          50: "#f0fdf4", // was success-5
          100: "#dcfce7", // was success-10
          200: "#bbf7d0", // was success-20
          300: "#86efac", // was success-30
          400: "#4ade80", // was success-40
          500: "#22c55e", // was success-50
          600: "#16a34a", // was success-60
          700: "#15803d", // was success-70
          800: "#166534", // was success-80
          900: "#14532d", // was success-90
        },

        yellow: {
          50: "#fffbeb", // was warning-5
          100: "#fef3c7", // was warning-10
          200: "#fde68a", // was warning-20
          300: "#fcd34d", // was warning-30
          400: "#fbbf24", // was warning-40
          500: "#f59e0b", // was warning-50
          600: "#d97706", // was warning-60
          700: "#b45309", // was warning-70
          800: "#92400e", // was warning-80
          900: "#78350f", // was warning-90
        },

        red: {
          50: "#fff1f2", // was danger-5
          100: "#ffe4e6", // was danger-10
          200: "#fecdd3", // was danger-20
          300: "#fda4af", // was danger-30
          400: "#fb7185", // was danger-40
          500: "#f43f5e", // was danger-50
          600: "#e11d48", // was danger-60
          700: "#be123c", // was danger-70
          800: "#9f1239", // was danger-80
          900: "#881337", // was danger-90
        },

        // Additional colors mapped to Tailwind scale
        blue: {
          50: "#eff6ff", // was blue-5
          100: "#dbeafe", // was blue-10
          200: "#bfdbfe", // was blue-20
          300: "#93c5fd", // was blue-30
          400: "#60a5fa", // was blue-40
          500: "#3b82f6", // was blue-50
          600: "#2563eb", // was blue-60
          700: "#1d4ed8", // was blue-70
          800: "#1e40af", // was blue-80
          900: "#1e3a8a", // was blue-90
        },

        cyan: {
          50: "#ecfeff", // was cyan-5
          100: "#cffafe", // was cyan-10
          200: "#a5f3fc", // was cyan-20
          300: "#67e8f9", // was cyan-30
          400: "#22d3ee", // was cyan-40
          500: "#06b6d4", // was cyan-50
          600: "#0891b2", // was cyan-60
          700: "#0e7490", // was cyan-70
          800: "#155e75", // was cyan-80
          900: "#164e63", // was cyan-90
        },

        teal: {
          50: "#f0fdfa", // was teal-5
          100: "#ccfbf1", // was teal-10
          200: "#99f6e4", // was teal-20
          300: "#5eead4", // was teal-30
          400: "#2dd4bf", // was teal-40
          500: "#14b8a6", // was teal-50
          600: "#0d9488", // was teal-60
          700: "#0f766e", // was teal-70
          800: "#115e59", // was teal-80
          900: "#134e4a", // was teal-90
        },

        lime: {
          50: "#f7fee7", // was lime-5
          100: "#ecfccb", // was lime-10
          200: "#d9f99d", // was lime-20
          300: "#bef264", // was lime-30
          400: "#a3e635", // was lime-40
          500: "#84cc16", // was lime-50
          600: "#65a30d", // was lime-60
          700: "#4d7c0f", // was lime-70
          800: "#3f6212", // was lime-80
          900: "#365314", // was lime-90
        },

        purple: {
          50: "#faf5ff", // was purple-5
          100: "#f3e8ff", // was purple-10
          200: "#e9d5ff", // was purple-20
          300: "#d8b4fe", // was purple-30
          400: "#c084fc", // was purple-40
          500: "#a855f7", // was purple-50
          600: "#9333ea", // was purple-60
          700: "#7c3aed", // was purple-70 (adjusted)
          800: "#6b21a8", // was purple-80
          900: "#581c87", // was purple-90
        },

        pink: {
          50: "#fdf2f8", // was pink-5
          100: "#fce7f3", // was pink-10 (adjusted)
          200: "#fbcfe8", // was pink-20
          300: "#f9a8d4", // was pink-30
          400: "#f472b6", // was pink-40
          500: "#ec4899", // was pink-50
          600: "#db2777", // was pink-60
          700: "#be185d", // was pink-70
          800: "#9d174d", // was pink-80
          900: "#831843", // was pink-90
        },

        orange: {
          50: "#fff7ed", // was orange-5
          100: "#ffedd5", // was orange-10
          200: "#fed7aa", // was orange-20
          300: "#fdba74", // was orange-30
          400: "#fb923c", // was orange-40
          500: "#f97316", // was orange-50
          600: "#ea580c", // was orange-60
          700: "#c2410c", // was orange-70
          800: "#9a3412", // was orange-80
          900: "#7c2d12", // was orange-90
        },
      },

      /* Typography Scale */
      fontSize: {
        xss: "var(--font-size-xxs)",
        xs: "var(--font-size-xs)",
        sm: "var(--font-size-sm)",
        base: "var(--font-size-base)",
        lg: "var(--font-size-lg)",
        xl: "var(--font-size-xl)",
        "2xl": "var(--font-size-2xl)",
        "3xl": "var(--font-size-3xl)",
        "4xl": "var(--font-size-4xl)",
        "5xl": "var(--font-size-5xl)",
        "6xl": "var(--font-size-6xl)",
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        inter: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 20px rgba(0,0,0,0.05)",
        elegant: "var(--shadow-elegant)",
        login: "var(--shadow-login-card)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
