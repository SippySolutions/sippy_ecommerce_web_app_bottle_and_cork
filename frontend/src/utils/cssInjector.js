/**
 * CSS Injection Utility for Theme Preview
 * Allows store owners to dynamically inject and preview CSS changes
 */

class CSSInjector {
  constructor() {
    this.injectedStyles = new Map();
  }

  /**
   * Inject CSS into the page
   * @param {string} id - Unique identifier for the CSS
   * @param {string} css - CSS content to inject
   */
  inject(id, css) {
    // Remove existing style if it exists
    this.remove(id);

    // Create new style element
    const styleElement = document.createElement('style');
    styleElement.id = `injected-css-${id}`;
    styleElement.type = 'text/css';
    styleElement.innerHTML = css;

    // Add to head
    document.head.appendChild(styleElement);
    
    // Store reference
    this.injectedStyles.set(id, styleElement);

    console.log(`CSS injected with ID: ${id}`);
    return styleElement;
  }

  /**
   * Remove injected CSS
   * @param {string} id - Unique identifier for the CSS to remove
   */
  remove(id) {
    const element = this.injectedStyles.get(id);
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
      this.injectedStyles.delete(id);
      console.log(`CSS removed with ID: ${id}`);
    }
  }

  /**
   * Update existing CSS
   * @param {string} id - Unique identifier for the CSS
   * @param {string} css - New CSS content
   */
  update(id, css) {
    const element = this.injectedStyles.get(id);
    if (element) {
      element.innerHTML = css;
      console.log(`CSS updated with ID: ${id}`);
    } else {
      this.inject(id, css);
    }
  }

  /**
   * Clear all injected CSS
   */
  clear() {
    this.injectedStyles.forEach((element, id) => {
      this.remove(id);
    });
    console.log('All injected CSS cleared');
  }

  /**
   * Get list of all injected CSS IDs
   */
  getInjectedIds() {
    return Array.from(this.injectedStyles.keys());
  }

  /**
   * Preview theme changes from external source
   * @param {string} cssUrl - URL to fetch CSS from
   * @param {string} id - Unique identifier for this theme
   */
  async previewFromUrl(cssUrl, id = 'theme-preview') {
    try {
      const response = await fetch(cssUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const css = await response.text();
      this.inject(id, css);
      
      console.log(`Theme preview loaded from: ${cssUrl}`);
      return true;
    } catch (error) {
      console.error('Failed to load CSS from URL:', error);
      
      // Fallback: try with proxy if direct fetch fails
      return this.previewFromUrlWithProxy(cssUrl, id);
    }
  }

  /**
   * Preview theme changes using a proxy (for CORS issues)
   * @param {string} cssUrl - URL to fetch CSS from
   * @param {string} id - Unique identifier for this theme
   */
  async previewFromUrlWithProxy(cssUrl, id = 'theme-preview') {
    try {
      // Use your backend as a proxy
      const proxyUrl = `${import.meta.env.VITE_API_BASE_URL}/proxy-css`;
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: cssUrl })
      });
      
      if (!response.ok) {
        throw new Error(`Proxy error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.inject(id, data.css);
      
      console.log(`Theme preview loaded via proxy from: ${cssUrl}`);
      return true;
    } catch (error) {
      console.error('Failed to load CSS via proxy:', error);
      return false;
    }
  }

  /**
   * Apply theme variables dynamically
   * @param {Object} variables - CSS custom properties
   * @param {string} id - Unique identifier
   */
  applyThemeVariables(variables, id = 'theme-variables') {
    const css = `:root {
      ${Object.entries(variables)
        .map(([key, value]) => `  --${key}: ${value};`)
        .join('\n')}
    }`;
    
    this.inject(id, css);
  }

  /**
   * Quick theme preview for common properties
   * @param {Object} theme - Theme configuration
   */
  quickPreview(theme) {
    const {
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor,
      borderRadius,
      fontFamily
    } = theme;

    const css = `
      :root {
        ${primaryColor ? `--primary-color: ${primaryColor};` : ''}
        ${secondaryColor ? `--secondary-color: ${secondaryColor};` : ''}
        ${backgroundColor ? `--bg-color: ${backgroundColor};` : ''}
        ${textColor ? `--text-color: ${textColor};` : ''}
        ${borderRadius ? `--border-radius: ${borderRadius};` : ''}
        ${fontFamily ? `--font-family: ${fontFamily};` : ''}
      }

      body {
        ${backgroundColor ? `background-color: var(--bg-color) !important;` : ''}
        ${textColor ? `color: var(--text-color) !important;` : ''}
        ${fontFamily ? `font-family: var(--font-family) !important;` : ''}
      }

      .btn-primary, button[type="submit"] {
        ${primaryColor ? `background-color: var(--primary-color) !important;` : ''}
        ${borderRadius ? `border-radius: var(--border-radius) !important;` : ''}
      }

      .btn-secondary {
        ${secondaryColor ? `background-color: var(--secondary-color) !important;` : ''}
        ${borderRadius ? `border-radius: var(--border-radius) !important;` : ''}
      }

      .card, .product-card {
        ${borderRadius ? `border-radius: var(--border-radius) !important;` : ''}
      }
    `;

    this.inject('quick-theme-preview', css);
  }
}

// Create global instance
const cssInjector = new CSSInjector();

// Make it available globally for store owner tools
window.cssInjector = cssInjector;

export default cssInjector;
