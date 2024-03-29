const { PythonShell } = require("python-shell");

const path = require("path");

const multipleVideosClassification = async (userDataPath_temp, videoInputPaths) => {
  const unetPretrainPath = path.resolve(
    __dirname + "/../resources/pretrained_models/unet3.h5"
  );

  const checkColNumPretrainPath = path.resolve(
    __dirname + "/../resources/pretrained_models/check_col_num.h5"
  );
  const classifyPretrainPath = path.resolve(
    __dirname + "/../resources/pretrained_models/classify5.h5"
  );

  const multipleVideosClassificationScript = path.resolve(
    __dirname + "/../extra/multiple_videos_classification.py"
  );

  const pythonPath = path.resolve(
    __dirname + "/../resources/Python/python.exe"
  );

  const options = {
    mode: "text",
    pythonPath: pythonPath,
    pythonOptions: ["-u"],
    args: [
      unetPretrainPath,
      checkColNumPretrainPath,
      classifyPretrainPath,
      userDataPath_temp,
      ...videoInputPaths,
    ],
  };

  const multipleVideosClassificationPromise = new Promise((resolve, _reject) => {
    PythonShell.run(multipleVideosClassificationScript, options, (err, results) => {
      if (err) {
        console.log(err);
        resolve("FAILED");
      } else {
        resolve(results[results.length - 1]);
      }
    });
  });

  const multipleVideosClassificationResult = await multipleVideosClassificationPromise;

  return multipleVideosClassificationResult;
};

module.exports = {
  multipleVideosClassification,
};

