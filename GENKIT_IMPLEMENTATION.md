# Genkit Implementation - Bhasha Bridge AI

## Overview

This implementation provides a complete Genkit-based parallel agent swarm architecture for the Bhasha Bridge AI project, following the exact specifications from the hackathon requirements.

## Architecture

### 4 Specialized Agents

1. **VisionAgent** (Gemini 1.5 Pro Vision)
   - Input: Image/Video Base64
   - Task: Identify objects, medicines, crop diseases
   - Location: `src/genkit/agents/VisionAgent.js`

2. **VoiceAgent** (Gemini 1.5 Flash Audio)
   - Input: Audio Base64
   - Task: Transcribe Hindi/Regional dialects, extract intent
   - Location: `src/genkit/agents/VoiceAgent.js`

3. **LocationAgent**
   - Input: Lat/Long
   - Task: Mock lookup for nearby Indian services
   - Location: `src/genkit/agents/LocationAgent.js`

4. **UIGenerator**
   - Input: Combined JSON from all agents
   - Task: Generate React component in detected language
   - Location: `src/genkit/agents/UIGenerator.js`

### MasterBridge Orchestrator

The MasterBridge flow orchestrates all agents with parallel execution:

```javascript
// Phase 1: PARALLEL - Vision + Voice
const [visualResult, voiceResult] = await Promise.all([
  VisionAgent.invoke({ videoBase64, imageMimeType }),
  VoiceAgent.invoke({ audioBase64, audioMimeType }),
]);

// Phase 2: SEQUENTIAL - Location
const locationResult = await LocationAgent.invoke({
  latitude, longitude, intent: voiceResult.intent
});

// Phase 3: SEQUENTIAL - UI Generation
const uiResult = await UIGenerator.invoke({
  visual_context: visualResult,
  voice_analysis: voiceResult,
  location_data: locationResult,
});
```

Location: `src/genkit/flows/MasterBridge.js`

## Setup Instructions

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install client dependencies
cd client
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase
FIREBASE_PROJECT_ID=your_firebase_project_id

# Server Port
PORT=3001

# Logging
LOG_LEVEL=info
```

### 3. Start Backend Server

```bash
npm run start:genkit
```

The server will start on `http://localhost:3001`

### 4. Start Frontend

```bash
cd client
npm start
```

The React app will start on `http://localhost:3000`

## API Endpoints

### Main Endpoint

**POST** `/api/master-bridge`

Request body:
```json
{
  "videoBase64": "base64_encoded_video",
  "imageMimeType": "video/mp4",
  "audioBase64": "base64_encoded_audio",
  "audioMimeType": "audio/webm",
  "latitude": 19.0760,
  "longitude": 72.8777
}
```

Response:
```json
{
  "visual_context": {
    "visual_context": "Medicine strip identified",
    "category": "medicine",
    "details": {
      "medicine_name": "Paracetamol 500mg",
      "usage_instructions": "Take twice daily"
    }
  },
  "voice_analysis": {
    "transcript": "दादी को ये दवाई कब देनी है?",
    "language": "Hindi",
    "sentiment": "urgent",
    "intent": "healthcare"
  },
  "location_data": {
    "nearby_services": [...]
  },
  "generated_ui": {
    "component_code": "React component code",
    "language": "Hindi",
    "ui_mode": "emergency"
  },
  "processing_time_ms": 1234,
  "success": true
}
```

### Test Endpoints

- **POST** `/api/test-vision` - Test VisionAgent only
- **POST** `/api/test-voice` - Test VoiceAgent only
- **POST** `/api/test-location` - Test LocationAgent only

## Frontend Features

### CameraCapture Component

- Captures 5-second video buffer
- Converts to Base64
- MIME type: `video/mp4`
- Location: `client/src/components/CameraCapture.js`

### AudioRecorder Component

- Records audio with duration tracking
- Converts to Base64
- MIME type: `audio/webm`
- Location: `client/src/components/AudioRecorder.js`

### DynamicUI Component

- Renders generated UI from UIGenerator
- Falls back to structured display
- Shows medicine dosage with ☀️/🌙 icons
- Emergency buttons for urgent cases
- Location: `client/src/components/DynamicUI.js`

## Demo Scenario

### The "Magic Moment"

