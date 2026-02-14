# Agent Development Guide

Complete guide for building, connecting, and running agents with Google Antigravity in the Bhasha Bridge AI system.

## Table of Contents

1. [Agent Basics](#agent-basics)
2. [Building Custom Agents](#building-custom-agents)
3. [Connecting Agents with Antigravity](#connecting-agents-with-antigravity)
4. [Running Agents in Parallel](#running-agents-in-parallel)
5. [Agent Communication](#agent-communication)
6. [Testing Agents](#testing-agents)
7. [Best Practices](#best-practices)

## Agent Basics

### What is an Agent?

An agent is an autonomous component that:
- Performs a specific task (language analysis, location lookup, UI generation)
- Can run independently or in coordination with other agents
- Communicates through the AgentOrchestrator
- Has its own state and lifecycle

### Agent Lifecycle

```
┌──────────────┐
│  Initialize  │ ← Set up resources, connect to APIs
└──────┬───────┘
       │
       ▼
┌──────────────┐
│     Idle     │ ← Waiting for requests
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Processing  │ ← Executing main logic
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Completed   │ ← Return results
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Cleanup    │ ← Release resources
└──────────────┘
```

## Building Custom Agents

### Step 1: Extend BaseAgent Class

All agents extend the `BaseAgent` class:

```javascript
const BaseAgent = require('../base/BaseAgent');

class MyCustomAgent extends BaseAgent {
  constructor(config = {}) {
    super('MyCustomAgent', config);
    
    // Agent-specific configuration
    this.apiKey = config.apiKey || process.env.MY_API_KEY;
    this.timeout = config.timeout || 30000;
  }

  async initialize() {
    await super.initialize();
    
    // Initialize agent-specific resources
    this.client = new SomeAPIClient(this.apiKey);
    
    return true;
  }

  async execute(input, context) {
    // Implement your agent's main logic here
    const result = await this.processData(input);
    
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  async processData(input) {
    // Your custom processing logic
    return { processed: true };
  }

  async cleanup() {
    await super.cleanup();
    // Clean up agent-specific resources
    if (this.client) {
      await this.client.disconnect();
    }
  }
}

module.exports = MyCustomAgent;
```

### Step 2: Required Methods

Every agent must implement:

#### `initialize()`
Set up resources, API clients, database connections, etc.

```javascript
async initialize() {
  await super.initialize();
  
  this.geminiClient = new GoogleGenerativeAI(this.apiKey);
  this.database = await connectToDatabase();
  
  logger.info(`${this.name} initialized successfully`);
  return true;
}
```

#### `execute(input, context)`
Main processing logic. Always returns a result object.

```javascript
async execute(input, context) {
  // Validate input
  if (!input.data) {
    throw new Error('Data is required');
  }

  // Process the input
  const result = await this.performAnalysis(input.data);

  // Return structured result
  return {
    success: true,
    result,
    metadata: {
      processingTime: Date.now() - startTime,
      confidence: 0.95,
    },
  };
}
```

#### `cleanup()`
Release resources when agent shuts down.

```javascript
async cleanup() {
  await super.cleanup();
  
  if (this.database) {
    await this.database.close();
  }
  
  logger.info(`${this.name} cleanup complete`);
}
```

## Connecting Agents with Antigravity

### Step 1: Register Agent in Orchestrator

Edit `src/orchestrator/AgentOrchestrator.js`:

```javascript
async initialize() {
  // ... existing code ...

  // Create your custom agent
  const myAgent = new MyCustomAgent(this.config);
  await myAgent.initialize();

  // Register it
  this.agents.set('myagent', myAgent);

  // ... rest of code ...
}
```

### Step 2: Configure Antigravity Integration

The orchestrator handles Antigravity coordination:

```javascript
class AgentOrchestrator {
  constructor(config = {}) {
    // ... existing code ...

    // Antigravity configuration
    this.antigravityConfig = {
      workspaceId: process.env.ANTIGRAVITY_WORKSPACE_ID,
      apiKey: process.env.ANTIGRAVITY_API_KEY,
      endpoint: process.env.ANTIGRAVITY_ENDPOINT,
    };
  }
}
```

### Step 3: Agent-to-Agent Communication

Agents can communicate through the orchestrator:

```javascript
// In your agent's execute method
async execute(input, context) {
  // Request data from another agent
  const message = {
    type: 'DATA_REQUEST',
    payload: { query: input.query },
  };

  // Send through orchestrator
  const response = await this.sendMessage('otheragent', message);
  
  // Use the response
  const result = this.processWithExternalData(input, response);
  
  return result;
}
```

## Running Agents in Parallel

### Method 1: Automatic Parallel Execution

The orchestrator automatically runs compatible agents in parallel:

```javascript
// In AgentOrchestrator.js
async process(userInput, context) {
  // Step 1: Sequential (needs to complete first)
  const languageResult = await this.executeAgent('language', input);

  // Step 2 & 3: Parallel execution
  const [locationResult, uiResult] = await this.executeAgentsParallel([
    { agent: 'location', input: {...}, context },
    { agent: 'ui', input: {...}, context },
    { agent: 'myagent', input: {...}, context }, // Your custom agent
  ]);

  return aggregatedResults;
}
```

### Method 2: Manual Parallel Execution

You can also manually run agents in parallel:

```javascript
const promises = [
  orchestrator.executeAgent('agent1', input1),
  orchestrator.executeAgent('agent2', input2),
  orchestrator.executeAgent('agent3', input3),
];

const [result1, result2, result3] = await Promise.all(promises);
```

### Method 3: Windows-Compatible Parallel Processes

For truly independent processes (Windows-compatible):

```javascript
// In src/scripts/start-agents.js
const { spawn } = require('child_process');

function startAgentProcess(agentPath) {
  return spawn('node', [agentPath], {
    stdio: 'inherit',
    shell: true,  // Important for Windows
  });
}

// Start multiple agents
const agent1 = startAgentProcess('src/agents/language/LanguageAnalyzerAgent.js');
const agent2 = startAgentProcess('src/agents/location/LocationContextAgent.js');
const agent3 = startAgentProcess('src/agents/ui/UIGeneratorAgent.js');
```

### Controlling Parallelism

Set maximum parallel agents:

```javascript
const orchestrator = new AgentOrchestrator({
  executionMode: 'parallel',
  maxParallelAgents: 5,  // Run up to 5 agents simultaneously
});
```

## Agent Communication

### Communication Patterns

#### 1. Request-Response

```javascript
// Agent A sends request
const response = await this.sendMessage('agentB', {
  type: 'REQUEST',
  action: 'ANALYZE',
  data: inputData,
});

// Agent B receives and responds
async receiveMessage(message) {
  if (message.type === 'REQUEST' && message.action === 'ANALYZE') {
    const result = await this.analyze(message.data);
    return { type: 'RESPONSE', result };
  }
}
```

#### 2. Event Broadcasting

```javascript
// Agent broadcasts event to all agents
await this.broadcast({
  type: 'EVENT',
  event: 'USER_LOCATION_CHANGED',
  data: newLocation,
});
```

#### 3. Pipeline Processing

```javascript
// Data flows through agents sequentially
let data = initialInput;

data = await orchestrator.executeAgent('agent1', data);
data = await orchestrator.executeAgent('agent2', data);
data = await orchestrator.executeAgent('agent3', data);

return data;
```

### Shared Context

Agents can share context through the orchestrator:

```javascript
// Set shared context
context.userPreferences = { language: 'Hindi', theme: 'dark' };

// All agents receive the same context
const result = await orchestrator.process(input, context);
```

## Testing Agents

### Unit Testing Individual Agents

```javascript
// tests/agents/MyCustomAgent.test.js
const MyCustomAgent = require('../../src/agents/custom/MyCustomAgent');

describe('MyCustomAgent', () => {
  let agent;

  beforeEach(async () => {
    agent = new MyCustomAgent({ apiKey: 'test-key' });
    await agent.initialize();
  });

  afterEach(async () => {
    await agent.cleanup();
  });

  test('should process input correctly', async () => {
    const input = { data: 'test' };
    const result = await agent.process(input);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  test('should handle errors gracefully', async () => {
    const input = { data: null };

    await expect(agent.process(input)).rejects.toThrow();
  });
});
```

### Integration Testing with Orchestrator

```javascript
// tests/integration/orchestrator.test.js
const AgentOrchestrator = require('../../src/orchestrator/AgentOrchestrator');

describe('Agent Orchestrator Integration', () => {
  let orchestrator;

  beforeEach(async () => {
    orchestrator = new AgentOrchestrator({
      geminiApiKey: process.env.TEST_GEMINI_API_KEY,
    });
    await orchestrator.initialize();
  });

  test('should process request through all agents', async () => {
    const result = await orchestrator.process({
      text: 'test input',
    }, {
      location: { lat: 19, lng: 72 },
    });

    expect(result.success).toBe(true);
    expect(result.language).toBeDefined();
    expect(result.location).toBeDefined();
    expect(result.ui).toBeDefined();
  });
});
```

### Manual Testing

Start the system and test with curl:

```bash
# Windows PowerShell
curl -X POST http://localhost:3000/process `
  -H "Content-Type: application/json" `
  -d '{\"text\": \"test\", \"location\": {\"lat\": 19, \"lng\": 72}}'
```

## Best Practices

### 1. Error Handling

Always handle errors gracefully:

```javascript
async execute(input, context) {
  try {
    const result = await this.riskyOperation(input);
    return { success: true, result };
  } catch (error) {
    logger.error(`${this.name} failed`, { error });
    
    // Return fallback result
    return {
      success: false,
      error: error.message,
      fallback: this.getFallbackResult(input),
    };
  }
}
```

### 2. Timeout Handling

Set timeouts for long-running operations:

```javascript
async execute(input, context) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), this.timeout);
  });

  const workPromise = this.doWork(input);

  return Promise.race([workPromise, timeoutPromise]);
}
```

### 3. State Management

Keep agents stateless when possible:

```javascript
// ❌ Bad: Storing state
this.lastResult = result;  // Don't do this

// ✅ Good: Return all needed data
return {
  success: true,
  result,
  metadata: { timestamp: Date.now() },
};
```

### 4. Logging

Use structured logging:

```javascript
logger.info('Agent processing', {
  agent: this.name,
  input: input,
  context: context,
});
```

### 5. Resource Management

Always clean up resources:

```javascript
async cleanup() {
  await super.cleanup();
  
  // Close all connections
  if (this.database) await this.database.close();
  if (this.apiClient) await this.apiClient.disconnect();
  
  // Clear caches
  this.cache.clear();
}
```

### 6. Performance Monitoring

Track agent performance:

```javascript
async execute(input, context) {
  const startTime = Date.now();
  
  const result = await this.doWork(input);
  
  const duration = Date.now() - startTime;
  logger.info(`${this.name} completed in ${duration}ms`);
  
  return result;
}
```

## Example: Creating a Translation Agent

Here's a complete example of a custom translation agent:

```javascript
const BaseAgent = require('../base/BaseAgent');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../../utils/logger');

class TranslationAgent extends BaseAgent {
  constructor(config = {}) {
    super('TranslationAgent', config);
    this.geminiApiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
  }

  async initialize() {
    await super.initialize();
    this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-3-pro' });
    logger.info('Translation Agent initialized');
    return true;
  }

  async execute(input, context) {
    const { text, targetLanguage } = input;

    const prompt = `Translate the following text to ${targetLanguage}:\n\n${text}`;

    try {
      const result = await this.model.generateContent(prompt);
      const translation = result.response.text();

      return {
        success: true,
        original: text,
        translated: translation,
        targetLanguage,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Translation failed', { error });
      throw error;
    }
  }
}

module.exports = TranslationAgent;
```

## Next Steps

1. Study the existing agents in `src/agents/`
2. Create your custom agent following this guide
3. Register it in the orchestrator
4. Test it thoroughly
5. Deploy to production

## Support

For questions or issues, open an issue on GitHub or check the main [README.md](../README.md).

---

**Happy Agent Building! 🤖**
