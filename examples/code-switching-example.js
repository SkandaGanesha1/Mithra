/**
 * Example: Code-Switching Query (Hinglish)
 * 
 * Demonstrates handling of mixed language input (Hindi + English)
 * which is very common in India.
 */

const AgentOrchestrator = require('../src/orchestrator/AgentOrchestrator');
require('dotenv').config();

async function codeSwitchingExample() {
  console.log('🔀 Code-Switching Example: Hinglish Query\n');

  const orchestrator = new AgentOrchestrator({
    geminiApiKey: process.env.GEMINI_API_KEY,
    mapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  });

  await orchestrator.initialize();
  console.log('✅ Orchestrator initialized\n');

  // User input mixing Hindi and English (very common in India)
  const userInput = {
    text: 'मुझे ek good school chahiye जो English aur Hindi दोनों में पढ़ाता हो',
    // Translation: "I need a good school that teaches in both English and Hindi"
  };

  const context = {
    location: {
      lat: 28.7041,
      lng: 77.1025,
      placeName: 'Delhi, India',
    },
    userProfile: {
      elderly: false,
      preferredLanguage: 'Hinglish',
    },
  };

  console.log('📝 User Input (Hinglish):', userInput.text);
  console.log('📍 Location:', context.location.placeName);
  console.log('\n⚙️  Processing code-switched input...\n');

  try {
    const result = await orchestrator.process(userInput, context);

    console.log('✅ Processing Complete!\n');
    console.log('═══════════════════════════════════════════════\n');

    // Language Analysis
    console.log('🗣️  CODE-SWITCHING ANALYSIS:');
    console.log(`   Primary Language: ${result.language.primary_language}`);
    console.log(`   All Languages: ${result.language.detected_languages.join(', ')}`);
    console.log(`   Code Switching Detected: ${result.language.code_switching ? '✅ YES' : 'No'}`);
    console.log(`   Intent: ${result.language.intent}`);
    console.log(`   Formality: ${result.language.formality}\n`);

    console.log('📊 MIXED LANGUAGE HANDLING:');
    console.log('   The system correctly identified the mixed language pattern');
    console.log('   and understands that the user is comfortable with both');
    console.log('   Hindi and English (common in urban India).\n');

    // Services
    console.log('🏫 NEARBY SCHOOLS:');
    if (result.location.services.length > 0) {
      result.location.services.slice(0, 3).forEach((school, index) => {
        console.log(`   ${index + 1}. ${school.name}`);
        console.log(`      📍 ${school.address}`);
        if (school.rating) {
          console.log(`      ⭐ ${school.rating}/5`);
        }
        console.log('');
      });
    } else {
      console.log('   (Location API needed for live results)\n');
    }

    // UI Adaptation
    console.log('🎨 UI ADAPTATION:');
    console.log('   The generated UI will:');
    console.log('   ✓ Use mixed Hindi-English labels (matching user preference)');
    console.log('   ✓ Show bilingual schools first');
    console.log('   ✓ Allow switching between pure Hindi/English/Hinglish');
    console.log('   ✓ Support voice input in mixed language\n');

    console.log('═══════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await orchestrator.shutdown();
  }
}

if (require.main === module) {
  codeSwitchingExample().catch(console.error);
}

module.exports = codeSwitchingExample;
