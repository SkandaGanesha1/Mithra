/**
 * Base Agent Class
 * 
 * All agents in the Bhasha Bridge system extend this base class.
 * Provides common functionality for agent communication, state management,
 * and integration with Google Antigravity.
 */

const { v4: uuidv4 } = require('uuid');
const logger = require('../../utils/logger');

class BaseAgent {
  constructor(name, config = {}) {
    this.id = uuidv4();
    this.name = name;
    this.config = config;
    this.state = 'idle'; // idle, processing, completed, error
    this.lastResult = null;
    this.lastError = null;
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
    };
  }

  /**
   * Initialize the agent
   * Override this method to set up agent-specific resources
   */
  async initialize() {
    logger.info(`Initializing agent: ${this.name} (${this.id})`);
    this.state = 'idle';
    return true;
  }

  /**
   * Process a request
   * This is the main entry point for agent processing
   * Override this method in child classes
   */
  async process(input, context = {}) {
    const startTime = Date.now();
    this.state = 'processing';
    this.metrics.totalRequests++;

    try {
      logger.info(`Agent ${this.name} processing request`, { input, context });
      
      // Child classes override this method
      const result = await this.execute(input, context);
      
      this.lastResult = result;
      this.state = 'completed';
      this.metrics.successfulRequests++;
      
      const duration = Date.now() - startTime;
      this.updateAverageResponseTime(duration);
      
      logger.info(`Agent ${this.name} completed successfully`, { duration });
      return result;
      
    } catch (error) {
      this.lastError = error;
      this.state = 'error';
      this.metrics.failedRequests++;
      
      logger.error(`Agent ${this.name} failed`, { error: error.message });
      throw error;
    }
  }

  /**
   * Execute the agent's main logic
   * Override this method in child classes
   */
  async execute(input, context) {
    throw new Error(`execute() must be implemented by ${this.name}`);
  }

  /**
   * Send message to another agent via Antigravity
   */
  async sendMessage(targetAgentId, message) {
    logger.debug(`${this.name} sending message to ${targetAgentId}`, { message });
    // This will be implemented when integrated with Antigravity
    return { sent: true, targetAgentId, message };
  }

  /**
   * Receive message from another agent
   */
  async receiveMessage(message) {
    logger.debug(`${this.name} received message`, { message });
    return message;
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      state: this.state,
      metrics: this.metrics,
      lastError: this.lastError ? this.lastError.message : null,
    };
  }

  /**
   * Update average response time metric
   */
  updateAverageResponseTime(duration) {
    const total = this.metrics.averageResponseTime * (this.metrics.successfulRequests - 1);
    this.metrics.averageResponseTime = (total + duration) / this.metrics.successfulRequests;
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    logger.info(`Cleaning up agent: ${this.name}`);
    this.state = 'idle';
  }
}

module.exports = BaseAgent;
