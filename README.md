# Mongoose Checkpoint

A small Node.js / Mongoose project that manages a MongoDB Atlas database:
schema modelling, CRUD operations and chained search queries, all with
Node-style callbacks.

## Project structure

```
mongoose-checkpoint/
├── myApp.js            # connection, Person schema/model and all checkpoint functions
├── server.js           # demo runner (npm start) that exercises every function
├── tests.checkpoint.js # shared test scenarios (assertions for all 10 functions)
├── local.test.js       # npm test — tests against the local MongoDB (localhost:27017)
├── e2e.test.js         # npm run test:memory — tests against an in-memory MongoDB
├── .env                # private — holds your MongoDB Atlas URI as MONGO_URI
├── .gitignore          # ignores node_modules/ and .env
└── package.json
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Open the private `.env` file and replace the placeholder with **your**
   MongoDB Atlas database URI. Keep the quotes and make sure there is **no
   space** around the `=`:

   ```
   MONGO_URI="mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
   ```

3. Run the demo:

   ```bash
   npm start
   ```

4. Run the tests against your LOCAL MongoDB on `localhost:27017`
   (e.g. the `shop-mongo` Docker container). They use the dedicated database
   `mongoose-checkpoint-test`, which is dropped before and after the run so no
   other local data is touched:

   ```bash
   npm test
   ```

   No local MongoDB running? Use the in-memory variant instead (it downloads
   a temporary `mongod` via mongodb-memory-server):

   ```bash
   npm run test:memory
   ```

## Implemented tasks

| # | Task | Function |
|---|------|----------|
| 1 | Install & connect Mongoose (`useNewUrlParser`, `useUnifiedTopology`) | top of `myApp.js` |
| 2 | Person prototype: `name` (required), `age`, `favoriteFoods: [String]` | `personSchema` |
| 3 | Create and save a record (`document.save()`) | `createAndSavePerson(done)` |
| 4 | Create many records (`model.create()`) | `createManyPeople(arrayOfPeople, done)` |
| 5 | Search by name (`model.find()`) | `findPeopleByName(personName, done)` |
| 6 | Single match by favorite food (`model.findOne()`) | `findOneByFood(food, done)` |
| 7 | Search by `_id` (`model.findById()`) | `findPersonById(personId, done)` |
| 8 | Classic update: find → edit → save (push `"hamburger"`) | `findEditThenSave(personId, done)` |
| 9 | `model.findOneAndUpdate()` with `{ new: true }` (age → 20) | `findAndUpdate(personName, done)` |
| 10 | Delete one by `_id` (`findByIdAndRemove`) | `removeById(personId, done)` |
| 11 | Delete many (`model.remove()`, name = "Mary") | `removeManyPeople(done)` |
| 12 | Chained helpers `.find().sort().limit().select().exec()` | `queryChain(done)` |

> **Note:** the project pins `mongoose` to v6 because the checkpoint uses the
> callback API (`person.save(function (err, data) {...})`), which was removed
> in Mongoose 7. Both `mongodb` and `mongoose` are listed in `package.json`
> as required by the instructions.
