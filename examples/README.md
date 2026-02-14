# Bhasha Bridge AI - Examples

This directory contains example implementations demonstrating how to use the Bhasha Bridge AI system.

## Running Examples

Make sure the server is running first:

```bash
npm start
```

Then in a separate terminal, run any example:

```bash
node examples/healthcare-example.js
node examples/code-switching-example.js
```

## Available Examples

### 1. Healthcare Example (`healthcare-example.js`)

Demonstrates processing a healthcare query in Hindi:

```javascript
Input: "मुझे अपने गांव में डॉक्टर चाहिए"
Translation: "I need a doctor in my village"

Features:
- Hindi language detection
- Healthcare intent recognition
- Nearby hospital/doctor discovery
- Accessibility features for low-literacy users
```

### 2. Code-Switching Example (`code-switching-example.js`)

Demonstrates handling mixed Hindi-English (Hinglish):

```javascript
Input: "मुझे ek good school chahiye जो English aur Hindi दोनों में पढ़ाता हो"
Translation: "I need a good school that teaches in both English and Hindi"

Features:
- Code-switching detection
- Multilingual service matching
- Adaptive UI in mixed language
```

## Creating Your Own Example

```javascript
const AgentOrchestrator = require('../src/orchestrator/AgentOrchestrator');
require('dotenv').config();

async function myExample() {
  // Initialize orchestrator
  const orchestrator = new AgentOrchestrator({
    geminiApiKey: process.env.GEMINI_API_KEY,
    mapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  });

  await orchestrator.initialize();

  // Process request
  const result = await orchestrator.process({
    text: 'Your input here',
  }, {
    location: { lat: 19.0760, lng: 72.8777 },
  });

  console.log(result);

  // Cleanup
  await orchestrator.shutdown();
}

myExample().catch(console.error);
```

## Example Scenarios to Try

1. **Government Services** (Hindi)
   - "मुझे राशन कार्ड के लिए आवेदन करना है"
   - "I want to apply for a ration card"

2. **Education** (Tamil)
   - "எனக்கு ஒரு நல்ல பள்ளி வேண்டும்"
   - "I need a good school"

3. **Emergency** (Bengali)
   - "আমার জরুরি সাহায্য দরকার"
   - "I need emergency help"

4. **Business** (Gujarati)
   - "મારે GST માટે મદદ જોઈએ છે"
   - "I need help with GST"

5. **Mixed Language** (Hinglish)
   - "Mujhe nearest ATM chahiye"
   - "I need the nearest ATM"

## Testing with curl

You can also test via HTTP API:

```bash
# Windows PowerShell
curl -X POST http://localhost:3000/process `
  -H "Content-Type: application/json" `
  -d '{\"text\": \"मुझे डॉक्टर चाहिए\", \"location\": {\"lat\": 19.0760, \"lng\": 72.8777}}'

# Linux/Mac
curl -X POST http://localhost:3000/process \
  -H "Content-Type: application/json" \
  -d '{"text": "मुझे डॉक्टर चाहिए", "location": {"lat": 19.0760, "lng": 72.8777}}'
```

## Example Output

All examples will show:
- Language analysis (detected language, intent, confidence)
- Location context (nearby services, local information)
- Generated UI (components, styling, accessibility features)
- Performance metrics (processing time)

## Next Steps

- Read [AGENT_GUIDE.md](../docs/AGENT_GUIDE.md) to create custom agents
- Check [ARCHITECTURE.md](../docs/ARCHITECTURE.md) for system design
- See [WINDOWS_SETUP.md](../docs/WINDOWS_SETUP.md) for Windows-specific setup

## Support

For issues or questions, open an issue on GitHub.
