export const getCurrentPosition = (options = {}) =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });

const DEFAULT_LOCATION_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 30000, 
  timeout: 5000,    // Initial high-accuracy try: 5s
};

/**
 * Robust geolocation fetcher with automatic fallback for Laptops/Desktops
 */
export const getCurrentCoordinates = async (options = {}) => {
  try {
    // Stage 1: Try with requested settings (default High Accuracy)
    return await fetchPos({
      ...DEFAULT_LOCATION_OPTIONS,
      ...options,
    });
  } catch (error) {
    // Stage 2: Fallback for Timeout or signal issues
    const isTimeout = error?.code === 3; // TIMEOUT
    const isUnavailable = error?.code === 2; // POSITION_UNAVAILABLE
    
    if (isTimeout || isUnavailable) {
      console.warn("Geolocation: Primary request failed, attempting fallback...", error);
      
      try {
        // Fallback: Disable High Accuracy, Increase Timeout, allow older Cache
        return await fetchPos({
          ...options,
          enableHighAccuracy: false,
          maximumAge: 600000, // 10 mins cache for stability
          timeout: 10000,     // Give another 10s (Total 15s)
        });
      } catch (fallbackError) {
        throw fallbackError;
      }
    }
    
    throw error;
  }
};

const fetchPos = async (options) => {
  const position = await getCurrentPosition(options);
  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy,
    timestamp: position.timestamp
  };
};

export const getGeolocationErrorMessage = (error, fallbackMessage) => {
  const code = error?.code;
  if (code === 1) { // PERMISSION_DENIED
    return "Location access blocked. Please allow location permission in your browser and Windows privacy settings.";
  }
  if (code === 2) { // POSITION_UNAVAILABLE
    return "Location signal unavailable. Ensure your Wi-Fi/GPS is active and try again.";
  }
  if (code === 3) { // TIMEOUT
    return "Location request timed out. This often happens on laptops; please try moving closer to a window or ensure Wi-Fi is on.";
  }
  return fallbackMessage || "Unable to fetch your current location. Please check your system settings.";
};
