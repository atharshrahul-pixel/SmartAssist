const placesService = require('./services/placesService');
const cacheService = require('./services/cacheService');

async function test() {
  console.log("Testing Places API for Podiatrist near Chennai (13.08, 80.27)...");
  try {
    const results = await placesService.getSpecialistsFromPlaces(13.08, 80.27, "Podiatrist", 10000);
    console.log("Results count:", results.length);
    console.log("Results:", JSON.stringify(results, null, 2));
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    process.exit(0);
  }
}

test();
