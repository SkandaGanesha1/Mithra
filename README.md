# Bhasha Bridge AI - Autonomous Multilingual Micro-App Generator

An autonomous agentic platform that dynamically generates localized, multilingual micro-apps on-the-fly using Google Gemini 3's Generative UI, powered by parallel AI agents coordinated through Google Antigravity.

## 🚀 Project Overview

Bhasha Bridge AI addresses India's #1 digital challenge: language barriers that exclude 70% of new internet users from digital services. Using Google's Antigravity platform with parallel AI agents, this system instantly generates contextual micro-apps in 22+ Indian languages.

### Key Features

- **Zero-Shot Micro-App Generation**: Creates unique, contextual interfaces for every interaction
- **Multimodal Understanding**: Supports voice, image, video, and text inputs
- **Hyperlocal Intelligence**: Leverages Gemini 3's 1M context window for regional context
- **Code-Switching Native**: Handles natural language mixing (Hinglish, Tanglish, etc.)
- **Autonomous Agent Coordination**: Parallel agents working together via Google Antigravity

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│        BHASHA BRIDGE ORCHESTRATOR                    │
│        (Google Antigravity + Gemini 3 Pro)          │
└─────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
    │ Agent 1:│    │ Agent 2:│    │ Agent 3:│
    │Language │    │Location │    │UI/UX    │
    │Analyzer │    │Context  │    │Generator│
    └────┬────┘    └────┬────┘    └────┬────┘
         │               │               │
         └───────────────┴───────────────┘
                         │
              ┌──────────▼──────────┐
              │  GENERATIVE UI      │
              │  (Instant App Gen)  │
              └─────────────────────┘
```

## 📋 Prerequisites

### Required Tools

- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **Google Cloud Account** with:
  - Gemini 3 API access
  - Google Antigravity workspace
  - Firebase project
  - Google AI Studio access

### API Keys Required

- Google Gemini API Key
- Google Maps API Key
- Firebase API credentials
- Bhashini API Key (for Indian languages)

## 🖥️ Windows Setup

See [WINDOWS_SETUP.md](./docs/WINDOWS_SETUP.md) for detailed Windows-specific installation instructions.

### Quick Setup (Windows)

1. **Install Prerequisites**:
```powershell
# Using Chocolatey
choco install nodejs python git

# Or download installers from:
# - Node.js: https://nodejs.org/
# - Python: https://www.python.org/
```

2. **Clone and Setup**:
```powershell
git clone https://github.com/SkandaGanesha1/Mithra.git
cd Mithra
npm install
pip install -r requirements.txt
```

3. **Configure Environment**:
```powershell
# Copy example environment file
copy .env.example .env

# Edit .env with your API keys
notepad .env
```

4. **Run Antigravity Agent System**:
```powershell
# Start the orchestrator
npm run start:orchestrator

# In separate terminal, start agents
npm run start:agents
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Google Gemini Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3-pro
GEMINI_CONTEXT_SIZE=1000000

# Google Antigravity
ANTIGRAVITY_WORKSPACE_ID=your_workspace_id
ANTIGRAVITY_API_KEY=your_antigravity_key

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_API_KEY=your_firebase_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com

# Google Maps API
GOOGLE_MAPS_API_KEY=your_maps_api_key

# Bhashini API (Indian Languages)
BHASHINI_API_KEY=your_bhashini_key
BHASHINI_USER_ID=your_user_id

# Optional: Language Models
LANGUAGE_MODEL_ENDPOINT=https://api.example.com/translate
```

## 🤖 Agent System

### Running Agents in Parallel with Antigravity

The system uses Google Antigravity to coordinate three parallel agents:

1. **Language Analyzer Agent**: Detects language, dialect, and code-switching patterns
2. **Location Context Agent**: Provides hyperlocal intelligence and services
3. **UI Generator Agent**: Creates Generative UI micro-apps on-the-fly

See [AGENT_GUIDE.md](./docs/AGENT_GUIDE.md) for detailed agent development instructions.

### Starting the Agent System

```bash
# Start all agents in parallel
npm run agents:start

# Monitor agent activity
npm run agents:monitor

# Stop all agents
npm run agents:stop
```

## 📚 Project Structure

```
Mithra/
├── src/
│   ├── agents/                 # Agent implementations
│   │   ├── base/              # Base agent classes
│   │   ├── language/          # Language Analyzer Agent
│   │   ├── location/          # Location Context Agent
│   │   └── ui/                # UI Generator Agent
│   ├── orchestrator/          # Antigravity orchestrator
│   ├── services/              # External service integrations
│   ├── utils/                 # Utility functions
│   └── config/                # Configuration files
├── tests/                     # Test files
├── docs/                      # Documentation
├── examples/                  # Example implementations
└── scripts/                   # Setup and deployment scripts
```

## 🎯 Usage Examples

### Example 1: Healthcare Query (Hindi)

```javascript
const query = "मुझे अपने गांव में डॉक्टर चाहिए";
const result = await orchestrator.process(query, { location: userLocation });
// Generates instant healthcare micro-app in Hindi
```

### Example 2: Code-Switching (Hinglish)

```javascript
const query = "मुझे ek doctor chahiye जो Hindi aur English दोनों समझे";
const result = await orchestrator.process(query);
// Handles mixed language naturally
```

See [examples/](./examples/) directory for more usage scenarios.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run agent tests
npm test -- --grep "Agent"

# Run integration tests
npm run test:integration

# Test individual agent
npm test src/agents/language/
```

## 📖 Documentation

- [Agent Development Guide](./docs/AGENT_GUIDE.md) - How to build and connect agents
- [Windows Setup Guide](./docs/WINDOWS_SETUP.md) - Windows-specific setup
- [Architecture Overview](./docs/ARCHITECTURE.md) - System architecture
- [API Documentation](./docs/API.md) - API reference
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment

## 🚀 Development Timeline

- **Day 1-2**: Core Infrastructure ✓
- **Day 3-4**: Agent Development
- **Day 5-6**: Integration & Demo Scenarios
- **Day 7**: Polish & Presentation

## 🤝 Contributing

This is a hackathon project. Contributions welcome!

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🏆 Hackathon Goals

This project demonstrates:
- ✅ Autonomous multi-agent coordination (countering Anthropic's compiler demo)
- ✅ Gemini 3's unique strengths (1M context, Generative UI, multimodal)
- ✅ Real-world impact (solving India's language barriers)
- ✅ Technical excellence (Google Antigravity, Firebase AI Logic)
- ✅ Viral potential (visually stunning, instant app generation)

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for the Google Gemini Hackathon 2026**
