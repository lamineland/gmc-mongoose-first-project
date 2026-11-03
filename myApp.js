

// Load the environment variables from the private .env file
// (this gives us access to process.env.MONGO_URI)
require('dotenv').config();

// Import mongoose
const mongoose = require('mongoose');

// Silence the Mongoose 7 strictQuery deprecation warning (Mongoose 6 default)
mongoose.set('strictQuery', false);

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connection established'))
  .catch((err) => console.error('MongoDB connection error:', err.message));

// ---------------------------------------------------------------------------
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
// ---------------------------------------------------------------------------
const createManyPeople = (arrayOfPeople, done) => {
  Person.create(arrayOfPeople, function (err, data) {
    if (err) return done(err);
    done(null, data); // data is the array of saved documents
  });
};

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
const findPeopleByName = (personName, done) => {
  Person.find({ name: personName }, function (err, data) {
    if (err) return done(err);
    done(null, data); // data is an array of matching people
  });
};

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
const findOneByFood = (food, done) => {
  // Matches any person whose favoriteFoods array contains `food`
  Person.findOne({ favoriteFoods: food }, function (err, data) {
    if (err) return done(err);
    done(null, data); // data is a single Person document
  });
};

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
const findPersonById = (personId, done) => {
  Person.findById(personId, function (err, data) {
    if (err) return done(err);
    done(null, data);
  });
};

// ---------------------------------------------------------------------------
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
// ---------------------------------------------------------------------------
const removeById = (personId, done) => {
  Person.findByIdAndRemove(personId, function (err, data) {
    if (err) return done(err);
    done(null, data); // data is the removed document
  });
};

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
const removeManyPeople = (done) => {
  Person.remove({ name: 'Mary' }, function (err, data) {
    if (err) return done(err);
    done(null, data); // outcome object + number of items affected
  });
};

// ---------------------------------------------------------------------------
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
