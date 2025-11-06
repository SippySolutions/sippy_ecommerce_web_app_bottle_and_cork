/**
 * Feature Flags Configuration
 * Toggle features on/off for the entire application
 */

const FEATURE_FLAGS = {
  // Shopping Features
  ENABLE_SHOPPING: false, // Set to true when ready to accept orders
  ENABLE_CART: false,
  ENABLE_WISHLIST: false,
  ENABLE_CHECKOUT: false,
  ENABLE_LOGIN: false,
  ENABLE_ACCOUNT: false,
  
  // Browse Mode Banner
  SHOW_COMING_SOON_BANNER: true,
  COMING_SOON_MESSAGE: "🎉 Online Shopping Coming Soon! Browse our products and get ready to order.",
  
  // Product Features (can be enabled even in browse mode)
  SHOW_PRODUCT_DETAILS: true,
  SHOW_PRODUCT_PRICES: true,
  SHOW_PRODUCT_REVIEWS: true,
  
  // Third-party ordering platforms
  UBEREATS_LINK: "https://www.ubereats.com/store/bottle-%26-cork-380-west-pleasantview-avenue/MKLnEA0iWmafgwS6NguLQQ",
  POSTMATES_LINK: "https://postmates.com/store/bottle-%26-cork-380-west-pleasantview-avenue/MKLnEA0iWmafgwS6NguLQQ",
};

/**
 * Helper function to check if a feature is enabled
 * @param {string} feature - Feature name from FEATURE_FLAGS
 * @returns {boolean}
 */
export const isFeatureEnabled = (feature) => {
  return FEATURE_FLAGS[feature] ?? false;
};

/**
 * Get the coming soon message
 * @returns {string}
 */
export const getComingSoonMessage = () => {
  return FEATURE_FLAGS.COMING_SOON_MESSAGE;
};

/**
 * Check if the app is in browse-only mode
 * @returns {boolean}
 */
export const isBrowseOnlyMode = () => {
  return !FEATURE_FLAGS.ENABLE_SHOPPING;
};

/**
 * Get third-party ordering platform links
 * @returns {object}
 */
export const getOrderingPlatforms = () => {
  return {
    ubereats: FEATURE_FLAGS.UBEREATS_LINK,
    postmates: FEATURE_FLAGS.POSTMATES_LINK,
  };
};

export default FEATURE_FLAGS;
