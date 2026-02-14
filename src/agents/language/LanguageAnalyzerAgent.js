/**
 * Language Analyzer Agent
 * 
 * Detects language, dialect, and code-switching patterns using Gemini 3.
 * Handles 22+ Indian languages and various dialects.
 */

const BaseAgent = require('../base/BaseAgent');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../../utils/logger');

class LanguageAnalyzerAgent extends BaseAgent {
  constructor(config = {}) {
    super('LanguageAnalyzerAgent', config);
    
    this.geminiApiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
    this.model = config.model || process.env.GEMINI_MODEL || 'gemini-3-pro';
    this.supportedLanguages = [
      'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Urdu',
      'Kannada', 'Odia', 'Malayalam', 'Punjabi', 'Assamese', 'Maithili',
      'Sanskrit', 'Konkani', 'Nepali', 'Sindhi', 'Dogri', 'Kashmiri',
      'Manipuri', 'Santali', 'Bodo'
    ];
  }

  async initialize() {
    await super.initialize();
    
    try {
      this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
      this.geminiModel = this.genAI.getGenerativeModel({ model: this.model });
      logger.info('Language Analyzer Agent initialized with Gemini 3');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Language Analyzer Agent', { error });
      throw error;
    }
  }

  async execute(input, context) {
    const { text, audio, image } = input;
    
    // Analyze text input
    if (text) {
      return await this.analyzeText(text, context);
    }
    
    // TODO: Add audio and image analysis for multimodal support
    if (audio) {
      return await this.analyzeAudio(audio, context);
    }
    
    if (image) {
      return await this.analyzeImage(image, context);
    }
    
    throw new Error('No valid input provided to Language Analyzer Agent');
  }

  async analyzeText(text, context = {}) {
    logger.info('Analyzing text for language detection', { textLength: text.length });
    
    const prompt = `Analyze the following text and provide a detailed linguistic analysis:

Text: "${text}"

Provide the following information in JSON format:
1. primary_language: The main language used (from Indian languages)
2. detected_languages: All languages detected (array)
3. code_switching: Whether the text contains mixed languages (boolean)
4. dialect: Any specific dialect or regional variant detected
5. formality: Level of formality (casual, formal, mixed)
6. intent: The user's likely intent (query, request, information_seeking, etc.)
7. sentiment: Overall sentiment (positive, negative, neutral)
8. key_entities: Important entities mentioned (people, places, dates, etc.)
9. confidence: Confidence score (0-1)

Return ONLY valid JSON, no additional text.`;

    try {
      const result = await this.geminiModel.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();
      
      // Parse JSON response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse JSON from Gemini response');
      }
      
      const analysis = JSON.parse(jsonMatch[0]);
      
      logger.info('Language analysis completed', { analysis });
      
      return {
        success: true,
        analysis,
        originalText: text,
        timestamp: new Date().toISOString(),
      };
      
    } catch (error) {
      logger.error('Language analysis failed', { error });
      
      // Fallback: Basic language detection
      return this.fallbackAnalysis(text);
    }
  }

  async analyzeAudio(audio, context = {}) {
    // TODO: Implement audio analysis with Gemini 3's multimodal capabilities
    logger.info('Audio analysis requested (not yet implemented)');
    return {
      success: false,
      message: 'Audio analysis coming soon',
    };
  }

  async analyzeImage(image, context = {}) {
    // TODO: Implement image OCR and text extraction
    logger.info('Image analysis requested (not yet implemented)');
    return {
      success: false,
      message: 'Image analysis coming soon',
    };
  }

  /**
   * Fallback analysis when Gemini API fails
   */
  fallbackAnalysis(text) {
    const analysis = {
      primary_language: this.detectPrimaryLanguage(text),
      detected_languages: [this.detectPrimaryLanguage(text)],
      code_switching: this.detectCodeSwitching(text),
      dialect: 'unknown',
      formality: 'mixed',
      intent: 'query',
      sentiment: 'neutral',
      key_entities: [],
      confidence: 0.5,
    };
    
    return {
      success: true,
      analysis,
      originalText: text,
      fallback: true,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Simple language detection (fallback)
   */
  detectPrimaryLanguage(text) {
    // Check for Devanagari script (Hindi, Marathi, Sanskrit)
    if (/[\u0900-\u097F]/.test(text)) return 'Hindi';
    
    // Check for Bengali script
    if (/[\u0980-\u09FF]/.test(text)) return 'Bengali';
    
    // Check for Telugu script
    if (/[\u0C00-\u0C7F]/.test(text)) return 'Telugu';
    
    // Check for Tamil script
    if (/[\u0B80-\u0BFF]/.test(text)) return 'Tamil';
    
    // Check for Gujarati script
    if (/[\u0A80-\u0AFF]/.test(text)) return 'Gujarati';
    
    // Check for Kannada script
    if (/[\u0C80-\u0CFF]/.test(text)) return 'Kannada';
    
    // Check for Malayalam script
    if (/[\u0D00-\u0D7F]/.test(text)) return 'Malayalam';
    
    // Default to English for Latin script
    return 'English';
  }

  /**
   * Detect code-switching (simplified)
   */
  detectCodeSwitching(text) {
    const hasIndianScript = /[\u0900-\u0DFF]/.test(text);
    const hasLatinScript = /[a-zA-Z]/.test(text);
    return hasIndianScript && hasLatinScript;
  }
}

module.exports = LanguageAnalyzerAgent;
