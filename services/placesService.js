const cacheService = require('./cacheService');

const getApiKey = () => process.env.GOOGLE_PLACES_API_KEY || '';

const CATEGORY_MAP = {
  'Dentist': { mode: 'NearbySearch', type: 'dentist' },
  'Physiotherapist': { mode: 'NearbySearch', type: 'physiotherapist' },
  'Gym Trainer': { mode: 'NearbySearch', type: 'gym' },
  'Salon Specialist': { mode: 'NearbySearch', type: 'beauty_salon' },
  'Cardiologist': { mode: 'TextSearch', query: 'cardiologist' },
  'Dermatologist': { mode: 'TextSearch', query: 'dermatologist' },
  'General Practitioner': { mode: 'TextSearch', query: 'doctor' }
};

/**
 * Normalizes geocode query and fetches/caches coordinates from Google Geocoding API
 */
const getCoordinatesFromQuery = async (query) => {
  if (!query) return null;
  const normalizedQuery = query.trim().toLowerCase().replace(/\s+/g, '_');
  const cacheKey = `geocode:${normalizedQuery}`;

  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }

  if (!getApiKey()) {
    console.warn('Google Places API key is missing. Geocoding failed.');
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${getApiKey()}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.status === 'OK' && json.results && json.results.length > 0) {
      const { lat, lng } = json.results[0].geometry.location;
      const coords = { lat, lng };
      // Cache for 7 days
      await cacheService.set(cacheKey, coords, 604800);
      return coords;
    } else {
      console.warn(`Geocoding API status error: ${json.status}`, json.error_message || '');
    }
  } catch (err) {
    console.error('Geocoding API request failed:', err.message);
  }
  return null;
};

/**
 * Calls Google Places API to search for places nearby
 */
const queryGooglePlaces = async (lat, lng, category, radius, isEscalated = false) => {
  const config = CATEGORY_MAP[category];
  if (!config) {
    console.warn(`Unsupported category for Places API: ${category}`);
    return { results: [], fromQuotaError: false };
  }

  if (!getApiKey()) {
    console.warn('Google Places API key is missing. Skipping Places search.');
    return { results: [], fromQuotaError: false };
  }

  let url = '';
  if (config.mode === 'NearbySearch') {
    url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${config.type}&key=${getApiKey()}`;
  } else {
    // TextSearch for specific medical specialties
    const queryStr = `${config.query} near ${lat},${lng}`;
    url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(queryStr)}&location=${lat},${lng}&radius=${radius}&key=${getApiKey()}`;
  }

  try {
    const res = await fetch(url);
    const page1 = await res.json();

    if (page1.status === 'OVER_QUERY_LIMIT') {
      console.warn('Google Places API key query limit reached.');
      return { results: [], fromQuotaError: true };
    }

    if (page1.status !== 'OK' && page1.status !== 'ZERO_RESULTS') {
      console.warn(`Places API error status: ${page1.status}`, page1.error_message || '');
      return { results: [], fromQuotaError: false };
    }

    let allResults = page1.results || [];

    // Pagination: fetch up to 2 pages eagerly with a mandatory 2-second delay
    if (page1.next_page_token) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const page2Url = `${url}&pagetoken=${page1.next_page_token}`;
      const res2 = await fetch(page2Url);
      const page2 = await res2.json();
      if (page2.status === 'OK' && page2.results) {
        allResults = [...allResults, ...page2.results];
      } else {
        console.warn(`Places pagination error status: ${page2.status}`, page2.error_message || '');
      }
    }

    return { results: allResults, fromQuotaError: false };
  } catch (err) {
    console.error('Google Places request failed:', err.message);
    return { results: [], fromQuotaError: false };
  }
};

/**
 * Dynamic Specialist Fetcher combining nearby searches, pagination, caching and degradation fallback rules
 */
