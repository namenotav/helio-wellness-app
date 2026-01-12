// Native GPS & Motion Tracking Service
import { Geolocation } from '@capacitor/geolocation';
import { Motion } from '@capacitor/motion';

// Get current GPS position
export const getCurrentPosition = async () => {
  try {
    const permission = await Geolocation.checkPermissions();
    if (permission.location !== 'granted') {
      await Geolocation.requestPermissions();
    }

    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      speed: position.coords.speed,
      heading: position.coords.heading,
      timestamp: position.timestamp
    };
  } catch (error) {
    if(import.meta.env.DEV)console.error('GPS error:', error);
    throw error;
  }
};

// Watch position for live tracking
let watchId = null;
export const startGPSTracking = async (callback) => {
  try {
    watchId = await Geolocation.watchPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }, (position, err) => {
      if (err) {
        if(import.meta.env.DEV)console.error('GPS tracking error:', err);
        return;
      }
      
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        speed: position.coords.speed, // meters/second
        timestamp: position.timestamp
      });
    });
    
    return watchId;
  } catch (error) {
    if(import.meta.env.DEV)console.error('GPS tracking start error:', error);
    throw error;
  }
};

// Stop GPS tracking
export const stopGPSTracking = async () => {
  if (watchId !== null) {
    await Geolocation.clearWatch({ id: watchId });
    watchId = null;
  }
};

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

// Calculate pace (min/km)
export const calculatePace = (distanceKm, timeSeconds) => {
  if (distanceKm === 0) return 0;
  const paceSeconds = timeSeconds / distanceKm;
  const minutes = Math.floor(paceSeconds / 60);
  const seconds = Math.round(paceSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Calculate calories burned (approximate)
export const calculateCaloriesBurned = (distanceKm, weightKg, activityType = 'running') => {
  const MET = {
    walking: 3.5,
    jogging: 7.0,
    running: 9.8,
    cycling: 8.0
  };
  
  const met = MET[activityType] || 7.0;
  const timeHours = distanceKm / 5; // Assuming ~5km/h average
  return Math.round(met * weightKg * timeHours);
};

// Get device motion/orientation data
export const startMotionTracking = async (callback) => {
  try {
    await Motion.addListener('accel', (event) => {
      callback({
        x: event.accelerationIncludingGravity.x,
        y: event.accelerationIncludingGravity.y,
        z: event.accelerationIncludingGravity.z
      });
    });
  } catch (error) {
    if(import.meta.env.DEV)console.error('Motion tracking error:', error);
  }
};

// Stop motion tracking
export const stopMotionTracking = async () => {
  await Motion.removeAllListeners();
};

// Export route as GPX format
export const exportRouteAsGPX = (routePoints, routeName = 'Helio Route') => {
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Helio" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${routeName}</name>
    <trkseg>
${routePoints.map(point => `      <trkpt lat="${point.latitude}" lon="${point.longitude}">
        <ele>${point.altitude || 0}</ele>
        <time>${new Date(point.timestamp).toISOString()}</time>
      </trkpt>`).join('\n')}
    </trkseg>
  </trk>
</gpx>`;
  
  return gpx;
};



