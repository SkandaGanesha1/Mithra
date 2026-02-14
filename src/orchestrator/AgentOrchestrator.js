/**
 * Agent Orchestrator
 * 
 * Coordinates parallel execution of agents using Google Antigravity.
 * Manages agent lifecycle, communication, and result aggregation.
 */

const LanguageAnalyzerAgent = require('../agents/language/LanguageAnalyzerAgent');
const LocationContextAgent = require('../agents/location/LocationContextAgent');
const UIGeneratorAgent = require('../agents/ui/UIGeneratorAgent');
const logger = require('../utils/logger');

class AgentOrchestrator {
  constructor(config = {}) {
    this.config = config;
    this.agents = new Map();
    this.isInitialized = false;
    
    // Agent execution modes
    this.executionMode = config.executionMode || 'parallel'; // parallel, sequential
    this.maxParallelAgents = config.maxParallelAgents || 3;
    
    // Antigravity configuration
    this.antigravityConfig = {
      workspaceId: config.antigravityWorkspaceId || process.env.ANTIGRAVITY_WORKSPACE_ID,
      apiKey: config.antigravityApiKey || process.env.ANTIGRAVITY_API_KEY,
      endpoint: config.antigravityEndpoint || process.env.ANTIGRAVITY_ENDPOINT,
    };
  }

  /**
   * Initialize the orchestrator and all agents
   */
  async initialize() {
    if (this.isInitialized) {
      logger.warn('Orchestrator already initialized');
      return true;
    }

    logger.info('Initializing Agent Orchestrator');

    try {
      // Create and initialize agents
      const languageAgent = new LanguageAnalyzerAgent(this.config);
      const locationAgent = new LocationContextAgent(this.config);
      const uiAgent = new UIGeneratorAgent(this.config);

      // Initialize agents in parallel
      await Promise.all([
        languageAgent.initialize(),
        locationAgent.initialize(),
        uiAgent.initialize(),
      ]);

      // Register agents
      this.agents.set('language', languageAgent);
      this.agents.set('location', locationAgent);
      this.agents.set('ui', uiAgent);

      this.isInitialized = true;
      logger.info('Agent Orchestrator initialized successfully');
      
      return true;
      
    } catch (error) {
      logger.error('Failed to initialize orchestrator', { error });
      throw error;
    }
  }

  /**
   * Process a user request through the agent pipeline
   */
  async process(userInput, context = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const requestId = this.generateRequestId();
    logger.info('Processing request', { requestId, userInput });

    try {
      // Step 1: Analyze language
      const languageResult = await this.executeAgent('language', {
        text: userInput.text || userInput,
        audio: userInput.audio,
        image: userInput.image,
      }, context);

      if (!languageResult.success) {
        throw new Error('Language analysis failed');
      }

      // Step 2 & 3: Run location and UI agents in parallel
      const [locationResult, uiResult] = await this.executeAgentsParallel([
        {
          agent: 'location',
          input: {
            location: context.location || userInput.location,
            intent: languageResult.analysis.intent,
            language: languageResult.analysis.primary_language,
          },
          context,
        },
        {
          agent: 'ui',
          input: {
            intent: languageResult.analysis.intent,
            language: languageResult.analysis.primary_language,
            services: [], // Will be populated after location result
            userProfile: context.userProfile,
          },
          context,
        },
      ]);

      // Step 4: Regenerate UI with location data
      const finalUIResult = await this.executeAgent('ui', {
        intent: languageResult.analysis.intent,
        language: languageResult.analysis.primary_language,
        services: locationResult.services,
        locationContext: locationResult.context,
        userProfile: context.userProfile,
      }, context);

      // Aggregate results
      const result = {
        success: true,
        requestId,
        language: languageResult.analysis,
        location: locationResult,
        ui: finalUIResult.ui,
        generatedAt: new Date().toISOString(),
        processingTime: this.calculateProcessingTime(requestId),
      };

      logger.info('Request processed successfully', { requestId });
      return result;
      
    } catch (error) {
      logger.error('Request processing failed', { requestId, error });
      throw error;
    }
  }

  /**
   * Execute a single agent
   */
  async executeAgent(agentName, input, context) {
    const agent = this.agents.get(agentName);
    
    if (!agent) {
      throw new Error(`Agent not found: ${agentName}`);
    }

    logger.info(`Executing agent: ${agentName}`);
    
    try {
      const result = await agent.process(input, context);
      return result;
    } catch (error) {
      logger.error(`Agent ${agentName} execution failed`, { error });
      throw error;
    }
  }

  /**
   * Execute multiple agents in parallel using Antigravity
   */
  async executeAgentsParallel(agentConfigs) {
    logger.info(`Executing ${agentConfigs.length} agents in parallel`);

    const promises = agentConfigs.map(config => {
      return this.executeAgent(config.agent, config.input, config.context);
    });

    try {
      // Execute all agents in parallel
      const results = await Promise.all(promises);
      logger.info('Parallel agent execution completed');
      return results;
      
    } catch (error) {
      logger.error('Parallel agent execution failed', { error });
      throw error;
    }
  }

  /**
   * Get status of all agents
   */
  getAgentStatus() {
    const status = {};
    
    for (const [name, agent] of this.agents) {
      status[name] = agent.getStatus();
    }
    
    return {
      orchestrator: {
        initialized: this.isInitialized,
        executionMode: this.executionMode,
        activeAgents: this.agents.size,
      },
      agents: status,
    };
  }

  /**
   * Shutdown all agents
   */
  async shutdown() {
    logger.info('Shutting down orchestrator');

    const cleanupPromises = [];
    
    for (const [name, agent] of this.agents) {
      cleanupPromises.push(agent.cleanup());
    }

    await Promise.all(cleanupPromises);
    
    this.agents.clear();
    this.isInitialized = false;
    
    logger.info('Orchestrator shutdown complete');
  }

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate processing time
   */
  calculateProcessingTime(requestId) {
    // Extract timestamp from request ID
    const timestamp = parseInt(requestId.split('_')[1]);
    return Date.now() - timestamp;
  }
}

module.exports = AgentOrchestrator;
