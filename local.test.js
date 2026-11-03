/**
 * local.test.js — checkpoint tests against the LOCAL MongoDB on
 * mongodb://localhost:27017 (e.g. the `shop-mongo` Docker container).
 *
 * Safety: only the dedicated database `mongoose-checkpoint-test` is used,
 * and it is dropped before AND after the run, so no other local data is
 * touched and every run starts from a clean slate.
 *
 * Run it with:  npm test
 */

// Local MongoDB URI with a dedicated test database (set BEFORE requiring
// myApp.js, because the connection is opened at require time)
process.env.MONGO_URI = 'mongodb://localhost:27017/mongoose-checkpoint-test';

const mongoose = require('mongoose');
const app = require('./myApp'); // opens the connection using MONGO_URI
const { runCheckpointTests } = require('./tests.checkpoint');

(async () => {
  // Wait for the connection; fail fast with a timeout instead of hanging
  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(
        () =>
          reject(
            new Error('Timed out connecting to mongodb://localhost:27017 — is MongoDB running?')
          ),
        8000
      );
      mongoose.connection.once('open', () => {
        clearTimeout(timer);
        resolve();
      });
      mongoose.connection.once('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }
  console.log('connected to local MongoDB at mongodb://localhost:27017');

  // Clean slate: drop only the dedicated test database
  await mongoose.connection.dropDatabase();

  try {
    // Run all checkpoint scenarios (see tests.checkpoint.js)
    await runCheckpointTests(app);
    console.log('ALL 10 FUNCTIONS VALIDATED AGAINST LOCAL MONGODB ✔');
  } finally {
    // Remove the test data again so nothing is left behind
    try {
      await mongoose.connection.dropDatabase();
    } catch (e) {
      /* ignore cleanup errors */
    }
    await mongoose.connection.close();
    console.log('test database dropped — local tests finished.');
  }
  process.exit(0);
})().catch((e) => {
  console.error('FAIL', e);
  process.exit(1);
});
