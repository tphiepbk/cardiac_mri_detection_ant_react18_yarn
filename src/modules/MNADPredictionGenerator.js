const { PythonShell } = require("python-shell");
const path = require("path");
const fs = require("fs");

const MNADPredictionGenerator = async (userDataPath_temp, croppedNpyFolderPath) => {
  const MNADPredictionScript = path.resolve(
    __dirname + "/../extra/MNAD-master/predict.py"
  );

  const modelDir = path.resolve(
    __dirname + "/../resources/pretrained_models/model.pth"
  );

  const mItemsDir = path.resolve(
    __dirname + "/../resources/pretrained_models/keys.pt"
  );

  const pythonPath = path.resolve(
    __dirname + "/../resources/Python/python.exe"
  );

  const sampleName = path.basename(path.dirname(croppedNpyFolderPath));

  const MNADOutputFolder = path.resolve(
    userDataPath_temp + "/" + sampleName + "/MNAD_output/"
  );

  if (!fs.existsSync(MNADOutputFolder)) {
    fs.mkdirSync(MNADOutputFolder);
  }

  const options = {
    mode: "text",
    pythonOptions: ["-u"],
    pythonPath: pythonPath,
    args: [
      "--t_length=5",
      "--h=128",
      "--w=128",
      `--sample_path=${croppedNpyFolderPath}`,
      `--save_dir=${MNADOutputFolder}`,
      `--model_dir=${modelDir}`,
      `--m_items_dir=${mItemsDir}`,
    ],
  };

  const MNADPredictionPromise = new Promise((resolve, _reject) => {
    PythonShell.run(MNADPredictionScript, options, (err, results) => {
      if (err) {
        console.log(err);
        resolve("FAILED");
      } else {
        resolve("SUCCESS");
      }
    });
  });
  const MNADPredictionResult = await MNADPredictionPromise;

  return MNADPredictionResult;
};

module.exports = {
  MNADPredictionGenerator,
};
