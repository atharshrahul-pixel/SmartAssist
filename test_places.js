// Test script for tasks 3, 4, 5: Redis layer, Places Fetcher, and Deduplication Service.
require('dotenv').config();
process.env.DB_PROVIDER = 'mongodb'; // Ensure we connect to MongoDB

const mongoose = require('mongoose');
const env = require('./config/env');
const connectDb = require('./config/mongodb');
const placesService = require('./services/placesService');
const specialistService = require('./services/specialistService');

// Setup mock Google API key so the placesService runs the API path
process.env.GOOGLE_PLACES_API_KEY = 'mock_key_123';

const mockFetch = async (url, options = {}) => {
  console.log(`[Mock Fetch Request]: ${url}`);
  if (options.body) {
    console.log(`[Mock Fetch Body]: ${options.body}`);
  }

  if (url.includes('api.groq.com') || url.includes('generativelanguage.googleapis.com') || url.includes('api.openai.com')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: '1'
            }
          }
        ],
        candidates: [
          {
            content: {
              parts: [
                { text: '1' }
              ]
            }
          }
        ]
      })
    };
  }
  
  if (url.includes('/geocode/address/')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        results: [
          {
            location: { latitude: 13.0827, longitude: 80.2707 }
          }
        ]
      })
    };
  }

  if (url.includes('/places:searchNearby') || url.includes('/places:searchText')) {
    const bodyObj = options.body ? JSON.parse(options.body) : {};
    
    // Check if it's the second page request
    if (bodyObj.pageToken) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          places: [
            {
              id: 'mock_place_page2_1',
              displayName: { text: 'Dr. Page Two Specialist' },
              businessStatus: 'OPERATIONAL',
              rating: 4.2,
              userRatingCount: 12,
              shortFormattedAddress: 'Chennai Central, Chennai',
              types: ['dentist', 'health', 'establishment']
            }
          ]
        })
      };
    }

    // First page request
    return {
      ok: true,
      status: 200,
      json: async () => ({
        nextPageToken: 'mock_token_xyz',
        places: [
          {
            id: 'mock_place_1',
            displayName: { text: 'Dr. Chennai Dental Clinic' },
            businessStatus: 'OPERATIONAL',
            rating: 4.8,
            userRatingCount: 45,
            shortFormattedAddress: 'Mylapore, Chennai',
            types: ['dentist', 'health', 'establishment']
          },
          {
            id: 'mock_place_2',
            displayName: { text: 'Dr. Poorly Rated Clinic' },
            businessStatus: 'OPERATIONAL',
            rating: 2.2, // Will be filtered out by rating
            userRatingCount: 2,
            shortFormattedAddress: 'Adyar, Chennai',
            types: ['dentist', 'health', 'establishment']
          },
          {
            id: 'mock_place_3',
            displayName: { text: 'The Railway Officers\' Club' },
            businessStatus: 'OPERATIONAL',
            rating: 4.3,
            userRatingCount: 577,
            shortFormattedAddress: 'Nungambakkam, Chennai',
            types: ['bar', 'social_club', 'establishment']
          }
        ]
      })
    };
  }

  return {
    ok: true,
    status: 200,
    json: async () => ({})
  };
};

const test = async () => {
  console.log('--- STARTING PLACES & REDIS INTEGRATION TEST ---');
  
  // Install mock fetch globally
  global.fetch = mockFetch;

  // Connect to DB
  console.log('Connecting to database...');
  await connectDb();

  // Clear cache keys for test
  console.log('Clearing test cache keys...');
  const cacheService = require('./services/cacheService');
  await cacheService.del('geocode:chennai_600001');
  await cacheService.del('places:data:Dentist:13.08:80.27:5000');
  await cacheService.del('places:fresh:Dentist:13.08:80.27:5000');
  
  // 1. Test Geocoding query & caching
  const query = 'Chennai 600001';
  console.log(`\n1. Geocoding address: "${query}"`);
  const coords = await placesService.getCoordinatesFromQuery(query);
  console.log('Geocoding output coordinates:', coords);

  const lat = coords.lat;
  const lng = coords.lng;

  // 2. Test fetching and caching specialists (e.g. Dentist)
  const category = 'Dentist';
  console.log(`\n2. Fetching and merging specialists for category: "${category}" at coordinates: ${lat}, ${lng}`);
  
  // First run: Cache Miss (calls mock Places API, handles 2s pagination delay, writes to cache)
  console.log('Run 1 (Expected cache miss/fetch with 2s pagination delay):');
  const start1 = Date.now();
  const specs1 = await specialistService.getSpecialists({ category, lat, lng, radius: 5000 });
  console.log(`Run 1 completed in ${Date.now() - start1}ms. Found ${specs1.length} specialists.`);
  
  // Verify that page 2 results were merged correctly
  console.log('Specialists list from Run 1:');
  specs1.forEach(s => {
    console.log(` - ID: ${s.id}, Name: ${s.name}, Rating: ${s.rating}, External: ${s.fromPlaces}`);
  });

  // Second run: Cache Hit
  console.log('\nRun 2 (Expected cache hit):');
  const start2 = Date.now();
  const specs2 = await specialistService.getSpecialists({ category, lat, lng, radius: 5000 });
  console.log(`Run 2 completed in ${Date.now() - start2}ms. Found ${specs2.length} specialists.`);
  console.log('Specialists list from Run 2:');
  specs2.forEach(s => {
    console.log(` - ID: ${s.id}, Name: ${s.name}, Cache State: ${s.fromCache}`);
  });

  // Disconnect
  console.log('\nDisconnecting from database...');
  await mongoose.disconnect();
  console.log('--- TEST COMPLETED SUCCESSFULLY ---');
  process.exit(0);
};

test().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
