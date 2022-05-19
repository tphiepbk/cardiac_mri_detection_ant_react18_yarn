const isDev = require("electron-is-dev");

const { app, BrowserWindow, ipcMain, dialog } = require("electron");

if (require("electron-squirrel-startup")) {
  app.quit();
}

const { execFile } = require("child_process");

const { PythonShell } = require("python-shell");

const path = require("path");

const fs = require("fs");

const ffmpeg = require("fluent-ffmpeg");

const database = require("./database/mongoDB");
const { homedir } = require("os");

let userDataPath_temp = path.resolve(
  homedir + "/cardiac_mri_abnormalities_detection/"
);

/*
let userDataPath_temp;
const userDataPath = app.getPath("userData");
if (process.platform === "win32") {
  userDataPath_temp = `${userDataPath}/temp/`;
} else if (process.platform === "linux") {
  const homedir = require("os").homedir();
  userDataPath_temp = path.resolve(
    homedir + "/cardiac_mri_detection_ant_react18_yarn/"
  );
}
*/

if (!fs.existsSync(userDataPath_temp)) {
  fs.mkdirSync(userDataPath_temp);
}

if (process.platform === "win32") {
  const ffmpegDir = path.resolve(__dirname + "/resources/ffmpeg_windows");
  ffmpeg.setFfmpegPath(path.resolve(`${ffmpegDir}/ffmpeg.exe`));
  ffmpeg.setFfprobePath(path.resolve(`${ffmpegDir}/ffprobe.exe`));
} else if (process.platform === "linux") {
  const ffmpegDir = path.resolve(__dirname + "/resources/ffmpeg_linux");
  ffmpeg.setFfmpegPath(path.resolve(`${ffmpegDir}/ffmpeg`));
  ffmpeg.setFfprobePath(path.resolve(`${ffmpegDir}/ffprobe`));
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1880,
    height: 970,
    webPreferences: {
      webSecurity: false,
      preload: path.join(__dirname, "electron-preload.js"),
    },
    frame: false,
    autoHideMenuBar: true,
    resizable: true,
  });

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  mainWindow.webContents.openDevTools();

  mainWindow.on("closed", function () {
    mainWindow = null;
  });

  mainWindow.on("maximize", () => {
    mainWindow.webContents.send('maximized-app')
  })

  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send('unmaximized-app')
  })
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }

  console.log("Removing temp file...");
  fs.readdirSync(userDataPath_temp).forEach((smallDir) => {
    const fullDir = `${userDataPath_temp}/${smallDir}`;
    console.log(fullDir);
    const res = fs.lstatSync(fullDir).isDirectory();

    if (res) {
      fs.rmSync(fullDir, { recursive: true, force: true });
    } else {
      fs.rmSync(fullDir, { recursive: false, force: true });
    }
  });
});

// ****************************************** ALL THE CODE FOR PROCESSING *****************************************************

const controlApp = (arg) => {
  if (arg === "minimize") mainWindow.minimize();
  else if (arg === "maximize") {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  } else mainWindow.close();
};

ipcMain.on("app:control", (_event, arg) => {
  controlApp(arg);
});

ipcMain.handle("open-file-dialog", async (event, _arg) => {
  global.filepath = undefined;

  const properties =
    process.platform === "darwin"
      ? ["openFile", "openDirectory"]
      : ["openFile"];

  const file = await dialog.showOpenDialog({
    title: "Select files to be uploaded",
    defaultPath: path.join(__dirname, "../assets/"),
    buttonLabel: "Open",
    filters: [{ name: "MRI Videos", extensions: ["avi"] }],
    properties: properties,
  });
  if (!file) {
    return {
      description: "OPEN FILE DIALOG",
      result: "ERROR",
    };
  } else {
    if (file.canceled) {
      return {
        description: "OPEN FILE DIALOG",
        result: "CANCELED",
      };
    } else {
      global.filepath = file.filePaths[0].toString();

      const fileNameWithExt = path.basename(global.filepath);
      const fileExt = path.extname(global.filepath);
      const filename = path.basename(fileNameWithExt, fileExt);

      const inputDir = path.resolve(global.filepath);
      console.log(`Input file path : ${inputDir}`);
      const outputDir = path.resolve(
        `${userDataPath_temp}/${filename}_converted.mp4`
      );
      console.log(`Output file path : ${outputDir}`);

      const ffmpegPromise = new Promise((resolve, reject) => {
        ffmpeg(inputDir)
          .on("end", () => {
            console.log("Finished processing");
            console.log(
              "================== Finished opening file =================="
            );

            const returnValue = {
              description: "OPEN FILE DIALOG",
              result: "SUCCESS",
              videoName: filename,
              videoInputPath: inputDir,
              videoOutputPath:
                process.platform === "linux"
                  ? "file:///" + outputDir
                  : outputDir,
            };

            resolve(returnValue);
          })
          .on("error", (errFfmpeg) => {
            console.log(`An error happened: ${errFfmpeg.message}`);
            console.error(
              "================== Failed opening file =================="
            );

            const returnValue = {
              description: "OPEN FILE DIALOG",
              result: "FAILED",
            };

            resolve(returnValue);
          })
          .saveToFile(outputDir);
      });

      const returnValue = await ffmpegPromise;

      console.log(returnValue);

      return returnValue;
    }
  }
});

