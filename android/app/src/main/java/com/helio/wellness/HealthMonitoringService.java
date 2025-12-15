package com.helio.wellness;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;
import org.json.JSONArray;
import org.json.JSONObject;

public class HealthMonitoringService extends Service implements SensorEventListener, LocationListener {

    private static final String CHANNEL_ID = "HealthMonitoringChannel";
    private static final int NOTIFICATION_ID = 3;
    private static final String PREFS_NAME = "HealthMonitoringPrefs";
    
    private SensorManager sensorManager;
    private LocationManager locationManager;
    private Sensor stepCounterSensor;
    private Sensor accelerometerSensor;
    private Sensor heartRateSensor;
    private SharedPreferences prefs;
    
    // Monitoring parameters
    private static final long STILLNESS_THRESHOLD = 2 * 60 * 60 * 1000; // 2 hours
    private static final long LOCATION_STUCK_THRESHOLD = 4 * 60 * 60 * 1000; // 4 hours
    private static final float HEART_RATE_HIGH = 140.0f;
    private static final float HEART_RATE_LOW = 40.0f;
    private static final float LOCATION_STUCK_RADIUS = 50.0f; // 50 meters
    private static final long DEBOUNCE_TIME = 10000; // 10 seconds between alerts
    
    // State tracking
    private long lastMovementTime = 0;
    private long lastStepTime = 0;
    private int lastStepCount = 0;
    private float lastAccelVariance = 0;
    private float currentHeartRate = 0;
    private Location lastLocation = null;
    private long locationStartTime = 0;
    private long lastAlertTime = 0;
    private JSONArray locationHistory = new JSONArray();

    @Override
    public void onCreate() {
        super.onCreate();
        
        // Initialize sensors
        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        stepCounterSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
        accelerometerSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        heartRateSensor = sensorManager.getDefaultSensor(Sensor.TYPE_HEART_RATE);
        
        // Initialize GPS
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        
        prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        
        // Load saved state
        lastMovementTime = prefs.getLong("lastMovementTime", System.currentTimeMillis());
        lastStepCount = prefs.getInt("lastStepCount", 0);
        
        android.util.Log.d("HealthMonitor", "Service created - Sensors available: Steps=" + 
            (stepCounterSensor != null) + ", Accel=" + (accelerometerSensor != null) + 
            ", HR=" + (heartRateSensor != null));
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        android.util.Log.d("HealthMonitor", "⚡ Starting health monitoring service");
        
        try {
            // Create notification channel
            createNotificationChannel();
            
            // Create persistent notification
            Intent notificationIntent = new Intent(this, MainActivity.class);
            notificationIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                0,
                notificationIntent,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
            );

            Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("🩺 Health Monitoring Active")
                .setContentText("24/7 protection - Heart Rate, Movement, Location")
                .setSmallIcon(android.R.drawable.ic_menu_compass)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .setAutoCancel(false)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
                .build();

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(NOTIFICATION_ID, notification, 
                    android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH | 
                    android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
            } else {
                startForeground(NOTIFICATION_ID, notification);
            }
            
            // Register sensor listeners
            if (stepCounterSensor != null) {
                sensorManager.registerListener(this, stepCounterSensor, SensorManager.SENSOR_DELAY_NORMAL);
                android.util.Log.d("HealthMonitor", "✅ Step counter registered");
            }
            
            if (accelerometerSensor != null) {
                sensorManager.registerListener(this, accelerometerSensor, SensorManager.SENSOR_DELAY_NORMAL);
                android.util.Log.d("HealthMonitor", "✅ Accelerometer registered");
            }
            
            if (heartRateSensor != null) {
                sensorManager.registerListener(this, heartRateSensor, SensorManager.SENSOR_DELAY_NORMAL);
                android.util.Log.d("HealthMonitor", "✅ Heart rate sensor registered");
            } else {
                android.util.Log.w("HealthMonitor", "⚠️ Heart rate sensor not available on this device");
            }
            
            // Start GPS tracking
            try {
                locationManager.requestLocationUpdates(
                    LocationManager.GPS_PROVIDER,
                    60000, // 1 minute
                    50, // 50 meters
                    this
                );
                android.util.Log.d("HealthMonitor", "✅ GPS tracking started");
            } catch (SecurityException e) {
                android.util.Log.e("HealthMonitor", "❌ GPS permission denied", e);
            }
            
            // Start monitoring loop
            startMonitoringLoop();
            
        } catch (Exception e) {
            android.util.Log.e("HealthMonitor", "❌ FATAL ERROR in onStartCommand", e);
        }

