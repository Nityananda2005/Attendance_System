export const getCurrentPosition = (options = {}) =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });

const DEFAULT_LOCATION_OPTIONS = {
  enableHighAccuracy: false,
  maximumAge: 60000,
  timeout: 15000, // Increased to 15s for slower laptop fixes
};

export const getCurrentCoordinates = async (options = {}) => {
  try {
    const position = await getCurrentPosition({
      ...DEFAULT_LOCATION_OPTIONS,
      ...options,
    });

    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };
  } catch (error) {
    const shouldRetry = error?.code === error?.TIMEOUT || error?.code === error?.POSITION_UNAVAILABLE;

    if (!shouldRetry) {
      throw error;
    }

    const retryPosition = await getCurrentPosition({
      ...options,
      enableHighAccuracy: false,
      maximumAge: 120000,
      timeout: 20000,
    });

    return {
      lat: retryPosition.coords.latitude,
      lng: retryPosition.coords.longitude,
      accuracy: retryPosition.coords.accuracy,
    };
  }
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
    return "Location request timed out. Move closer to a window or try again in a moment.";
  }
  return fallbackMessage || "Unable to fetch your current location. Please check your system settings.";
};
