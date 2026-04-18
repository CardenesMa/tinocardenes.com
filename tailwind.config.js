/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          light: '#ffffff',
          dark: '#0a0a0a',
        },
        text: {
          light: '#171717',
          dark: '#ededed',
        },
        accent: {
          light: '#9a75d9',
          dark: '#bb9ff5',
        },
        'soft-bg': {
          light: 'rgb(246, 240, 236)',
          dark: 'rgb(86, 81, 77)',
        },
      },
      fontSize: {
        headline: ['50px', { lineHeight: '1.05', fontWeight: '700' }],
        'headline-sm': ['32px', { lineHeight: '1.05', fontWeight: '700' }],
        'headline-mobile': ['32px', { lineHeight: '1.05', fontWeight: '700' }],
        'headline-mobile-sm': ['28px', { lineHeight: '1.1' }],
        subheadline: ['22px', { lineHeight: '1', fontWeight: '500' }],
        'subheadline-mobile': ['18px', { lineHeight: '1', fontWeight: '500' }],
        medheadline: ['32px', { lineHeight: '1', fontWeight: '600' }],
        'medheadline-mobile': ['24px', { lineHeight: '1', fontWeight: '600' }],
        description: ['24px', { lineHeight: 'inherit', fontWeight: '400' }],
        'description-mobile': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
}