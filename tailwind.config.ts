import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#527474',
          light: '#6a9090',
          dark: '#3d5858',
          muted: '#7a9f9f',
        },
        surface: {
          0: '#0a0a0a',
          1: '#111115',
          2: '#18181d',
          3: '#1f1f25',
          4: '#27272e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'elevation-sm': '0 1px 3px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.25)',
        'elevation-md': '0 4px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)',
        'elevation-lg': '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.35)',
        'elevation-xl': '0 20px 60px rgba(0,0,0,0.75), 0 4px 16px rgba(0,0,0,0.4)',
        'brand':        '0 8px 32px rgba(82,116,116,0.25), 0 2px 8px rgba(82,116,116,0.15)',
        'brand-sm':     '0 4px 16px rgba(82,116,116,0.2)',
      },
    },
  },
  plugins: [],
}

export default config
