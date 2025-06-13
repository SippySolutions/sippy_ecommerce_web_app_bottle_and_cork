// filepath: p:\SIPPY\PROJECTS\Ecomm\multi-tenant-ecommerce\ecom-monorepo\apps\webApp\frontend\tailwind.config.js

const cmsData = require("./src/Data/cmsData.js");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: cmsData.theme.primary,
        secondary: cmsData.theme.secondary,
        accent: cmsData.theme.accent,
        muted: cmsData.theme.muted,
        background: cmsData.theme.background,
      },
    },
  },
  plugins: [],
};