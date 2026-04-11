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
  timeout: 10000,
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
    };
  }
};

export const getGeolocationErrorMessage = (error, fallbackMessage) => {
  switch (error?.code) {
    case error?.PERMISSION_DENIED:
      return "Location access blocked. Allow location permission in your browser and OS settings.";
    case error?.POSITION_UNAVAILABLE:
      return "Current location is unavailable right now. Make sure GPS/location services are on and try again.";
    case error?.TIMEOUT:
      return "Location request timed out. Move to an open area or wait a few seconds and try again.";
    default:
      return fallbackMessage || "Unable to fetch your current location.";
  }
};
