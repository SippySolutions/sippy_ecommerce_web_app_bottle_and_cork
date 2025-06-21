// ===================================================================
// CMS DATA BACKUP - REFERENCE ONLY
// ===================================================================
// This file contains the complete CMS data structure for reference
// when the LoadingScreen component is re-integrated with CMS data.
// 
// REMOVED FROM: LoadingScreen.jsx
// REASON: LoadingScreen is for server wait time, not CMS data loading
// RESTORE WHEN: CMS data loading is moved to appropriate component
// ===================================================================

// CMS Data Props that were removed from LoadingScreen:
const removedCmsIntegration = {
  // Props that were passed to LoadingScreen:
  cmsData: {
    logo: 'https://sippysolutionsbucket.s3.us-east-2.amazonaws.com/universal_liquors/Logo.png',
    storeInfo: {
      name: 'Universal Liquors',
      tagline: 'Your premium liquor destination'
    }
  }
};

// JSX that was removed from LoadingScreen component:
const removedJSXElements = `
  // Logo section (REMOVED):
  {cmsData?.logo ? (
    <img
      src={cmsData.logo}
      alt={cmsData?.storeInfo?.name || "Store Logo"}
      className="h-16 w-auto mx-auto"
      style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}
    />
  ) : (
    <div className="h-16 w-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-2xl text-gray-600">🏪</div>
    </div>
  )}

  // Store name section (REMOVED):
  {cmsData?.storeInfo?.name && (
    <motion.h1
      className="text-xl font-semibold text-gray-800 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {cmsData.storeInfo.name}
    </motion.h1>
  )}

  // Tagline section (REMOVED):
  {cmsData?.storeInfo?.tagline || 'Getting everything ready for you...'}
`;

// Component prop signature that was changed:
const oldPropSignature = `
const LoadingScreen = ({ onLoadingComplete, cmsData = null, serverHealthCheck = null, error = null }) => {
`;

const newPropSignature = `
const LoadingScreen = ({ onLoadingComplete, serverHealthCheck = null, error = null }) => {
`;

// ===================================================================
// TO RESTORE CMS INTEGRATION:
// ===================================================================
// 1. Add cmsData prop back to LoadingScreen component
// 2. Replace hardcoded "Universal Liquors" with cmsData?.storeInfo?.name
// 3. Replace hardcoded store icon with cmsData?.logo
// 4. Replace hardcoded tagline with cmsData?.storeInfo?.tagline
// 5. Update parent components to pass cmsData prop
// ===================================================================

export default {
  removedCmsIntegration,
  removedJSXElements,
  oldPropSignature,
  newPropSignature
};
