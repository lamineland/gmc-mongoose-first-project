

// Load the environment variables from the private .env file
// (this gives us access to process.env.MONGO_URI)
require('dotenv').config();

// Import mongoose
const mongoose = require('mongoose');

// Silence the Mongoose 7 strictQuery deprecation warning (Mongoose 6 default)
mongoose.set('strictQuery', false);

// ---------------------------------------------------------------------------
// 1) Connect to the MongoDB Atlas database
//    The URI is stored in the private .env file as MONGO_URI,
//    surrounded by quotes and with no spaces around the `=`.
//    The promise chain below only logs the result / errors so that a wrong
//    URI does not crash the process with an unhandled rejection.
// ---------------------------------------------------------------------------
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connection established'))
  .catch((err) => console.error('MongoDB connection error:', err.message));

// ---------------------------------------------------------------------------
// 2) Person prototype / schema
//    name           : String  [required]
//    age            : Number  (with a default value)
//    favoriteFoods  : Array of Strings ([String] so push() is tracked properly)
//    Simple validators (required / default) are used as suggested in the docs.
// ---------------------------------------------------------------------------
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // validator: a person must have a name
  },
  age: {
    type: Number,
    default: 0, // default value when age is not provided
  },
  favoriteFoods: {
    type: [String], // array of strings
    default: [], // default to an empty list
  },
});

// Create the Person model from the schema
const Person = mongoose.model('Person', personSchema);

// ---------------------------------------------------------------------------
// 3) Create and Save a Record of a Model
//    Build a document instance with the Person constructor, then call
//    document.save() with a classic Node-style callback.
// ---------------------------------------------------------------------------
const createAndSavePerson = (done) => {
  // Build a document that conforms to the Person schema
  const person = new Person({
    name: 'John Doe',
    age: 30,
    favoriteFoods: ['pizza', 'burger'],
  });

  // Save it to the database, then pass the result to the done() callback
  person.save(function (err, data) {
    if (err) return done(err);
    done(null, data);
  });
};

// ---------------------------------------------------------------------------
// 4) Create Many Records with model.create()
//    model.create() takes an array of objects and saves them all in the DB.
// ---------------------------------------------------------------------------
const createManyPeople = (arrayOfPeople, done) => {
  Person.create(arrayOfPeople, function (err, data) {
    if (err) return done(err);
    done(null, data); // data is the array of saved documents
  });
};

// ---------------------------------------------------------------------------
// 5) Use model.find() to Search Your Database
//    Find all the people having a given name, using Model.find() -> [Person]
// ---------------------------------------------------------------------------
const findPeopleByName = (personName, done) => {
  Person.find({ name: personName }, function (err, data) {
    if (err) return done(err);
    done(null, data); // data is an array of matching people
  });
};

// ---------------------------------------------------------------------------
// 6) Use model.findOne() to Return a Single Matching Document
//    Find just one person who has a certain food in their favorites.
//    The function argument `food` is used as the search key.
// ---------------------------------------------------------------------------
const findOneByFood = (food, done) => {
  // Matches any person whose favoriteFoods array contains `food`
  Person.findOne({ favoriteFoods: food }, function (err, data) {
    if (err) return done(err);
    done(null, data); // data is a single Person document
  });
};

// ---------------------------------------------------------------------------
// 7) Use model.findById() to Search Your Database By _id
//    Find the (only) person having a given _id.
//    The function argument `personId` is used as the search key.
// ---------------------------------------------------------------------------
const findPersonById = (personId, done) => {
  Person.findById(personId, function (err, data) {
    if (err) return done(err);
    done(null, data);
  });
};

// ---------------------------------------------------------------------------
// 8) Perform Classic Updates by Running Find, Edit, then Save
//    Find a person by _id, push "hamburger" into favoriteFoods, then save()
//    the updated document inside the find callback.
//
//    Note: favoriteFoods is declared as [String] so Mongoose tracks the push
//    automatically. If it had been declared as a plain Array (Mixed type),
//    we would need document.markModified('favoriteFoods') before saving.
// ---------------------------------------------------------------------------
const findEditThenSave = (personId, done) => {
  // Step 1: find the person by _id
  Person.findById(personId, function (err, person) {
    if (err) return done(err);

    // Step 2: edit the document — add "hamburger" to favoriteFoods
    person.favoriteFoods.push('hamburger');

    // (Mixed-type arrays only) tell Mongoose the field was edited:
    // person.markModified('favoriteFoods');

    // Step 3: save the updated person
    person.save(function (err, updatedPerson) {
      if (err) return done(err);
      done(null, updatedPerson);
    });
  });
};

// ---------------------------------------------------------------------------
// 9) Perform New Updates on a Document Using model.findOneAndUpdate()
//    Find a person by name and set their age to 20.
//    { new: true } makes the method return the UPDATED document.
// ---------------------------------------------------------------------------
const findAndUpdate = (personName, done) => {
  Person.findOneAndUpdate(
    { name: personName }, // search key
    { age: 20 }, // update
    { new: true }, // return the modified document (not the original)
    function (err, data) {
      if (err) return done(err);
      done(null, data);
    }
  );
};

// ---------------------------------------------------------------------------
// 10) Delete One Document Using model.findByIdAndRemove()
//     Delete one person by their _id (function argument `personId`).
// ---------------------------------------------------------------------------
const removeById = (personId, done) => {
  Person.findByIdAndRemove(personId, function (err, data) {
    if (err) return done(err);
    done(null, data); // data is the removed document
  });
};

// ---------------------------------------------------------------------------
// 11) Delete Many Documents with model.remove()
//     Delete all the people whose name is "Mary".
//     Note: model.remove() returns a JSON object with the outcome of the
//     operation and the number of items affected (not the deleted documents).
//     The result is passed to the done() callback (used by the tests).
// ---------------------------------------------------------------------------
const removeManyPeople = (done) => {
  Person.remove({ name: 'Mary' }, function (err, data) {
    if (err) return done(err);
    done(null, data); // outcome object + number of items affected
  });
};

// ---------------------------------------------------------------------------
// 12) Chain Search Query Helpers to Narrow Search Results
//     Find people who like burritos, sort by name, limit to two documents,
//     hide their age, and pass the done(err, data) callback to exec().
// ---------------------------------------------------------------------------
const queryChain = (done) => {
  Person.find({ favoriteFoods: 'burritos' }) // people who like burritos
    .sort({ name: 1 }) // sort by name (ascending)
    .limit(2) // keep only 2 documents
    .select('-age') // hide the age field
    .exec(function (err, data) {
      if (err) return done(err);
      done(null, data);
    });
};

// Export the model and every function so they can be required / tested
module.exports = {
  Person,
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
};
