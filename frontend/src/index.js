import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter
import App from './App';
import './index.css';

// Detect Android platform and add class
function detectAndroidPlatform() {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('android')) {
    document.documentElement.classList.add('android-app');
  }
}

// Run detection immediately
detectAndroidPlatform();

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Router> {/* Wrap App in Router */}
      <App />
    </Router>
  </React.StrictMode>
);