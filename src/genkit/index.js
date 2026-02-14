/**
 * Genkit Main Entry Point
 * Initializes Genkit with all agents and flows
 */

require('dotenv').config();
const express = require('express');
const logger = require('../utils/logger');

// Import Genkit configuration
require('./config/genkit.config');

// Import all agents (this registers them with Genkit)
require('./agents/VisionAgent');
require('./agents/VoiceAgent');
require('./agents/LocationAgent');
require('./agents/UIGenerator');

// Import MasterBridge flow
const { MasterBridge } = require('./flows/MasterBridge');

// Create Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Enable CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Bhasha Bridge AI - Genkit',
    timestamp: new Date().toISOString(),
  });
});

// Main MasterBridge endpoint
app.post('/api/master-bridge', async (req, res) => {
  try {
    logger.info('Received MasterBridge request');

    const {
      imageBase64,
      videoBase64,
      imageMimeType,
      audioBase64,
      audioMimeType,
      latitude,
      longitude,
    } = req.body;

    // Validate required fields
    if (!audioBase64) {
      return res.status(400).json({
        error: 'Missing required field: audioBase64',
      });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Missing required fields: latitude and longitude',
      });
    }

    // Invoke MasterBridge flow
    const result = await MasterBridge.invoke({
      imageBase64,
      videoBase64,
      imageMimeType: imageMimeType || 'image/jpeg',
      audioBase64,
      audioMimeType: audioMimeType || 'audio/mp3',
      latitude,
      longitude,
    });

    logger.info('MasterBridge request completed', {
      success: result.success,
      processingTime: result.processing_time_ms,
    });

    res.json(result);
  } catch (error) {
    logger.error('MasterBridge request failed', {
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

// Test endpoint for individual agents
app.post('/api/test-vision', async (req, res) => {
  try {
    const { VisionAgent } = require('./agents/VisionAgent');
    const result = await VisionAgent.invoke(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/test-voice', async (req, res) => {
  try {
    const { VoiceAgent } = require('./agents/VoiceAgent');
    const result = await VoiceAgent.invoke(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/test-location', async (req, res) => {
  try {
    const { LocationAgent } = require('./agents/LocationAgent');
    const result = await LocationAgent.invoke(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  logger.info(`🚀 Genkit server running on port ${port}`);
  console.log(`\n🌉 Bhasha Bridge AI - Genkit Server`);
  console.log(`📍 http://localhost:${port}`);
  console.log(`💚 Health: http://localhost:${port}/health`);
  console.log(`🌉 MasterBridge: POST http://localhost:${port}/api/master-bridge\n`);
});

module.exports = app;
