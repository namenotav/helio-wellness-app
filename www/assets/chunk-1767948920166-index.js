const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunk-1767948920167-web.js","assets/entry-1767948920134-index.js","assets/asset-1767948921966-index.css"])))=>i.map(i=>d[i]);
import { d as registerPlugin, _ as __vitePreload } from "./entry-1767948920134-index.js";
const SpeechRecognition = registerPlugin("SpeechRecognition", {
  web: () => __vitePreload(() => import("./chunk-1767948920167-web.js"), true ? __vite__mapDeps([0,1,2]) : void 0).then((m) => new m.SpeechRecognitionWeb())
});
export {
  SpeechRecognition
};
