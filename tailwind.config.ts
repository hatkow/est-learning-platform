import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // イースト株式会社 コーポレートカラー
        est: {
          50: '#eef4fb',
          100: '#d6e3f4',
          200: '#aec7e9',
          300: '#7ba3d8',
          400: '#4a7ec2',
          500: '#2a62a8',
          600: '#1a56a0', // ブランドメインカラー
          700: '#164684',
          800: '#143a6b',
          900: '#12305a',
          950: '#0b1d39',
        },
      },
      fontFamily: {
        sans: ['var(--font-noto)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },
  plugins: [],
}

export default config
