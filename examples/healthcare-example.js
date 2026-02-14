/**
 * Example: Healthcare Query in Hindi
 * 
 * Demonstrates how to use the Bhasha Bridge AI system to process
 * a healthcare-related query in Hindi and generate a micro-app.
 */

const AgentOrchestrator = require('../src/orchestrator/AgentOrchestrator');
require('dotenv').config();

async function healthcareExample() {
  console.log('🏥 Healthcare Example: Finding a Doctor in Hindi\n');

  // Initialize the orchestrator
  const orchestrator = new AgentOrchestrator({
    geminiApiKey: process.env.GEMINI_API_KEY,
    mapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  });

  await orchestrator.initialize();
  console.log('✅ Orchestrator initialized\n');

  // User input in Hindi: "I need a doctor in my village"
  const userInput = {
    text: 'मुझे अपने गांव में डॉक्टर चाहिए',
  };

  // Context: User's location (example: rural Maharashtra)
  const context = {
    location: {
      lat: 19.2183,
      lng: 72.9781,
      placeName: 'Thane, Maharashtra',
    },
    userProfile: {
      elderly: false,
      lowLiteracy: true,
      preferredLanguage: 'Hindi',
    },
  };

  console.log('📝 User Input:', userInput.text);
  console.log('📍 Location:', context.location.placeName);
  console.log('\n⚙️  Processing through agent pipeline...\n');

  try {
    // Process the request
    const result = await orchestrator.process(userInput, context);

    // Display results
    console.log('✅ Processing Complete!\n');
    console.log('═══════════════════════════════════════════════\n');

    // Language Analysis
    console.log('🗣️  LANGUAGE ANALYSIS:');
    console.log(`   Primary Language: ${result.language.primary_language}`);
    console.log(`   Intent: ${result.language.intent}`);
    console.log(`   Code Switching: ${result.language.code_switching ? 'Yes' : 'No'}`);
    console.log(`   Confidence: ${(result.language.confidence * 100).toFixed(1)}%\n`);

    // Location Context
    console.log('📍 LOCATION CONTEXT:');
    if (result.location.location) {
      console.log(`   Address: ${result.location.location.formattedAddress}`);
    }
    console.log(`   Nearby Services: ${result.location.services.length} found\n`);

    // Display top services
    if (result.location.services.length > 0) {
      console.log('   🏥 Top Nearby Healthcare Services:');
      result.location.services.slice(0, 3).forEach((service, index) => {
        console.log(`   ${index + 1}. ${service.name}`);
        console.log(`      📍 ${service.address}`);
        if (service.rating) {
          console.log(`      ⭐ Rating: ${service.rating}`);
        }
        console.log('');
      });
    }

    // UI Generation
    console.log('🎨 GENERATED UI:');
    console.log(`   Layout: ${result.ui.specification.layout}`);
    console.log(`   Components: ${result.ui.specification.components.join(', ')}`);
    console.log(`   Voice Support: ${result.ui.specification.voice_support ? 'Enabled' : 'Disabled'}`);
    console.log(`   Accessibility: ${JSON.stringify(result.ui.accessibility)}\n`);

    // Performance Metrics
    console.log('⚡ PERFORMANCE:');
    console.log(`   Processing Time: ${result.processingTime}ms`);
    console.log(`   Generated At: ${result.generatedAt}\n`);

    console.log('═══════════════════════════════════════════════\n');
    console.log('✨ Micro-app generated successfully!\n');
    console.log('📱 The user would now see a fully functional healthcare');
    console.log('   app in Hindi with nearby doctors, booking options,');
    console.log('   and voice navigation support.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await orchestrator.shutdown();
    console.log('🛑 Orchestrator shutdown complete');
  }
}

// Run the example
if (require.main === module) {
  healthcareExample().catch(console.error);
}

module.exports = healthcareExample;
