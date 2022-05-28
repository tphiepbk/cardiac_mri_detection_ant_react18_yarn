const PouchDB = require("pouchdb");
const { nanoid } = require("nanoid")

const db = new PouchDB("http://localhost:5984/users");

const connectToDatabase = async () => {
  const info = await db.info();
  return info;
};

const insertUser = async (username, password) => {
  var doc = {
    "_id": nanoid(),
    "name": username,
    "password": password,
  };
  const insertUserPromise = new Promise((resolve, _reject) => {
    db.put(doc).then(function (response) {
      console.log(response);
      resolve("SUCCESS")
    }).catch(function (err) {
      console.log(err);
      resolve("FAILED")
    });
  })
  const returnValue = await insertUserPromise;

  return returnValue
}

module.exports = {
  connectToDatabase,
  insertUser,
};
