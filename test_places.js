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

const mockFetch = async (url) => {
  console.log(`[Mock Fetch Request]: ${url}`);
  
  if (url.includes('/geocode/')) {
    return {
      json: async () => ({
        status: 'OK',
        results: [
          {
            geometry: {
              location: { lat: 13.0827, lng: 80.2707 }
            }
          }
        ]
      })
    };
  }

  if (url.includes('/place/nearbysearch/') || url.includes('/place/textsearch/')) {
    // Check if it's the second page request
    if (url.includes('pagetoken=')) {
      return {
        json: async () => ({
          status: 'OK',
          results: [
            {
              place_id: 'mock_place_page2_1',
              name: 'Dr. Page Two Specialist',
              business_status: 'OPERATIONAL',
              rating: 4.2,
              user_ratings_total: 12,
              vicinity: 'Chennai Central, Chennai'
            }
          ]
        })
      };
    }

    // First page request
    return {
      json: async () => ({
        status: 'OK',
        next_page_token: 'mock_token_xyz',
        results: [
          {
            place_id: 'mock_place_1',
            name: 'Dr. Chennai Dental Clinic',
            business_status: 'OPERATIONAL',
            rating: 4.8,
            user_ratings_total: 45,
            vicinity: 'Mylapore, Chennai'
          },
          {
            place_id: 'mock_place_2',
            name: 'Dr. Poorly Rated Clinic',
            business_status: 'OPERATIONAL',
            rating: 2.2, // Will be filtered out
            user_ratings_total: 2,
            vicinity: 'Adyar, Chennai'
          }
        ]
      })
    };
  }

  return {
    json: async () => ({ status: 'ZERO_RESULTS' })
  };
};

const test = async () => {
  console.log('--- STARTING PLACES & REDIS INTEGRATION TEST ---');
  
  // Install mock fetch globally
  global.fetch = mockFetch;

  // Connect to DB
  console.log('Connecting to database...');
  await connectDb();
  
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