1. **User holds up medicine packet to camera**
   - CameraCapture records 5-second video
   - VisionAgent identifies: "Paracetamol 500mg strip"

2. **User says in Hindi:** "दादी को ये दवाई कब देनी है?"
   - Translation: "When should I give this medicine to grandma?"
   - VoiceAgent transcribes and detects:
     - Language: Hindi
     - Sentiment: urgent
     - Entity: "Dadi" (Grandma)

3. **Parallel Processing** ⚡
   - Vision and Voice agents run simultaneously
   - LocationAgent finds nearby pharmacies/doctors
   - UIGenerator creates Hindi UI

4. **Generated UI Shows:**
   - Medicine name and usage
   - ☀️ Morning and 🌙 Night dosage icons
   - "दादी की देखभाल" (Caring for Grandma)
   - 📞 "डॉक्टर को फोन करें" (Call Doctor) button
   - Nearby pharmacies with contact info

## System Instructions

### VisionAgent Prompt

The VisionAgent uses a specialized prompt for:
- Medicine identification (Indian pharma brands)
- Crop disease detection (Wheat Rust, Rice Blast, etc.)
- Document OCR (Ration Card, Aadhaar)
- General object recognition

### VoiceAgent Prompt

The VoiceAgent is configured for:
- 22+ Indian languages
- Code-switching (Hinglish, Tanglish)
- Regional accents and dialects
- Sentiment analysis (urgent, confused, calm)
- Entity extraction (people, places, times)

### UIGenerator Prompt

The UIGenerator follows these rules:
- UI in DETECTED LANGUAGE
- Big red buttons if sentiment is urgent
- Dosage icons (☀️🌙) for medical context
- Call buttons for emergency
- Tailwind CSS styling

## Parallel Execution Flow

```
User Input (Video + Audio)
          ↓
    ┌─────────────┐
    │ MasterBridge│
    └─────────────┘
          ↓
    [PARALLEL] ⚡
    ↙         ↘
VisionAgent  VoiceAgent
    ↘         ↙
    [MERGE]
          ↓
   LocationAgent
          ↓
    UIGenerator
          ↓
   Generated UI
```

## Performance

- **Vision + Voice**: Run in parallel using `Promise.all()`
- **Total Processing**: < 5 seconds typical
- **Logging**: Full trace with winston logger
- **Error Handling**: Fallback responses for each agent

## Verification

### Check Parallel Execution

Look for these logs:
```
⚡ Phase 1: Running Vision and Voice agents in PARALLEL
✅ Phase 1 Complete - Parallel agents finished
```

### Visual Indicators in Logs

- 🌉 MasterBridge flow started
- ⚡ Phase 1: Parallel execution
- 📍 Phase 2: LocationAgent
- 🎨 Phase 3: UIGenerator
- 🎉 MasterBridge flow completed

## Troubleshooting

### "Cannot access camera/microphone"

Grant browser permissions for camera and microphone.

### "GEMINI_API_KEY not found"

Make sure `.env` file is configured with valid API key.

### "Module not found"

Run `npm install` in both root and `client/` directories.

## Next Steps

1. Test with real medicine images
2. Record actual Hindi voice queries
3. Verify parallel execution in logs
4. Check generated UI language adaptation
5. Test emergency mode with urgent sentiment

## Files Structure

```
src/genkit/
├── config/
│   └── genkit.config.js      # Genkit configuration
├── agents/
│   ├── VisionAgent.js         # Gemini 1.5 Pro Vision
│   ├── VoiceAgent.js          # Gemini 1.5 Flash Audio
│   ├── LocationAgent.js       # Service lookup
│   └── UIGenerator.js         # React component generator
├── flows/
│   └── MasterBridge.js        # Main orchestrator
└── index.js                   # Express server

client/
├── src/
│   ├── components/
│   │   ├── CameraCapture.js   # 5-sec video capture
│   │   ├── AudioRecorder.js   # Audio recording
│   │   └── DynamicUI.js       # UI renderer
│   ├── App.js                 # Main app
│   ├── App.css                # Styles
│   └── index.js               # Entry point
└── public/
    └── index.html             # HTML template
```

## License

MIT License - See LICENSE file

---

**Built for Google Gemini Hackathon 2026**
*"Bhasha Bridge AI - Bringing digital services to every Indian, in every language"*
