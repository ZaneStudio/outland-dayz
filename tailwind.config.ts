import type { Config } from "tailwindcss";
export default { content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"], theme: { extend: { colors: { military: "#83915c", ember: "#e24435", ink: "#0a0c09" }, fontFamily: { display: ["Impact", "Arial Narrow", "sans-serif"] }, boxShadow: { glow: "0 0 32px rgba(132,149,82,.2)" } } }, plugins: [] } satisfies Config;
