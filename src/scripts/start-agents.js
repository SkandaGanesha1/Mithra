/**
 * Script to start all agents in parallel using Antigravity
 * Windows-compatible version
 */

const { spawn } = require('child_process');
const path = require('path');

const agents = [
  {
    name: 'Language Analyzer',
    script: 'agents/language/LanguageAnalyzerAgent.js',
    color: '\x1b[36m', // Cyan
  },
  {
    name: 'Location Context',
    script: 'agents/location/LocationContextAgent.js',
    color: '\x1b[33m', // Yellow
  },
  {
    name: 'UI Generator',
    script: 'agents/ui/UIGeneratorAgent.js',
    color: '\x1b[35m', // Magenta
  },
];

const processes = [];

function startAgent(agent) {
  console.log(`${agent.color}Starting ${agent.name} Agent...\x1b[0m`);
  
  // Use 'node' command directly (Windows compatible)
  const proc = spawn('node', [path.join(__dirname, '..', agent.script)], {
    stdio: 'inherit',
    shell: true, // Important for Windows
  });

  proc.on('error', (error) => {
    console.error(`${agent.color}Failed to start ${agent.name}: ${error.message}\x1b[0m`);
  });

  proc.on('exit', (code) => {
    console.log(`${agent.color}${agent.name} exited with code ${code}\x1b[0m`);
  });

  return proc;
}

function startAllAgents() {
  console.log('\n🚀 Starting Bhasha Bridge AI Agents in Parallel\n');
  
  agents.forEach(agent => {
    const proc = startAgent(agent);
    processes.push({ name: agent.name, process: proc });
  });

  console.log('\n✅ All agents started successfully!');
  console.log('Press Ctrl+C to stop all agents\n');
}

function stopAllAgents() {
  console.log('\n🛑 Stopping all agents...\n');
  
  processes.forEach(({ name, process }) => {
    if (process && !process.terminated) {
      console.log(`Stopping ${name}...`);
      process.terminate();
    }
  });

  process.exit(0);
}

// Handle graceful shutdown
process.on('SIGINT', stopAllAgents);
process.on('SIGTERM', stopAllAgents);

// Start agents
startAllAgents();