ipcMain.handle("open-multi-files-dialog", async (_event, _arg) => {
  global.filepath = undefined;

  const properties =
    process.platform !== "darwin"
      ? ["openFile", "multiSelections"]
      : ["openFile", "openDirectory", "multiSelections"];

  const files = await dialog.showOpenDialog({
    title: "Select files to be uploaded",
    defaultPath: path.join(__dirname, "../assets/"),
    buttonLabel: "Open",
    filters: [{ name: "MRI Videos", extensions: ["avi"] }],
    properties: properties,
  });
  if (!files) {
    return {
      description: "OPEN MULTI FILES DIALOG",
      result: "ERROR",
    };
  } else {
    if (files.canceled) {
      return {
        description: "OPEN MULTI FILES DIALOG",
        result: "CANCELED",
      };
    } else {
      const allPromise = [];
      for (let i = 0; i < files.filePaths.length; i++) {
        const videoPath = files.filePaths[i];

        const fileNameWithExt = path.basename(videoPath.toString());
        const fileExt = path.extname(videoPath.toString());
        const filename = path.basename(fileNameWithExt, fileExt);

        const inputDir = path.resolve(videoPath.toString());
        const outputDir = path.resolve(
          `${userDataPath_temp}/${filename}_converted.mp4`
        );

        const promiseFfmpeg = new Promise((resolve, reject) => {
          ffmpeg(inputDir)
            .on("end", () => {
              console.log("Finished processing");
              console.log(
                "================== Finished opening file =================="
              );
              resolve(outputDir);
            })
            .on("error", (errFfmpeg) => {
              console.log(`An error happened: ${errFfmpeg.message}`);
              console.error(
                "================== Failed opening file =================="
              );
              resolve("FAILED");
            })
            .saveToFile(outputDir);
        });
        allPromise.push(promiseFfmpeg);
      }

      const values = await Promise.all(allPromise);

      let returnValue = {
        description: "OPEN MULTI FILES DIALOG",
      };

      if (values.length === files.filePaths.length) {
        const fileNames = files.filePaths.map((filepath) => {
          const fileNameWithExt = path.basename(filepath.toString());
          const fileExt = path.extname(filepath.toString());
          const filename = path.basename(fileNameWithExt, fileExt);
          return filename;
        });

        const videoObjectList = [];
        for (let i = 0; i < files.filePaths.length; i++) {
          videoObjectList.push({
            index: i,
            videoName: fileNames[i],
            videoInputPath: files.filePaths[i].toString(),
            videoOutputPath:
              process.platform === "linux" ? "file:///" + values[i] : values[i],
          });
        }
        returnValue.result = "SUCCESS";
        returnValue.videoObjectList = videoObjectList;
      } else {
        returnValue.result = "FAILED";
      }

      return returnValue;
    }
  }
});

