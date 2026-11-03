/**
 * server.js — small demo runner for the mongoose checkpoint.
 * It requires myApp.js (which opens the connection) and exercises every
 * checkpoint function once, printing the results to the console.
 *
 * Run it with:  npm start
 */

const mongoose = require('mongoose');

// Requiring myApp.js starts the connection using the MONGO_URI from .env
const {
  createAndSavePerson,
  createManyPeople,
  findPeopleByName,
  findOneByFood,
  findPersonById,
  findEditThenSave,
  findAndUpdate,
  removeById,
  removeManyPeople,
  queryChain,
} = require('./myApp');

// Helper: wrap a callback-style function into a Promise so the demos can
// be written with async/await (the checkpoint functions stay callback-based).
const promisify =
  (fn) =>
  (...args) =>
    new Promise((resolve, reject) => {
      fn(...args, (err, data) => (err ? reject(err) : resolve(data)));
    });

// Run the demo once the connection is open
mongoose.connection.once('open', async () => {
  try {
    // --- 1) Create and save a single record ---
    const saved = await promisify(createAndSavePerson)();
    console.log('createAndSavePerson ->', saved);

    // --- 2) Create many records ---
    const many = await promisify(createManyPeople)([
      { name: 'Mary', age: 25, favoriteFoods: ['burritos', 'salad'] },
      { name: 'Mary', age: 40, favoriteFoods: ['burritos'] },
      { name: 'Alice', age: 22, favoriteFoods: ['burritos', 'pasta'] },
      { name: 'Bob', age: 35, favoriteFoods: ['tacos'] },
    ]);
    console.log('createManyPeople ->', many.map((p) => p.name));

    // --- 3) model.find() by name ---
    console.log('findPeopleByName("Mary") ->', await promisify(findPeopleByName)('Mary'));

    // --- 4) model.findOne() by favorite food ---
    console.log('findOneByFood("burritos") ->', await promisify(findOneByFood)('burritos'));

    // --- 5) model.findById() ---
    const found = await promisify(findPeopleByName)('Alice');
    console.log('findPersonById ->', await promisify(findPersonById)(found[0]._id));

    // --- 6) Classic update: find -> edit -> save ---
    console.log(
      'findEditThenSave ->',
      await promisify(findEditThenSave)(found[0]._id)
    );

    // --- 7) findOneAndUpdate (returns the updated doc) ---
    console.log('findAndUpdate("Bob") ->', await promisify(findAndUpdate)('Bob'));

    // --- 8) findByIdAndRemove ---
    console.log('removeById ->', await promisify(removeById)(found[0]._id));

    // --- 9) model.remove() — delete every "Mary" ---
    console.log('removeManyPeople ->', await promisify(removeManyPeople)());

    // --- 10) Chained query helpers ---
    console.log('queryChain ->', await promisify(queryChain)());
  } catch (err) {
    console.error('Demo error:', err);
  } finally {
    // Close the connection so the process can exit
    await mongoose.connection.close();
    console.log('Connection closed — demo finished.');
  }
});
