# Voice System Setup 🎤

## Current Voice Implementation ✅

### **TikTok TTS (Primary)** - FREE Forever
- **Status**: ✅ ACTIVE
- **Quality**: 9/10 (sounds like ElevenLabs "Aimee")
- **Cost**: $0 (100% FREE)
- **Voices**: 
  - `en_us_002` - Soft female (ultra-realistic)
  - `en_male_narration` - Deep male (calming)
- **Location**: `src/services/directAudioService.js`
- **Features**:
  - No API key required
  - No rate limits
  - Ultra-realistic AI voice
  - Works online only

### **Enhanced Native TTS (Fallback)** - Always Available
- **Status**: ✅ ACTIVE
- **Quality**: 7/10 (device quality)
- **Cost**: $0 (built into Android/iOS)
- **Settings**: Optimized for calm, soothing delivery
- **Features**:
  - Works offline
  - No internet required
  - Always available
  - Fast response

---

## Voice Usage Across App 🎯

| Feature | Voice System | Status |
|---------|-------------|---------|
| Breathing Exercises | TikTok TTS → Native | ✅ |
| AI Assistant | TikTok TTS → Native | ✅ |
| Workout Rep Counter | Native TTS | ✅ |
| Meditation | TikTok TTS → Native | ✅ |
| Voice Chat | TikTok TTS → Native | ✅ |

---

## Future Enhancement: Piper TTS 🚀

### **Piper TTS** - Best Quality Offline
- **Status**: ❌ NOT IMPLEMENTED (requires native plugin)
- **Quality**: 9/10 (neural network voice)
- **Cost**: $0 (open source)
- **Size**: ~15-50MB (model files)
- **Best for**: Privacy + offline use

### Implementation Requirements:
1. **Create Capacitor Plugin**:
   ```bash
   npx @capacitor/cli plugin:generate
   ```
   
2. **Add Native Code**:
   - Android: Integrate Piper native library
   - iOS: Integrate Piper native library
   
3. **Download Voice Models**:
   - Female: `en_US-lessac-medium.onnx` (17MB)
   - Male: `en_US-ryan-medium.onnx` (17MB)

4. **Integrate in App**:
   ```javascript
   import { PiperTTS } from './plugins/piper-tts';
   
   await PiperTTS.speak({
     text: "Hello world",
     voice: "en_US-lessac-medium"
   });
   ```

### Why Not Implemented Yet:
- Requires **custom Capacitor plugin** (native Android/iOS code)
- Adds **~30-50MB** to app size (voice models)
- Takes **2-3 days** to develop and test plugin
- Current TikTok TTS works great (sounds like ElevenLabs)

### When to Add Piper:
- ✅ If users demand offline voice
- ✅ If TikTok API becomes unreliable
- ✅ If privacy concerns increase
- ✅ If want 100% offline capability

---

## Current Voice Quality Comparison 📊

| Voice System | Quality | Cost | Offline | Implementation |
|--------------|---------|------|---------|----------------|
| **ElevenLabs** | ⭐⭐⭐⭐⭐ | $11/mo | ❌ | ✅ (has API key) |
| **TikTok TTS** | ⭐⭐⭐⭐⭐ | FREE | ❌ | ✅ **ACTIVE** |
| **Native TTS** | ⭐⭐⭐ | FREE | ✅ | ✅ **ACTIVE** |
| **Piper TTS** | ⭐⭐⭐⭐⭐ | FREE | ✅ | ❌ (needs plugin) |

---

## How It Works 🔧

### Voice Selection Flow:
```
User triggers voice
    ↓
Try TikTok TTS (FREE, sounds like ElevenLabs)
    ↓ (if fails)
Try Local MP3 files (breathing exercises)
    ↓ (if fails)
Use Enhanced Native TTS (always works)
```

### Code Location:
- **Main Service**: `src/services/directAudioService.js`
- **Breathing**: `src/services/breathingService.js` (uses directAudioService)
- **AI Assistant**: `src/components/AIAssistantModal.jsx` (uses directAudioService)
- **Dashboard**: `src/pages/NewDashboard.jsx` (uses directAudioService)

---

## Testing Voice 🧪

### Test in Browser Console:
```javascript
// Import service
const service = await import('./src/services/directAudioService');

// Test TikTok TTS
await service.default.speak("Hello, this is a test");

// Change voice
service.default.setVoice('male');
await service.default.speak("This is the male voice");
```

### Test in App:
1. Open Breathing Exercises → Start session
2. Open AI Assistant → Ask a question
3. Open Voice Chat → Speak to AI

---

## Voice API Endpoints 🌐

### TikTok TTS:
```
https://api16-normal-c-useast1a.tiktokv.com/media/api/text/speech/invoke/
?text_speaker=en_us_002
&req_text=Hello%20World
```

### ElevenLabs (if API key provided):
```
https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
Authorization: Bearer {API_KEY}
```

---

## Troubleshooting 🔧

### Voice not working:
1. Check internet connection (TikTok TTS needs online)
2. Check device volume
3. Check app permissions (microphone/audio)
4. Falls back to native TTS automatically

### Voice sounds robotic:
- TikTok TTS failed → using native TTS
- Check console logs for errors
- Verify internet connection

### Voice too fast/slow:
- Edit `directAudioService.js` → `voiceConfig` → `rate`
- TikTok TTS: Adjust text spacing in `generateVoiceURL()`
- Native TTS: Adjust in `speakWithTTS()` → `rate` parameter

---

## Credits 🙏

- **TikTok TTS**: Free realistic voice API
- **ElevenLabs**: Premium voice files (if API key provided)
- **Piper TTS**: Open-source neural voice (future)
- **Capacitor**: Native device TTS integration
