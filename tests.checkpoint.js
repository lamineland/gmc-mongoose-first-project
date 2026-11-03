/**
 * tests.checkpoint.js — shared test scenarios for the mongoose checkpoint.
 * Each test calls one exported checkpoint function and asserts its behaviour.
 * Used by:
 *   - local.test.js  -> runs against mongodb://localhost:27017 (npm test)
 *   - e2e.test.js    -> runs against an in-memory MongoDB (npm run test:memory)
 */
const assert = require('assert');

// Wrap a callback-style checkpoint function (args..., done) into a Promise
const p = (fn) => (...args) =>
  new Promise((resolve, reject) =>
    fn(...args, (err, data) => (err ? reject(err) : resolve(data)))
  );

/**
 * Run every checkpoint function once and assert the results.
 * IMPORTANT: expects an EMPTY database (callers drop it first), because some
 * assertions rely on exact counts (e.g. exactly two "Mary" documents).
 */
async function runCheckpointTests(app) {
  // --- 3) createAndSavePerson: constructor + document.save() ---
  const saved = await p(app.createAndSavePerson)();
  assert.strictEqual(saved.name, 'John Doe');
  assert.strictEqual(saved.age, 30);
  assert.deepStrictEqual(saved.favoriteFoods, ['pizza', 'burger']);
  console.log('PASS createAndSavePerson');

  // --- 4) createManyPeople: Model.create() with an array of people ---
  const many = await p(app.createManyPeople)([
    { name: 'Mary', age: 25, favoriteFoods: ['burritos', 'salad'] },
    { name: 'Mary', age: 40, favoriteFoods: ['burritos'] },
    { name: 'Alice', age: 22, favoriteFoods: ['burritos', 'pasta'] },
    { name: 'Bob', age: 35, favoriteFoods: ['tacos'] },
  ]);
  assert.strictEqual(many.length, 4);
  console.log('PASS createManyPeople');

  // --- 5) findPeopleByName: Model.find() returns ALL matches ---
  const marys = await p(app.findPeopleByName)('Mary');
  assert.strictEqual(marys.length, 2);
  console.log('PASS findPeopleByName');

  // --- 6) findOneByFood: Model.findOne() returns ONE match ---
  const foodie = await p(app.findOneByFood)('burritos');
  assert.ok(foodie.favoriteFoods.includes('burritos'));
  console.log('PASS findOneByFood');

  // --- 7) findPersonById: Model.findById() finds by _id ---
  const byId = await p(app.findPersonById)(saved._id);
  assert.strictEqual(byId.name, 'John Doe');
  console.log('PASS findPersonById');

  // --- 8) findEditThenSave: find -> push "hamburger" -> save() ---
  const edited = await p(app.findEditThenSave)(saved._id);
  assert.ok(edited.favoriteFoods.includes('hamburger'));
  console.log('PASS findEditThenSave');

  // --- 9) findAndUpdate: findOneAndUpdate + { new: true } -> age 20 ---
  const updated = await p(app.findAndUpdate)('Bob');
  assert.strictEqual(updated.age, 20);
  console.log('PASS findAndUpdate');

  // --- 10) removeById: findByIdAndRemove() deletes the document ---
  const removed = await p(app.removeById)(byId._id);
  assert.strictEqual(removed.name, 'John Doe');
  const gone = await p(app.findPersonById)(saved._id);
  assert.strictEqual(gone, null);
  console.log('PASS removeById');

  // --- 11) removeManyPeople: Model.remove({ name: "Mary" }) ---
  const outcome = await p(app.removeManyPeople)();
  assert.strictEqual(outcome.deletedCount, 2);
  assert.strictEqual((await p(app.findPeopleByName)('Mary')).length, 0);
  console.log('PASS removeManyPeople');

  // --- 12) queryChain: find/sort/limit/select/exec ---
  const chained = await p(app.queryChain)();
  assert.ok(chained.length >= 1 && chained.length <= 2);
  for (const doc of chained) {
    assert.ok(doc.favoriteFoods.includes('burritos'));
    assert.strictEqual(doc.age, undefined); // hidden by .select('-age')
  }
  console.log('PASS queryChain (count=' + chained.length + ', age hidden)');
}

module.exports = { runCheckpointTests };
