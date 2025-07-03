# CSS Injection & Theme Preview - Usage Guide

## 🎨 **How to Use CSS Injection for Theme Preview**

### **1. Direct CSS Injection**
```javascript
// Inject custom CSS
window.cssInjector.inject('my-theme', `
  body { background-color: #f0f0f0; }
  .product-card { border-radius: 12px; }
  .btn-primary { background-color: #ff6b6b; }
`);

// Update existing CSS
window.cssInjector.update('my-theme', `
  body { background-color: #e0e0e0; }
  .product-card { border-radius: 8px; }
`);

// Remove CSS
window.cssInjector.remove('my-theme');
```

### **2. Quick Theme Preview**
```javascript
// Apply a complete theme quickly
window.cssInjector.quickPreview({
  primaryColor: '#ff6b6b',
  secondaryColor: '#4ecdc4',
  backgroundColor: '#f8f9fa',
  textColor: '#333333',
  borderRadius: '8px',
  fontFamily: 'Inter, sans-serif'
});
```

### **3. Load CSS from External URL**
```javascript
// Load theme from external CSS file
await window.cssInjector.previewFromUrl('https://your-theme-server.com/theme.css');

// With custom ID
await window.cssInjector.previewFromUrl('https://your-theme-server.com/dark-theme.css', 'dark-theme');
```

### **4. Apply CSS Variables**
```javascript
// Set CSS custom properties
window.cssInjector.applyThemeVariables({
  'primary-color': '#ff6b6b',
  'secondary-color': '#4ecdc4',
  'border-radius': '12px',
  'font-size-base': '16px'
});
```

### **5. Post Message API (for iframe usage)**
```javascript
// Send theme changes via postMessage (useful for iframe previews)
window.postMessage({
  type: 'THEME_PREVIEW',
  action: 'QUICK_PREVIEW',
  data: {
    theme: {
      primaryColor: '#ff6b6b',
      backgroundColor: '#f8f9fa'
    }
  }
}, '*');
```

## 🛠️ **Store Owner Dashboard Integration**

### **Example: Theme Preview Component**
```javascript
// In your store owner dashboard
const ThemePreview = () => {
  const applyTheme = (themeData) => {
    // Target the main website iframe or window
    const targetWindow = document.getElementById('website-preview').contentWindow;
    
    targetWindow.postMessage({
      type: 'THEME_PREVIEW',
      action: 'QUICK_PREVIEW',
      data: { theme: themeData }
    }, '*');
  };

  const clearTheme = () => {
    const targetWindow = document.getElementById('website-preview').contentWindow;
    
    targetWindow.postMessage({
      type: 'THEME_PREVIEW',
      action: 'CLEAR_ALL',
      data: {}
    }, '*');
  };

  return (
    <div>
      <button onClick={() => applyTheme({
        primaryColor: '#ff6b6b',
        backgroundColor: '#ffffff'
      })}>
        Apply Red Theme
      </button>
      
      <button onClick={clearTheme}>
        Clear Theme
      </button>
    </div>
  );
};
```

## 🔧 **CORS Handling**

### **For External CSS Files:**
1. **Direct fetch** (if CORS allows)
2. **Proxy through your backend** (automatic fallback)
3. **Use relative URLs** from your domain

### **Backend Proxy Endpoint:**
Add this to your backend for CSS proxying:
```javascript
// Express.js example
app.post('/api/proxy-css', async (req, res) => {
  try {
    const { url } = req.body;
    const response = await fetch(url);
    const css = await response.text();
    
    res.json({ css });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch CSS' });
  }
});
```

## 🎯 **Common Use Cases**

### **1. Color Scheme Preview**
```javascript
window.cssInjector.inject('color-scheme', `
  :root {
    --primary: #your-color;
    --secondary: #your-color;
  }
  
  .product-card { border-color: var(--primary); }
  .btn-primary { background: var(--primary); }
`);
```

### **2. Typography Changes**
```javascript
window.cssInjector.inject('typography', `
  body { font-family: 'Your Font', sans-serif; }
  h1, h2, h3 { font-weight: 600; }
  .price { font-size: 1.2em; }
`);
```

### **3. Layout Adjustments**
```javascript
window.cssInjector.inject('layout', `
  .product-grid { gap: 2rem; }
  .container { max-width: 1400px; }
  .navbar { padding: 1rem 0; }
`);
```

## 🚀 **Getting Started**

1. **Import the hook** in your main App component ✅
2. **Use browser console** to test: `window.cssInjector.quickPreview({primaryColor: '#ff0000'})`
3. **Build store owner dashboard** with theme controls
4. **Test with iframe** or direct integration

The CSS injection is now ready for your store owner's theme preview functionality!