const getSpecialistsFromPlaces = async (lat, lng, category, radius = 5000) => {
  const roundedLat = Math.round(lat * 100) / 100;
  const roundedLng = Math.round(lng * 100) / 100;

  const dataKey = `places:data:${category}:${roundedLat}:${roundedLng}:${radius}`;
  const freshKey = `places:fresh:${category}:${roundedLat}:${roundedLng}:${radius}`;

  // 1. Dual-Key Cache Check
  const freshExists = await cacheService.get(freshKey);
  const cachedData = await cacheService.get(dataKey);

  // Fresh Hit
  if (freshExists && cachedData) {
    await cacheService.increment('cache:stats:hits');
    return cachedData.map(item => ({ ...item, fromCache: 'fresh' }));
  }

  // Stale Hit (Stale-while-revalidate / Quota fallback)
  if (!freshExists && cachedData) {
    await cacheService.increment('cache:stats:hits');
    // We can try to fetch fresh in background or just return stale
    console.log(`[Cache Stale Hit] Serving stale data for: ${dataKey}`);
    return cachedData.map(item => ({ ...item, fromCache: 'stale' }));
  }

  await cacheService.increment('cache:stats:misses');

  // 2. Fetch from Places API
  let { results, fromQuotaError } = await queryGooglePlaces(lat, lng, category, radius);

  // Radius Escalation if result count < 3
  if (!fromQuotaError && results.length < 3) {
    console.log(`Fewer than 3 results at ${radius}m. Escalating radius to 10000m.`);
    const escalated = await queryGooglePlaces(lat, lng, category, 10000);
    if (!escalated.fromQuotaError) {
      results = escalated.results;
    } else {
      fromQuotaError = true;
    }
  }

  // Quota Error Fallback
  if (fromQuotaError) {
    console.warn('API Quota exhausted. No new Places requests allowed.');
    if (cachedData) {
      return cachedData.map(item => ({ ...item, fromCache: 'quota_stale' }));
    }
    return []; // Cold cache and no quota: return empty to fallback to local DB specialists
  }

  // 3. Filter Results
  // Exclude closed locations
  let filtered = results.filter(p => p.business_status === 'OPERATIONAL');

  // Rating Threshold (3.5)
  let rated = filtered.filter(p => p.rating && p.rating >= 3.5);
  let warningBadge = false;

  // Fallback to 2.5 if 0 results remain
  if (rated.length === 0 && filtered.length > 0) {
    rated = filtered.filter(p => p.rating && p.rating >= 2.5);
    warningBadge = true;
  }

  // Map Google results to SA Specialist format
  const mappedResults = rated.map(p => {
    // Generate mock slots & info
    return {
      place_id: p.place_id,
      name: p.name,
      specialization: category,
      rating: p.rating || 3.5,
      reviews: p.user_ratings_total || 5,
      experience: '5+ years',
      bio: p.vicinity || p.formatted_address || 'Specialist clinic in your area.',
      clinicName: p.name,
      address: p.vicinity || p.formatted_address || '',
      profilePhoto: p.photos && p.photos.length > 0 ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photos[0].photo_reference}&key=${getApiKey()}` : null,
      appointmentModes: {
        inPerson: { enabled: true, price: 100, duration: '30 mins', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
        video: { enabled: true, price: 60, duration: '20 mins', slots: ['09:30 AM', '10:30 AM', '11:30 AM', '02:30 PM', '03:30 PM', '04:30 PM'] },
        chat: { enabled: true, price: 30, duration: '15 mins', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] }
      },
      availableSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
      isExternal: true,
      lowRatingWarning: warningBadge,
      fromPlaces: true
    };
  });

  // 4. Save to cache: Fresh key for 6 hours, Data key indefinitely
  if (mappedResults.length > 0) {
    await cacheService.set(dataKey, mappedResults);
    await cacheService.set(freshKey, 1, 21600); // 6 hours
  }

  return mappedResults;
};

module.exports = {
  getCoordinatesFromQuery,
  getSpecialistsFromPlaces
};
