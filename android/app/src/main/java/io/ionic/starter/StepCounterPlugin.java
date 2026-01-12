package io.ionic.starter;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "StepCounter")
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
        result.put("available", stepCounterSensor != null);
        call.resolve(result);
    }

    @PluginMethod
    public void start(PluginCall call) {
        if (stepCounterSensor == null) {
            call.reject("Step counter sensor not available on this device");
            return;
        }

        if (isListening) {
            call.resolve();
            return;
        }

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
            } else {
                currentStepCount = totalSteps - initialStepCount;
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
