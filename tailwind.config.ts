import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        urgent: "#dc2626",
        high: "#ea580c",
        medium: "#ca8a04",
        low: "#16a34a",
        brand: { 50:"#eff6ff",100:"#dbeafe",500:"#2563eb",600:"#1d4ed8",700:"#1e40af" }
      }
    },
  },
  plugins: [],
};
export default config;
