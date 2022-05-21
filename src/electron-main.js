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

const { videoProcessor } = require("./modules/videoProcessor");
const {
  multipleVideosProcessor,
} = require("./modules/multipleVideosProcessor");
const { npyProcessor } = require("./modules/npyProcessor");
const {
  multipleNpySamplesProcessor,
} = require("./modules/multipleNpySamplesProcessor");
const {
  predictAbnormalPositionForSlice,
} = require("./modules/predictAbnormalPositionForSlice");

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
    mainWindow.webContents.send("maximized-app");
  });

  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send("unmaximized-app");
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

ipcMain.on("minimize-app", (_event, _arg) => mainWindow.minimize());
ipcMain.on("maximize-app", (_event, _arg) =>
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
);
ipcMain.on("close-app", (_event, _arg) => mainWindow.close());

ipcMain.handle("upload-video", async (_event, _arg) => {
  const properties =
    process.platform === "darwin"
      ? ["openFile", "openDirectory"]
      : ["openFile"];

  const file = await dialog.showOpenDialog({
    title: "Select video to be uploaded",
    defaultPath: path.join(__dirname, "../assets/"),
    buttonLabel: "Open",
    filters: [{ name: "MRI Videos", extensions: ["avi"] }],
    properties: properties,
  });
  if (!file) {
    return {
      description: "UPLOAD VIDEO",
      result: "FAILED",
    };
  } else {
    if (file.canceled) {
      return {
        description: "UPLOAD VIDEO",
        result: "CANCELED",
      };
    } else {
      const videoInputPath = path.resolve(file.filePaths[0]);

      const videoProcessorResult = await videoProcessor(
        userDataPath_temp,
        videoInputPath
      );

      if (videoProcessorResult === "FAILED") {
        return {
          description: "UPLOAD VIDEO",
          result: "FAILED",
        };
      } else {
        return {
          description: "UPLOAD VIDEO",
          result: "SUCCESS",
          target: { ...videoProcessorResult },
        };
      }
    }
  }
});

ipcMain.handle("upload-multiple-videos", async (_event, _arg) => {
  global.filepath = undefined;

  const properties =
    process.platform !== "darwin"
      ? ["openFile", "multiSelections"]
      : ["openFile", "openDirectory", "multiSelections"];

  const files = await dialog.showOpenDialog({
    title: "Select videos to be uploaded",
    defaultPath: path.join(__dirname, "../assets/"),
    buttonLabel: "Open",
    filters: [{ name: "MRI Videos", extensions: ["avi"] }],
    properties: properties,
  });
  if (!files) {
    return {
      description: "UPLOAD MULTIPLE VIDEOS",
      result: "ERROR",
    };
  } else {
    if (files.canceled) {
      return {
        description: "UPLOAD MULTIPLE VIDEOS",
        result: "CANCELED",
      };
    } else {
      const videoInputPaths = files.filePaths.map((filePath) =>
        path.resolve(filePath)
      );

      const videoObjects = await multipleVideosProcessor(
        userDataPath_temp,
        videoInputPaths
      );

      if (videoObjects === "FAILED") {
        return {
          description: "UPLOAD MULTIPLE VIDEOS",
          result: "FAILED",
        };
      } else {
        return {
          description: "UPLOAD MULTIPLE VIDEOS",
          result: "SUCCESS",
          target: [...videoObjects],
        };
      }
    }
  }
});

ipcMain.handle("upload-npy-sample", async (_event, _arg) => {
  console.log("================== Opening NPY sample ==================");

  const properties = ["openDirectory"];

  const folder = await dialog.showOpenDialog({
    title: "Select folder to be uploaded",
    defaultPath: path.join(__dirname, "../assets/"),
    buttonLabel: "Open",
    filters: [{ name: "NPY folder", extensions: ["npy"] }],
    properties: properties,
  });

  if (!folder) {
    return {
      description: "UPLOAD NPY SAMPLE",
      result: "FAILED",
    };
  } else {
    if (folder.canceled) {
      return {
        description: "UPLOAD NPY SAMPLE",
        result: "CANCELED",
      };
    } else {
      const samplePath = path.resolve(folder.filePaths[0]);
      const npyProcessorResult = await npyProcessor(
        userDataPath_temp,
        samplePath
      );

      console.log(npyProcessorResult);
      if (npyProcessorResult === "FAILED") {
        return {
          description: "UPLOAD NPY SAMPLE",
          result: "FAILED",
        };
      } else {
        return {
          description: "UPLOAD NPY SAMPLE",
          result: "SUCCESS",
          target: { ...npyProcessorResult },
        };
      }
    }
  }
});

ipcMain.handle("upload-multiple-npy-samples", async (_event, _arg) => {
  console.log(
    "==================================== Opening multi npy samples ==========================================="
  );

  const properties = ["openDirectory", "multiSelections"];

  const folders = await dialog.showOpenDialog({
    title: "Select folders to be uploaded",
    defaultPath: path.join(__dirname, "../assets/"),
    buttonLabel: "Open",
    filters: [{ name: "NPY folders", extensions: ["npy"] }],
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
      const samplePaths = folders.filePaths.map((folderPath) =>
        path.resolve(folderPath)
      );

      console.time("Multiple NPY samples processing time");
      const npyObjects = await multipleNpySamplesProcessor(
        userDataPath_temp,
        samplePaths
      );
      console.timeEnd("Multiple NPY samples processing time");

      if (npyObjects === "FAILED") {
        return {
          description: "UPLOAD MULTIPLE NPY SAMPLES",
          result: "FAILED",
        };
      } else {
        return {
          description: "UPLOAD MULTIPLE NPY SAMPLES",
          result: "SUCCESS",
          target: [...npyObjects],
        };
      }
    }
  }
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

ipcMain.handle("predict-abnormal-position-for-slice", async (_event, data) => {
  const { sliceCroppedNpyPath, edFrameIndex, esFrameIndex } = data;

  console.log(edFrameIndex, esFrameIndex)

  const rawPredictionResults = await predictAbnormalPositionForSlice(sliceCroppedNpyPath, edFrameIndex, esFrameIndex);

  if (rawPredictionResults === "FAILED") {
    return {
      description: "PREDICT ABNORMAL POSITION FOR SLICE",
      result: "FAILED"
    }
  } else {
    const predictionResults = JSON.parse(
      rawPredictionResults.replaceAll("'", '"')
    );

    console.log(predictionResults);

    return {
      description: "PREDICT ABNORMAL POSITION FOR SLICE",
      result: "SUCCESS",
      target: [...predictionResults],
    }
  }
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
