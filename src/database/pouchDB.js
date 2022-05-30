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
      dateOfDiagnosis: sampleObject.diagnosisResult.dateOfDiagnosis,
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

const updateSampleRecord = async (sampleObject) => {
  const id = sampleObject.id;

  const updateSampleRecordPromise = new Promise((resolve, _reject) => {
    sampleDB.get(id).then((doc) => {
      return sampleDB.put({
        _id: id,
        _rev: doc._rev,
        id: doc.id,
        sampleName: sampleObject.sampleName,
        fullName: sampleObject.fullName,
        age: sampleObject.age,
        gender: sampleObject.gender,
        diagnosisResult : {
          value: sampleObject.diagnosisResult.value,
          author: sampleObject.diagnosisResult.author,
          dateOfDiagnosis: doc.diagnosisResult.dateOfDiagnosis,
        }
      })
    }).then((response) => {
      resolve("SUCCESS")
    }).catch((err) => {
      console.log(err);
      resolve("FAILED");
    })
  })

  const returnValue = await updateSampleRecordPromise;

  return returnValue
}

module.exports = {
  insertUser,
  saveSampleRecord,
  updateSampleRecord,
  getAllSampleRecords,
};
