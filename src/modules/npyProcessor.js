const path = require("path");

const fs = require("fs");

const { execFile } = require("child_process");

const { PythonShell } = require("python-shell");

const { videoProcessor } = require("./videoProcessor");

const npyProcessor = async (userDataPath_temp, samplePath) => {
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

      /*
      const npyProcessingModuleExecutablePath = path.resolve(
        __dirname + "/resources/npy_processor/npy_processor.exe"
      );
      const npyProcessingPromise = new Promise((resolve, _reject) => {
        execFile(
          npyProcessingModuleExecutablePath,
          [
            ultralyticsYoloV5Path,
            detectorPath,
            userDataPath_temp,
            samplePath,
          ],
          (error, _stdout, _stderr) => {
            if (error) {
              console.log(error);
              resolve("FAILED");
            } else {
              resolve("SUCCESS");
            }
          }
        );
      });
      */

      const npyAviConverterScriptPath = path.resolve(
        __dirname + "/../extra/npy_avi_converter.py"
      );

      const options = {
        mode: "text",
        pythonOptions: ["-u"],
        args: [
          ultralyticsYoloV5Path,
          detectorPath,
          userDataPath_temp,
          samplePath,
        ],
      };

      const npyAviConverterPromise = new Promise((resolve, _reject) => {
        PythonShell.run(npyAviConverterScriptPath, options, (err, _results) => {
          if (err) {
            console.log(err);
            resolve("FAILED");
          } else {
            resolve("SUCCESS");
          }
        });
      });

      const npyAviConverterResult = await npyAviConverterPromise;

      if (npyAviConverterResult === "FAILED") {
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

          let sliceTempPaths = fs.readdirSync(currentSampleTempPath);

          sliceTempPaths = sliceTempPaths.filter(
            (element) => element.substring(0, 5) === "slice"
          );
          sliceTempPaths.sort(
            (a, b) =>
              parseInt(a.substring(6, a.length)) -
              parseInt(b.substring(6, b.length))
          );

          const numberOfFrames = fs.readdirSync(
            `${currentSampleTempPath}/${sliceTempPaths[0]}/`
          ).length;

          const returnedSlicesTempPaths = [];

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
            returnedSlicesTempPaths.unshift(temp);
          }

          return {
            samplePath: samplePath,
            sampleName: sampleName,
            npyFileNames: filesInFolder,
            sliceTempPaths: returnedSlicesTempPaths,
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
  npyProcessor,
};
