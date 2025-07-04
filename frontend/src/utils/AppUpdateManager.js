import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { Capacitor } from '@capacitor/core';

class AppUpdateManager {
  constructor() {
    this.currentVersion = '1.3.0';
    this.minRequiredVersion = '1.3.0';
    this.updateCheckInterval = 24 * 60 * 60 * 1000; // 24 hours
  }

  // Check for updates when app starts
  async checkForUpdates() {
    try {
      // Only check in mobile app, not web
      if (!Capacitor.isNativePlatform()) {
        return;
      }

      const updateInfo = await this.getUpdateInfo();
      
      if (updateInfo.hasUpdate) {
        if (updateInfo.isForced) {
          this.showForceUpdateDialog(updateInfo);
        } else {
          this.showOptionalUpdateDialog(updateInfo);
        }
      }
    } catch (error) {
      console.log('Update check failed:', error);
    }
  }

  // Get update information from your backend
  async getUpdateInfo() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/app-version`);
      const data = await response.json();
      
      return {
        hasUpdate: this.isUpdateAvailable(data.latestVersion),
        isForced: this.isForceUpdateRequired(data.minRequiredVersion),
        latestVersion: data.latestVersion,
        minRequiredVersion: data.minRequiredVersion,
        updateMessage: data.updateMessage || 'A new version is available!',
        features: data.features || []
      };
    } catch (error) {
      // Fallback to local version check
      return {
        hasUpdate: false,
        isForced: false
      };
    }
  }

  // Check if update is available
  isUpdateAvailable(latestVersion) {
    return this.compareVersions(latestVersion, this.currentVersion) > 0;
  }

  // Check if force update is required
  isForceUpdateRequired(minRequiredVersion) {
    return this.compareVersions(minRequiredVersion, this.currentVersion) > 0;
  }

  // Compare version numbers
  compareVersions(version1, version2) {
    const v1parts = version1.split('.').map(Number);
    const v2parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;
      
      if (v1part > v2part) return 1;
      if (v1part < v2part) return -1;
    }
    return 0;
  }

  // Show force update dialog
  showForceUpdateDialog(updateInfo) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 m-4 max-w-sm w-full">
        <div class="text-center mb-4">
          <div class="text-red-500 text-4xl mb-2">⚠️</div>
          <h3 class="text-lg font-semibold text-gray-900">Update Required</h3>
        </div>
        <div class="mb-4">
          <p class="text-gray-600 text-sm mb-2">
            ${updateInfo.updateMessage}
          </p>
          <p class="text-gray-500 text-xs">
            Version ${updateInfo.latestVersion} is now available.
          </p>
        </div>
        <div class="flex justify-center">
          <button 
            id="forceUpdateBtn"
            class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium"
          >
            Update Now
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Handle update button click
    document.getElementById('forceUpdateBtn').addEventListener('click', () => {
      this.redirectToPlayStore();
    });

    // Prevent closing the modal (force update)
    modal.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Show optional update dialog
  showOptionalUpdateDialog(updateInfo) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 m-4 max-w-sm w-full">
        <div class="text-center mb-4">
          <div class="text-blue-500 text-4xl mb-2">🚀</div>
          <h3 class="text-lg font-semibold text-gray-900">Update Available</h3>
        </div>
        <div class="mb-4">
          <p class="text-gray-600 text-sm mb-2">
            ${updateInfo.updateMessage}
          </p>
          <p class="text-gray-500 text-xs mb-2">
            Version ${updateInfo.latestVersion} is now available.
          </p>
          ${updateInfo.features.length > 0 ? `
            <div class="bg-gray-50 rounded p-3 mt-3">
              <p class="text-xs font-medium text-gray-700 mb-1">What's New:</p>
              <ul class="text-xs text-gray-600 space-y-1">
                ${updateInfo.features.map(feature => `<li>• ${feature}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
        <div class="flex space-x-3">
          <button 
            id="laterBtn"
            class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium"
          >
            Later
          </button>
          <button 
            id="updateBtn"
            class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            Update
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Handle button clicks
    document.getElementById('updateBtn').addEventListener('click', () => {
      this.redirectToPlayStore();
    });

    document.getElementById('laterBtn').addEventListener('click', () => {
      document.body.removeChild(modal);
      // Remember user declined (optional)
      localStorage.setItem('updateDeclined', Date.now().toString());
    });
  }

  // Redirect to Play Store
  redirectToPlayStore() {
    const packageName = 'com.sippysolution.universalliquor';
    const playStoreUrl = `https://play.google.com/store/apps/details?id=${packageName}`;
    
    // Try to open Play Store app first, fallback to browser
    window.open(`market://details?id=${packageName}`, '_system') || 
    window.open(playStoreUrl, '_system');
  }

  // Initialize update checking
  init() {
    // Check for updates on app start
    this.checkForUpdates();
    
    // Set up periodic checks
    setInterval(() => {
      this.checkForUpdates();
    }, this.updateCheckInterval);
  }
}

export default AppUpdateManager;
