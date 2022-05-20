const { videoProcessor } = require("./videoProcessor");

const multipleVideosProcessor = async (userDataPath_temp, videoInputPaths) => {
  const allPromise = [];

  for (let i = 0; i < videoInputPaths.length; i++) {
    const videoInputPath = videoInputPaths[i];
    const videoProcessorPromise = new Promise((resolve, _reject) => {
      videoProcessor(userDataPath_temp, videoInputPath).then(
        (returnedValue) => {
          resolve(returnedValue);
        }
      );
    });
    allPromise.push(videoProcessorPromise);
  }

  const values = await Promise.all(allPromise);

  if (values.length !== videoInputPaths.length) {
    return "FAILED";
  } else {
    const returnedVideoObjects = [];
    for (let i = 0; i < values.length; i++) {
      returnedVideoObjects.push({
        index: i,
        ...values[i],
      });
    }
    return returnedVideoObjects;
  }
};

module.exports = {
  multipleVideosProcessor,
};
