import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        onest: ["Onest", "sans-serif"],
        lora: ["Onest", "sans-serif"],
        mono: ["Onest", "sans-serif"],
        inter: ["Onest", "sans-serif"],
      },
      colors: {
        brand: "#7779FC",
        "brand-dark": "#6668EC",
        background: "#EEEDFA",
        surface: "#EEEDFA",
        heading: "#10233F",
        body: "#65758B",
        border: "#D8E5F1",
        success: "#25A96B",
        emergency: "#E84545",
        warning: "#DBB28F",
        purple: "#7779FC",
        navy: "#EEEDFA",
        "dark-section": "#EEEDFA",
        "primary-text": "#101828",
        "secondary-text": "#667085",
        "soft-bg": "#EEEDFA",
        "light-blue": "#EEF0FF",
        "ai-purple": "#7779FC",
        sapphire: "#7779FC",
        azure: "#8E90FF",
        skywash: "#EEF0FF",
        cloud: "#EEEDFA",
        ambercare: "#DBB28F",
        ink: "#0F172A",
      },
      boxShadow: {
        card: "0 18px 40px rgba(15, 23, 42, 0.08)",
        neu: "10px 10px 24px rgba(125, 148, 171, 0.18), -10px -10px 24px rgba(255, 255, 255, 0.88)",
        "neu-sm":
          "6px 6px 14px rgba(125, 148, 171, 0.18), -6px -6px 14px rgba(255, 255, 255, 0.9)",
        "neu-inset":
          "inset 4px 4px 9px rgba(125, 148, 171, 0.16), inset -4px -4px 9px rgba(255, 255, 255, 0.9)",
      },
      maxWidth: {
        container: "1280px",
        wide: "1440px",
      },
      fontSize: {
        "hero": ["clamp(3.25rem, 7vw, 7.5rem)", { lineHeight: "1.05", fontWeight: "700" }],
        "section": ["clamp(2.5rem, 5vw, 5.25rem)", { lineHeight: "1.1", fontWeight: "700" }],
        "subsection": ["clamp(1.75rem, 3vw, 3rem)", { lineHeight: "1.15", fontWeight: "600" }],
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top left, rgba(119,121,252,0.14), transparent 36%), radial-gradient(circle at bottom right, rgba(219,178,143,0.18), transparent 26%)",
      },
    },
  },
  plugins: [],
};

export default config;
