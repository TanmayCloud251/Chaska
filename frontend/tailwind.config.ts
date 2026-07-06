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
        primary: "#F47C2B", // saffron orange
        background: "#FFFBF5", // warm cream
        foreground: "#2C1810", // deep brown
        card: "#FFFFFF",
        border: "#E8E0D5",
        "status-open": "#2E7D32", // muted green
        "status-closed": "#C62828", // muted red
        chator: "#F4A227", // gold
        "muted-text": "#6B6B6B",
      },
      fontFamily: {
        heading: ["var(--font-baloo)", "sans-serif"],
        body: ["var(--font-nunito)", "sans-serif"],
      },
      boxShadow: {
        warm: "0 2px 12px rgba(44, 24, 16, 0.10)",
      },
      borderRadius: {
        card: "16px",
        btn: "24px",
        tag: "10px",
      }
    },
  },
  plugins: [],
};
export default config;
