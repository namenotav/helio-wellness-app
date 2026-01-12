const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunk-1767948920213-web.js","assets/entry-1767948920134-index.js","assets/asset-1767948921966-index.css"])))=>i.map(i=>d[i]);
import { d as registerPlugin, _ as __vitePreload, P as Preferences } from "./entry-1767948920134-index.js";
registerPlugin("BackgroundRunner", {
  web: () => __vitePreload(() => import("./chunk-1767948920213-web.js"), true ? __vite__mapDeps([0,1,2]) : void 0).then((m) => new m.BackgroundRunnerWeb())
});
class BackgroundRunnerService {
  constructor() {
    this.isRunning = false;
  }
  // Check if background runner is available
  async isAvailable() {
    try {
      return true;
    } catch {
      return false;
    }
  }
  // Start background tracking (steps + fall detection)
  async start() {
    try {
      if (this.isRunning) {
        if (false) ;
        return { success: true };
      }
      await Preferences.set({
        key: "background_runner_enabled",
        value: "true"
      });
      this.isRunning = true;
      if (false) ;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  // Stop background tracking
  async stop() {
    try {
      await Preferences.set({
        key: "background_runner_enabled",
        value: "false"
      });
      this.isRunning = false;
      if (false) ;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  // Check if background runner is enabled
  async isEnabled() {
    try {
      const { value } = await Preferences.get({ key: "background_runner_enabled" });
      return value === "true";
    } catch {
      return false;
    }
  }
  // Get background status
  async getStatus() {
    const enabled = await this.isEnabled();
    return {
      enabled,
      available: await this.isAvailable(),
      features: ["step_counting", "fall_detection", "gps_tracking"]
    };
  }
}
const backgroundRunnerService = new BackgroundRunnerService();
export {
  backgroundRunnerService,
  backgroundRunnerService as default
};