        return START_STICKY;
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_STEP_COUNTER) {
            int currentSteps = (int) event.values[0];
            
            // Check if steps increased (movement detected)
            if (currentSteps > lastStepCount) {
                lastMovementTime = System.currentTimeMillis();
                lastStepTime = System.currentTimeMillis();
                lastStepCount = currentSteps;
                
                // Save to SharedPreferences
                prefs.edit()
                    .putLong("lastMovementTime", lastMovementTime)
                    .putInt("lastStepCount", lastStepCount)
                    .apply();
            }
        }
        
        if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            // Calculate acceleration variance (detect micro-movements)
            float x = event.values[0];
            float y = event.values[1];
            float z = event.values[2];
            float magnitude = (float) Math.sqrt(x*x + y*y + z*z);
            
            // Simple variance calculation (deviation from gravity ~9.8 m/s²)
            lastAccelVariance = Math.abs(magnitude - 9.8f);
            
            // If significant movement detected (not just lying still)
            if (lastAccelVariance > 0.5f) {
                lastMovementTime = System.currentTimeMillis();
                prefs.edit().putLong("lastMovementTime", lastMovementTime).apply();
            }
            
            // Save current variance
            prefs.edit().putFloat("accelVariance", lastAccelVariance).apply();
        }
        
        if (event.sensor.getType() == Sensor.TYPE_HEART_RATE) {
            currentHeartRate = event.values[0];
            
            // Save to SharedPreferences
            prefs.edit()
                .putFloat("currentHeartRate", currentHeartRate)
                .putLong("heartRateTimestamp", System.currentTimeMillis())
                .apply();
            
            // Check for abnormal heart rate
            checkHeartRate(currentHeartRate);
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // Not used
    }

    @Override
    public void onLocationChanged(Location location) {
        android.util.Log.d("HealthMonitor", "📍 GPS update: " + location.getLatitude() + ", " + location.getLongitude());
        
        try {
            // Save location to history
            JSONObject locationObj = new JSONObject();
            locationObj.put("lat", location.getLatitude());
            locationObj.put("lon", location.getLongitude());
            locationObj.put("accuracy", location.getAccuracy());
            locationObj.put("time", System.currentTimeMillis());
            
            locationHistory.put(locationObj);
            
            // Keep last 100 locations
            if (locationHistory.length() > 100) {
                JSONArray newHistory = new JSONArray();
                for (int i = locationHistory.length() - 100; i < locationHistory.length(); i++) {
                    newHistory.put(locationHistory.get(i));
                }
                locationHistory = newHistory;
            }
            
            // Save to SharedPreferences
            prefs.edit()
                .putString("locationHistory", locationHistory.toString())
                .putFloat("lastLatitude", (float) location.getLatitude())
                .putFloat("lastLongitude", (float) location.getLongitude())
                .putLong("locationTimestamp", System.currentTimeMillis())
                .apply();
            
            // Check if stuck in same location
            checkLocationStuck(location);
            
            lastLocation = location;
            
        } catch (Exception e) {
            android.util.Log.e("HealthMonitor", "❌ Error processing location", e);
        }
    }

    @Override
    public void onStatusChanged(String provider, int status, Bundle extras) {}

    @Override
    public void onProviderEnabled(String provider) {
        android.util.Log.d("HealthMonitor", "📍 GPS enabled");
    }

    @Override
    public void onProviderDisabled(String provider) {
        android.util.Log.w("HealthMonitor", "⚠️ GPS disabled");
    }

    private void startMonitoringLoop() {
        // Check for anomalies every 30 seconds
        new Thread(() -> {
            while (true) {
                try {
                    Thread.sleep(30000); // 30 seconds
                    
                    // Check stillness
                    long stillnessDuration = System.currentTimeMillis() - lastMovementTime;
                    prefs.edit().putLong("stillnessDuration", stillnessDuration).apply();
                    
                    if (stillnessDuration > STILLNESS_THRESHOLD) {
                        triggerAlert("stillness", "No movement detected for " + 
                            (stillnessDuration / (60 * 60 * 1000)) + " hours");
                    }
                    
                    // Update notification with latest metrics
                    updateNotification();
                    
                } catch (InterruptedException e) {
                    android.util.Log.e("HealthMonitor", "Monitoring loop interrupted", e);
                    break;
                }
            }
        }).start();
    }

    private void checkHeartRate(float heartRate) {
        if (heartRate <= 0) return; // Invalid reading
        
        long now = System.currentTimeMillis();
        if (now - lastAlertTime < DEBOUNCE_TIME) return; // Debounce
        
        if (heartRate > HEART_RATE_HIGH) {
            triggerAlert("heartRate", "Abnormally high heart rate: " + (int)heartRate + " bpm");
        } else if (heartRate < HEART_RATE_LOW) {
            triggerAlert("heartRate", "Abnormally low heart rate: " + (int)heartRate + " bpm");
        }
    }

    private void checkLocationStuck(Location location) {
        if (lastLocation == null) {
            lastLocation = location;
            locationStartTime = System.currentTimeMillis();
            return;
        }
        
        // Calculate distance from last location
        float distance = lastLocation.distanceTo(location);
        
        if (distance < LOCATION_STUCK_RADIUS) {
            // Still in same area
            long stuckDuration = System.currentTimeMillis() - locationStartTime;
            prefs.edit().putLong("locationStuckDuration", stuckDuration).apply();
            
            if (stuckDuration > LOCATION_STUCK_THRESHOLD) {
                long now = System.currentTimeMillis();
                if (now - lastAlertTime >= DEBOUNCE_TIME) {
                    triggerAlert("locationStuck", "User hasn't moved from location for " + 
                        (stuckDuration / (60 * 60 * 1000)) + " hours");
                }
            }
        } else {
            // Moved to new location
            locationStartTime = System.currentTimeMillis();
        }
    }

    private void triggerAlert(String alertType, String message) {
        android.util.Log.w("HealthMonitor", "⚠️ HEALTH ALERT: " + alertType + " - " + message);
        
        lastAlertTime = System.currentTimeMillis();
        
        // Save alert to SharedPreferences for JavaScript to poll
        prefs.edit()
            .putBoolean("alertTriggered", true)
            .putString("alertType", alertType)
            .putString("alertMessage", message)
            .putLong("alertTimestamp", System.currentTimeMillis())
            .apply();
        
        // Update notification
        updateNotification();
        
        // Launch full-screen alert activity (reuse FallAlertActivity)
        try {
            Intent intent = new Intent(this, FallAlertActivity.class);
            intent.putExtra("alertType", alertType);
            intent.putExtra("message", message);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | 
                           Intent.FLAG_ACTIVITY_CLEAR_TOP |
                           Intent.FLAG_ACTIVITY_NO_HISTORY);
            startActivity(intent);
            android.util.Log.d("HealthMonitor", "✅ Alert activity launched");
        } catch (Exception e) {
            android.util.Log.e("HealthMonitor", "❌ Failed to launch alert activity", e);
        }
    }

    private void updateNotification() {
        try {
            NotificationManager notificationManager = 
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            
            if (notificationManager == null) return;
            
            long stillnessDuration = System.currentTimeMillis() - lastMovementTime;
            String statusText = "24/7 protection - ";
            
            if (currentHeartRate > 0) {
                statusText += "HR: " + (int)currentHeartRate + " bpm, ";
            }
            
            if (stillnessDuration < 60000) {
                statusText += "Active";
            } else {
                statusText += "Still: " + (stillnessDuration / 60000) + " min";
            }
            
            Intent notificationIntent = new Intent(this, MainActivity.class);
            notificationIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                0,
                notificationIntent,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
            );

            Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("🩺 Health Monitoring Active")
                .setContentText(statusText)
                .setSmallIcon(android.R.drawable.ic_menu_compass)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .setAutoCancel(false)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .build();

            notificationManager.notify(NOTIFICATION_ID, notification);
            
        } catch (Exception e) {
            android.util.Log.e("HealthMonitor", "❌ Error updating notification", e);
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Health Monitoring Service",
                NotificationManager.IMPORTANCE_DEFAULT
            );
            channel.setDescription("24/7 health monitoring - heart rate, movement, location");
            channel.setShowBadge(true);
            channel.enableLights(false);
            channel.enableVibration(false);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
                android.util.Log.d("HealthMonitor", "✅ Notification channel created");
            }
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        
        // Unregister sensors
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
        }
        
        // Stop GPS
        if (locationManager != null) {
            locationManager.removeUpdates(this);
        }
        
        android.util.Log.d("HealthMonitor", "Service destroyed");
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
