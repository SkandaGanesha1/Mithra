/**
 * Location Context Agent
 * 
 * Provides hyperlocal intelligence using Google Maps, government APIs,
 * and Gemini 3's 1M context window for regional understanding.
 */

const BaseAgent = require('../base/BaseAgent');
const axios = require('axios');
const logger = require('../../utils/logger');

class LocationContextAgent extends BaseAgent {
  constructor(config = {}) {
    super('LocationContextAgent', config);
    
    this.googleMapsApiKey = config.mapsApiKey || process.env.GOOGLE_MAPS_API_KEY;
    this.maxRadius = config.maxRadius || 50000; // 50km default
  }

  async initialize() {
    await super.initialize();
    logger.info('Location Context Agent initialized');
    return true;
  }

  async execute(input, context) {
    const { location, intent, language } = input;
    
    if (!location) {
      throw new Error('Location is required for Location Context Agent');
    }
    
    logger.info('Processing location context', { location, intent });
    
    // Gather location-based context
    const locationData = await this.getLocationData(location);
    const nearbyServices = await this.getNearbyServices(location, intent);
    const localContext = await this.getLocalContext(location, language);
    const governmentServices = await this.getGovernmentServices(location, intent);
    
    return {
      success: true,
      location: locationData,
      services: nearbyServices,
      context: localContext,
      government: governmentServices,
      timestamp: new Date().toISOString(),
    };
  }

  async getLocationData(location) {
    logger.info('Fetching location data', { location });
    
    try {
      // If location is lat/lng
      if (location.lat && location.lng) {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json`,
          {
            params: {
              latlng: `${location.lat},${location.lng}`,
              key: this.googleMapsApiKey,
            },
          }
        );
        
        if (response.data.results && response.data.results.length > 0) {
          const result = response.data.results[0];
          return {
            formattedAddress: result.formatted_address,
            components: result.address_components,
            placeId: result.place_id,
            coordinates: location,
          };
        }
      }
      
      // If location is a place name
      if (location.placeName) {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json`,
          {
            params: {
              address: location.placeName,
              key: this.googleMapsApiKey,
            },
          }
        );
        
        if (response.data.results && response.data.results.length > 0) {
          const result = response.data.results[0];
          return {
            formattedAddress: result.formatted_address,
            components: result.address_components,
            placeId: result.place_id,
            coordinates: result.geometry.location,
          };
        }
      }
      
      return null;
      
    } catch (error) {
      logger.error('Failed to fetch location data', { error });
      return null;
    }
  }

  async getNearbyServices(location, intent) {
    logger.info('Fetching nearby services', { location, intent });
    
    // Determine service type based on intent
    const serviceType = this.mapIntentToServiceType(intent);
    
    if (!serviceType) {
      return [];
    }
    
    try {
      const coords = location.lat && location.lng 
        ? location 
        : await this.getCoordinates(location);
      
      if (!coords || !coords.lat || !coords.lng) {
        return [];
      }
      
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
        {
          params: {
            location: `${coords.lat},${coords.lng}`,
            radius: this.maxRadius,
            type: serviceType,
            key: this.googleMapsApiKey,
          },
        }
      );
      
      if (response.data.results) {
        return response.data.results.slice(0, 10).map(place => ({
          name: place.name,
          address: place.vicinity,
          rating: place.rating,
          openNow: place.opening_hours?.open_now,
          placeId: place.place_id,
          location: place.geometry.location,
        }));
      }
      
      return [];
      
    } catch (error) {
      logger.error('Failed to fetch nearby services', { error });
      return [];
    }
  }

  async getLocalContext(location, language) {
    logger.info('Gathering local context', { location, language });
    
    // TODO: Integrate with local databases for:
    // - Local festivals and holidays
    // - Regional customs and cultural considerations
    // - Local transportation options
    // - Weather conditions
    // - Regional regulations
    
    return {
      festivals: [],
      customs: [],
      transportation: [],
      weather: null,
      regulations: [],
    };
  }

  async getGovernmentServices(location, intent) {
    logger.info('Fetching government services', { location, intent });
    
    // TODO: Integrate with Indian government APIs:
    // - DigiLocker
    // - UMANG (Unified Mobile Application for New-age Governance)
    // - mySecurity (Social Security)
    // - BHIM (UPI payments)
    // - Aarogya Setu
    // - CoWIN
    
    return {
      schemes: [],
      applications: [],
      contacts: [],
    };
  }

  mapIntentToServiceType(intent) {
    const intentMap = {
      healthcare: 'hospital',
      doctor: 'doctor',
      medical: 'pharmacy',
      education: 'school',
      school: 'school',
      government: 'local_government_office',
      police: 'police',
      emergency: 'hospital',
      bank: 'bank',
      atm: 'atm',
      restaurant: 'restaurant',
      food: 'restaurant',
      transport: 'transit_station',
      bus: 'bus_station',
      train: 'train_station',
    };
    
    return intentMap[intent?.toLowerCase()] || null;
  }

  async getCoordinates(location) {
    if (location.lat && location.lng) {
      return location;
    }
    
    const data = await this.getLocationData(location);
    return data?.coordinates || null;
  }
}

module.exports = LocationContextAgent;
