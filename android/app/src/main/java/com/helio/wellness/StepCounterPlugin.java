package com.helio.wellness;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import androidx.core.app.ActivityCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "StepCounter",
    permissions = {
        @Permission(
            alias = "activityRecognition",
            strings = { Manifest.permission.ACTIVITY_RECOGNITION }
        )
    }
)
public class StepCounterPlugin extends Plugin implements SensorEventListener {

    private SensorManager sensorManager;
    private Sensor stepCounterSensor;
    private int initialStepCount = -1;
    private int currentStepCount = 0;
    private boolean isListening = false;

    @Override
    public void load() {
        super.load();
        sensorManager = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
        stepCounterSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject result = new JSObject();
        boolean available = stepCounterSensor != null;
        result.put("available", available);
        if (available) {
            android.util.Log.d("StepCounter", "✅ TYPE_STEP_COUNTER sensor found");
        } else {
            android.util.Log.w("StepCounter", "❌ TYPE_STEP_COUNTER sensor NOT found");
        }
        call.resolve(result);
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
            // Check if permission is already granted
            if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.ACTIVITY_RECOGNITION) 
                == PackageManager.PERMISSION_GRANTED) {
                JSObject result = new JSObject();
                result.put("granted", true);
                call.resolve(result);
            } else {
                requestPermissionForAlias("activityRecognition", call, "permissionCallback");
            }
        } else {
            JSObject result = new JSObject();
            result.put("granted", true);
            call.resolve(result);
        }
    }

    @PermissionCallback
    private void permissionCallback(PluginCall call) {
        JSObject result = new JSObject();
        if (getPermissionState("activityRecognition") == com.getcapacitor.PermissionState.GRANTED) {
            result.put("granted", true);
            android.util.Log.d("StepCounter", "✅ Activity recognition permission granted by user");
        } else {
            result.put("granted", false);
            android.util.Log.w("StepCounter", "❌ Activity recognition permission denied");
        }
        call.resolve(result);
    }

    @PluginMethod
    public void start(PluginCall call) {
        if (stepCounterSensor == null) {
            android.util.Log.e("StepCounter", "Sensor not available on device");
            call.reject("Step counter sensor not available on this device");
            return;
        }

        if (isListening) {
            android.util.Log.d("StepCounter", "Already listening");
            call.resolve();
            return;
        }

        android.util.Log.d("StepCounter", "Attempting to register listener...");
        boolean registered = sensorManager.registerListener(
            this,
            stepCounterSensor,
            SensorManager.SENSOR_DELAY_NORMAL
        );

        if (registered) {
            isListening = true;
            JSObject result = new JSObject();
            result.put("started", true);
            call.resolve(result);
        } else {
            call.reject("Failed to register step counter listener");
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (isListening) {
            sensorManager.unregisterListener(this);
            isListening = false;
            initialStepCount = -1;
        }
        
        JSObject result = new JSObject();
        result.put("stopped", true);
        call.resolve(result);
    }

    @PluginMethod
    public void getStepCount(PluginCall call) {
        JSObject result = new JSObject();
        result.put("steps", currentStepCount);
        call.resolve(result);
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_STEP_COUNTER) {
            int totalSteps = (int) event.values[0];
            
            // Initialize on first reading
            if (initialStepCount == -1) {
                initialStepCount = totalSteps;
                currentStepCount = 0;
                android.util.Log.d("StepCounter", "Initialized with baseline: " + totalSteps);
            } else {
                currentStepCount = totalSteps - initialStepCount;
            }

            if (currentStepCount % 10 == 0 && currentStepCount > 0) {
                android.util.Log.d("StepCounter", "Hardware steps: " + currentStepCount);
            }

            // Notify JavaScript listeners
            JSObject data = new JSObject();
            data.put("steps", currentStepCount);
            notifyListeners("stepCountUpdate", data);
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // Not used but required by interface
    }

    @Override
    protected void handleOnDestroy() {
        if (isListening) {
            sensorManager.unregisterListener(this);
        }
        super.handleOnDestroy();
    }
}
