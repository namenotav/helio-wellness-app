import { W as WebPlugin } from "./entry-1767948920134-index.js";
class SpeechRecognitionWeb extends WebPlugin {
  available() {
    throw this.unimplemented("Method not implemented on web.");
  }
  start(_options) {
    throw this.unimplemented("Method not implemented on web.");
  }
  stop() {
    throw this.unimplemented("Method not implemented on web.");
  }
  getSupportedLanguages() {
    throw this.unimplemented("Method not implemented on web.");
  }
  hasPermission() {
    throw this.unimplemented("Method not implemented on web.");
  }
  isListening() {
    throw this.unimplemented("Method not implemented on web.");
  }
  requestPermission() {
    throw this.unimplemented("Method not implemented on web.");
  }
  checkPermissions() {
    throw this.unimplemented("Method not implemented on web.");
  }
  requestPermissions() {
    throw this.unimplemented("Method not implemented on web.");
  }
}
const SpeechRecognition = new SpeechRecognitionWeb();
export {
  SpeechRecognition,
  SpeechRecognitionWeb
};
