/**
 * UI Generator Agent
 * 
 * Creates Generative UI micro-apps on-the-fly using Gemini 3.
 * Generates React components, UI layouts, and interactive interfaces.
 */

const BaseAgent = require('../base/BaseAgent');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../../utils/logger');

class UIGeneratorAgent extends BaseAgent {
  constructor(config = {}) {
    super('UIGeneratorAgent', config);
    
    this.geminiApiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
    this.model = config.model || process.env.GEMINI_MODEL || 'gemini-3-pro';
  }

  async initialize() {
    await super.initialize();
    
    try {
      this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
      this.geminiModel = this.genAI.getGenerativeModel({ model: this.model });
      logger.info('UI Generator Agent initialized with Gemini 3');
      return true;
    } catch (error) {
      logger.error('Failed to initialize UI Generator Agent', { error });
      throw error;
    }
  }

  async execute(input, context) {
    const { intent, language, services, userProfile } = input;
    
    logger.info('Generating UI', { intent, language });
    
    // Generate UI based on intent and context
    const uiSpec = await this.generateUISpecification(input);
    const componentCode = await this.generateComponentCode(uiSpec, language);
    const styling = await this.generateStyling(uiSpec, userProfile);
    
    return {
      success: true,
      ui: {
        specification: uiSpec,
        component: componentCode,
        styling,
        accessibility: this.getAccessibilityFeatures(userProfile),
      },
      timestamp: new Date().toISOString(),
    };
  }

  async generateUISpecification(input) {
    const { intent, language, services, locationContext } = input;
    
    const prompt = `Generate a UI specification for a micro-app with the following requirements:

Intent: ${intent}
Language: ${language}
Available Services: ${JSON.stringify(services || [])}
Location Context: ${JSON.stringify(locationContext || {})}

Create a UI specification in JSON format that includes:
1. layout: Overall layout structure (list, grid, form, etc.)
2. components: Array of UI components needed
3. interactions: User interactions and navigation
4. data_display: How to display the service data
5. call_to_actions: Primary and secondary actions
6. voice_support: Whether voice navigation is needed
7. accessibility: Accessibility requirements

Return ONLY valid JSON, no additional text.`;

    try {
      const result = await this.geminiModel.generateContent(prompt);
      const response = await result.response;
      const specText = response.text();
      
      const jsonMatch = specText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.getDefaultUISpec(intent);
      }
      
      return JSON.parse(jsonMatch[0]);
      
    } catch (error) {
      logger.error('Failed to generate UI specification', { error });
      return this.getDefaultUISpec(intent);
    }
  }

  async generateComponentCode(uiSpec, language) {
    logger.info('Generating component code', { language });
    
    const prompt = `Generate a React functional component based on this UI specification:

${JSON.stringify(uiSpec, null, 2)}

The component should:
1. Be written in modern React with hooks
2. Support the language: ${language}
3. Include proper prop-types or TypeScript types
4. Be responsive and mobile-first
5. Include accessibility attributes
6. Handle loading and error states

Return ONLY the JavaScript/JSX code, no markdown or additional text.`;

    try {
      const result = await this.geminiModel.generateContent(prompt);
      const response = await result.response;
      const code = response.text();
      
      // Clean up the code (remove markdown code blocks if present)
      const cleanCode = code
        .replace(/```jsx?\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      return cleanCode;
      
    } catch (error) {
      logger.error('Failed to generate component code', { error });
      return this.getDefaultComponent(uiSpec);
    }
  }

  async generateStyling(uiSpec, userProfile) {
    logger.info('Generating styling');
    
    // Determine styling preferences based on user profile
    const fontSize = userProfile?.elderly ? 'large' : 'medium';
    const colorScheme = userProfile?.theme || 'light';
    const spacing = userProfile?.elderly ? 'comfortable' : 'compact';
    
    return {
      fontSize,
      colorScheme,
      spacing,
      theme: {
        primary: '#4285F4',
        secondary: '#34A853',
        accent: '#FBBC04',
        error: '#EA4335',
        background: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
        text: colorScheme === 'dark' ? '#ffffff' : '#000000',
      },
      responsive: {
        mobile: '320px',
        tablet: '768px',
        desktop: '1024px',
      },
    };
  }

  getAccessibilityFeatures(userProfile) {
    const features = {
      screenReaderSupport: true,
      keyboardNavigation: true,
      highContrast: false,
      largeText: false,
      voiceControl: false,
    };
    
    if (userProfile?.elderly) {
      features.largeText = true;
      features.highContrast = true;
    }
    
    if (userProfile?.visuallyImpaired) {
      features.screenReaderSupport = true;
      features.highContrast = true;
      features.voiceControl = true;
    }
    
    if (userProfile?.lowLiteracy) {
      features.voiceControl = true;
      features.iconBased = true;
    }
    
    return features;
  }

  getDefaultUISpec(intent) {
    return {
      layout: 'list',
      components: ['header', 'searchBar', 'serviceList', 'footer'],
      interactions: ['tap', 'scroll', 'search'],
      data_display: 'cards',
      call_to_actions: {
        primary: 'Select Service',
        secondary: 'View Details',
      },
      voice_support: true,
      accessibility: {
        screenReader: true,
        largeText: false,
      },
    };
  }

  getDefaultComponent(uiSpec) {
    return `
import React from 'react';

const MicroApp = ({ data, language }) => {
  return (
    <div className="micro-app">
      <h1>Service App</h1>
      <div className="content">
        {data && data.map((item, index) => (
          <div key={index} className="service-card">
            <h2>{item.name}</h2>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MicroApp;
    `.trim();
  }
}

module.exports = UIGeneratorAgent;
