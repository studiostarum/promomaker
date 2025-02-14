import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
	"./pages/**/*.{js,ts,jsx,tsx,mdx}",
	"./components/**/*.{js,ts,jsx,tsx,mdx}",
	"./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
	extend: {
		borderRadius: {
			lg: 'var(--radius)',
			md: 'calc(var(--radius) - 2px)',
			sm: 'calc(var(--radius) - 4px)'
		},
		colors: {
			primary: {
				100: '#e0d7ff',
				200: '#b3aaff',
				300: '#867dff',
				400: '#5a50ff',
				500: '#4f42c6',
				600: '#3e3399',
				700: '#2e256d',
				800: '#1e1740',
				900: '#0f0920',
				950: '#070410',
			},
		}
	}
  },
  plugins: [
	require("tailwindcss-animate"),
	require('@tailwindcss/forms'),
  ],
} satisfies Config;
