/**
 * Main entry point for the Bhasha Bridge AI system
 */

require('dotenv').config();
const express = require('express');
const AgentOrchestrator = require('./orchestrator/AgentOrchestrator');
const logger = require('./utils/logger');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize orchestrator
const orchestrator = new AgentOrchestrator({
  geminiApiKey: process.env.GEMINI_API_KEY,
  mapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  antigravityWorkspaceId: process.env.ANTIGRAVITY_WORKSPACE_ID,
  antigravityApiKey: process.env.ANTIGRAVITY_API_KEY,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  const status = orchestrator.getAgentStatus();
  res.json(status);
});

// Main processing endpoint
app.post('/process', async (req, res) => {
  try {
    const { text, audio, image, location, userProfile } = req.body;
    
    if (!text && !audio && !image) {
      return res.status(400).json({
        error: 'At least one input (text, audio, or image) is required',
      });
    }

    const result = await orchestrator.process(
      { text, audio, image, location },
      { location, userProfile }
    );

    res.json(result);
    
  } catch (error) {
    logger.error('Processing error', { error });
    res.status(500).json({
      error: 'Processing failed',
      message: error.message,
    });
  }
});

// Start server
async function start() {
  try {
    // Initialize orchestrator
    await orchestrator.initialize();
    logger.info('Orchestrator initialized');

    // Start server
    app.listen(port, () => {
      logger.info(`Bhasha Bridge AI server running on port ${port}`);
      console.log(`\n🚀 Server ready at http://localhost:${port}`);
      console.log(`📊 Status: http://localhost:${port}/status`);
      console.log(`💬 Process: POST http://localhost:${port}/process\n`);
    });
    
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await orchestrator.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await orchestrator.shutdown();
  process.exit(0);
});

// Start the application
start();

module.exports = app;
