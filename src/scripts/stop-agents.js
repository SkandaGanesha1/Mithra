/**
 * Script to stop all running agents
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function stopAgents() {
  try {
    console.log('🛑 Stopping all agents...');
    
    const response = await axios.post(`${API_URL}/shutdown`);
    
    console.log('✅ All agents stopped successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Failed to stop agents:', error.message);
    process.exit(1);
  }
}

stopAgents();
