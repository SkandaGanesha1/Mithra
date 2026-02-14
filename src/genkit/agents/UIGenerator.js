/**
 * UIGenerator Agent
 * Generates React components in the detected language
 */

const { defineFlow } = require('@genkit-ai/flow');
const { generate } = require('@genkit-ai/ai');
const { z } = require('zod');
const logger = require('../../utils/logger');

// Input schema
const UIGeneratorInputSchema = z.object({
  visual_context: z.any(),
  voice_analysis: z.any(),
  location_data: z.any(),
});

// Output schema
const UIGeneratorOutputSchema = z.object({
  component_code: z.string(),
  language: z.string(),
  ui_mode: z.enum(['emergency', 'normal', 'informational']),
});

// System prompt for UIGenerator
const UI_GENERATOR_SYSTEM_PROMPT = `You are a 'Vibe Coder' for mobile apps, specializing in creating culturally appropriate UI for Indian users.

INPUT DATA:
- visual_context: What the camera saw
- voice_analysis: What the user said (with transcript, language, sentiment)
- location_data: Nearby services

YOUR TASK:
Generate a complete React Component using Tailwind CSS that:

1. LANGUAGE RULES:
   - Use the DETECTED LANGUAGE from voice_analysis.language
   - All text, labels, buttons must be in that language
   - Support Hindi, Tamil, Bengali, Marathi, Telugu, Gujarati, etc.

2. SENTIMENT-BASED STYLING:
   - If sentiment is 'urgent': Use big red buttons, large fonts, emergency mode
   - If sentiment is 'confused': Use step-by-step guidance, simple language
   - If sentiment is 'calm': Use normal, clean UI
   
3. CONTEXT-SPECIFIC UI:
   - Medical context: Show dosage icons (☀️ Morning, 🌙 Night)
   - Agriculture: Show crop images, disease severity
   - Education: Show school info cards
   - Emergency: Show big action buttons (📞 Call Doctor/Police)

4. VISUAL ELEMENTS:
   - Use emojis for clarity (helpful for low-literacy users)
   - Big, clear buttons with icons
   - Cards for each service
   - Contact buttons for phone calls

5. COMPONENT STRUCTURE:
   - Must be a complete, self-contained React component
   - Use Tailwind CSS classes
   - Include all necessary imports
   - Return ONLY the raw JSX code, no markdown

EXAMPLE OUTPUT FORMAT:
import React from 'react';

export default function BhashaBridgeUI() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      {/* Your UI here */}
    </div>
  );
}`;

/**
 * UIGenerator Flow
 * Generates React component based on combined agent outputs
 */
const UIGenerator = defineFlow(
  {
    name: 'uiGenerator',
    inputSchema: UIGeneratorInputSchema,
    outputSchema: UIGeneratorOutputSchema,
  },
  async (input) => {
    logger.info('UIGenerator processing input', {
      hasVisual: !!input.visual_context,
      hasVoice: !!input.voice_analysis,
      hasLocation: !!input.location_data,
    });

    try {
      // Prepare the context for UI generation
      const context = JSON.stringify({
        visual_context: input.visual_context,
        voice_analysis: input.voice_analysis,
        location_data: input.location_data,
      }, null, 2);

      const prompt = UI_GENERATOR_SYSTEM_PROMPT + `

CONTEXT DATA:
${context}

Generate the React component now:`;

      // Generate UI using Gemini 1.5 Pro
      const result = await generate({
        model: 'googleai/gemini-1.5-pro',
        prompt: prompt,
        config: {
          temperature: 0.7, // Higher creativity for UI generation
          maxOutputTokens: 2048,
        },
      });

      const componentCode = result.text();
      
      // Clean up the code (remove markdown if present)
      let cleanCode = componentCode.trim();
      if (cleanCode.startsWith('```')) {
        cleanCode = cleanCode.replace(/```[a-z]*\n/g, '').replace(/```$/g, '').trim();
      }

      // Determine UI mode based on sentiment
      let uiMode = 'normal';
      if (input.voice_analysis && input.voice_analysis.sentiment === 'urgent') {
        uiMode = 'emergency';
      } else if (input.visual_context && input.visual_context.category === 'document') {
        uiMode = 'informational';
      }

      const language = input.voice_analysis?.language || 'Hindi';

      logger.info('UIGenerator completed successfully', {
        codeLength: cleanCode.length,
        language: language,
        uiMode: uiMode,
      });

      return {
        component_code: cleanCode,
        language: language,
        ui_mode: uiMode,
      };
    } catch (error) {
      logger.error('UIGenerator failed', { error: error.message });
      
      // Return fallback UI
      const fallbackCode = `import React from 'react';

export default function BhashaBridgeUI() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="text-center mt-20">
        <h1 className="text-2xl font-bold text-gray-800">
          कृपया पुनः प्रयास करें
        </h1>
        <p className="text-gray-600 mt-4">
          Please try again
        </p>
      </div>
    </div>
  );
}`;

      return {
        component_code: fallbackCode,
        language: 'Hindi',
        ui_mode: 'normal',
      };
    }
  }
);

module.exports = { UIGenerator, UIGeneratorInputSchema, UIGeneratorOutputSchema };
