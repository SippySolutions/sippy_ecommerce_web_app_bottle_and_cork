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
        headingText: 'var(--color-headingText)',
        bodyText: 'var(--color-bodyText)',
        link: 'var(--color-link)',
      },
    },
  },
  plugins: [],
};