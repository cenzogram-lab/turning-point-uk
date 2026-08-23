import typography from "@tailwindcss/typography";
import containerQueries from "@tailwindcss/container-queries";
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring) / <alpha-value>)",
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
        chart: {
          1: "oklch(var(--chart-1))",
          2: "oklch(var(--chart-2))",
          3: "oklch(var(--chart-3))",
          4: "oklch(var(--chart-4))",
          5: "oklch(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "oklch(var(--sidebar))",
          foreground: "oklch(var(--sidebar-foreground))",
          primary: "oklch(var(--sidebar-primary))",
          "primary-foreground": "oklch(var(--sidebar-primary-foreground))",
          accent: "oklch(var(--sidebar-accent))",
          "accent-foreground": "oklch(var(--sidebar-accent-foreground))",
          border: "oklch(var(--sidebar-border))",
          ring: "oklch(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        none: "0",
        sm: "0",
        md: "0",
        lg: "0",
        xl: "0",
        "2xl": "0",
        full: "9999px",
      },
      boxShadow: {
        none: "none",
        xs: "none",
        sm: "none",
        md: "none",
        lg: "none",
        xl: "none",
        "2xl": "none",
        inner: "none",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "hero-fade-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "headline-rise": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "nav-solidify": {
          from: { backgroundColor: "oklch(var(--background) / 0.55)" },
          to: { backgroundColor: "oklch(var(--background))" },
        },
        "entrance-left": {
          from: { opacity: "0", transform: "translateX(-5rem)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "entrance-right": {
          from: { opacity: "0", transform: "translateX(5rem)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "tpuk-arrow-nudge": {
          from: { transform: "translate(0, 0)" },
          to: { transform: "translate(2px, -2px)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(1.5rem)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "lightbox-fade": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "blog-cover-reveal": {
          from: { opacity: "0", transform: "scale(1.04)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "scroll-cue-bounce": {
          "0%": { transform: "translateY(0)", opacity: "0.4" },
          "50%": { transform: "translateY(8px)", opacity: "1" },
          "100%": { transform: "translateY(0)", opacity: "0.4" },
        },
        "spin-jump": {
          "0%": { transform: "translateY(0) rotate(0deg) scale(1)" },
          "25%": {
            transform: "translateY(-11px) rotate(90deg) scale(1.08)",
          },
          "50%": { transform: "translateY(0) rotate(180deg) scale(1)" },
          "75%": {
            transform: "translateY(-11px) rotate(270deg) scale(1.08)",
          },
          "100%": { transform: "translateY(0) rotate(360deg) scale(1)" },
        },
        "loading-arrow-pulse": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.08)", opacity: "0.85" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "preloader-progress": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(400%)" },
        },
        "podcasts-bounce": {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "hero-fade-in": "hero-fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) both",
        "headline-rise": "headline-rise 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.15s both",
        "nav-solidify": "nav-solidify 0.3s ease-out",
        "entrance-left": "entrance-left 700ms ease-out both",
        "entrance-right": "entrance-right 700ms ease-out both",
        "tpuk-arrow-nudge": "tpuk-arrow-nudge 0.3s cubic-bezier(0.4, 0, 0.2, 1) both",
        "fade-in-up": "fade-in-up 600ms ease-out both",
        "lightbox-fade": "lightbox-fade 200ms ease-out both",
        "blog-cover-reveal":
          "blog-cover-reveal 1.1s cubic-bezier(0.4, 0, 0.2, 1) both",
        "scroll-cue-bounce":
          "scroll-cue-bounce 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "spin-jump": "spin-jump 2.6s ease-in-out infinite",
        "loading-arrow-pulse": "loading-arrow-pulse 1.6s ease-in-out infinite",
        "preloader-progress": "preloader-progress 1.4s ease-in-out infinite",
        "podcasts-bounce": "podcasts-bounce 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [typography, containerQueries, animate],
};
