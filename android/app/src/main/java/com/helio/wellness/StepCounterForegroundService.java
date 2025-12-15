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
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import org.json.JSONArray;
import org.json.JSONObject;

public class StepCounterForegroundService extends Service implements SensorEventListener {

    private static final String CHANNEL_ID = "StepCounterChannel";
    private static final int NOTIFICATION_ID = 1;
    private static final String PREFS_NAME = "StepCounterPrefs";
    
    private SensorManager sensorManager;
    private Sensor stepCounterSensor;
    private int initialStepCount = -1;
    private int currentStepCount = 0;
    private SharedPreferences prefs;
    private String currentDate = "";

    @Override
    public void onCreate() {
        super.onCreate();
        
        // Initialize sensor
        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        stepCounterSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
        prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        
        // Load saved step count and date
        currentStepCount = prefs.getInt("currentStepCount", 0);
        initialStepCount = prefs.getInt("initialStepCount", -1);
        currentDate = prefs.getString("currentDate", "");
        
        // 🔥 CHECK IF SERVICE RESTARTED ON A NEW DAY
        String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
        if (!currentDate.isEmpty() && !today.equals(currentDate)) {
            android.util.Log.d("StepService", "🌅 Service started on NEW DAY: " + currentDate + " → " + today);
            
            // Archive yesterday's steps if we have data
            if (initialStepCount != -1 && currentStepCount > 0) {
                int yesterdaySteps = Math.abs(currentStepCount - initialStepCount);
                saveStepHistory(currentDate, yesterdaySteps);
                android.util.Log.d("StepService", "📝 Archived " + currentDate + ": " + yesterdaySteps + " steps");
            }
            
            // RESET for new day (will set proper baseline on first sensor reading)
            initialStepCount = -1;  // Force re-initialization
            currentDate = today;
            
            prefs.edit()
                .putString("currentDate", currentDate)
                .putInt("initialStepCount", -1)
                .apply();
                
            android.util.Log.d("StepService", "✅ Reset for new day: " + today);
        }
        
        android.util.Log.d("StepService", "Service created. Current steps: " + currentStepCount + " | Baseline: " + initialStepCount + " | Date: " + currentDate);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        android.util.Log.d("StepService", "⚡⚡⚡ onStartCommand called - MUST create notification in 5 seconds or Android KILLS service!");
        
        try {
            // Create notification channel FIRST
            createNotificationChannel();
            android.util.Log.d("StepService", "✅ Notification channel created");
            
            // Create notification - MUST happen immediately!
            Intent notificationIntent = new Intent(this, MainActivity.class);
            notificationIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                0,
                notificationIntent,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
            );

            // Calculate daily steps for initial notification
            int dailySteps = (initialStepCount != -1) ? Math.abs(currentStepCount - initialStepCount) : 0;
            
            Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("🏃 " + dailySteps + " steps today")
                .setContentText("24/7 tracking active - Tap to open")
                .setSmallIcon(android.R.drawable.ic_menu_compass)
                .setContentIntent(pendingIntent)
                .setOngoing(true)  // Cannot be dismissed by user
                .setAutoCancel(false)  // Don't remove when tapped
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)  // Android 12+ immediate display
                .build();

