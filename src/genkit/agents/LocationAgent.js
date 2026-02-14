/**
 * LocationAgent
 * Mock lookup for nearby Indian services based on intent
 */

const { defineFlow } = require('@genkit-ai/flow');
const { z } = require('zod');
const logger = require('../../utils/logger');

// Input schema
const LocationInputSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  intent: z.string(),
  language: z.string().optional(),
});

// Output schema
const LocationOutputSchema = z.object({
  nearby_services: z.array(z.object({
    name: z.string(),
    type: z.string(),
    distance: z.string(),
    address: z.string(),
    phone: z.string().optional(),
    open_now: z.boolean(),
    rating: z.number().optional(),
  })),
  location_context: z.object({
    area: z.string(),
    district: z.string().optional(),
    state: z.string().optional(),
  }),
});

/**
 * Mock Indian service database
 */
const MOCK_SERVICES = {
  healthcare: [
    { name: 'सरकारी अस्पताल (Government Hospital)', type: 'hospital', distance: '1.2 km', address: 'Main Road, Near Bus Stand', phone: '1800-123-4567', open_now: true, rating: 4.2 },
    { name: 'डॉ. शर्मा क्लिनिक (Dr. Sharma Clinic)', type: 'clinic', distance: '0.8 km', address: 'Gandhi Chowk', phone: '9876543210', open_now: true, rating: 4.5 },
    { name: 'मेडिकल स्टोर (Medical Store)', type: 'pharmacy', distance: '0.5 km', address: 'Market Area', phone: '9876543211', open_now: true, rating: 4.0 },
    { name: 'आयुष्मान केंद्र (Ayushman Center)', type: 'health_center', distance: '2.0 km', address: 'Panchayat Bhawan', phone: '1800-111-565', open_now: true, rating: 3.8 },
  ],
  agriculture: [
    { name: 'कृषि मंडी (Krishi Mandi)', type: 'mandi', distance: '3.5 km', address: 'Mandi Road', phone: '9876543220', open_now: true, rating: 4.0 },
    { name: 'कृषि विभाग केंद्र (Agri Dept Center)', type: 'agri_office', distance: '2.8 km', address: 'District HQ', phone: '0120-2345678', open_now: true, rating: 3.5 },
    { name: 'बीज भंडार (Seed Store)', type: 'seed_store', distance: '1.5 km', address: 'Station Road', phone: '9876543221', open_now: true, rating: 4.2 },
  ],
  education: [
    { name: 'राजकीय विद्यालय (Government School)', type: 'school', distance: '1.0 km', address: 'School Road', phone: '0120-2345679', open_now: true, rating: 4.0 },
    { name: 'सरस्वती विद्यालय (Saraswati School)', type: 'school', distance: '2.5 km', address: 'College Road', phone: '9876543222', open_now: true, rating: 4.3 },
    { name: 'डिजिटल सेवा केंद्र (Digital Seva Kendra)', type: 'training_center', distance: '1.8 km', address: 'Near Post Office', phone: '9876543223', open_now: true, rating: 3.9 },
  ],
  government: [
    { name: 'ग्राम पंचायत (Gram Panchayat)', type: 'panchayat', distance: '1.5 km', address: 'Panchayat Bhawan', phone: '0120-2345680', open_now: true, rating: 3.5 },
    { name: 'तहसील कार्यालय (Tehsil Office)', type: 'tehsil', distance: '5.0 km', address: 'District HQ', phone: '0120-2345681', open_now: true, rating: 3.2 },
    { name: 'जन सेवा केंद्र (Jan Seva Kendra)', type: 'service_center', distance: '0.7 km', address: 'Near Bank', phone: '9876543224', open_now: true, rating: 4.1 },
  ],
  emergency: [
    { name: 'पुलिस स्टेशन (Police Station)', type: 'police', distance: '2.0 km', address: 'Police Line', phone: '100', open_now: true, rating: 3.5 },
    { name: 'अग्निशमन केंद्र (Fire Station)', type: 'fire', distance: '3.0 km', address: 'Fire Brigade Road', phone: '101', open_now: true, rating: 3.8 },
    { name: 'एम्बुलेंस सेवा (Ambulance Service)', type: 'ambulance', distance: '1.5 km', address: 'Hospital Campus', phone: '108', open_now: true, rating: 4.0 },
  ],
};

/**
 * LocationAgent Flow
 * Returns mock nearby services based on intent
 */
const LocationAgent = defineFlow(
  {
    name: 'locationAgent',
    inputSchema: LocationInputSchema,
    outputSchema: LocationOutputSchema,
  },
  async (input) => {
    logger.info('LocationAgent processing request', {
      latitude: input.latitude,
      longitude: input.longitude,
      intent: input.intent,
    });

    try {
      // Determine service type from intent
      let serviceCategory = 'healthcare'; // default
      
      if (input.intent.includes('healthcare') || input.intent.includes('medical') || input.intent.includes('doctor')) {
        serviceCategory = 'healthcare';
      } else if (input.intent.includes('agriculture') || input.intent.includes('farm') || input.intent.includes('crop')) {
        serviceCategory = 'agriculture';
      } else if (input.intent.includes('education') || input.intent.includes('school')) {
        serviceCategory = 'education';
      } else if (input.intent.includes('government') || input.intent.includes('ration') || input.intent.includes('certificate')) {
        serviceCategory = 'government';
      } else if (input.intent.includes('emergency') || input.intent.includes('urgent')) {
        serviceCategory = 'emergency';
      }

      // Get services for the category
      const services = MOCK_SERVICES[serviceCategory] || MOCK_SERVICES.healthcare;

      // Mock location context (could be derived from lat/long in real implementation)
      const locationContext = {
        area: 'Rural Area',
        district: 'Sample District',
        state: 'Maharashtra',
      };

      const result = {
        nearby_services: services,
        location_context: locationContext,
      };

      logger.info('LocationAgent completed successfully', {
        serviceCount: services.length,
        category: serviceCategory,
      });

      return result;
    } catch (error) {
      logger.error('LocationAgent failed', { error: error.message });
      
      // Return fallback response
      return {
        nearby_services: [],
        location_context: {
          area: 'Unknown',
        },
      };
    }
  }
);

module.exports = { LocationAgent, LocationInputSchema, LocationOutputSchema };
