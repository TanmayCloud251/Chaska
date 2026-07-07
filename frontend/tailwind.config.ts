import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#9b4500", // primary terracotta orange
        "primary-container": "#f47c2b", // saffron orange CTA
        "on-primary-container": "#5a2500",
        secondary: "#855400",
        "secondary-container": "#fdaa30",
        "on-secondary-container": "#6b4200",
        tertiary: "#1b6d24",
        "tertiary-container": "#5faf5d",
        background: "#fff8f6", // Warm Cream
        foreground: "#2a170f", // Deep Brown
        card: "#ffffff", // Pure White
        border: "#dec1b2", // outline-variant (border)
        outline: "#8a7265",
        "outline-variant": "#dec1b2",
        "status-open": "#1b6d24",
        "status-closed": "#ba1a1a",
        chator: "#f4a227", // gold badge
        "muted-text": "#574237", // on-surface-variant
        "surface-container-low": "#fff1ec",
        "surface-container-lowest": "#ffffff",
        "surface-container": "#ffe9e2",
        "surface-container-high": "#ffe2d8",
        "surface-container-highest": "#ffdbce",
      },
      fontFamily: {
        heading: ["var(--font-be-vietnam)", "sans-serif"],
        body: ["var(--font-nunito-sans)", "sans-serif"],
      },
      boxShadow: {
        warm: "0 2px 12px rgba(44, 24, 16, 0.10)", // Warm Soil shadow
      },
      borderRadius: {
        card: "16px", // rounded-lg
        btn: "24px", // rounded-xl
        tag: "10px",
      }
    },
  },
  plugins: [],
};
export default config;
