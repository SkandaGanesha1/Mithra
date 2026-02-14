# Bhasha Bridge AI - Architecture Overview

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                          │
│  (Mobile App, Web App, Voice Interface, API)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  HTTP/REST API LAYER                        │
│              (Express.js Server - Port 3000)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              AGENT ORCHESTRATOR                             │
│         (Google Antigravity Coordination)                   │
│                                                             │
│  • Manages agent lifecycle                                  │
│  • Coordinates parallel execution                           │
│  • Aggregates results                                       │
│  • Handles errors and retries                               │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Language   │  │  Location   │  │     UI      │
│  Analyzer   │  │   Context   │  │  Generator  │
│   Agent     │  │    Agent    │  │   Agent     │
└─────────────┘  └─────────────┘  └─────────────┘
         │               │               │
         ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                          │
│                                                             │
│  • Google Gemini 3 API                                      │
│  • Google Maps API                                          │
│  • Bhashini API (Indian Languages)                          │
│  • Firebase (Real-time sync)                                │
│  • Government APIs (DigiLocker, UMANG, etc.)                │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Agent Orchestrator

**Location**: `src/orchestrator/AgentOrchestrator.js`

**Responsibilities**:
- Initialize all agents
- Coordinate parallel execution
- Manage agent communication
- Aggregate results
- Handle errors and retries
- Monitor agent health

**Key Methods**:
```javascript
async initialize()           // Set up all agents
async process(input, ctx)    // Process user request
async executeAgent(name, input)  // Run single agent
async executeAgentsParallel([])  // Run multiple agents
getAgentStatus()            // Get system health
async shutdown()            // Clean shutdown
```

### 2. Language Analyzer Agent

**Location**: `src/agents/language/LanguageAnalyzerAgent.js`

**Purpose**: Detect language, dialect, code-switching, and user intent

**Capabilities**:
- Detect 22+ Indian languages
- Handle code-switching (Hinglish, Tanglish, etc.)
- Extract user intent
- Sentiment analysis
- Entity recognition
- Dialect detection

**Technologies**:
- Google Gemini 3 Pro
- Custom language detection algorithms
- Unicode script detection

**Input**:
```javascript
{
  text: "मुझे डॉक्टर चाहिए",
  audio: <audio_data>,  // Optional
  image: <image_data>   // Optional
}
```

**Output**:
```javascript
{
  success: true,
  analysis: {
    primary_language: "Hindi",
    detected_languages: ["Hindi"],
    code_switching: false,
    dialect: "Standard",
    formality: "casual",
    intent: "healthcare_request",
    sentiment: "neutral",
    key_entities: ["doctor"],
    confidence: 0.95
  }
}
```

### 3. Location Context Agent

**Location**: `src/agents/location/LocationContextAgent.js`

**Purpose**: Provide hyperlocal intelligence and services

**Capabilities**:
- Geocoding (address ↔ coordinates)
- Nearby service discovery
- Local context (festivals, customs, regulations)
- Government service integration
- Weather and transportation data

**Technologies**:
- Google Maps API
- Government APIs (DigiLocker, UMANG)
- Local databases
- Real-time data sources

**Input**:
```javascript
{
  location: { lat: 19.0760, lng: 72.8777 },
  intent: "healthcare_request",
  language: "Hindi"
}
```

**Output**:
```javascript
{
  success: true,
  location: {
    formattedAddress: "Mumbai, Maharashtra",
    coordinates: { lat: 19.0760, lng: 72.8777 }
  },
  services: [
    {
      name: "City Hospital",
      address: "Near Station Rd",
      rating: 4.2,
      openNow: true,
      placeId: "ChIJ..."
    }
  ],
  context: {
    festivals: ["Ganesh Chaturthi"],
    weather: { temp: 28, condition: "Sunny" }
  }
}
```

### 4. UI Generator Agent

**Location**: `src/agents/ui/UIGeneratorAgent.js`

**Purpose**: Create Generative UI micro-apps on-the-fly

**Capabilities**:
- Generate React components dynamically
- Adapt UI to user profile (elderly, low-literacy, etc.)
- Create multilingual interfaces
- Voice navigation support
- Accessibility features (screen reader, high contrast, etc.)

**Technologies**:
- Google Gemini 3 Pro (for code generation)
- Generative UI framework
- React/JSX generation
- Accessibility standards (WCAG)

**Input**:
```javascript
{
  intent: "healthcare_request",
  language: "Hindi",
  services: [...],
  locationContext: {...},
  userProfile: { elderly: false, lowLiteracy: true }
}
```

**Output**:
```javascript
{
  success: true,
  ui: {
    specification: {
      layout: "list",
      components: ["header", "searchBar", "serviceList"],
      voice_support: true
    },
    component: "<React JSX code>",
    styling: {
      fontSize: "large",
      colorScheme: "light",
      theme: {...}
    },
    accessibility: {
      screenReaderSupport: true,
      voiceControl: true
    }
  }
}
```

## Data Flow

### Sequential Processing Pipeline

