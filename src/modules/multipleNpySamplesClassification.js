const { PythonShell } = require("python-shell");
const path = require("path");

const multipleNpySamplesClassification = async (concatenatedNpySamplePaths) => {
  const multipleNpySamplesClassificationScript = path.resolve(
    __dirname + "/../extra/multiple_npy_samples_classification.py"
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
    args: [finalModelKFoldWeight, ...concatenatedNpySamplePaths],
  };

  const multipleNpySamplesClassificationPromise = new Promise(
    (resolve, _reject) => {
      PythonShell.run(
        multipleNpySamplesClassificationScript,
        options,
        (err, results) => {
          if (err) {
            console.log(err);
            resolve("FAILED");
          } else {
            resolve(results[results.length - 1]);
          }
        }
      );
    }
  );

  const multipleNpySamplesClassificationResult =
    await multipleNpySamplesClassificationPromise;

  return multipleNpySamplesClassificationResult;
};

module.exports = {
  multipleNpySamplesClassification,
};
