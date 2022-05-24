const { PythonShell } = require("python-shell");
const path = require("path");

const npySampleClassification = async (concatenatedNpySamplePath) => {
  const npySampleClassificationScript = path.resolve(
    __dirname + "/../extra/npy_sample_classification.py"
  );

  const finalModelKFoldWeight = path.resolve(
    __dirname + "/../resources/pretrained_models/final_model_kfold_2_p2.h5"
  );

  const pythonPath = path.resolve(
    __dirname + "/../resources/Python/python.exe"
  );

  const options = {
    mode: "text",
    pythonOptions: ["-u"],
    pythonPath: pythonPath,
    args: [finalModelKFoldWeight, concatenatedNpySamplePath],
  };

  const npySampleClassificationPromise = new Promise((resolve, _reject) => {
    PythonShell.run(npySampleClassificationScript, options, (err, results) => {
      if (err) {
        console.log(err);
        resolve("FAILED");
      } else {
        resolve(results[results.length - 1]);
      }
    });
  });

  const npySampleClassificationResult = await npySampleClassificationPromise;

  return npySampleClassificationResult;
};

module.exports = {
  npySampleClassification,
};
