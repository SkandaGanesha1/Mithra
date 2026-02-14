/**
 * MasterBridge Flow
 * Orchestrates parallel execution of Vision and Voice agents,
 * then sequentially processes through Location and UI generators
 */

const { defineFlow } = require('@genkit-ai/flow');
const { z } = require('zod');
const logger = require('../../utils/logger');
const { VisionAgent } = require('../agents/VisionAgent');
const { VoiceAgent } = require('../agents/VoiceAgent');
const { LocationAgent } = require('../agents/LocationAgent');
const { UIGenerator } = require('../agents/UIGenerator');

// Input schema for MasterBridge
const MasterBridgeInputSchema = z.object({
  imageBase64: z.string().optional(),
  videoBase64: z.string().optional(),
  imageMimeType: z.string().default('image/jpeg'),
  audioBase64: z.string(),
  audioMimeType: z.string().default('audio/mp3'),
  latitude: z.number(),
  longitude: z.number(),
});

// Output schema for MasterBridge
const MasterBridgeOutputSchema = z.object({
  visual_context: z.any(),
  voice_analysis: z.any(),
  location_data: z.any(),
  generated_ui: z.any(),
  processing_time_ms: z.number(),
  success: z.boolean(),
});

/**
 * MasterBridge - Main Orchestration Flow
 * 
 * Execution Pattern:
 * 1. PARALLEL: VisionAgent + VoiceAgent (Promise.all)
 * 2. SEQUENTIAL: LocationAgent (uses outputs from step 1)
 * 3. SEQUENTIAL: UIGenerator (uses all outputs)
 */
const MasterBridge = defineFlow(
  {
    name: 'masterBridge',
    inputSchema: MasterBridgeInputSchema,
    outputSchema: MasterBridgeOutputSchema,
  },
  async (input) => {
    const startTime = Date.now();
    
    logger.info('🌉 MasterBridge flow started', {
      hasImage: !!input.imageBase64,
      hasVideo: !!input.videoBase64,
      hasAudio: !!input.audioBase64,
      location: { lat: input.latitude, lng: input.longitude },
    });

    try {
      // PHASE 1: PARALLEL EXECUTION - Vision & Voice Agents
      logger.info('⚡ Phase 1: Running Vision and Voice agents in PARALLEL');
      
      const [visualResult, voiceResult] = await Promise.all([
        // VisionAgent processes image/video
        VisionAgent.invoke({
          imageBase64: input.imageBase64,
          videoBase64: input.videoBase64,
          mimeType: input.imageMimeType,
        }),
        // VoiceAgent processes audio
        VoiceAgent.invoke({
          audioBase64: input.audioBase64,
          mimeType: input.audioMimeType,
        }),
      ]);

      logger.info('✅ Phase 1 Complete - Parallel agents finished', {
        visionCategory: visualResult.category,
        voiceLanguage: voiceResult.language,
        voiceSentiment: voiceResult.sentiment,
      });

      // PHASE 2: SEQUENTIAL - LocationAgent
      logger.info('📍 Phase 2: Running LocationAgent');
      
      const locationResult = await LocationAgent.invoke({
        latitude: input.latitude,
        longitude: input.longitude,
        intent: voiceResult.intent,
        language: voiceResult.language,
      });

      logger.info('✅ Phase 2 Complete - LocationAgent finished', {
        servicesFound: locationResult.nearby_services.length,
      });

      // PHASE 3: SEQUENTIAL - UIGenerator
      logger.info('🎨 Phase 3: Running UIGenerator');
      
      const uiResult = await UIGenerator.invoke({
        visual_context: visualResult,
        voice_analysis: voiceResult,
        location_data: locationResult,
      });

      logger.info('✅ Phase 3 Complete - UIGenerator finished', {
        language: uiResult.language,
        uiMode: uiResult.ui_mode,
      });

      const processingTime = Date.now() - startTime;

      logger.info('🎉 MasterBridge flow completed successfully', {
        totalTime: processingTime + 'ms',
      });

      return {
        visual_context: visualResult,
        voice_analysis: voiceResult,
        location_data: locationResult,
        generated_ui: uiResult,
        processing_time_ms: processingTime,
        success: true,
      };

    } catch (error) {
      logger.error('❌ MasterBridge flow failed', {
        error: error.message,
        stack: error.stack,
      });

      const processingTime = Date.now() - startTime;

      return {
        visual_context: null,
        voice_analysis: null,
        location_data: null,
        generated_ui: null,
        processing_time_ms: processingTime,
        success: false,
      };
    }
  }
);

module.exports = { MasterBridge, MasterBridgeInputSchema, MasterBridgeOutputSchema };