```
1. USER INPUT
   ↓
2. LANGUAGE ANALYZER AGENT (Sequential)
   - Detect language
   - Identify intent
   - Extract entities
   ↓
3. PARALLEL PROCESSING
   ┌──────────────────────┬──────────────────────┐
   ↓                      ↓                      ↓
   LOCATION AGENT    UI AGENT (Initial)   FUTURE AGENTS
   - Find services   - Plan layout        - ...
   - Get context     - Prepare template   - ...
   ↓                      ↓                      ↓
   └──────────────────────┴──────────────────────┘
                         ↓
4. UI AGENT (Final) - Sequential
   - Combine all data
   - Generate final UI
   ↓
5. RESULT AGGREGATION
   ↓
6. RETURN TO USER
```

### Parallel Execution

Agents run in parallel when:
- They don't depend on each other's results
- They can process independently
- System resources allow it

```javascript
// Parallel execution example
const [locationResult, otherResult] = await Promise.all([
  locationAgent.process(input),
  otherAgent.process(input),
]);
```

## Google Antigravity Integration

### What is Antigravity?

Google Antigravity is an agentic development platform that:
- Coordinates multiple AI agents
- Manages agent state and communication
- Enables parallel execution
- Provides monitoring and debugging tools
- Handles error recovery

### How We Use It

```javascript
// Configuration
const antigravityConfig = {
  workspaceId: process.env.ANTIGRAVITY_WORKSPACE_ID,
  apiKey: process.env.ANTIGRAVITY_API_KEY,
  endpoint: 'https://antigravity.google.com/api/v1',
};

// Agent coordination
const orchestrator = new AgentOrchestrator(antigravityConfig);
await orchestrator.initialize();

// Parallel agent execution
const results = await orchestrator.executeAgentsParallel([
  { agent: 'language', input: {...} },
  { agent: 'location', input: {...} },
  { agent: 'ui', input: {...} },
]);
```

### Benefits

1. **Automatic Parallelization**: Runs compatible agents simultaneously
2. **Resource Management**: Optimizes CPU/memory usage
3. **Error Recovery**: Automatic retries and fallbacks
4. **Monitoring**: Real-time agent status and metrics
5. **Scalability**: Handles increased load automatically

## Scalability & Performance

### Horizontal Scaling

```
Load Balancer
     │
     ├─── Server Instance 1 (Orchestrator + Agents)
     ├─── Server Instance 2 (Orchestrator + Agents)
     └─── Server Instance 3 (Orchestrator + Agents)
```

### Caching Strategy

- **Language Analysis**: Cache common phrases and patterns
- **Location Data**: Cache geocoding results (1 hour TTL)
- **UI Templates**: Cache generated components (24 hour TTL)

### Performance Targets

- **Language Analysis**: < 500ms
- **Location Lookup**: < 1s
- **UI Generation**: < 2s
- **Total Processing**: < 3s (end-to-end)

## Security

### API Key Management

- Store in environment variables
- Never commit to version control
- Rotate regularly
- Use separate keys for dev/prod

### Data Privacy

- No persistent storage of user queries
- Location data anonymized
- Compliance with GDPR and Indian data laws
- Secure HTTPS communication

### Rate Limiting

```javascript
// Per user: 100 requests/hour
// Per IP: 1000 requests/hour
// Global: 10,000 requests/hour
```

## Deployment

### Development

```bash
npm run dev    # Local development with hot reload
```

### Production

```bash
npm start      # Production server
```

### Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
CMD ["npm", "start"]
```

### Cloud Deployment

- **Google Cloud Run**: Serverless, auto-scaling
- **Firebase Hosting**: Frontend delivery
- **Cloud Functions**: Event-driven tasks

## Monitoring & Logging

### Metrics Tracked

- Request count per agent
- Success/failure rates
- Average response times
- Error rates and types
- Resource usage (CPU, memory)

### Logging Levels

- **ERROR**: Critical failures
- **WARN**: Recoverable issues
- **INFO**: Normal operations
- **DEBUG**: Detailed diagnostic info

### Health Checks

```
GET /health     → Overall system health
GET /status     → Detailed agent status
```

## Future Enhancements

1. **Additional Agents**
   - Translation Agent
   - Payment Agent
   - Booking Agent
   - Authentication Agent

2. **Advanced Features**
   - Video input processing
   - Real-time collaboration
   - Offline mode support
   - Progressive Web App (PWA)

3. **Scale Improvements**
   - Redis caching
   - Database integration
   - Message queue (RabbitMQ/Kafka)
   - Microservices architecture

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **AI**: Google Gemini 3 Pro
- **Orchestration**: Google Antigravity

### Frontend (Future)
- **Framework**: React
- **State**: Redux/Context API
- **UI**: Material-UI
- **PWA**: Workbox

### Infrastructure
- **Cloud**: Google Cloud Platform
- **Database**: Firebase Firestore
- **Storage**: Cloud Storage
- **Hosting**: Cloud Run / Firebase

### DevOps
- **CI/CD**: GitHub Actions
- **Containers**: Docker
- **Monitoring**: Cloud Logging
- **Analytics**: Google Analytics

## References

- [Google Gemini API Documentation](https://ai.google.dev/)
- [Google Maps API](https://developers.google.com/maps)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Antigravity](https://antigravity.google)

---

**Last Updated**: February 14, 2026
