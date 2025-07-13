import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        // Base accent colors (consistent across themes)
        'accent-purple': '#8A2BE2',
        'accent-blue': '#5A55F5',
        'icon-light': '#F8F8F8',

        // Dark Mode Palette (default) - EXACT HEX VALUES
        'dark-primary-bg': '#1B0C30',
        'dark-secondary-bg': '#2C1A4A',
        'dark-tertiary-bg': '#3A2E50',
        'dark-text-light': '#F8F8F8',
        'dark-text-muted': '#B0B0B0',
        'dark-border-subtle': '#4A3D66',

        // Light Mode Palette (with texture) - EXACT HEX VALUES
        'light-primary-bg': '#F0F2F5',
        'light-secondary-bg': '#FFFFFF',
        'light-tertiary-bg': '#E6E8EB',
        'light-text-dark': '#1A1A1A',
        'light-text-muted': '#5C5C5C',
        'light-border-subtle': '#D1D5DA',

        // Shadcn/UI compatible colors with CSS variables
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'theme-transition': {
          '0%': { opacity: '0.8' },
          '100%': { opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 0 0px rgba(138, 43, 226, 0.4)' 
          },
          '50%': { 
            boxShadow: '0 0 0 8px rgba(138, 43, 226, 0.1)' 
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'blob-bounce': {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'theme-transition': 'theme-transition 0.3s ease-in-out',
        'pulse-glow': 'pulse-glow 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'blob-bounce': 'blob-bounce 6s ease-in-out infinite',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;