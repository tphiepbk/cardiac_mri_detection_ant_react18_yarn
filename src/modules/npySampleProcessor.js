const path = require("path");

const fs = require("fs");

const { PythonShell } = require("python-shell");

const { videoProcessor } = require("./videoProcessor");

const npySampleProcessor = async (userDataPath_temp, samplePath) => {
  const sampleName = path.basename(samplePath);

  const sampleTempFolderPath = path.resolve(
    `${userDataPath_temp}/${sampleName}/`
  );

  if (!fs.existsSync(sampleTempFolderPath)) {
    fs.mkdirSync(sampleTempFolderPath);
  }

  let filesInFolder;
  try {
    filesInFolder = fs.readdirSync(samplePath);
  } catch (err) {
    filesInFolder = "FAILED";
  }

  if (filesInFolder === "FAILED") {
    return "FAILED";
  } else {
    const MINIMUM_NUMBER_OF_NPY_FILES = 10;
    const MAXIMUM_NUMBER_OF_NPY_FILES = 13;

    const wrongFormat =
      filesInFolder.filter((filename) => filename.slice(-4) !== ".npy")
        .length === 0
        ? false
        : true;

    if (
      filesInFolder.length < MINIMUM_NUMBER_OF_NPY_FILES ||
      filesInFolder.length > MAXIMUM_NUMBER_OF_NPY_FILES ||
      wrongFormat
    ) {
      return "FAILED";
    } else {
      filesInFolder.sort(
        (a, b) =>
          parseInt(a.slice(0, a.length - 4)) -
          parseInt(b.slice(0, b.length - 4))
      );

      const ultralyticsYoloV5Path = path.resolve(
        __dirname + "/../resources/ultralytics_yolov5_master/"
      );

      const detectorPath = path.resolve(
        __dirname + "/../resources/pretrained_models/best.pt"
      );

      const npySampleProcessorScript = path.resolve(
        __dirname + "/../extra/npy_sample_processor.py"
      );

      const pythonPath = path.resolve(
        __dirname + "/../resources/Python/python.exe"
      );

      const options = {
        mode: "text",
        pythonOptions: ["-u"],
        pythonPath: pythonPath,
        args: [
          ultralyticsYoloV5Path,
          detectorPath,
          userDataPath_temp,
          samplePath,
        ],
      };

      const npyProcessingPromise = new Promise((resolve, _reject) => {
        PythonShell.run(npySampleProcessorScript, options, (err, _results) => {
          if (err) {
            console.log(err);
            resolve("FAILED");
          } else {
            resolve("SUCCESS");
          }
        });
      });

      const npySampleProcessorResult = await npyProcessingPromise;

      if (npySampleProcessorResult === "FAILED") {
        return "FAILED";
      } else {
        const videoInputPath = path.resolve(
          `${userDataPath_temp}/${sampleName}/${sampleName}.avi`
        );
        const videoProcessorResult = await videoProcessor(
          userDataPath_temp,
          videoInputPath
        );

        const videoBboxInputPath = path.resolve(
          `${userDataPath_temp}/${sampleName}/${sampleName}_bbox.avi`
        );
        const videoBboxProcessorResult = await videoProcessor(
          userDataPath_temp,
          videoBboxInputPath
        );

        if (
          videoProcessorResult === "FAILED" ||
          videoBboxProcessorResult === "FAILED"
        ) {
          return "FAILED";
        } else {
          const currentSampleTempPath = path.resolve(
            `${userDataPath_temp}/${sampleName}/`
          );

          const allFilesInCurrentSampleTempPath = fs.readdirSync(currentSampleTempPath);

          const sliceTempPaths = allFilesInCurrentSampleTempPath.filter(
            (filename) => filename.substring(0, 5) === "slice"
          );
          sliceTempPaths.sort(
            (a, b) =>
              parseInt(a.substring(6, a.length)) -
              parseInt(b.substring(6, b.length))
          );

          const croppedSliceTempPaths = allFilesInCurrentSampleTempPath.filter(
            (filename) => filename.length >= 13 && filename.substring(0, 13) === "cropped_slice"
          );
          croppedSliceTempPaths.sort(
            (a, b) =>
              parseInt(a.substring(14, a.length)) -
              parseInt(b.substring(14, b.length))
          );

          const numberOfFrames = fs.readdirSync(
            `${currentSampleTempPath}/${sliceTempPaths[0]}/`
          ).length;

          const returnedSliceTempPaths = [];

          for (
            let sliceNumber = 0;
            sliceNumber < sliceTempPaths.length;
            sliceNumber++
          ) {
            const temp = [];
            for (
              let frameNumber = 0;
              frameNumber < numberOfFrames;
              frameNumber++
            ) {
              temp.push(
                path.resolve(
                  `${currentSampleTempPath}/slice_${sliceNumber}/${frameNumber}.png`
                )
              );
            }
            returnedSliceTempPaths.unshift(temp);
          }

          const returnedCroppedSliceTempPaths = [];

          for (
            let sliceNumber = 0;
            sliceNumber < croppedSliceTempPaths.length;
            sliceNumber++
          ) {
            const temp = [];
            for (
              let frameNumber = 0;
              frameNumber < numberOfFrames;
              frameNumber++
            ) {
              temp.push(
                path.resolve(
                  `${currentSampleTempPath}/cropped_slice_${sliceNumber}/${frameNumber}.png`
                )
              );
            }
            returnedCroppedSliceTempPaths.unshift(temp);
          }

          const croppedNpyFolderPath = path.resolve(
            `${userDataPath_temp}/${sampleName}/cropped_npy/`
          );

          let croppedNpyFilePaths = fs.readdirSync(
            croppedNpyFolderPath
          );

          croppedNpyFilePaths.sort(
            (a, b) =>
              parseInt(a.substring(0, a.length - 8)) -
              parseInt(b.substring(0, b.length - 8))
          );

          croppedNpyFilePaths = croppedNpyFilePaths.map(filename => path.resolve(`${croppedNpyFolderPath}/${filename}`))
          croppedNpyFilePaths.reverse();

          const concatenatedNpySamplePath = path.resolve(`${userDataPath_temp}/${sampleName}/${sampleName}.npy`)

          return {
            samplePath,
            sampleName,
            concatenatedNpySamplePath,
            npyFileNames: filesInFolder,
            croppedNpyFolderPath,
            croppedNpyFilePaths,
            sliceTempPaths: returnedSliceTempPaths,
            croppedSliceTempPaths: returnedCroppedSliceTempPaths,
            ...videoProcessorResult,
            videoBboxName: videoBboxProcessorResult.videoName,
            videoBboxInputPath: videoBboxProcessorResult.videoInputPath,
            videoBboxOutputPath: videoBboxProcessorResult.videoOutputPath,
            videoBboxMetadata: videoBboxProcessorResult.videoMetadata,
          };
        }
      }
    }
  }
};

module.exports = {
  npySampleProcessor,
};
