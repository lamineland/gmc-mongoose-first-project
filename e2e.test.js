/**
 * e2e.test.js — end-to-end tests against an in-memory MongoDB
 * (mongodb-memory-server, dev dependency) — no local server needed.
 *
 * Run it with:  npm run test:memory
 */
const { MongoMemoryServer } = require('mongodb-memory-server');
const { runCheckpointTests } = require('./tests.checkpoint');

(async () => {
  // Start a throwaway in-memory MongoDB
  const mem = await MongoMemoryServer.create();
  // Set the URI BEFORE requiring myApp.js (connection opens at require time)
  process.env.MONGO_URI = mem.getUri('checkpoint');

  const mongoose = require('mongoose');
  const app = require('./myApp');
  if (mongoose.connection.readyState !== 1) {
    await new Promise((res) => mongoose.connection.once('open', res));
  }
  console.log('connected to in-memory MongoDB');

  try {
    // Run all checkpoint scenarios (see tests.checkpoint.js)
    await runCheckpointTests(app);
    console.log('ALL 10 FUNCTIONS VALIDATED (in-memory MongoDB) ✔');
  } finally {
    await mongoose.connection.close();
    await mem.stop();
    console.log('in-memory tests finished.');
  }
  process.exit(0);
})().catch((e) => {
  console.error('FAIL', e);
  process.exit(1);
});
