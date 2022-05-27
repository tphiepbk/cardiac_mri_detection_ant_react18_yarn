const { PythonShell } = require("python-shell");

const path = require("path");

const videoClassification = async (userDataPath_temp, videoPath) => {
  const unetPretrainPath = path.resolve(
    __dirname + "/../resources/pretrained_models/unet3.h5"
  );

  const checkColNumPretrainPath = path.resolve(
    __dirname + "/../resources/pretrained_models/check_col_num.h5"
  );
  const classifyPretrainPath = path.resolve(
    __dirname + "/../resources/pretrained_models/classify5.h5"
  );

  /*
  const predictionModuleExecutable = path.resolve(
    __dirname + "/resources/prediction_module/prediction_module.exe"
  );

  const predictionPromise = new Promise((resolve, _reject) => {
    execFile(
      predictionModuleExecutable,
      [
        unetPretrainPath,
        checkColNumPretrainPath,
        classifyPretrainPath,
        filepath,
      ],
      (error, stdout, _stderr) => {
        if (error) {
          const returnValue = {
            description: "MAKE SINGLE PREDICTION",
            result: "FAILED",
          };
          resolve(returnValue);
        } else {
          const predictionResult = JSON.parse(stdout.replaceAll("'", '"'));
          const returnValue = {
            description: "MAKE SINGLE PREDICTION",
            result: "SUCCESS",
            value: predictionResult[0].result.toString(),
          };
          resolve(returnValue);
        }
      }
    );
  });
  */

  const pythonPath = path.resolve(
    __dirname + "/../resources/Python/python.exe"
  );

  const videoClassificationScript = path.resolve(
    __dirname + "/../extra/video_classification.py"
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
      videoPath,
    ],
  };

  const videoClassificationPromise = new Promise((resolve, _reject) => {
    PythonShell.run(videoClassificationScript, options, (err, results) => {
      if (err) {
        console.log(err);
        resolve("FAILED");
      } else {
        resolve(results[results.length - 1]);
      }
    });
  });

  const videoClassificationResult = await videoClassificationPromise;

  return videoClassificationResult;
};

module.exports = {
  videoClassification,
};
