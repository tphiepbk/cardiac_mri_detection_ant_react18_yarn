const { PythonShell } = require("python-shell");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

const MNADVideoGenerator = async (sliceCroppedNpyPath) => {
  const MNADGenerateVideoScript = path.resolve(
    __dirname + "/../extra/mnad_gen_video.py"
  );

  const pythonPath = path.resolve(
    __dirname + "/../resources/Python/python.exe"
  );

  const MNADGeneratedFramesFolderName = path.basename(sliceCroppedNpyPath, path.extname(sliceCroppedNpyPath)) + '_npy'
  const MNADGeneratedFramesFolderPath = path.resolve(path.dirname(sliceCroppedNpyPath) + '/' + MNADGeneratedFramesFolderName)

  const MNADOutputVideoPath = path.resolve(MNADGeneratedFramesFolderPath + '/' + MNADGeneratedFramesFolderName + '.avi')

  const options = {
    mode: "text",
    pythonOptions: ["-u"],
    pythonPath: pythonPath,
    args: [MNADGeneratedFramesFolderPath, MNADOutputVideoPath],
  };

  const MNADGenerateVideoPromise = new Promise((resolve, _reject) => {
    PythonShell.run(MNADGenerateVideoScript, options, (err, results) => {
      if (err) {
        console.log(err);
        resolve("FAILED");
      } else {
        resolve("SUCCESS");
      }
    });
  });
  const MNADGenerateVideoResult = await MNADGenerateVideoPromise;

  if (MNADGenerateVideoResult === "FAILED") {
    return "FAILED"
  } else {

    const MNADOutputConvertedVideoPath = path.resolve(MNADGeneratedFramesFolderPath + '/' + MNADGeneratedFramesFolderName + '_converted.mp4')

    const ffmpegPromise = new Promise((resolve, _reject) => {
      ffmpeg(MNADOutputVideoPath)
        .on("end", () => {
          resolve(MNADOutputConvertedVideoPath);
        })
        .on("error", (errFfmpeg) => {
          console.log(`An error happened: ${errFfmpeg.message}`);
          resolve("FAILED");
        })
        .saveToFile(MNADOutputConvertedVideoPath);
    });

    const ffmpegResult = await ffmpegPromise;

    if (ffmpegResult === "FAILED") {
      return "FAILED"
    } else {
      return MNADOutputConvertedVideoPath
    }
  }
  /*
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
    args: [],
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
  */
};

module.exports = {
  MNADVideoGenerator,
};
