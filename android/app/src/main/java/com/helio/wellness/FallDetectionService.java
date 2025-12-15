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
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;

public class FallDetectionService extends Service implements SensorEventListener {

    private static final String CHANNEL_ID = "FallDetectionChannel";
    private static final int NOTIFICATION_ID = 2;
    private static final String PREFS_NAME = "FallDetectionPrefs";
    
    private SensorManager sensorManager;
    private Sensor accelerometerSensor;
    private SharedPreferences prefs;
    
    // Fall detection parameters
    private static final float FALL_THRESHOLD = 25.0f; // m/s² - sudden acceleration spike
    private static final long DEBOUNCE_TIME = 10000; // 10 seconds between fall alerts
    private long lastFallTime = 0;

    @Override
    public void onCreate() {
        super.onCreate();
        
        // Initialize sensor
        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        accelerometerSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        
        android.util.Log.d("FallService", "Service created");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        android.util.Log.d("FallService", "⚡ onStartCommand - Starting fall detection service");
        
        try {
            // Create notification channel FIRST
            createNotificationChannel();
            android.util.Log.d("FallService", "✅ Notification channel created");
            
            // Create notification - MUST happen immediately!
            Intent notificationIntent = new Intent(this, MainActivity.class);
            notificationIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                0,
                notificationIntent,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
            );

            Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("🛡️ Fall Detection Active")
                .setContentText("24/7 protection enabled - Tap to open")
                .setSmallIcon(android.R.drawable.ic_menu_compass)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .setAutoCancel(false)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
                .build();

            android.util.Log.d("FallService", "✅ Notification built, calling startForeground()");
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(NOTIFICATION_ID, notification, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH);
                android.util.Log.d("FallService", "✅ startForeground() with HEALTH type");
            } else {
                startForeground(NOTIFICATION_ID, notification);
                android.util.Log.d("FallService", "✅ startForeground() called");
            }
            
