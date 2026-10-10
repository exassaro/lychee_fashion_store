import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" }, screens: { "2xl": "1320px" } },
    extend: {
      colors: {
        brand: { DEFAULT: "#E8004C", dark: "#D4083F", soft: "#FFE8EF" },
        leaf: { DEFAULT: "#5CC91A", dark: "#2F7A0A", soft: "#EAF8DF" },
        ink: "#1A1A1A",
        mist: "#F6F6F6",
        whatsapp: { DEFAULT: "#25D366", button: "#189D4A", hover: "#13873F" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        slab: ["var(--font-zilla)", "Georgia", "serif"],
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #E8004C 0%, #D4083F 100%)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(26,26,26,0.04), 0 4px 16px rgba(26,26,26,0.06)",
        "card-hover": "0 2px 4px rgba(26,26,26,0.06), 0 12px 32px rgba(26,26,26,0.10)",
      },
    },
  },
  plugins: [animate],
};

export default config;
