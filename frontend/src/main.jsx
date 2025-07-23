import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import { fetchCMSData } from "./services/api"; // Import fetchCMSData from api.jsx

// Server health check function
async function checkServerHealth() {
  const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/api`;
  const STORE_DB_NAME = import.meta.env.VITE_STORE_DB_NAME;
  const maxRetries = 5;
  const retryDelay = 2000; // 2 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Server health check attempt ${attempt}/${maxRetries}`);
      
      // Try to fetch a simple endpoint with proper headers
      const response = await fetch(`${API_BASE_URL}/cms-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Store-DB': STORE_DB_NAME  // Add the required database header
        },
        timeout: 10000 // 10 second timeout
      });

      if (response.ok) {
        console.log('✅ Server is responsive');
        return true;
      }
      throw new Error(`Server responded with status: ${response.status}`);
    } catch (error) {
      console.log(`❌ Server health check failed (attempt ${attempt}): ${error.message}`);
      
      if (attempt < maxRetries) {
        console.log(`⏳ Retrying in ${retryDelay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  console.warn('⚠️ Server may be slow to respond, proceeding anyway...');
  return false;
}

// Enhanced initialization with loading screen
async function initializeApp() {
  let cmsData = null;
  let showLoadingScreen = true;

  // Create initial loading screen
  const rootElement = document.getElementById("root");
  const root = createRoot(rootElement);

  // First, try to get basic CMS data for the loading screen
  try {
    console.log('🔄 Fetching initial CMS data for loading screen...');
    cmsData = await fetchCMSData();
    console.log('✅ Initial CMS data loaded successfully');
  } catch (error) {
    console.log('⚠️ Could not fetch initial CMS data, using fallback');
  }

  // Perform server health check first
  const serverHealthy = await checkServerHealth();

  // Show loading screen with server health check
  root.render(
    <StrictMode>
      <LoadingScreen 
        cmsData={cmsData}
        onLoadingComplete={() => {
          showLoadingScreen = false;
          renderMainApp();
        }}
      />
    </StrictMode>
  );

  // If no CMS data was loaded initially, try again
  if (!cmsData) {
    try {
      console.log('🔄 Retrying CMS data fetch...');
      cmsData = await fetchCMSData();
      console.log('✅ CMS data loaded on retry');
    } catch (error) {
      console.error('❌ Failed to fetch CMS data after retry:', error);
      // Continue with default/fallback data
    }
  }

  // Function to render the main app
  function renderMainApp() {
    if (showLoadingScreen) return; // Prevent double rendering

    // Apply theme dynamically if available
    if (cmsData?.theme) {
      const documentRoot = document.documentElement;
      Object.keys(cmsData.theme).forEach((key) => {
        documentRoot.style.setProperty(`--color-${key}`, cmsData.theme[key]);
      });
      console.log('🎨 Theme applied successfully');
    } else {
      console.warn("⚠️ No theme data found in CMS data, using defaults");
    }

    // Render the main application
    root.render(
      <StrictMode>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <App cmsData={cmsData} serverHealthy={serverHealthy} />
        </Router>
      </StrictMode>
    );

    console.log('🚀 Application initialized successfully');
  }
}

// Start the application
initializeApp().catch(error => {
  console.error('💥 Application initialization failed:', error);
  
  // Fallback: render app anyway with error state
  const rootElement = document.getElementById("root");
  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-800 mb-4">Unable to Load Store</h1>
          <p className="text-red-600 mb-6">
            We're having trouble connecting to our servers. This might be because:
          </p>
          <ul className="text-sm text-red-600 text-left mb-6">
            <li>• The server is starting up (this can take 30-60 seconds)</li>
            <li>• Temporary network issues</li>
            <li>• Server maintenance in progress</li>
          </ul>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </StrictMode>
  );
});
