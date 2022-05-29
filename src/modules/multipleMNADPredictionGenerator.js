const { MNADPredictionGenerator } = require("./MNADPredictionGenerator");

const multipleMNADPredictionGenerator = async (
  userDataPath_temp,
  croppedNpyFolderPaths
) => {
  const allPromise = [];
  for (let i = 0; i < croppedNpyFolderPaths.length; i++) {
    const currentCroppedNpyFolderPath = croppedNpyFolderPaths[i];

    const MNADPredictionPromise = new Promise((resolve, _reject) => {
      MNADPredictionGenerator(
        userDataPath_temp,
        currentCroppedNpyFolderPath
      ).then((returnedValue) => {
        resolve(returnedValue);
      });
    });

    allPromise.push(MNADPredictionPromise);
  }

  const values = await Promise.all(allPromise);

  if (values.length !== croppedNpyFolderPaths.length) {
    return "FAILED";
  } else {
    const returnedMNADPredictionObjects = [];
    for (let i = 0; i < values.length; i++) {
      returnedMNADPredictionObjects.push({
        index: i,
        ...values[i],
      });
    }
    return returnedMNADPredictionObjects;
  }
};

module.exports = {
  multipleMNADPredictionGenerator,
};