            // Register accelerometer listener AFTER foreground notification is posted
            if (accelerometerSensor != null) {
                sensorManager.registerListener(
                    this,
                    accelerometerSensor,
                    SensorManager.SENSOR_DELAY_NORMAL
                );
                android.util.Log.d("FallService", "✅ Accelerometer listener registered");
            } else {
                android.util.Log.e("FallService", "❌ Accelerometer sensor not available on this device");
            }
            
        } catch (Exception e) {
            android.util.Log.e("FallService", "❌ FATAL ERROR in onStartCommand", e);
            e.printStackTrace();
        }

        return START_STICKY; // Service will restart if killed by Android
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            float x = event.values[0];
            float y = event.values[1];
            float z = event.values[2];
            
            // Calculate total acceleration magnitude
            float magnitude = (float) Math.sqrt(x*x + y*y + z*z);
            
            // Detect sudden acceleration spike (fall/shake)
            if (magnitude > FALL_THRESHOLD) {
                long currentTime = System.currentTimeMillis();
                
                // Debounce - only trigger once per 10 seconds
                if (currentTime - lastFallTime > DEBOUNCE_TIME) {
                    lastFallTime = currentTime;
                    handleFallDetected(magnitude);
                }
            }
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // Not used
    }

    private void handleFallDetected(float magnitude) {
        android.util.Log.w("FallService", "⚠️ FALL DETECTED! Acceleration: " + magnitude + " m/s²");
        
        // Set flag in SharedPreferences for JavaScript to poll
        prefs.edit().putBoolean("fallDetected", true).apply();
        prefs.edit().putLong("fallTimestamp", System.currentTimeMillis()).apply();
        prefs.edit().putFloat("fallMagnitude", magnitude).apply();
        
        // Update notification
        updateNotification("⚠️ FALL DETECTED! " + String.format("%.1f", magnitude) + " m/s²");
        
        // Launch full-screen alert activity
        launchFallAlertActivity(magnitude);
    }
    
    private void launchFallAlertActivity(float magnitude) {
        try {
            android.util.Log.d("FallService", "🚨 Launching FallAlertActivity directly...");
            
            // DIRECT LAUNCH - Bypass notification system
            Intent intent = new Intent(this, FallAlertActivity.class);
            intent.putExtra("magnitude", magnitude);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | 
                           Intent.FLAG_ACTIVITY_CLEAR_TOP |
                           Intent.FLAG_ACTIVITY_NO_HISTORY);
            
            startActivity(intent);
            android.util.Log.d("FallService", "✅ FallAlertActivity launched directly");
            
            // Also send full-screen notification as backup
            sendFullScreenNotification(magnitude);
            
        } catch (Exception e) {
            android.util.Log.e("FallService", "❌ Failed to launch FallAlertActivity", e);
        }
    }
    
    private void sendFullScreenNotification(float magnitude) {
        try {
            NotificationManager notificationManager = 
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            
            if (notificationManager == null) return;
            
            // Create intent for full-screen alert
            Intent fullScreenIntent = new Intent(this, FallAlertActivity.class);
            fullScreenIntent.putExtra("magnitude", magnitude);
            fullScreenIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            
            PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
                this,
                999, // Unique request code for fall alerts
                fullScreenIntent,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
            );
            
            // Create HIGH PRIORITY notification with full-screen intent
            Notification alertNotification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("🚨 FALL DETECTED!")
                .setContentText("Tap to respond - Emergency alert active")
                .setSmallIcon(android.R.drawable.ic_dialog_alert)
                .setFullScreenIntent(fullScreenPendingIntent, true) // Force full-screen
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setAutoCancel(true)
                .build();
            
            // Send with different ID so it doesn't replace the service notification
            notificationManager.notify(999, alertNotification);
            android.util.Log.d("FallService", "📢 Full-screen notification sent");
            
        } catch (Exception e) {
            android.util.Log.e("FallService", "Error sending full-screen notification", e);
        }
    }

    private void updateNotification(String message) {
        try {
            NotificationManager notificationManager = 
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            
            if (notificationManager == null) {
                android.util.Log.e("FallService", "❌ NotificationManager is null!");
                return;
            }
            
            Intent notificationIntent = new Intent(this, MainActivity.class);
            notificationIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                0,
                notificationIntent,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
            );
            
            // Create full-screen intent for fall alert
            Intent fullScreenIntent = new Intent(this, FallAlertActivity.class);
            fullScreenIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
                this,
                1,
                fullScreenIntent,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
            );

            Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("🛡️ Fall Detection Active")
                .setContentText(message)
                .setSmallIcon(android.R.drawable.ic_menu_compass)
                .setContentIntent(pendingIntent)
                .setFullScreenIntent(fullScreenPendingIntent, true) // KEY: Triggers full-screen alert
                .setOngoing(true)
                .setAutoCancel(false)
                .setPriority(NotificationCompat.PRIORITY_MAX) // Changed to MAX for full-screen
                .setCategory(NotificationCompat.CATEGORY_ALARM) // Changed to ALARM for full-screen
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .build();

            notificationManager.notify(NOTIFICATION_ID, notification);
            
        } catch (Exception e) {
            android.util.Log.e("FallService", "❌ Error updating notification", e);
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            android.util.Log.d("FallService", "Creating notification channel for Android O+");
            
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Fall Detection Service",
                NotificationManager.IMPORTANCE_HIGH // Changed to HIGH for full-screen support
            );
            channel.setDescription("24/7 fall detection monitoring with emergency alerts");
            channel.setShowBadge(true);
            channel.enableLights(true);
            channel.setLightColor(android.graphics.Color.RED);
            channel.enableVibration(true);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            channel.setBypassDnd(true); // Bypass Do Not Disturb
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
                android.util.Log.d("FallService", "✅ Notification channel created successfully");
            } else {
                android.util.Log.e("FallService", "❌ NotificationManager is null!");
            }
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
        }
        android.util.Log.d("FallService", "Service destroyed");
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
