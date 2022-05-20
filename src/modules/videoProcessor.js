const ffmpeg = require("fluent-ffmpeg");

const fs = require("fs")

const path = require("path");

if (process.platform === "win32") {
  const ffmpegDir = path.resolve(__dirname + "/resources/ffmpeg_windows");
  ffmpeg.setFfmpegPath(path.resolve(`${ffmpegDir}/ffmpeg.exe`));
  ffmpeg.setFfprobePath(path.resolve(`${ffmpegDir}/ffprobe.exe`));
} else if (process.platform === "linux") {
  const ffmpegDir = path.resolve(__dirname + "/resources/ffmpeg_linux");
  ffmpeg.setFfmpegPath(path.resolve(`${ffmpegDir}/ffmpeg`));
  ffmpeg.setFfprobePath(path.resolve(`${ffmpegDir}/ffprobe`));
}

const getVideoMetadata = async (videoInputPath) => {
  const ffprobePromise = new Promise((resolve, _reject) => {
    ffmpeg.ffprobe(videoInputPath, (error, metadata) => {
      if (error) {
        resolve("FAILED");
      } else {
        const { format_long_name, duration } = metadata.format;
        const { height, width } = metadata.streams[0];
        resolve({
          format_long_name,
          duration,
          height,
          width,
        });
      }
    });
  });

  const result = await ffprobePromise;

  return result;
};

const convertVideo = async (userDataPath_temp, videoInputPath, videoName) => {
  const videoTempFolderPath = path.resolve(`${userDataPath_temp}/${videoName}/`)

  if (!fs.existsSync(videoTempFolderPath)) {
    fs.mkdirSync(videoTempFolderPath)
  }

  const inputDir = videoInputPath;
  const outputDir = path.resolve(
    `${userDataPath_temp}/${videoName}/${videoName}_converted.mp4`
  );

  const ffmpegPromise = new Promise((resolve, _reject) => {
    ffmpeg(inputDir)
      .on("end", () => {
        resolve(outputDir);
      })
      .on("error", (errFfmpeg) => {
        console.log(`An error happened: ${errFfmpeg.message}`);
        resolve("FAILED");
      })
      .saveToFile(outputDir);
  });

  const result = await ffmpegPromise;

  return result;
};

const videoProcessor = async (userDataPath_temp, videoInputPath) => {
  const videoNameWithExt = path.basename(videoInputPath);
  const videoName = path.basename(
    videoNameWithExt,
    path.extname(videoInputPath)
  );

  const videoConvertedPath = await convertVideo(
    userDataPath_temp,
    videoInputPath,
    videoName
  );

  const videoMetadata = await getVideoMetadata(videoInputPath);

  if (videoMetadata === "FAILED" || videoConvertedPath === "FAILED") {
    return "FAILED"
  } else {
    return {
      videoName,
      videoInputPath,
      videoOutputPath:
        process.platform === "linux" ? "file:///" + videoConvertedPath : videoConvertedPath,
      videoMetadata,
    };
  }
};

module.exports = {
  videoProcessor,
}