/**
 * Script to monitor agent activity
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const CHECK_INTERVAL = 5000; // 5 seconds

async function checkStatus() {
  try {
    const response = await axios.get(`${API_URL}/status`);
    const status = response.data;
    
    console.clear();
    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║     Bhasha Bridge AI - Agent Monitor             ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');
    
    console.log('📊 Orchestrator Status:');
    console.log(`   Initialized: ${status.orchestrator.initialized ? '✅' : '❌'}`);
    console.log(`   Execution Mode: ${status.orchestrator.executionMode}`);
    console.log(`   Active Agents: ${status.orchestrator.activeAgents}\n`);
    
    console.log('🤖 Agent Status:\n');
    
    for (const [name, agentStatus] of Object.entries(status.agents)) {
      const stateEmoji = {
        idle: '⏸️',
        processing: '⚙️',
        completed: '✅',
        error: '❌',
      }[agentStatus.state] || '❓';
      
      console.log(`   ${stateEmoji} ${name.toUpperCase()}`);
      console.log(`      State: ${agentStatus.state}`);
      console.log(`      Requests: ${agentStatus.metrics.totalRequests}`);
      console.log(`      Success Rate: ${calculateSuccessRate(agentStatus.metrics)}%`);
      console.log(`      Avg Response: ${agentStatus.metrics.averageResponseTime.toFixed(2)}ms`);
      
      if (agentStatus.lastError) {
        console.log(`      ⚠️  Last Error: ${agentStatus.lastError}`);
      }
      
      console.log('');
    }
    
    console.log(`Last updated: ${new Date().toLocaleTimeString()}`);
    console.log('Press Ctrl+C to exit');
    
  } catch (error) {
    console.error('❌ Failed to fetch status:', error.message);
    console.log('Make sure the server is running on', API_URL);
  }
}

function calculateSuccessRate(metrics) {
  if (metrics.totalRequests === 0) return 0;
  return ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1);
}

// Start monitoring
console.log('Starting agent monitor...\n');
checkStatus();
setInterval(checkStatus, CHECK_INTERVAL);
