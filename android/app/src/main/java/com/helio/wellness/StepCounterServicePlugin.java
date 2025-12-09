package com.helio.wellness;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "StepCounterService")
public class StepCounterServicePlugin extends Plugin {

    private static final String PREFS_NAME = "StepCounterPrefs";

    @PluginMethod
    public void startService(PluginCall call) {
        try {
            Context context = getContext();
            Intent serviceIntent = new Intent(context, StepCounterForegroundService.class);
            
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent);
            } else {
                context.startService(serviceIntent);
            }
            
            JSObject result = new JSObject();
            result.put("started", true);
            call.resolve(result);
            android.util.Log.d("StepServicePlugin", "✅ Foreground service started");
        } catch (Exception e) {
            call.reject("Failed to start service: " + e.getMessage());
            android.util.Log.e("StepServicePlugin", "❌ Failed to start service", e);
        }
    }

    @PluginMethod
    public void stopService(PluginCall call) {
        try {
            Context context = getContext();
            Intent serviceIntent = new Intent(context, StepCounterForegroundService.class);
            context.stopService(serviceIntent);
            
            JSObject result = new JSObject();
            result.put("stopped", true);
            call.resolve(result);
            android.util.Log.d("StepServicePlugin", "Service stopped");
        } catch (Exception e) {
            call.reject("Failed to stop service: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getSteps(PluginCall call) {
        try {
            SharedPreferences prefs = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            int steps = prefs.getInt("currentStepCount", 0);
            
            JSObject result = new JSObject();
            result.put("steps", steps);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to get steps: " + e.getMessage());
        }
    }
}
