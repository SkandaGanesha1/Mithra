/**
 * VisionAgent - Gemini 1.5 Pro Vision
 * Identifies objects, medicines, and crop diseases from images/videos
 */

const { defineFlow } = require('@genkit-ai/flow');
const { generate } = require('@genkit-ai/ai');
const { z } = require('zod');
const logger = require('../../utils/logger');

// Input schema
const VisionInputSchema = z.object({
  imageBase64: z.string().optional(),
  videoBase64: z.string().optional(),
  mimeType: z.string().default('image/jpeg'),
});

// Output schema
const VisionOutputSchema = z.object({
  visual_context: z.string(),
  identified_objects: z.array(z.string()),
  category: z.enum(['medicine', 'crop', 'document', 'general']),
  details: z.object({
    medicine_name: z.string().optional(),
    usage_instructions: z.string().optional(),
    crop_type: z.string().optional(),
    disease_identified: z.string().optional(),
    extracted_text: z.string().optional(),
  }).optional(),
  confidence: z.number(),
});

// System prompt for VisionAgent
const VISION_SYSTEM_PROMPT = `You are an expert Indian rural assistant with deep knowledge of healthcare, agriculture, and document processing.

Your responsibilities:
1. If you see a medicine strip or medical packaging:
   - Identify the drug name accurately
   - Provide usage instructions in simple terms
   - Note any warnings or dosage information visible
   - Consider Indian pharmaceutical brands (e.g., Cipla, Sun Pharma)

2. If you see crops or plants:
   - Identify the crop type (wheat, rice, cotton, etc.)
   - Detect any visible diseases (e.g., Wheat Rust, Rice Blast, Cotton Bollworm)
   - Suggest severity level
   - Note any pest damage

3. If you see documents:
   - Extract text using OCR capabilities
   - Identify document type (Ration Card, Aadhaar, prescription, etc.)
   - Note important information

4. For any other objects:
   - Provide clear description
   - Note context and relevance

CRITICAL: Your response must be in JSON format matching this structure:
{
  "visual_context": "Brief description of what you see",
  "identified_objects": ["object1", "object2"],
  "category": "medicine|crop|document|general",
  "details": {
    "medicine_name": "if applicable",
    "usage_instructions": "if applicable",
    "crop_type": "if applicable",
    "disease_identified": "if applicable",
    "extracted_text": "if applicable"
  },
  "confidence": 0.0-1.0
}`;

/**
 * VisionAgent Flow
 * Processes image/video input and returns structured visual analysis
 */
const VisionAgent = defineFlow(
  {
    name: 'visionAgent',
    inputSchema: VisionInputSchema,
    outputSchema: VisionOutputSchema,
  },
  async (input) => {
    logger.info('VisionAgent processing input', {
      hasImage: !!input.imageBase64,
      hasVideo: !!input.videoBase64,
      mimeType: input.mimeType,
    });

    try {
      const mediaContent = input.videoBase64 || input.imageBase64;
      
      if (!mediaContent) {
        throw new Error('No image or video data provided');
      }

      // Prepare the prompt with image/video
      const prompt = {
        text: VISION_SYSTEM_PROMPT + '\n\nAnalyze this image/video and provide the JSON response:',
        media: {
          contentType: input.mimeType,
          data: mediaContent,
        },
      };

      // Generate response using Gemini 1.5 Pro Vision
      const result = await generate({
        model: 'googleai/gemini-1.5-pro',
        prompt: prompt,
        config: {
          temperature: 0.2, // Lower temperature for more consistent analysis
          maxOutputTokens: 1024,
        },
      });

      // Parse JSON response
      const responseText = result.text();
      logger.debug('VisionAgent raw response', { responseText });

      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from vision response');
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      logger.info('VisionAgent completed successfully', {
        category: parsedResponse.category,
        confidence: parsedResponse.confidence,
      });

      return parsedResponse;
    } catch (error) {
      logger.error('VisionAgent failed', { error: error.message });
      
      // Return fallback response
      return {
        visual_context: 'Unable to analyze image',
        identified_objects: [],
        category: 'general',
        details: {},
        confidence: 0,
      };
    }
  }
);

module.exports = { VisionAgent, VisionInputSchema, VisionOutputSchema };
