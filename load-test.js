#!/usr/bin/env node

/**
 * Load testing script for QR code reading creation endpoint
 * Tests 100 concurrent requests to /api/qr/[token]
 *
 * Usage: node load-test.js <token>
 * Example: node load-test.js 5fb51c5a-7fb5-4e88-a707-e3a05bf17327
 */

const BASE_URL = process.env.BASE_URL || "https://new-year-oracle.vercel.app";
const CONCURRENT_REQUESTS = 100;
const TIMEOUT_MS = 60000; // 60 seconds timeout per request

// Sample tarot card IDs (Major Arcana)
const MAJOR_ARCANA = [
  "major-0", // Fool
  "major-1", // Magician
  "major-2", // High Priestess
  "major-3", // Empress
  "major-4", // Emperor
  "major-5", // Hierophant
  "major-6", // Lovers
  "major-7", // Chariot
  "major-8", // Strength
  "major-9", // Hermit
  "major-10", // Wheel of Fortune
  "major-11", // Justice
  "major-12", // Hanged Man
  "major-13", // Death
  "major-14", // Temperance
  "major-15", // Devil
  "major-16", // Tower
  "major-17", // Star
  "major-18", // Moon
  "major-19", // Sun
  "major-20", // Judgement
  "major-21", // World
];

// Sample Minor Arcana cards (format: minor-{suit}-{number})
const MINOR_ARCANA = [
  "minor-cups-1",
  "minor-cups-2",
  "minor-cups-3",
  "minor-cups-4",
  "minor-cups-5",
  "minor-pentacles-1",
  "minor-pentacles-2",
  "minor-pentacles-3",
  "minor-pentacles-4",
  "minor-pentacles-5",
  "minor-swords-1",
  "minor-swords-2",
  "minor-swords-3",
  "minor-swords-4",
  "minor-swords-5",
  "minor-wands-1",
  "minor-wands-2",
  "minor-wands-3",
  "minor-wands-4",
  "minor-wands-5",
];

const ALL_CARDS = [...MAJOR_ARCANA, ...MINOR_ARCANA];

// Get 3 random cards
function getRandomCards() {
  const shuffled = [...ALL_CARDS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

// Create FormData for a single request
function createFormData(token) {
  const formData = new FormData();

  // Random question
  const questions = [
    "*****Что меня ждет в будущем?",
    "*****Какие изменения произойдут в моей жизни?",
    "*****Что нужно знать о моих отношениях?",
    "*****Какой путь мне выбрать?",
    "*****Что скрывает мое подсознание?",
  ];
  const question = questions[Math.floor(Math.random() * questions.length)];

  // Random birth date (dd-mm-yy format)
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const year = String(Math.floor(Math.random() * 50) + 50).padStart(2, "0");
  const birthDate = `${day}-${month}-${year}`;

  // Random cards
  const selectedCards = getRandomCards();

  formData.append("selectedCards", JSON.stringify(selectedCards));
  formData.append("cardSelectionMode", "random");
  formData.append("birthDate", birthDate);
  formData.append("question", question);
  formData.append("tarotReaderId", "default");
  formData.append("locale", "ru");

  // No image for load testing (to reduce payload size)

  return formData;
}

// Make a single request
async function makeRequest(token, requestNumber) {
  const startTime = Date.now();
  const formData = createFormData(token);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(`${BASE_URL}/api/qr/${token}`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;
    const data = await response.json();

    return {
      requestNumber,
      success: response.ok && data.success,
      status: response.status,
      duration,
      readingId: data.readingId,
      error: data.error || null,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      requestNumber,
      success: false,
      status: error.name === "AbortError" ? "TIMEOUT" : "ERROR",
      duration,
      error: error.message,
    };
  }
}

// Main load test function
async function runLoadTest(token) {
  console.log("🚀 Starting load test...");
  console.log(`📍 Target: ${BASE_URL}/api/qr/${token}`);
  console.log(`📊 Concurrent requests: ${CONCURRENT_REQUESTS}`);
  console.log(`⏱️  Timeout per request: ${TIMEOUT_MS}ms\n`);

  const startTime = Date.now();
  const results = [];
  const promises = [];

  // Create all requests simultaneously
  for (let i = 1; i <= CONCURRENT_REQUESTS; i++) {
    promises.push(
      makeRequest(token, i).then((result) => {
        results.push(result);
        const status = result.success ? "✅" : "❌";
        console.log(
          `${status} Request #${result.requestNumber}: ${result.status} (${result.duration}ms)`
        );
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
        return result;
      })
    );
  }

  // Wait for all requests to complete
  await Promise.all(promises);

  const totalDuration = Date.now() - startTime;

  // Calculate statistics
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const timeouts = results.filter((r) => r.status === "TIMEOUT").length;
  const errors = results.filter((r) => r.status === "ERROR").length;
  const httpErrors = results.filter(
    (r) => !r.success && typeof r.status === "number"
  ).length;

  const durations = results.map((r) => r.duration);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📈 LOAD TEST SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total requests: ${CONCURRENT_REQUESTS}`);
  console.log(
    `✅ Successful: ${successful} (${(
      (successful / CONCURRENT_REQUESTS) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `❌ Failed: ${failed} (${((failed / CONCURRENT_REQUESTS) * 100).toFixed(
      1
    )}%)`
  );
  console.log(`   - Timeouts: ${timeouts}`);
  console.log(`   - HTTP Errors: ${httpErrors}`);
  console.log(`   - Other Errors: ${errors}`);
  console.log(`\n⏱️  Timing:`);
  console.log(
    `   Total time: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`
  );
  console.log(`   Average response: ${avgDuration.toFixed(0)}ms`);
  console.log(`   Min response: ${minDuration}ms`);
  console.log(`   Max response: ${maxDuration}ms`);
  console.log(
    `   Requests/sec: ${((CONCURRENT_REQUESTS / totalDuration) * 1000).toFixed(
      2
    )}`
  );
  console.log("=".repeat(60));

  // Status code breakdown
  const statusCodes = {};
  results.forEach((r) => {
    if (typeof r.status === "number") {
      statusCodes[r.status] = (statusCodes[r.status] || 0) + 1;
    }
  });

  if (Object.keys(statusCodes).length > 0) {
    console.log("\n📊 HTTP Status Codes:");
    Object.entries(statusCodes)
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
  }

  // Check if server handled the load
  if (successful >= CONCURRENT_REQUESTS * 0.9) {
    console.log("\n🎉 SUCCESS: Server handled the load well!");
  } else if (successful >= CONCURRENT_REQUESTS * 0.5) {
    console.log("\n⚠️  WARNING: Server struggled with the load");
  } else {
    console.log("\n💥 CRITICAL: Server failed to handle the load");
  }
}

// Run the test
const token = process.argv[2];

if (!token) {
  console.error("❌ Error: QR token is required");
  console.log("Usage: node load-test.js <token>");
  console.log(
    "Example: node load-test.js 5fb51c5a-7fb5-4e88-a707-e3a05bf17327"
  );
  process.exit(1);
}

runLoadTest(token).catch((error) => {
  console.error("❌ Load test failed:", error);
  process.exit(1);
});
