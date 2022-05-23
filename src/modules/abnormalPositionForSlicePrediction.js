const path = require("path");

const { PythonShell } = require("python-shell");

const abnormalPositionForSlicePrediction = async (
  npySlicePath,
  edFrameIndex,
  esFrameIndex
) => {

  console.log(npySlicePath)

  const pythonPath = path.resolve(
    __dirname + "/../resources/Python/python.exe"
  );

  const monogenicSignalModelScript = path.resolve(
    __dirname + "/../extra/monogenic_signal_model.py"
  );

  const options = {
    mode: "text",
    pythonOptions: ["-u"],
    pythonPath: pythonPath,
    args: [npySlicePath, edFrameIndex, esFrameIndex],
  };

  const monogenicSignalModelPromise = new Promise((resolve, _reject) => {
    PythonShell.run(monogenicSignalModelScript, options, (err, results) => {
      if (err) {
        console.log(err);
        resolve("FAILED");
      } else {
        resolve(results[0]);
      }
    });
  });

  const result = await monogenicSignalModelPromise;

  return result
};

module.exports = {
  abnormalPositionForSlicePrediction,
};