            android.util.Log.d("StepService", "✅ Notification built, calling startForeground() NOW");
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // Android 10+ requires foregroundServiceType
                startForeground(NOTIFICATION_ID, notification, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH);
                android.util.Log.d("StepService", "✅ startForeground() with HEALTH type");
            } else {
                startForeground(NOTIFICATION_ID, notification);
                android.util.Log.d("StepService", "✅ startForeground() called");
            }
            
            // Register step counter listener AFTER foreground notification is posted
            if (stepCounterSensor != null) {
                sensorManager.registerListener(
                    this,
                    stepCounterSensor,
                    SensorManager.SENSOR_DELAY_NORMAL
                );
                android.util.Log.d("StepService", "✅ Step counter listener registered - TYPE_STEP_COUNTER sensor found");
            } else {
                android.util.Log.e("StepService", "❌ Step counter sensor not available on this device");
            }
            
        } catch (Exception e) {
            android.util.Log.e("StepService", "❌ FATAL ERROR in onStartCommand", e);
            e.printStackTrace();
        }

        return START_STICKY; // Service will restart if killed by Android
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_STEP_COUNTER) {
            int totalSteps = (int) event.values[0];
            
            // Store RAW sensor value
            currentStepCount = totalSteps;
            
            // 🔥 CHECK FOR MIDNIGHT RESET (date change)
            String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
            
            if (!today.equals(currentDate)) {
                // NEW DAY DETECTED!
                android.util.Log.d("StepService", "🌅 MIDNIGHT RESET: " + currentDate + " → " + today);
                
                // Save yesterday's final step count to history (if we have data)
                if (!currentDate.isEmpty() && initialStepCount != -1) {
                    int yesterdaySteps = Math.abs(currentStepCount - initialStepCount);
                    saveStepHistory(currentDate, yesterdaySteps);
                    android.util.Log.d("StepService", "📝 Archived " + currentDate + ": " + yesterdaySteps + " steps");
                }
                
                // Reset baseline for new day
                initialStepCount = totalSteps;
                currentDate = today;
                
                // Persist to storage
                prefs.edit()
                    .putInt("initialStepCount", initialStepCount)
                    .putString("currentDate", currentDate)
                    .apply();
                
                // Sync to CapacitorStorage
                SharedPreferences capacitorPrefs = getSharedPreferences("CapacitorStorage", MODE_PRIVATE);
                capacitorPrefs.edit()
                    .putString("wellnessai_stepBaseline", String.valueOf(totalSteps))
                    .putString("wellnessai_stepBaselineDate", today)
                    .apply();
                    
                android.util.Log.d("StepService", "✅ New baseline: " + totalSteps + " for " + today);
            }
            
            // Initialize baseline on FIRST READING EVER (service first install)
            if (initialStepCount == -1) {
                initialStepCount = totalSteps;
                currentDate = today;
                
                prefs.edit()
                    .putInt("initialStepCount", initialStepCount)
                    .putString("currentDate", currentDate)
                    .apply();
                
                // Sync to CapacitorStorage
                SharedPreferences capacitorPrefs = getSharedPreferences("CapacitorStorage", MODE_PRIVATE);
                capacitorPrefs.edit()
                    .putString("wellnessai_stepBaseline", String.valueOf(totalSteps))
                    .putString("wellnessai_stepBaselineDate", today)
                    .apply();
                
                android.util.Log.d("StepService", "📍 FIRST BASELINE: " + totalSteps + " on " + today);
            }
            
            // Calculate today's steps (always from baseline set at midnight or service start)
            int todaySteps = Math.abs(currentStepCount - initialStepCount);
            
            // 🔥 SAVE calculated steps to CapacitorStorage for JS Dashboard
            SharedPreferences capacitorPrefs = getSharedPreferences("CapacitorStorage", MODE_PRIVATE);
            capacitorPrefs.edit()
                .putString("wellnessai_todaySteps", "\"" + todaySteps + "\"")  // JSON-encoded string
                .apply();
            
            // 🔥 REAL-TIME SYNC: Update step history with current day's steps
            saveStepHistory(currentDate, todaySteps);
            
            // Save RAW value to internal storage
            prefs.edit().putInt("currentStepCount", currentStepCount).apply();
            
            // Update notification
            updateNotification();
            
            // Log every 10 steps to reduce log spam
            if (todaySteps % 10 == 0) {
                android.util.Log.d("StepService", "📊 Steps: " + todaySteps + " (raw: " + totalSteps + " - baseline: " + initialStepCount + " - date: " + currentDate + ")");
            }
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // Not used
    }

    private void updateNotification() {
        try {
            NotificationManager notificationManager = 
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            
            if (notificationManager == null) {
                android.util.Log.e("StepService", "❌ NotificationManager is null!");
                return;
            }
            
            // 🔥 Use internal baseline for accurate calculation
            int displaySteps = Math.abs(currentStepCount - initialStepCount);
            
            android.util.Log.d("StepService", "📊 Notification update - Raw: " + currentStepCount + " | Baseline: " + initialStepCount + " | Display: " + displaySteps);
            
            Intent notificationIntent = new Intent(this, MainActivity.class);
            notificationIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                0,
                notificationIntent,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
            );

            Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("🏃 " + displaySteps + " steps today")
                .setContentText("24/7 tracking active - Tap to open")
                .setSmallIcon(android.R.drawable.ic_menu_compass)
                .setContentIntent(pendingIntent)
                .setOngoing(true)  // Cannot be dismissed
                .setAutoCancel(false)  // Don't remove when tapped
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)  // Changed from LOW to DEFAULT
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .build();

            notificationManager.notify(NOTIFICATION_ID, notification);
            
        } catch (Exception e) {
            android.util.Log.e("StepService", "❌ Error updating notification", e);
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            android.util.Log.d("StepService", "Creating notification channel for Android O+");
            
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Step Counter Service",
                NotificationManager.IMPORTANCE_DEFAULT  // Changed from LOW to DEFAULT for visibility
            );
            channel.setDescription("24/7 step tracking in background");
            channel.setShowBadge(true);
            channel.enableLights(false);
            channel.enableVibration(false);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
                android.util.Log.d("StepService", "✅ Notification channel created successfully");
            } else {
                android.util.Log.e("StepService", "❌ NotificationManager is null!");
            }
        }
    }

    /**
     * Save step count to daily history
     * Appends to wellnessai_stepHistory array in CapacitorStorage
     */
    private void saveStepHistory(String date, int steps) {
        try {
            SharedPreferences capacitorPrefs = getSharedPreferences("CapacitorStorage", MODE_PRIVATE);
            String existingHistory = capacitorPrefs.getString("wellnessai_stepHistory", "[]");
            
            // Parse existing history
            JSONArray history = new JSONArray(existingHistory);
            
            // Check if today already exists (update if so)
            boolean found = false;
            for (int i = 0; i < history.length(); i++) {
                JSONObject entry = history.getJSONObject(i);
                if (entry.getString("date").equals(date)) {
                    entry.put("steps", steps);
                    entry.put("timestamp", System.currentTimeMillis());
                    found = true;
                    break;
                }
            }
            
            // Add new entry if not found
            if (!found) {
                JSONObject newEntry = new JSONObject();
                newEntry.put("date", date);
                newEntry.put("steps", steps);
                newEntry.put("timestamp", System.currentTimeMillis());
                history.put(newEntry);
            }
            
            // Save back to storage
            capacitorPrefs.edit()
                .putString("wellnessai_stepHistory", history.toString())
                .apply();
                
            android.util.Log.d("StepService", "💾 Step history saved: " + date + " = " + steps + " steps");
        } catch (Exception e) {
            android.util.Log.e("StepService", "❌ Failed to save step history", e);
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
        }
        // Save final count
        prefs.edit()
            .putInt("currentStepCount", currentStepCount)
            .putString("currentDate", currentDate)
            .apply();
        android.util.Log.d("StepService", "Service destroyed. Steps saved: " + currentStepCount + " (Date: " + currentDate + ")");
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
