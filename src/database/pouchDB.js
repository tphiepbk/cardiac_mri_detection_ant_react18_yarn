const PouchDB = require("pouchdb");
PouchDB.plugin(require("pouchdb-find"));
const { nanoid } = require("nanoid");
const bcrypt = require("bcryptjs");

const userDB = new PouchDB("http://localhost:5984/users");
const sampleDB = new PouchDB("http://localhost:5984/samples");

const insertUser = async (username, password) => {
  const doc = {
    _id: nanoid(),
    name: username,
    password: password,
  };
  const insertUserPromise = new Promise((resolve, _reject) => {
    userDB
      .put(doc)
      .then(function (response) {
        console.log(response);
        resolve("SUCCESS");
      })
      .catch(function (err) {
        console.log(err);
        resolve("FAILED");
      });
  });
  const returnValue = await insertUserPromise;

  return returnValue;
};

const getAllSampleRecords = async () => {
  console.log(
    "============================= Fetching sample data ================================"
  );

  const getAllSampleRecordsPromise = new Promise((resolve, _reject) => {
    sampleDB
      .allDocs({ include_docs: true })
      .then((response) => {
        const returnValue = response.rows.map((element) => ({
          id: element.doc.id,
          sampleName: element.doc.sampleName,
          fullName: element.doc.fullName,
          age: element.doc.age,
          gender: element.doc.gender,
          diagnosisResult: { ...element.doc.diagnosisResult },
        }));
        resolve(returnValue);
      })
      .catch((err) => {
        console.log(err);
        resolve("FAILED");
      });
  });
  const returnValue = await getAllSampleRecordsPromise;

  console.log(
    "============================= Finished fetching sample data ================================"
  );

  return returnValue;
};

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
  };

  const insertSamplePromise = new Promise((resolve, _reject) => {
    sampleDB
      .put(doc)
      .then(function (response) {
        console.log(response);
        resolve("SUCCESS");
      })
      .catch(function (err) {
        console.log(err);
        resolve("FAILED");
      });
  });
  const returnValue = await insertSamplePromise;

  return returnValue;
};

const updateSampleRecord = async (sampleObject) => {
  const id = sampleObject.id;

  const updateSampleRecordPromise = new Promise((resolve, _reject) => {
    sampleDB
      .get(id)
      .then((doc) => {
        return sampleDB.put({
          _id: id,
          _rev: doc._rev,
          id: doc.id,
          sampleName: sampleObject.sampleName,
          fullName: sampleObject.fullName,
          age: sampleObject.age,
          gender: sampleObject.gender,
          diagnosisResult: {
            value: sampleObject.diagnosisResult.value,
            author: sampleObject.diagnosisResult.author,
            dateOfDiagnosis: doc.diagnosisResult.dateOfDiagnosis,
          },
        });
      })
      .then((response) => {
        resolve("SUCCESS");
      })
      .catch((err) => {
        console.log(err);
        resolve("FAILED");
      });
  });

  const returnValue = await updateSampleRecordPromise;

  return returnValue;
};

const checkCredentials = async (username, password) => {
  console.log(
    "============================= Searching username ================================"
  );

  const salt = bcrypt.genSaltSync(10);
  const hashed = bcrypt.hashSync(password, salt);

  let returnValue;

  const checkCredentialsPromise = new Promise((resolve, _reject) => {
    userDB
      .find({
        selector: { username: username },
        fields: ["username", "password", "fullName"],
      })
      .then((result) => {
        console.log(result)
        if (result.docs.length === 0) {
          console.log("NO MATCHING USERNAME")
          resolve("NOT FOUND")
        } else if (result.docs.length > 1) {
          console.log("FOUND DUPLICATE USERNAME")
          resolve("FAILED")
        } else {
          const fetchedPassword = result.docs[0].password;
          if (bcrypt.compareSync(password, fetchedPassword)) {
            resolve(result.docs)
          } else {
            console.log("PASSWORD DOES NOT MATCH")
            resolve("NOT FOUND")
          }
        }
      })
      .catch((err) => {
        resolve("FAILED")
      });
  });

  returnValue = await checkCredentialsPromise;

  console.log(
    "============================= Finished Searching username ================================"
  );

  return returnValue;
};

module.exports = {
  insertUser,
  saveSampleRecord,
  updateSampleRecord,
  getAllSampleRecords,
  checkCredentials,
};
