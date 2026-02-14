/**
 * VoiceAgent - Gemini 1.5 Flash Audio
 * Transcribes Hindi/Regional dialects and extracts intent
 */

const { defineFlow } = require('@genkit-ai/flow');
const { generate } = require('@genkit-ai/ai');
const { z } = require('zod');
const logger = require('../../utils/logger');

// Input schema
const VoiceInputSchema = z.object({
  audioBase64: z.string(),
  mimeType: z.string().default('audio/mp3'),
});

// Output schema
const VoiceOutputSchema = z.object({
  transcript: z.string(),
  language: z.string(),
  detected_languages: z.array(z.string()),
  sentiment: z.enum(['urgent', 'confused', 'calm', 'happy', 'sad', 'neutral']),
  intent: z.string(),
  entities: z.array(z.object({
    type: z.string(),
    value: z.string(),
  })),
  confidence: z.number(),
});

// System prompt for VoiceAgent
const VOICE_SYSTEM_PROMPT = `You are a linguist expert for Indian languages with native fluency in Hindi, Tamil, Bengali, Marathi, Telugu, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, and other regional languages.

Your responsibilities:
1. Transcribe the audio accurately:
   - Handle code-switching (mixing Hindi-English, Tamil-English, etc.)
   - Recognize regional accents and dialects
   - Preserve local terminology and cultural references

2. Identify the user's emotional state:
   - Urgent: Fast speech, stressed tone, emergency keywords
   - Confused: Questions, uncertain tone, seeking clarification
   - Calm: Normal pace, relaxed tone
   - Happy: Positive tone, upbeat
   - Sad: Low energy, negative keywords
   - Neutral: Matter-of-fact, informational

3. Extract intent:
   - Healthcare (medicine, doctor, hospital, disease, pain)
   - Agriculture (crop, farm, disease, pest, mandi)
   - Education (school, teacher, admission, fees)
   - Government services (ration, Aadhaar, certificate)
   - Emergency (help, urgent, accident, fire)

4. Identify entities:
   - People (names, relationships like "Dadi", "Baba", "Maa")
   - Places (village names, cities, landmarks)
   - Medical terms (medicine names, symptoms)
   - Time references (morning, evening, "subah", "shaam")

CRITICAL: Your response must be in JSON format matching this structure:
{
  "transcript": "Exact transcription of what was said",
  "language": "Primary language (Hindi/Tamil/Bengali/etc.)",
  "detected_languages": ["Hindi", "English"] if code-switching,
  "sentiment": "urgent|confused|calm|happy|sad|neutral",
  "intent": "healthcare|agriculture|education|government|emergency|general",
  "entities": [
    {"type": "person", "value": "Dadi"},
    {"type": "time", "value": "morning"}
  ],
  "confidence": 0.0-1.0
}`;

/**
 * VoiceAgent Flow
 * Processes audio input and returns structured transcription with analysis
 */
const VoiceAgent = defineFlow(
  {
    name: 'voiceAgent',
    inputSchema: VoiceInputSchema,
    outputSchema: VoiceOutputSchema,
  },
  async (input) => {
    logger.info('VoiceAgent processing audio', {
      mimeType: input.mimeType,
      audioLength: input.audioBase64.length,
    });

    try {
      // Prepare the prompt with audio
      const prompt = {
        text: VOICE_SYSTEM_PROMPT + '\n\nTranscribe and analyze this audio, then provide the JSON response:',
        media: {
          contentType: input.mimeType,
          data: input.audioBase64,
        },
      };

      // Generate response using Gemini 1.5 Flash (optimized for speed)
      const result = await generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: prompt,
        config: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      });

      // Parse JSON response
      const responseText = result.text();
      logger.debug('VoiceAgent raw response', { responseText });

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from voice response');
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      logger.info('VoiceAgent completed successfully', {
        language: parsedResponse.language,
        sentiment: parsedResponse.sentiment,
        intent: parsedResponse.intent,
      });

      return parsedResponse;
    } catch (error) {
      logger.error('VoiceAgent failed', { error: error.message });
      
      // Return fallback response
      return {
        transcript: '',
        language: 'unknown',
        detected_languages: [],
        sentiment: 'neutral',
        intent: 'general',
        entities: [],
        confidence: 0,
      };
    }
  }
);

module.exports = { VoiceAgent, VoiceInputSchema, VoiceOutputSchema };
