/**
 * Genkit Configuration
 * Sets up Google AI and Firebase plugins for Bhasha Bridge AI
 */

const { configureGenkit } = require('@genkit-ai/core');
const { googleAI } = require('@genkit-ai/googleai');
const { firebase } = require('@genkit-ai/firebase');

// Configure Genkit with required plugins
const ai = configureGenkit({
  plugins: [
    // Google AI plugin for Gemini models
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
    // Firebase plugin for data storage and functions
    firebase({
      projectId: process.env.FIREBASE_PROJECT_ID,
    }),
  ],
  logLevel: process.env.LOG_LEVEL || 'info',
  enableTracingAndMetrics: true,
});

module.exports = { ai };
