const cacheService = require('./cacheService');
const { callLLM } = require('./aiService');

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
 * Normalizes geocode query and fetches/caches coordinates from Google Geocoding API (v4beta)
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
    const url = `https://geocode.googleapis.com/v4beta/geocode/address/${encodeURIComponent(query)}?key=${getApiKey()}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.results && json.results.length > 0) {
      const { latitude, longitude } = json.results[0].location;
      const coords = { lat: latitude, lng: longitude };
      // Cache for 7 days
      await cacheService.set(cacheKey, coords, 604800);
      return coords;
    } else {
      console.warn(`Geocoding API status error: ${json.status || 'No Results'}`, json.error_message || '');
    }
  } catch (err) {
    console.error('Geocoding API request failed:', err.message);
  }
  return null;
};

/**
 * Calls Google Places API (New) to search for places nearby
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

  const url = config.mode === 'NearbySearch'
    ? 'https://places.googleapis.com/v1/places:searchNearby'
    : 'https://places.googleapis.com/v1/places:searchText';

  const body = config.mode === 'NearbySearch'
    ? {
        includedTypes: [config.type],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: parseFloat(radius)
          }
        }
      }
    : {
        textQuery: `${config.query} near ${lat},${lng}`,
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: parseFloat(radius)
          }
        }
      };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': getApiKey(),
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.shortFormattedAddress,places.types,places.photos,places.businessStatus'
    },
    body: JSON.stringify(body)
  };

  try {
    const res = await fetch(url, options);
    const data = await res.json();

    if (res.status === 429 || (data.error && data.error.status === 'RESOURCE_EXHAUSTED')) {
      console.warn('Google Places API key query limit reached.');
      return { results: [], fromQuotaError: true };
    }

    if (!res.ok) {
      console.warn(`Places API error: ${res.status}`, data.error ? data.error.message : '');
      return { results: [], fromQuotaError: false };
    }

    const places = data.places || [];
    const legacyFormattedResults = places.map(p => {
      let photosArray = [];
      if (p.photos && p.photos.length > 0) {
        photosArray = [{ photo_reference: p.photos[0].name }];
      }

      return {
        place_id: p.id,
        name: p.displayName ? p.displayName.text : 'Specialist Clinic',
        business_status: p.businessStatus || 'OPERATIONAL',
        rating: p.rating || 3.5,
        user_ratings_total: p.userRatingCount || 0,
        vicinity: p.shortFormattedAddress || p.formattedAddress || '',
        formatted_address: p.formattedAddress || '',
        photos: photosArray,
        types: p.types || []
      };
    });

    return { results: legacyFormattedResults, fromQuotaError: false };
  } catch (err) {
    console.error('Google Places request failed:', err.message);
    return { results: [], fromQuotaError: false };
  }
};

/**
 * Dynamic LLM relevance filter to discard mismatched places
 */
const filterRelevantPlaces = async (places, category) => {
  if (!places || places.length === 0) return [];

  const placeList = places
    .map((p, i) => `${i + 1}. "${p.name}" (types: ${(p.types || []).join(', ')})`)
    .join('\n');

  const prompt = `You are a filter for a medical booking platform.
Category: "${category}"
Places:
${placeList}

Return ONLY the numbers of places genuinely relevant as a ${category} provider.
Reply with comma-separated numbers only. Example: 1,3,5`;

  try {
    const response = await callLLM(prompt, 64);
    if (!response || !response.trim()) {
      return places;
    }
    const validIndices = response
      .split(',')
      .map(n => parseInt(n.trim()) - 1)
      .filter(i => !isNaN(i) && i >= 0 && i < places.length);
    return validIndices.map(i => places[i]).filter(Boolean);
  } catch (err) {
    console.error('LLM relevance filtering failed, returning unfiltered places:', err.message);
    return places;
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

  // Dynamic LLM Relevance Filtering
  rated = await filterRelevantPlaces(rated, category);

  // Map Google results to SA Specialist format
  const mappedResults = rated.map(p => {
    const photoUrl = p.photos && p.photos.length > 0
      ? (p.photos[0].photo_reference.startsWith('places/')
        ? `https://places.googleapis.com/v1/${p.photos[0].photo_reference}/media?maxWidthPx=400&key=${getApiKey()}`
        : `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photos[0].photo_reference}&key=${getApiKey()}`)
      : null;

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
      profilePhoto: photoUrl,
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

const getPincodeFromCoordinates = async (lat, lng) => {
  if (!lat || !lng) return null;
  const cacheKey = `reverse_geocode:${lat}:${lng}`;
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }

  if (!getApiKey()) {
    console.warn('Google Places API key is missing. Reverse geocoding failed.');
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${getApiKey()}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.results && json.results.length > 0) {
      for (const result of json.results) {
        for (const component of result.address_components) {
          if (component.types.includes('postal_code')) {
            const postalCode = component.long_name;
            await cacheService.set(cacheKey, postalCode, 604800);
            return postalCode;
          }
        }
      }
    }
  } catch (err) {
    console.error('Reverse geocoding request failed:', err.message);
  }

  // Fallback to Nominatim on the backend (sends custom User-Agent to avoid blocks)
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'SmartAssist-Health-AI/1.0',
        'Accept-Language': 'en'
      }
    });
    const json = await res.json();
    if (json && json.address && json.address.postcode) {
      const postalCode = json.address.postcode;
      await cacheService.set(cacheKey, postalCode, 604800);
      return postalCode;
    }
  } catch (err) {
    console.error('Backend Nominatim reverse geocoding failed:', err.message);
  }
  return null;
};

module.exports = {
  getCoordinatesFromQuery,
  getSpecialistsFromPlaces,
  getPincodeFromCoordinates
};
