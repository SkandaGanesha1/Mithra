# Quick Reference Guide - Bhasha Bridge AI

## 🚀 Quick Start (Windows)

### 1. Setup (First Time Only)

```powershell
# Clone repository
git clone https://github.com/SkandaGanesha1/Mithra.git
cd Mithra

# Run Windows setup script
.\scripts\setup-windows.ps1

# Configure API keys
notepad .env
```

### 2. Start the System

```powershell
# Start the complete system
npm start

# OR start components separately:
# Terminal 1 - Orchestrator
npm run start:orchestrator

# Terminal 2 - Monitor agents
npm run agents:monitor
```

### 3. Test It

```powershell
# Health check
curl http://localhost:3000/health

# Process a request
curl -X POST http://localhost:3000/process `
  -H "Content-Type: application/json" `
  -d '{\"text\": \"मुझे डॉक्टर चाहिए\", \"location\": {\"lat\": 19.0760, \"lng\": 72.8777}}'
```

## 📁 Project Structure

```
Mithra/
├── src/
│   ├── agents/                # Agent implementations
│   │   ├── base/             # BaseAgent class
│   │   ├── language/         # Language Analyzer Agent
│   │   ├── location/         # Location Context Agent
│   │   └── ui/               # UI Generator Agent
│   ├── orchestrator/         # Agent coordination
│   ├── scripts/              # Utility scripts
│   └── utils/                # Helper functions
├── docs/                     # Documentation
├── examples/                 # Usage examples
└── tests/                    # Test files
```

## 🤖 How Agents Work with Antigravity

### Sequential Processing
```javascript
// Step 1: Analyze language (must complete first)
const languageResult = await orchestrator.executeAgent('language', input);

// Step 2: Use language info for next steps
const locationResult = await orchestrator.executeAgent('location', {
  ...input,
  intent: languageResult.analysis.intent
});
```

### Parallel Processing
```javascript
// Run multiple agents simultaneously
const [result1, result2, result3] = await orchestrator.executeAgentsParallel([
  { agent: 'location', input: {...} },
  { agent: 'ui', input: {...} },
  { agent: 'custom', input: {...} }
]);
```

## 🔧 Common Commands

### Development
```powershell
npm run dev              # Start with hot reload
npm test                 # Run tests
npm run agents:monitor   # Monitor agent status
npm run agents:stop      # Stop all agents
```

### Production
```powershell
npm start               # Start production server
npm run build          # Build for production (if needed)
```

## 📝 Creating a Custom Agent

### Step 1: Create Agent File

```javascript
// src/agents/custom/MyAgent.js
const BaseAgent = require('../base/BaseAgent');

class MyAgent extends BaseAgent {
  constructor(config = {}) {
    super('MyAgent', config);
  }

  async initialize() {
    await super.initialize();
    // Setup code
    return true;
  }

  async execute(input, context) {
    // Your logic here
    return { success: true, result: 'data' };
  }
}

module.exports = MyAgent;
```

### Step 2: Register in Orchestrator

```javascript
// src/orchestrator/AgentOrchestrator.js
const MyAgent = require('../agents/custom/MyAgent');

async initialize() {
  // ... existing code ...
  
  const myAgent = new MyAgent(this.config);
  await myAgent.initialize();
  this.agents.set('myagent', myAgent);
}
```

### Step 3: Use Your Agent

```javascript
const result = await orchestrator.executeAgent('myagent', {
  data: 'your input'
});
```

## 🌐 API Endpoints

### GET /health
Health check
```
Response: { "status": "healthy", "timestamp": "..." }
```

### GET /status
Agent status
```
Response: {
  "orchestrator": { ... },
  "agents": { ... }
}
```

### POST /process
Process user input
```json
Request:
{
  "text": "मुझे डॉक्टर चाहिए",
  "location": { "lat": 19.0760, "lng": 72.8777 },
  "userProfile": { "elderly": false }
}

Response:
{
  "success": true,
  "language": { ... },
  "location": { ... },
  "ui": { ... },
  "processingTime": 1234
}
```

## 🔍 Debugging

### View Logs
```powershell
# Console logs (real-time)
npm start

# File logs (if enabled)
type logs\combined.log
type logs\error.log
```

### Check Agent Status
```powershell
curl http://localhost:3000/status
```

### Monitor in Real-Time
```powershell
npm run agents:monitor
```

## ⚡ Performance Tips

1. **Parallel Execution**: Run independent agents in parallel
   ```javascript
   await orchestrator.executeAgentsParallel([...]);
   ```

2. **Caching**: Cache frequent requests
   ```javascript
   // Implement caching in agent execute()
   if (this.cache.has(key)) return this.cache.get(key);
   ```

3. **Timeouts**: Set appropriate timeouts
   ```javascript
   this.timeout = 30000; // 30 seconds
   ```

4. **Resource Cleanup**: Always cleanup
   ```javascript
   async cleanup() {
     await super.cleanup();
     // Release resources
   }
   ```

## 🐛 Common Issues

### "Module not found"
```powershell
npm install
```

### "API key not defined"
```powershell
# Edit .env file
notepad .env
# Add: GEMINI_API_KEY=your_key_here
```

### "Port 3000 already in use"
```powershell
# Change port in .env
PORT=3001
```

### "Agent not responding"
```powershell
# Check logs
npm run agents:monitor

# Restart
npm start
```

## 📚 More Information

- [README.md](../README.md) - Project overview
- [AGENT_GUIDE.md](docs/AGENT_GUIDE.md) - Detailed agent development
- [WINDOWS_SETUP.md](docs/WINDOWS_SETUP.md) - Windows setup
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture
- [examples/](examples/) - Usage examples

## 🎯 Key Concepts

### Agent
Autonomous component that performs specific tasks

### Orchestrator
Coordinates all agents, manages parallel execution

### Antigravity
Google's platform for agent coordination and management

### Parallel Execution
Running multiple agents simultaneously for better performance

### Context
Shared data passed between agents (location, user preferences, etc.)

## 💡 Pro Tips

1. **Start Simple**: Begin with single agent, then add parallelism
2. **Monitor Performance**: Use `npm run agents:monitor` regularly
3. **Handle Errors**: Always implement error handling in agents
4. **Test Locally**: Test thoroughly before deploying
5. **Read Logs**: Logs tell you everything about agent behavior

## 🎓 Learning Path

1. ✅ Setup and run basic system
2. ✅ Understand existing agents
3. ✅ Create a simple custom agent
4. ✅ Add parallel execution
5. ✅ Deploy to production

## 🆘 Need Help?

- Check [docs/](docs/) directory
- Run examples: `node examples/healthcare-example.js`
- Open GitHub issue
- Read agent source code in `src/agents/`

---

**Made with ❤️ for Google Gemini Hackathon 2026**
