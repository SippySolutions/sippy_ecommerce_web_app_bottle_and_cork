import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { fetchCMSData } from "./services/api"; // Import fetchCMSData from api.jsx

async function initializeApp() {
  const cmsData = await fetchCMSData(); // Use the imported function

  if (!cmsData) {
    console.error("Failed to fetch CMS data.");
    return;
  }

  // Apply theme dynamically
  const root = document.documentElement;
  if (cmsData.theme) {
    Object.keys(cmsData.theme).forEach((key) => {
      root.style.setProperty(`--color-${key}`, cmsData.theme[key]);
    });
  } else {
    console.warn("No theme data found in CMS data.");
  }

  // Render the app
  const rootElement = document.getElementById("root");
  createRoot(rootElement).render(
    <StrictMode>
      <Router>
        <App cmsData={cmsData} />
      </Router>
    </StrictMode>
  );
}

initializeApp();