ipcMain.handle("open-npy-sample-dialog", async (_event, _arg) => {
  console.log("================== Opening NPY sample ==================");

  const properties = ["openDirectory"];

  const folder = await dialog.showOpenDialog({
    title: "Select files to be uploaded",
    defaultPath: path.join(__dirname, "../assets/"),
    buttonLabel: "Open",
    filters: [{ name: "NPY Folder", extensions: ["npy"] }],
    properties: properties,
  });

  let returnValue = {
    description: "OPEN NPY SAMPLE DIALOG",
  };

  if (!folder) {
    returnValue.result = "FAILED";
  } else {
    if (folder.canceled) {
      returnValue.result = "CANCELED";
    } else {
      const samplePath = folder.filePaths[0];
      const sampleName = path.basename(samplePath);

      let filesInFolder;
      try {
        filesInFolder = fs.readdirSync(samplePath);
      } catch (err) {
        filesInFolder = "FAILED";
      }

      if (filesInFolder === "FAILED") {
        returnValue.result = "FAILED";
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
          returnValue.result = "FAILED";
        } else {
          filesInFolder.sort(
            (a, b) =>
              parseInt(a.slice(0, a.length - 4)) -
              parseInt(b.slice(0, b.length - 4))
          );

          const ultralyticsYoloV5Path = path.resolve(
            __dirname + "/resources/ultralytics_yolov5_master/"
          );

          const detectorPath = path.resolve(
            __dirname + "/resources/pretrained_models/best.pt"
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

          const npyProcessorScript = path.resolve(
            __dirname + "/extra/npy_processor.py"
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

          const npyProcessingPromise = new Promise((resolve, _reject) => {
            PythonShell.run(npyProcessorScript, options, (err, results) => {
              if (err) {
                resolve("FAILED");
              } else {
                resolve("SUCCESS");
              }
            });
          });

          console.time("npy processor");
          const npyProcessingResult = await npyProcessingPromise;
          console.timeEnd("npy processor");

          if (npyProcessingResult === "FAILED") {
            returnValue.result = "FAILED";
          } else {
            const inputDir = path.resolve(
              `${userDataPath_temp}/${sampleName}/${sampleName}.avi`
            );

            const outputDir = path.resolve(
              `${userDataPath_temp}/${sampleName}/${sampleName}_converted.mp4`
            );
            const ffmpegPromise = new Promise((resolve, _reject) => {
              ffmpeg(inputDir)
                .on("end", () => {
                  resolve("SUCCESS");
                })
                .on("error", (errFfmpeg) => {
                  console.log(`An error happened: ${errFfmpeg.message}`);
                  resolve("FAILED");
                })
                .saveToFile(outputDir);
            });

            const inputDirBbox = path.resolve(
              path.resolve(
                `${userDataPath_temp}/${sampleName}/${sampleName}_bbox.avi`
              )
            );

            const outputDirBbox = path.resolve(
              `${userDataPath_temp}/${sampleName}/${sampleName}__bbox_converted.mp4`
            );
            const ffmpegPromiseBbox = new Promise((resolve, _reject) => {
              ffmpeg(inputDirBbox)
                .on("end", () => {
                  resolve("SUCCESS");
                })
                .on("error", (errFfmpeg) => {
                  console.log(`An error happened: ${errFfmpeg.message}`);
                  resolve("FAILED");
                })
                .saveToFile(outputDirBbox);
            });

            const ffmpegResult = await Promise.all([
              ffmpegPromise,
              ffmpegPromiseBbox,
            ]);

            if (ffmpegResult.includes("FAILED")) {
              returnValue.result = "FAILED";
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

              returnValue.result = "SUCCESS";
              returnValue.samplePath = samplePath;
              returnValue.sampleName = sampleName;
              returnValue.npyFileNames = filesInFolder;
              returnValue.sliceTempPaths = returnedSlicesTempPaths;
              returnValue.videoInputPath = inputDir;
              returnValue.videoOutputPath =
                process.platform === "linux"
                  ? "file:///" + outputDir
                  : outputDir;
              returnValue.videoInputBboxPath = inputDirBbox;
              returnValue.videoOutputBboxPath =
                process.platform === "linux"
                  ? "file:///" + outputDirBbox
                  : outputDirBbox;
            }
          }
        }
      }
    }
  }

  console.log(
    "================== Finished opening NPY sample =================="
  );

  return returnValue;
});

ipcMain.handle("open-multi-npy-samples-dialog", async (_event, _arg) => {
  console.log(
    "==================================== Opening multi npy samples ==========================================="
  );

  const properties = ["openDirectory", "multiSelections"];

  const folders = await dialog.showOpenDialog({
    title: "Select files to be uploaded",
    defaultPath: path.join(__dirname, "../assets/"),
    buttonLabel: "Open",
    filters: [{ name: "NPY Folders", extensions: ["npy"] }],
    properties: properties,
  });

  let returnValue = {
    description: "OPEN MULTI NPY SAMPLES DIALOG",
  };

  if (!folders) {
    returnValue.result = "FAILED";
  } else {
    if (folders.canceled) {
      returnValue.result = "CANCELED";
    } else {
      const validNpySamples = [];

      for (let i = 0; i < folders.filePaths.length; i++) {
        const currentNpySamplePath = folders.filePaths[i];

        let filesInCurrentNpySample;
        try {
          filesInCurrentNpySample = fs.readdirSync(currentNpySamplePath);
        } catch (err) {
          continue;
        }

        if (filesInCurrentNpySample !== "FAILED") {
          const MINIMUM_NUMBER_OF_NPY_FILES = 10;
          const MAXIMUM_NUMBER_OF_NPY_FILES = 13;

          const wrongFormat =
            filesInCurrentNpySample.filter(
              (filename) => filename.slice(-4) !== ".npy"
            ).length === 0
              ? false
              : true;

          if (
            filesInCurrentNpySample.length >= MINIMUM_NUMBER_OF_NPY_FILES &&
            filesInCurrentNpySample.length <= MAXIMUM_NUMBER_OF_NPY_FILES &&
            !wrongFormat
          ) {
            validNpySamples.push(currentNpySamplePath);
          }
        }
      }

      if (validNpySamples.length === 0) {
        returnValue.result = "FAILED";
      } else {
        console.time("multi npy processor");

        const detectorPath = path.resolve(
          __dirname + "/resources/pretrained_models/best.pt"
        );

        const ultralyticsYoloV5Path = path.resolve(
          __dirname + "/resources/ultralytics_yolov5_master/"
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
              ...validNpySamples,
            ],
            (error, stdout, _stderr) => {
              if (error) {
                resolve("FAILED");
              } else {
                resolve(stdout);
              }
            }
          );
        });
        */

        const npyProcessorScript = path.resolve(
          __dirname + "/extra/npy_processor.py"
        );

        const options = {
          mode: "text",
          pythonOptions: ["-u"],
          args: [
            ultralyticsYoloV5Path,
            detectorPath,
            userDataPath_temp,
            ...validNpySamples,
          ],
        };

        const npyProcessingPromise = new Promise((resolve, _reject) => {
          PythonShell.run(npyProcessorScript, options, (err, results) => {
            if (err) {
              resolve("FAILED");
            } else {
              resolve("SUCCESS");
            }
          });
        });

        const npyProcessingResult = await npyProcessingPromise;

        if (npyProcessingResult === "FAILED") {
          returnValue.result = npyProcessingResult;
        } else {
          const returnNPYSamples = [];

          for (let i = 0; i < validNpySamples.length; i++) {
            const currentNpySamplePath = validNpySamples[i];
            const currentNpySampleName = path.basename(currentNpySamplePath);

            const inputDir = path.resolve(
              `${userDataPath_temp}/${currentNpySampleName}/${currentNpySampleName}.avi`
            );

            const outputDir = path.resolve(
              `${userDataPath_temp}/${currentNpySampleName}/${currentNpySampleName}_converted.mp4`
            );

            const inputDirBbox = path.resolve(
              `${userDataPath_temp}/${currentNpySampleName}/${currentNpySampleName}_bbox.avi`
            );

            const outputDirBbox = path.resolve(
              `${userDataPath_temp}/${currentNpySampleName}/${currentNpySampleName}_bbox_converted.mp4`
            );

            const ffmpegPromise = new Promise((resolve, _reject) => {
              ffmpeg(inputDir)
                .on("end", () => {
                  resolve("SUCCESS");
                })
                .on("error", (errFfmpeg) => {
                  console.log(`An error happened: ${errFfmpeg.message}`);
                  resolve("FAILED");
                })
                .saveToFile(outputDir);
            });

            const ffmpegPromiseBbox = new Promise((resolve, _reject) => {
              ffmpeg(inputDirBbox)
                .on("end", () => {
                  resolve("SUCCESS");
                })
                .on("error", (errFfmpeg) => {
                  console.log(`An error happened: ${errFfmpeg.message}`);
                  resolve("FAILED");
                })
                .saveToFile(outputDirBbox);
            });

            const ffmpegResult = await Promise.all([
              ffmpegPromise,
              ffmpegPromiseBbox,
            ]);

            const filesInCurrentNpySample =
              fs.readdirSync(currentNpySamplePath);

            filesInCurrentNpySample.sort(
              (a, b) =>
                parseInt(a.slice(0, a.length - 4)) -
                parseInt(b.slice(0, b.length - 4))
            );

            if (ffmpegResult.includes("FAILED")) {
              returnNPYSamples.push("FAILED");
            } else {
              const currentSampleTempPath = path.resolve(
                `${userDataPath_temp}/${currentNpySampleName}/`
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

              returnNPYSamples.push({
                index: i,
                npyFileNames: filesInCurrentNpySample,
                sliceTempPaths: returnedSlicesTempPaths,
                numberOfFrames: numberOfFrames,
                videoName: currentNpySampleName,
                videoInputPath: inputDir,
                videoOutputPath:
                  process.platform === "linux"
                    ? "file:///" + outputDir
                    : outputDir,
                videoInputBboxPath: inputDirBbox,
                videoOutputBboxPath:
                  process.platform === "linux"
                    ? "file:///" + outputDirBbox
                    : outputDirBbox,
              });
            }

            returnValue.result = "SUCCESS";
            returnValue.npyObjectList = returnNPYSamples;
          }
        }

        console.timeEnd("multi npy processor");
      }
    }
  }

  console.log(
    "================================= Finished opening multi npy samples ======================================="
  );

  return returnValue;
});

