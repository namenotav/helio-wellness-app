import { W as WebPlugin } from "./entry-1767948920134-index.js";
class BackgroundRunnerWeb extends WebPlugin {
  checkPermissions() {
    throw new Error("not available on web");
  }
  requestPermissions() {
    throw new Error("not available on web");
  }
  registerBackgroundTask() {
    throw new Error("not available on web");
  }
  dispatchEvent(_options) {
    throw new Error("not available on web");
  }
  async addListener(_eventName, _listenerFunc) {
    throw new Error("not available on web");
  }
  async removeNotificationListeners() {
    throw new Error("not available on web");
  }
}
export {
  BackgroundRunnerWeb
};
