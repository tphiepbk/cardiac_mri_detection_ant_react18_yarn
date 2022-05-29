const PouchDB = require("pouchdb");
const { nanoid } = require("nanoid")

const userDB = new PouchDB("http://localhost:5984/users");
const sampleDB = new PouchDB("http://localhost:5984/samples")

const insertUser = async (username, password) => {
  const doc = {
    "_id": nanoid(),
    "name": username,
    "password": password,
  };
  const insertUserPromise = new Promise((resolve, _reject) => {
    userDB.put(doc).then(function (response) {
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

const getAllSampleRecords = async () => {
  console.log(
    "============================= Fetching sample data ================================"
  );

  const getAllSampleRecordsPromise = new Promise((resolve, _reject) => {
    sampleDB.allDocs({include_docs: true}).then((response) => {
      const returnValue = response.rows.map(element => ({
        id: element.doc.id,
        sampleName: element.doc.sampleName,
        fullName: element.doc.fullName,
        age: element.doc.age,
        gender: element.doc.gender,
        diagnosisResult: {...element.doc.diagnosisResult}
      }))
      resolve(returnValue)
    }).catch((err) => {
      console.log(err);
      resolve("FAILED")
    });
  })
  const returnValue = await getAllSampleRecordsPromise;

  console.log(
    "============================= Finished fetching sample data ================================"
  );

  return returnValue;
}

const saveSampleRecord = async (sampleObject) => {
  const id = nanoid();
  const doc = {
    _id: id,
    id: id,
    sampleName: sampleObject.sampleName,
    fullName: sampleObject.fullName,
    age: sampleObject.age,
    gender: sampleObject.gender,
    diagnosisResult: {
      value: sampleObject.diagnosisResult.value,
      author: sampleObject.diagnosisResult.author,
      dateModified: sampleObject.diagnosisResult.dateModified,
    },
  }

  const insertSamplePromise = new Promise((resolve, _reject) => {
    sampleDB.put(doc).then(function (response) {
      console.log(response);
      resolve("SUCCESS")
    }).catch(function (err) {
      console.log(err);
      resolve("FAILED")
    });
  })
  const returnValue = await insertSamplePromise;

  return returnValue
}

module.exports = {
  insertUser,
  saveSampleRecord,
  getAllSampleRecords,
};
