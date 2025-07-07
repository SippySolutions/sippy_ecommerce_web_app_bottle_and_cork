// Server health check utility
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/api`;

export const checkServerHealth = async (retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      // Try to fetch a simple endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_BASE_URL}/cms-data`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return data; // Return CMS data if successful
      }

      throw new Error(`Server responded with status: ${response.status}`);
    } catch (error) {
      console.log(`Health check attempt ${i + 1} failed:`, error.message);
      
      if (i === retries - 1) {
        throw new Error(`Server health check failed after ${retries} attempts: ${error.message}`);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const checkServerHealthSimple = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_BASE_URL}/cms-data`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
};
