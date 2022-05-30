const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { nanoid } = require("nanoid");

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

const sampleSchema = new mongoose.Schema(
  {
    id: String,
    sampleName: String,
    fullName: String,
    age: Number,
    gender: String,
    avatar: String,
    diagnosisResult: {
      value: String,
      confirmed: Boolean,
      author: String,
      dateOfDiagnosis: Date,
    },
  },
  { collection: "samples" }
);

const sampleModel = mongoose.model("Sample", sampleSchema);

const getAllSampleRecords = async () => {
  console.log(
    "============================= Fetching data ================================"
  );

  let returnValue;

  const connectionResult = await startConnection();
  if (connectionResult === "FAILED") {
    returnValue = "FAILED";
  } else {
    const getAllSamplePromise = new Promise((resolve, reject) => {
      sampleModel.find({}, (err, docs) => {
        if (err) {
          console.log(err);
          resolve("FAILED");
        } else {
          const returnValue = docs.map((element) => ({
            id: element.id,
            sampleName: element.sampleName,
            fullName: element.fullName,
            age: element.age,
            gender: element.gender,
            diagnosisResult: { ...element.diagnosisResult },
          }));
          resolve(returnValue);
        }
      });
    });

    returnValue = await getAllSamplePromise;

    await closeConnection();
  }

  console.log(
    "============================= Finished fetching data ================================"
  );

  return returnValue;
};

const saveSampleRecord = async (sampleObject) => {
  console.log(
    "============================= Saving sample record ================================"
  );

  let returnValue;

  const connectionResult = await startConnection();
  if (connectionResult === "FAILED") {
    returnValue = "FAILED";
  } else {
    const sampleInstance = new sampleModel({
      id: nanoid(),
      sampleName: sampleObject.sampleName,
      fullName: sampleObject.fullName,
      age: sampleObject.age,
      gender: sampleObject.gender,
      diagnosisResult: {
        value: sampleObject.diagnosisResult.value,
        author: sampleObject.diagnosisResult.author,
        dateOfDiagnosis: sampleObject.diagnosisResult.dateOfDiagnosis,
      },
    });

    const saveSamplePromise = new Promise((resolve, reject) => {
      sampleInstance.save((err, data) => {
        if (err) {
          console.log(err);
          resolve("FAILED");
        } else {
          resolve("SUCCESS");
        }
      });
    });

    returnValue = await saveSamplePromise;

    await closeConnection();
  }

  console.log(
    "============================= Finished saving sample record ================================"
  );

  return returnValue;
};

const updateSampleRecord = async (sampleObject) => {
  console.log(
    "============================= Updating sample record ================================"
  );

  let returnValue;

  const connectionResult = await startConnection();
  if (connectionResult === "FAILED") {
    returnValue = "FAILED";
  } else {
    const filter = { id: sampleObject.id };

    const matchDocument = await sampleModel.findOne(filter).exec();

    const update = {
      sampleName: sampleObject.sampleName,
      fullName: sampleObject.fullName,
      age: sampleObject.age,
      gender: sampleObject.gender,
      diagnosisResult: {
        value: sampleObject.diagnosisResult.value,
        author: sampleObject.diagnosisResult.author,
        dateOfDiagnosis: matchDocument.diagnosisResult.dateOfDiagnosis,
      },
    };

    const updateSamplePromise = new Promise((resolve, _reject) => {
      sampleModel.findOneAndUpdate(filter, update, (err, _doc) => {
        if (err) {
          console.log(err);
          resolve("FAILED");
        } else {
          resolve("SUCCESS");
        }
      });
    });

    returnValue = await updateSamplePromise;

    await closeConnection();
  }

  console.log(
    "============================= Finished updating sample record ================================"
  );

  return returnValue;
};

const userSchema = new mongoose.Schema(
  {
    username: String,
    password: String,
    fullName: String,
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

  console.log(hashed);

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
            const hashedPasswordFromDB = docs[0].password;
            if (bcrypt.compareSync(password, hashedPasswordFromDB)) {
              resolve(docs);
            } else {
              resolve([]);
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
  getAllSampleRecords,
  saveSampleRecord,
  updateSampleRecord,
  checkCredentials,
};
