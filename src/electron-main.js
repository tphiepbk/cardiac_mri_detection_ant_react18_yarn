const isDev = require("electron-is-dev");

const { app, BrowserWindow, ipcMain, dialog } = require("electron");

const path = require("path");

const fs = require("fs");

const ffmpeg = require("fluent-ffmpeg");
const { PythonShell } = require("python-shell");

const database = require("./database/mongoDB");

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
  else mainWindow.close();
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
    filters: [{ name: "MRI Videos", extensions: ["avi", "npy"] }],
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
    filters: [{ name: "MRI Videos", extensions: ["avi", "npy"] }],
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
            name: fileNames[i],
            path: files.filePaths[i].toString(),
            convertedPath:
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

ipcMain.handle("open-folder-dialog", async (_event, _arg) => {
  global.filepath = undefined;

  const properties = ["openDirectory"];

  const folder = await dialog.showOpenDialog({
    title: "Select files to be uploaded",
    defaultPath: path.join(__dirname, "../assets/"),
    buttonLabel: "Open",
    filters: [{ name: "MRI Videos", extensions: ["avi", "npy"] }],
    properties: properties,
  });

  if (!folder) {
    return {
      description: "OPEN FOLDER DIALOG",
      result: "FAILED",
    };
  } else {
    if (folder.canceled) {
      return {
        description: "OPEN FOLDER DIALOG",
        result: "CANCELED",
      };
    } else {
      const folderPath = folder.filePaths[0];
      const getFilesInFolderPromise = new Promise((resolve, _reject) => {
        fs.readdir(folderPath, (err, files) => {
          if (err) {
            resolve("FAILED");
          } else {
            resolve(files);
          }
        });
      });

      const filesInFolder = await getFilesInFolderPromise;

      if (filesInFolder === "FAILED") {
        return {
          description: "OPEN FOLDER DIALOG",
          result: "FAILED",
        };
      } else {
        const wrongFormat =
          filesInFolder.filter((filename) => filename.slice(-4) !== ".npy")
            .length === 0
            ? false
            : true;
        if (filesInFolder.length < 10 || wrongFormat) {
          return {
            description: "OPEN FOLDER DIALOG",
            result: "FAILED",
          };
        }

        const folderName = path.basename(folderPath);
        const pathToTempFolder = path.resolve(
          `${userDataPath_temp}/${folderName}/`
        );

        if (!fs.existsSync(pathToTempFolder)) {
          fs.mkdirSync(pathToTempFolder);
        }

        filesInFolder.sort(
          (a, b) =>
            parseInt(a.slice(0, a.length - 4)) -
            parseInt(b.slice(0, b.length - 4))
        );

        const filesInFolder_fullPath = filesInFolder.map((filename) =>
          path.resolve(`${folderPath}/${filename}`)
        );

        const npyProcessingModulePath = path.resolve(
          __dirname + "/extra/npy_processing_module/main.py"
        );

        const options = {
          mode: "text",
          pythonOptions: ["-u"],
          args: [pathToTempFolder, folderName, ...filesInFolder_fullPath],
        };

        const npyProcessingPromise = new Promise((resolve, reject) => {
          PythonShell.run(npyProcessingModulePath, options, (err, _data) => {
            if (err) {
              resolve("FAILED");
            } else {
              resolve("SUCCESS");
            }
          });
        });

        const npyProcessingResult = await npyProcessingPromise;

        if (npyProcessingResult === "FAILED") {
          return {
            description: "OPEN FOLDER DIALOG",
            result: "FAILED",
          };
        }

        const inputDir = path.resolve(
          `${userDataPath_temp}/${folderName}/${folderName}.avi`
        );
        const filename = folderName;
        const outputDir = path.resolve(
          `${userDataPath_temp}/${folderName}/${folderName}_converted.mp4`
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

        const ffmpegResult = await ffmpegPromise;

        if (ffmpegResult === "FAILED") {
          return {
            description: "OPEN FOLDER DIALOG",
            result: "FAILED",
          };
        } else {
          return {
            description: "OPEN FOLDER DIALOG",
            result: "SUCCESS",
            npyFileNames: filesInFolder,
            npyFilePaths: filesInFolder_fullPath,
            videoName: filename,
            videoInputPath: inputDir,
            videoOutputPath:
              process.platform === "linux" ? "file:///" + outputDir : outputDir,
          };
        }
      }
    }
  }
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
        resolve({
          description: "GET VIDEO METADATA",
          result: "SUCCESS",
          target: metadata,
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
    __dirname + "/resources/prediction_models/unet3.h5"
  );

  console.log(unetPretrainPath);

  const checkColNumPretrainPath = path.resolve(
    __dirname + "/resources/prediction_models/check_col_num.h5"
  );
  const classifyPretrainPath = path.resolve(
    __dirname + "/resources/prediction_models/classify5.h5"
  );
  const options = {
    mode: "text",
    pythonOptions: ["-u"],
    args: [
      filepath,
      unetPretrainPath,
      checkColNumPretrainPath,
      classifyPretrainPath,
    ],
  };

  const predictionModulePath = path.resolve(
    __dirname + "/extra/prediction_module/model.py"
  );

  const pythonPromise = new Promise((resolve, reject) => {
    PythonShell.run(
      predictionModulePath,
      options,
      (errPrediction, dataPrediction) => {
        if (errPrediction) {
          console.log(errPrediction);
          const returnValue = {
            description: "MAKE SINGLE PREDICTION",
            result: "FAILED",
          };
          resolve(returnValue);
        } else {
          console.log(dataPrediction.toString());
          const returnValue = {
            description: "MAKE SINGLE PREDICTION",
            result: "SUCCESS",
            value: dataPrediction.toString(),
          };
          resolve(returnValue);
        }
      }
    );
  });

  const returnValue = await pythonPromise;

  console.log(returnValue);

  console.log("=============== Finished making prediction ================");

  return returnValue;
});

ipcMain.handle("make-multiple-prediction", async (event, videoObjectList) => {
  console.log("=================== Making prediction =====================");

  const unetPretrainPath = path.resolve(
    __dirname + "/resources/prediction_models/unet3.h5"
  );

  const checkColNumPretrainPath = path.resolve(
    __dirname + "/resources/prediction_models/check_col_num.h5"
  );
  const classifyPretrainPath = path.resolve(
    __dirname + "/resources/prediction_models/classify5.h5"
  );
  const predictionModulePath = path.resolve(
    __dirname + "/extra/prediction_module/model_for_multiple.py"
  );

  const listVideoPath = videoObjectList.map((videoObject) => videoObject.path);

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

  const multiplePredictionPromise = new Promise((resolve, reject) => {
    PythonShell.run(
      predictionModulePath,
      options,
      (errPrediction, dataPrediction) => {
        if (errPrediction) {
          console.log(errPrediction);
          resolve("FAILED");
        } else {
          //console.log(dataPrediction.toString());
          resolve(dataPrediction.toString());
        }
      }
    );
  });

  const rawPredictionResults = await multiplePredictionPromise;

  let returnValue = {
    description: "MAKE MULTIPLE PREDICTION",
  };

  const predictionResults = JSON.parse(
    rawPredictionResults.replaceAll("'", '"')
  );

  if (predictionResults.length === videoObjectList.length) {
    if (predictionResults.includes("FAILED")) {
      returnValue.result = "FAILED";
    } else {
      returnValue.result = "SUCCESS";
      const returnedVideoObjectList = [];
      for (let i = 0; i < predictionResults.length; i++) {
        if (predictionResults[i].filepath === videoObjectList[i].path) {
          returnedVideoObjectList.push({
            index: i,
            name: videoObjectList[i].name,
            path: videoObjectList[i].path,
            convertedPath: videoObjectList[i].convertedPath,
            predictedValue: predictionResults[i].result,
          });
        }
      }
      returnValue.returnedVideoObjectList = returnedVideoObjectList;
    }
  } else {
    returnValue.result = "FAILED";
  }

  console.log("=============== Finished making prediction ================");

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

ipcMain.handle("save-patient-record", async (_event, patientObject) => {
  const result = await database.savePatientRecord(patientObject);
  console.log("Save patient's record = ", result);
  const returnValue = {
    description: "SAVE PATIENT RECORD",
    result: result,
  };
  return returnValue;
});
// Disable security warning
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
