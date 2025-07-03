import { useEffect, useCallback } from 'react';
import cssInjector from '../utils/cssInjector';

/**
 * React hook for theme preview functionality
 */
export const useThemePreview = () => {
  useEffect(() => {
    // Initialize CSS injector
    console.log('Theme preview initialized');
    
    // Listen for messages from store owner tools
    const handleMessage = (event) => {
      if (event.data.type === 'THEME_PREVIEW') {
        const { action, data } = event.data;
        
        switch (action) {
          case 'INJECT_CSS':
            cssInjector.inject(data.id, data.css);
            break;
          case 'REMOVE_CSS':
            cssInjector.remove(data.id);
            break;
          case 'QUICK_PREVIEW':
            cssInjector.quickPreview(data.theme);
            break;
          case 'CLEAR_ALL':
            cssInjector.clear();
            break;
          default:
            console.warn('Unknown theme preview action:', action);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const injectCSS = useCallback((id, css) => {
    return cssInjector.inject(id, css);
  }, []);

  const removeCSS = useCallback((id) => {
    return cssInjector.remove(id);
  }, []);

  const updateCSS = useCallback((id, css) => {
    return cssInjector.update(id, css);
  }, []);

  const clearAll = useCallback(() => {
    return cssInjector.clear();
  }, []);

  const previewFromUrl = useCallback(async (url, id) => {
    return await cssInjector.previewFromUrl(url, id);
  }, []);

  const quickPreview = useCallback((theme) => {
    return cssInjector.quickPreview(theme);
  }, []);

  const applyThemeVariables = useCallback((variables, id) => {
    return cssInjector.applyThemeVariables(variables, id);
  }, []);

  return {
    injectCSS,
    removeCSS,
    updateCSS,
    clearAll,
    previewFromUrl,
    quickPreview,
    applyThemeVariables,
    cssInjector
  };
};

export default useThemePreview;