ipcMain.handle("get-video-metadata", async (event, data) => {
  console.log(
    "======================= Retrieving video's metadata ======================"
  );
  const filePath = data;
  console.log("Video path = ", filePath);

  const ffprobePromise = new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (error, metadata) => {
      if (error) {
        reject({
          description: "GET VIDEO METADATA",
          result: "FAILED",
        });
      } else {
        const { format_long_name, duration, filename } = metadata.format;
        const { height, width } = metadata.streams[0];
        resolve({
          description: "GET VIDEO METADATA",
          result: "SUCCESS",
          target: {
            filename : path.basename(filename, path.extname(filename)),
            format_long_name,
            duration,
            height,
            width,
          },
        });
      }
    });
  });

  const returnValue = await ffprobePromise;

  console.log(returnValue);

  console.log(
    "=================== Finished Retrieving video's metadata =================="
  );

  return returnValue;
});

ipcMain.handle("make-single-prediction", async (event, filepath) => {
  console.log("=================== Making prediction =====================");
  console.log(`filePath : ${filepath}`);

  const unetPretrainPath = path.resolve(
    __dirname + "/resources/pretrained_models/unet3.h5"
  );

  const checkColNumPretrainPath = path.resolve(
    __dirname + "/resources/pretrained_models/check_col_num.h5"
  );
  const classifyPretrainPath = path.resolve(
    __dirname + "/resources/pretrained_models/classify5.h5"
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

  const predictionScript = path.resolve(
    __dirname + "/extra/prediction_module.py"
  );

  const options = {
    mode: "text",
    pythonOptions: ["-u"],
    args: [
      unetPretrainPath,
      checkColNumPretrainPath,
      classifyPretrainPath,
      filepath,
    ],
  };

  const predictionPromise = new Promise((resolve, _reject) => {
    PythonShell.run(predictionScript, options, (err, results) => {
      if (err) {
        console.log(err);
        const returnValue = {
          description: "MAKE SINGLE PREDICTION",
          result: "FAILED",
        };
        resolve(returnValue);
      } else {
        const predictionResult = JSON.parse(
          results.toString().replaceAll("'", '"')
        );
        const returnValue = {
          description: "MAKE SINGLE PREDICTION",
          result: "SUCCESS",
          value: predictionResult[0].result.toString(),
        };
        resolve(returnValue);
      }
    });
  });

  const returnValue = await predictionPromise;

  console.log(
    "=================== Finished making prediction ====================="
  );

  return returnValue;
});

ipcMain.handle("make-multiple-prediction", async (event, sampleObjectList) => {
  console.log(
    "=================== Making multiple prediction ====================="
  );

  const unetPretrainPath = path.resolve(
    __dirname + "/resources/pretrained_models/unet3.h5"
  );

  const checkColNumPretrainPath = path.resolve(
    __dirname + "/resources/pretrained_models/check_col_num.h5"
  );
  const classifyPretrainPath = path.resolve(
    __dirname + "/resources/pretrained_models/classify5.h5"
  );

  const listVideoPath = sampleObjectList.map(
    (sampleObject) => sampleObject.videoInputPath
  );

  /*
  const isNpySample = sampleObjectList[0].hasOwnProperty("videoPath");
  let listVideoPath;
  if (isNpySample) {
    listVideoPath = sampleObjectList.map(
      (sampleObject) => sampleObject.videoPath
    );
  } else {
    listVideoPath = sampleObjectList.map((sampleObject) => sampleObject.path);
  }
  */

  /*
  const predictionModuleExecutablePath = path.resolve(
    __dirname +
    "/resources/prediction_module/prediction_module.exe"
  );

  const multiplePredictionPromise = new Promise((resolve, _reject) => {
    execFile(
      predictionModuleExecutablePath,
      [
        unetPretrainPath,
        checkColNumPretrainPath,
        classifyPretrainPath,
        ...listVideoPath,
      ],
      (error, stdout, _stderr) => {
        if (error) {
          resolve("FAILED");
        } else {
          resolve(stdout.toString());
        }
      }
    );
  });
  */

  const predictionScript = path.resolve(
    __dirname + "/extra/prediction_module.py"
  );

  const options = {
    mode: "text",
    pythonOptions: ["-u"],
    args: [
      unetPretrainPath,
      checkColNumPretrainPath,
      classifyPretrainPath,
      ...listVideoPath,
    ],
  };

  const multiplePredictionPromise = new Promise((resolve, _reject) => {
    PythonShell.run(predictionScript, options, (err, results) => {
      if (err) {
        console.log(err);
        resolve("FAILED");
      } else {
        resolve(results.toString());
      }
    });
  });

  const rawPredictionResults = await multiplePredictionPromise;

  let returnValue = {
    description: "MAKE MULTIPLE PREDICTION",
  };

  if (rawPredictionResults === "FAILED") {
    returnValue.value = "FAILED";
  } else {
    const predictionResults = JSON.parse(
      rawPredictionResults.replaceAll("'", '"')
    );

    if (predictionResults.length !== sampleObjectList.length) {
      returnValue.result = "FAILED";
    } else {
      returnValue.result = "SUCCESS";
      const returnedSampleObjectList = [];
      for (let i = 0; i < predictionResults.length; i++) {
        if (
          predictionResults[i].filePath === sampleObjectList[i].videoInputPath
        ) {
          returnedSampleObjectList.push({
            index: i,
            videoName: sampleObjectList[i].videoName,
            videoInputPath: sampleObjectList[i].videoInputPath,
            videoOutputPath: sampleObjectList[i].videoOutputPath,
            predictedValue: predictionResults[i].result,
          });
        }
      }
      returnValue.returnedVideoObjectList = returnedSampleObjectList;
    }
  }

  console.log(
    "=============== Finished making multiple prediction ================"
  );

  console.log(returnValue);

  return returnValue;
});

ipcMain.on("clear-temp-folder", (event, data) => {
  console.log("=================== Removing temp files ===================");
  const directory = `./${data}`;

  fs.readdirSync(directory).forEach((smallDir) => {
    const fullDir = `${directory}/${smallDir}`;
    console.log(fullDir);
    const res = fs.lstatSync(fullDir).isDirectory();

    if (res) {
      fs.rmSync(fullDir, { recursive: true, force: true });
    } else {
      fs.rmSync(fullDir, { recursive: false, force: true });
    }
  });

  console.log("============== Finished removing temp files ===============");
  event.reply("response-clear-temp-folder");
});

ipcMain.handle("check-credentials", async (_event, username, password) => {
  const result = await database.checkCredentials(username, password);
  let returnValue = {
    description: "CHECK CREDENTIALS",
  };
  if (result === "FAILED") {
    returnValue.result = "FAILED";
  } else if (result.length === 0) {
    returnValue.result = "NOT FOUND";
  } else {
    returnValue.result = "SUCCESS";
    returnValue.fullName = result[0].fullName;
    returnValue.username = result[0].username;
  }
  return returnValue;
});

ipcMain.handle("get-all-sample-records", async (_event, _data) => {
  const result = await database.getAllSampleRecords();
  const returnValue = {
    description: "GET ALL SAMPLE RECORDS",
    result: result,
  };
  return returnValue;
});

ipcMain.handle("save-sample-record", async (_event, sampleObject) => {
  const result = await database.saveSampleRecord(sampleObject);
  console.log("Save sample's record = ", result);
  const returnValue = {
    description: "SAVE SAMPLE RECORD",
    result: result,
  };
  return returnValue;
});

// Disable security warning
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
