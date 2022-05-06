const mongoose = require("mongoose");

const startConnection = async () => {
  const result = await mongoose.connect(
    "mongodb+srv://tphiepbk:hiepit-2992@cluster0.bjhqp.mongodb.net/test?retryWrites=true&w=majority"
  );
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
      confirmedBy: String,
      dateModified: Date,
    },
  },
  { collection: "patients" }
);

const patientModel = mongoose.model("Patient", patientSchema);

const savePatientRecord = async (patientObject) => {
  console.log('============================= Saving patient record ================================')

  await startConnection();

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
      confirmedBy: patientObject.diagnosisResult.confirmedBy,
      dateModified: patientObject.diagnosisResult.dateModified,
    },
  });

  //const returnValue = await patientInstance.save();

  const savePatientPromise = new Promise((resolve, reject) => {
    patientInstance.save((err, data) => {
      if (err) {
        console.log(err)
        resolve("FAILED")
      } else {
        resolve("SUCCESS");
      }
    })
  })

  const returnValue = await savePatientPromise;

  await closeConnection();

  console.log('============================= Finished saving patient record ================================')

  return returnValue;
};

const fun = () => {
  console.log("Database connected");
};

module.exports = {
  fun,
  savePatientRecord,
};
