// filepath: p:\SIPPY\PROJECTS\Ecomm\multi-tenant-ecommerce\ecom-monorepo\apps\webApp\frontend\tailwind.config.js

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: false, // Disable dark mode completely
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        muted: 'var(--color-muted)',
        background: 'var(--color-background)',
        'heading-text': 'var(--color-heading-text)',
        'body-text': 'var(--color-body-text)',
        'link-text': 'var(--color-link-text)',
      },
    },
  },
  plugins: [],
};