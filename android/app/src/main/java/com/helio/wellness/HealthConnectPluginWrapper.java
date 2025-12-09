package com.helio.wellness;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Java wrapper for Kotlin HealthConnectPlugin
 * Capacitor 7's registerPlugin() doesn't support Kotlin classes directly
 */
@CapacitorPlugin(name = "HealthConnect")
public class HealthConnectPluginWrapper extends Plugin {

    private HealthConnectPlugin kotlinPlugin;

    @Override
    public void load() {
        super.load();
        android.util.Log.d("HealthConnect", "🟢 WRAPPER: load() called");
        try {
            kotlinPlugin = new HealthConnectPlugin();
            kotlinPlugin.setBridge(this.getBridge());
            kotlinPlugin.load();
            android.util.Log.d("HealthConnect", "✅ WRAPPER: Kotlin plugin initialized");
        } catch (Exception e) {
            android.util.Log.e("HealthConnect", "❌ WRAPPER: Failed to init Kotlin plugin", e);
        }
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        kotlinPlugin.isAvailable(call);
    }

    @PluginMethod
    public void openHealthConnectSettings(PluginCall call) {
        kotlinPlugin.openHealthConnectSettings(call);
    }

    @PluginMethod
    public void getSteps(PluginCall call) {
        kotlinPlugin.getSteps(call);
    }

    @PluginMethod
    public void hasPermissions(PluginCall call) {
        kotlinPlugin.hasPermissions(call);
    }
}
