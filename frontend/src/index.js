import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter
import App from './App';
import './index.css';

// Android detection for status bar styling
const detectAndroidPlatform = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isAndroid = /android/i.test(userAgent);
  
  if (isAndroid && document.documentElement.classList.contains('capacitor-app')) {
    document.documentElement.classList.add('android-app');
  }
};

// Run detection when DOM is loaded
detectAndroidPlatform();

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Router> {/* Wrap App in Router */}
      <App />
    </Router>
  </React.StrictMode>
);