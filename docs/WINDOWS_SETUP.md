# Windows Setup Guide for Bhasha Bridge AI

This guide provides detailed instructions for setting up and running the Bhasha Bridge AI agent system on Windows.

## Prerequisites

### 1. Install Node.js

Download and install Node.js (v18 or higher) from [nodejs.org](https://nodejs.org/)

```powershell
# Verify installation
node --version
npm --version
```

### 2. Install Python

Download and install Python (v3.9 or higher) from [python.org](https://www.python.org/)

```powershell
# Verify installation
python --version
pip --version
```

### 3. Install Git

Download and install Git from [git-scm.com](https://git-scm.com/)

```powershell
# Verify installation
git --version
```

## Installation

### Step 1: Clone the Repository

```powershell
git clone https://github.com/SkandaGanesha1/Mithra.git
cd Mithra
```

### Step 2: Install Node.js Dependencies

```powershell
npm install
```

### Step 3: Install Python Dependencies

```powershell
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

1. Copy the example environment file:

```powershell
copy .env.example .env
```

2. Edit `.env` with your API keys:

```powershell
notepad .env
```

Required API keys:
- `GEMINI_API_KEY`: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- `GOOGLE_MAPS_API_KEY`: Get from [Google Cloud Console](https://console.cloud.google.com/)
- `ANTIGRAVITY_API_KEY`: Get from [Google Antigravity](https://antigravity.google)
- `FIREBASE_API_KEY`: Get from [Firebase Console](https://console.firebase.google.com/)

## Running the Application

### Option 1: Run Complete System (Recommended)

Start the orchestrator server:

```powershell
npm start
```

This will:
- Initialize all agents (Language, Location, UI)
- Start the HTTP server on port 3000
- Enable the `/process` API endpoint

### Option 2: Run Agents Separately

If you want to run agents as separate processes:

**Terminal 1** - Start the orchestrator:
```powershell
npm run start:orchestrator
```

**Terminal 2** - Monitor agents:
```powershell
npm run agents:monitor
```

## How Agents Work in Parallel with Antigravity

### Agent Architecture

The Bhasha Bridge system uses three parallel agents:

1. **Language Analyzer Agent**: Detects language, dialect, and intent
2. **Location Context Agent**: Fetches nearby services and local context
3. **UI Generator Agent**: Creates the micro-app interface

### Parallel Execution Flow

```
User Request
     │
     ▼
┌─────────────────────┐
│  AgentOrchestrator  │  ← Coordinates all agents
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│ Language Analysis   │  ← Step 1: Analyze input
│  (Sequential)       │
└─────────────────────┘
     │
     ▼
     ├────────────────────┬───────────────────┐
     ▼                    ▼                   ▼
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  Location   │    │  UI Initial  │    │ Other Agents │
│   Context   │    │  Generation  │    │   (Future)   │
│ (Parallel)  │    │  (Parallel)  │    │  (Parallel)  │
└─────────────┘    └──────────────┘    └──────────────┘
     │                    │                   │
     └────────────────────┴───────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  Final UI    │  ← Step 3: Generate final UI
                  │  Generation  │     with all context
                  └──────────────┘
                         │
                         ▼
                   Final Result
```

### Code Example: Running Agents in Parallel

```javascript
// The orchestrator automatically runs agents in parallel
const orchestrator = new AgentOrchestrator({
  geminiApiKey: process.env.GEMINI_API_KEY,
  executionMode: 'parallel', // Enable parallel execution
  maxParallelAgents: 3,      // Max 3 agents at once
});

// Initialize all agents
await orchestrator.initialize();

// Process request - agents run automatically in parallel
const result = await orchestrator.process({
  text: "मुझे डॉक्टर चाहिए", // "I need a doctor"
}, {
  location: { lat: 19.0760, lng: 72.8777 }, // Mumbai
});
```

### Understanding the Parallel Execution

The `AgentOrchestrator` class (in `src/orchestrator/AgentOrchestrator.js`) manages parallel execution:

```javascript
// This method runs multiple agents simultaneously
async executeAgentsParallel(agentConfigs) {
  const promises = agentConfigs.map(config => {
    return this.executeAgent(config.agent, config.input, config.context);
  });

  // All agents execute at the same time
  const results = await Promise.all(promises);
  
  return results;
}
```

## Testing the System

### Test 1: Health Check

```powershell
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-14T..."
}
```

### Test 2: Check Agent Status

```powershell
curl http://localhost:3000/status
```

Expected response shows all 3 agents initialized and idle.

### Test 3: Process a Request

```powershell
curl -X POST http://localhost:3000/process `
  -H "Content-Type: application/json" `
  -d '{\"text\": \"मुझे डॉक्टर चाहिए\", \"location\": {\"lat\": 19.0760, \"lng\": 72.8777}}'
```

## Monitoring Agents

Run the monitor script in a separate terminal:

```powershell
npm run agents:monitor
```

This shows:
- Agent states (idle, processing, completed, error)
- Request counts and success rates
- Average response times
- Any errors

## Troubleshooting

### Issue: "Cannot find module '@google/generative-ai'"

**Solution**: Install dependencies:
```powershell
npm install
```

### Issue: "GEMINI_API_KEY is not defined"

**Solution**: Set up your `.env` file with valid API keys.

### Issue: Port 3000 already in use

**Solution**: Change the port in `.env`:
```env
PORT=3001
```

### Issue: Agents not responding

**Solution**: Check logs:
```powershell
# View logs directory
dir logs
type logs\combined.log
```

## Windows-Specific Notes

### PowerShell Execution Policy

If you get execution policy errors:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Path Separators

The code uses `path.join()` which automatically handles Windows path separators (`\` vs `/`).

### Shell Option

In `start-agents.js`, the `shell: true` option is crucial for Windows:

```javascript
const proc = spawn('node', [scriptPath], {
  stdio: 'inherit',
  shell: true,  // Required for Windows
});
```

## Advanced Configuration

### Running in Development Mode

```powershell
npm run dev
```

This uses `nodemon` to auto-restart on file changes.

### Adjusting Agent Parallelism

Edit `src/orchestrator/AgentOrchestrator.js`:

```javascript
this.maxParallelAgents = 5; // Increase to run more agents simultaneously
```

### Enabling File Logging

In `.env`:
```env
LOG_TO_FILE=true
LOG_LEVEL=debug
```

## Next Steps

1. Read [AGENT_GUIDE.md](./AGENT_GUIDE.md) to understand how to build custom agents
2. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design details
3. Review [examples/](../examples/) for usage scenarios

## Support

For issues or questions, open an issue on GitHub.

---

**Note**: This setup guide is specifically optimized for Windows environments. The system also works on Linux and macOS with minimal changes (remove `shell: true` option in spawn calls).
