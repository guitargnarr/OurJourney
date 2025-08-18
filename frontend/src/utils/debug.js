// Debug utility for localStorage issues
export const debugLocalStorage = () => {
  console.log('=== OurJourney Debug Info ===');
  console.log('Current URL:', window.location.href);
  console.log('localStorage contents:');
  
  // Check all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`  ${key}:`, value);
  }
  
  // Check specific OurJourney token
  const token = localStorage.getItem('ourjourney_token');
  console.log('OurJourney Token exists:', !!token);
  if (token) {
    try {
      // Decode JWT token to check expiry (base64 decode)
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('Token payload:', payload);
        if (payload.exp) {
          const expiry = new Date(payload.exp * 1000);
          console.log('Token expires:', expiry);
          console.log('Token expired:', expiry < new Date());
        }
      }
    } catch (e) {
      console.log('Could not decode token:', e.message);
    }
  }
  
  // Check for any conflicting auth tokens
  const possibleAuthKeys = ['token', 'auth_token', 'authToken', 'jwt', 'access_token'];
  possibleAuthKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`Found potential conflicting key: ${key}`);
    }
  });
  
  console.log('=== End Debug Info ===');
};

// Clear all OurJourney data
export const clearOurJourneyData = () => {
  console.log('Clearing OurJourney data...');
  localStorage.removeItem('ourjourney_token');
  // Clear any other app-specific data
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('ourjourney')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`Removed: ${key}`);
  });
  console.log('OurJourney data cleared. Please refresh the page.');
};

// Add to window for easy console access
if (typeof window !== 'undefined') {
  window.debugOurJourney = debugLocalStorage;
  window.clearOurJourney = clearOurJourneyData;
}