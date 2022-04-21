const electron = require("electron");
const isDev = require("electron-is-dev");

const { app, BrowserWindow, ipcMain, dialog } = electron;

const path = require("path");

const fs = require("fs");
const axios = require("axios");
const extractZip = require("extract-zip");
const ffmpeg = require("fluent-ffmpeg");
const { PythonShell } = require("python-shell");

const userDataPath = app.getPath("userData");
const userDataPath_temp = `${userDataPath}/temp/`;

if (!fs.existsSync(userDataPath_temp)) {
  fs.mkdirSync(userDataPath_temp);
}

const ffmpegDir = path.resolve(__dirname + "/../extra/ffmpeg/bin");
ffmpeg.setFfmpegPath(path.resolve(`${ffmpegDir}/ffmpeg.exe`));
ffmpeg.setFfprobePath(path.resolve(`${ffmpegDir}/ffprobe.exe`));

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1850,
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
    process.platform !== "darwin"
      ? ["openFile"]
      : ["openFile", "openDirectory"];

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
              videoOutputPath: outputDir,
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
            convertedPath: values[i],
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
    __dirname + "/../extra/prediction_module/unet3.h5"
  );
  const checkColNumPretrainPath = path.resolve(
    __dirname + "/../extra/prediction_module/check_col_num.h5"
  );
  const classifyPretrainPath = path.resolve(
    __dirname + "/../extra/prediction_module/classify5.h5"
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
    __dirname + "/../extra/prediction_module/model.py"
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
          reject(returnValue);
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
    __dirname + "/../extra/prediction_module/unet3.h5"
  );
  const checkColNumPretrainPath = path.resolve(
    __dirname + "/../extra/prediction_module/check_col_num.h5"
  );
  const classifyPretrainPath = path.resolve(
    __dirname + "/../extra/prediction_module/classify5.h5"
  );
  const predictionModulePath = path.resolve(
    __dirname + "/../extra/prediction_module/model_for_multiple.py"
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

  const predictionResults = JSON.parse(rawPredictionResults.replaceAll("'", '"'));

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

  /*
  const allPromise = []

  for (let videoObject of videoObjectList) {
    const options = {
      mode: 'text',
      pythonOptions: ['-u'],
      args: [videoObject.path, unetPretrainPath, checkColNumPretrainPath, classifyPretrainPath],
    };

    const pythonPromise = new Promise((resolve, reject) => {
      PythonShell.run(predictionModulePath, options, (errPrediction, dataPrediction) => {
        if (errPrediction) {
          console.log(errPrediction);
          resolve('FAILED')
        } else {
          console.log(dataPrediction.toString());
          resolve(dataPrediction.toString())
        }
      })
    })

    allPromise.push(pythonPromise)
  }

  const values = await Promise.all(allPromise)

  let returnValue = {
    description: 'MAKE MULTIPLE PREDICTION'
  }

  if (values.length === videoObjectList.length) {
    if (values.includes('FAILED')) {
      returnValue.result = 'FAILED'
    } else {
      returnValue.result = 'SUCCESS'
      const returnedVideoObjectList = []
      for (let i = 0 ; i < values.length ; i++) {
        returnedVideoObjectList.push({
          index: i,
          name: videoObjectList[i].name,
          path: videoObjectList[i].path,
          convertedPath: videoObjectList[i].convertedPath,
          predictedValue: values[i]
        })
      }
      returnValue.returnedVideoObjectList = returnedVideoObjectList
    }
  } else {
    returnValue.result = 'FAILED'
  }

  console.log('=============== Finished making prediction ================');

  console.log(returnValue)

  return returnValue
  */
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

/*
async function extractZipFile(source, target, folderName, eventToReply) {
  try {
    await extractZip(source, { dir: path.resolve(target) });
    console.log('Extraction complete');
    console.log(`Folder name : ${folderName}`);
    console.log('Listing files...');

    const arrFileNames = [];
    fs.readdirSync(target).forEach((file) => {
      console.log(file);
      arrFileNames.push(file);
    });

    const res = {
      result: 'SUCCESS',
      folderName,
      fileNames: arrFileNames,
    };
    eventToReply.reply('response-open-zip-file', JSON.stringify(res));
    console.log('================ Finished opening zip file ================');
  } catch (err) {
    console.log('Oops: extractZip failed', err);
  }
}

ipcMain.on('open-zip-file-dialog', (event) => {
  console.log('===================== Opening zip file ====================');

  global.filepath = undefined;

  if (process.platform !== 'darwin') {
    // Resolves to a Promise<Object>
    dialog.showOpenDialog({
      title: 'Select the File to be uploaded',
      defaultPath: path.join(__dirname, '../assets/'),
      buttonLabel: 'Open',
      filters: [
        { name: 'Zipped MRI Videos', extensions: ['zip'] },
      ],
      properties: ['openFile'],
    }).then((file) => {
      console.log('Canceled file upload : ', file.canceled);
      if (!file.canceled) {
        const randomFolderName = Math.random().toString(36).substring(2, 7);

        global.filepath = file.filePaths[0].toString();

        const fileNameWithExt = path.basename(global.filepath);
        const fileExt = path.extname(global.filepath);
        const filename = path.basename(fileNameWithExt, fileExt);

        console.log(global.filepath);
        console.log(filename);

        fs.copyFile(global.filepath, `./temp/${filename}.zip`, (err) => {
          if (err) throw err;
          extractZipFile(`./temp/${filename}.zip`, `./temp/${randomFolderName}/`, randomFolderName, event);
        });
      }
    }).catch((err) => {
      console.log(err);
      const res = {
        result: 'FAIL',
      };
      event.reply('response-open-zip-file', JSON.stringify(res));
    });
  } else {
    // Resolves to a Promise<Object>
    dialog.showOpenDialog({
      title: 'Select the File to be uploaded',
      defaultPath: path.join(__dirname, '../assets/'),
      buttonLabel: 'Open',
      filters: [
        { name: 'Zipped MRI Videos', extensions: ['zip'] },
      ],
      properties: ['openFile', 'openDirectory'],
    }).then((file) => {
      console.log('Canceled file upload : ', file.canceled);
      if (!file.canceled) {
        const randomFolderName = Math.random().toString(36).substring(2, 7);

        global.filepath = file.filePaths[0].toString();

        const fileNameWithExt = path.basename(global.filepath);
        const fileExt = path.extname(global.filepath);
        const filename = path.basename(fileNameWithExt, fileExt);

        console.log(global.filepath);
        console.log(filename);

        fs.copyFile(global.filepath, `./temp/${filename}.zip`, (err) => {
          if (err) throw err;
          extractZipFile(`./temp/${filename}.zip`, `./temp/${randomFolderName}/`, randomFolderName, event);
        });
      }
    }).catch((err) => {
      console.log(err);
      const res = {
        result: 'FAIL',
      };
      event.reply('response-open-zip-file', JSON.stringify(res));
    });
  }
});
*/

function makePrediction(fileDir) {
  return new Promise((resolve, reject) => {
    const options = {
      mode: "text",
      pythonOptions: ["-u"], // get print results in real-time
      args: [fileDir],
    };

    PythonShell.run("./prediction_module/model.py", options, (err, data) => {
      if (err) {
        console.log(err);
        reject(new Error("Promise rejected"));
      }
      // console.log(data.toString())
      console.log(`File directory : ${fileDir}
      Result : ${data}`);

      resolve(data);
    });
  });
}

async function makeMultiPrediction(subfolderDir, eventForReplying) {
  const fileNames = [];

  fs.readdirSync(subfolderDir).forEach((file) => {
    fileNames.push(file);
  });

  const returnObj = {};

  /*
  for (const fileName of fileNames) {
    const result = await makePrediction(`${subfolderDir}/${fileName}`);
    returnObj[fileName] = result;
  }
  */

  fileNames.forEach(async (fileName) => {
    const result = await makePrediction(`${subfolderDir}/${fileName}`);
    returnObj[fileName] = result;
  });

  eventForReplying.reply(
    "response-get-multiple-prediction-result",
    JSON.stringify(returnObj)
  );
  console.log("=========== Finished making multiple prediction ===========");
}

ipcMain.on("get-multiple-prediction-result", (event, data) => {
  console.log("=============== Making multiple prediction ================");
  const folderName = data;
  console.log(`Folder name : ${folderName}`);

  const subfolderDir = `./temp/${folderName}`;
  makeMultiPrediction(subfolderDir, event);
});

// Disable security warning
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
