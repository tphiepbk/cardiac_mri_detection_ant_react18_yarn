const mongoose = require("mongoose");
const bcrypt = require('bcryptjs')

const CONNECTION_STRING =
  "mongodb+srv://tphiepbk:hiepit-2992@cluster0.bjhqp.mongodb.net/test?retryWrites=true&w=majority";

const startConnection = async () => {
  const connectionPromise = new Promise((resolve, _reject) => {
    mongoose.connect(CONNECTION_STRING, (error) => {
      if (error) resolve("FAILED");
      else resolve("SUCCESS");
    });
  });
  const result = await connectionPromise;
  return result;
};

const closeConnection = async () => {
  const result = await mongoose.disconnect();
  return result;
};

const patientSchema = new mongoose.Schema(
  {
    sampleName: String,
    fullName: String,
    age: Number,
    gender: String,
    address: String,
    avatar: String,
    diagnosisResult: {
      value: String,
      confirmed: Boolean,
      author: String,
      dateModified: Date,
    },
  },
  { collection: "patients" }
);

const patientModel = mongoose.model("Patient", patientSchema);

const savePatientRecord = async (patientObject) => {
  console.log(
    "============================= Saving patient record ================================"
  );

  let returnValue;

  const connectionResult = await startConnection();
  if (connectionResult === "FAILED") {
    returnValue = "FAILED";
  } else {
    const patientInstance = new patientModel({
      sampleName: patientObject.sampleName,
      fullName: patientObject.fullName,
      age: patientObject.age,
      gender: patientObject.gender,
      address: patientObject.address,
      avatar: patientObject.avatar,
      diagnosisResult: {
        value: patientObject.diagnosisResult.value,
        confirmed: patientObject.diagnosisResult.confirmed,
        author: patientObject.diagnosisResult.author,
        dateModified: patientObject.diagnosisResult.dateModified,
      },
    });

    const savePatientPromise = new Promise((resolve, reject) => {
      patientInstance.save((err, data) => {
        if (err) {
          console.log(err);
          resolve("FAILED");
        } else {
          resolve("SUCCESS");
        }
      });
    });

    returnValue = await savePatientPromise;

    await closeConnection();
  }

  console.log(
    "============================= Finished saving patient record ================================"
  );

  return returnValue;
};

const userSchema = new mongoose.Schema(
  {
    username: String,
    password: String,
    fullname: String,
  },
  { collection: "users" }
);

const userModel = mongoose.model("User", userSchema);

const checkCredentials = async (username, password) => {
  console.log(
    "============================= Searching username ================================"
  );

  const salt = bcrypt.genSaltSync(10);
  const hashed = bcrypt.hashSync(password, salt);

  console.log(hashed)

  let returnValue;

  const connectionResult = await startConnection();

  if (connectionResult === "FAILED") {
    returnValue = "FAILED";
  } else {
    const findUserPromise = new Promise((resolve, _reject) => {
      userModel.find({ username: username }, (err, docs) => {
        if (err) {
          console.log(err);
          resolve("FAILED");
        } else {
          if (docs.length !== 0) {
            const hashedPasswordFromDB = docs[0].password
            if (bcrypt.compareSync(password, hashedPasswordFromDB)) {
              resolve(docs)
            } else {
              console.log('here')
              resolve([])
            }
          } else {
            resolve(docs);
          }
        }
      });
    });

    returnValue = await findUserPromise;

    await closeConnection();
  }

  console.log(
    "============================= Finished Searching username ================================"
  );

  return returnValue;
};

module.exports = {
  savePatientRecord,
  checkCredentials,
};
