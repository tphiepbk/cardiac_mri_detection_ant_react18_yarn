const { npySampleProcessor } = require("./npySampleProcessor")

const multipleNpySamplesProcessor = async (userDataPath_temp, samplePaths) => {
  const allPromise = []
  for (let i = 0; i < samplePaths.length; i++) {
    const currentNpySamplePath = samplePaths[i];

    const npySampleProcessorPromise = new Promise((resolve, _reject) => {
      npySampleProcessor(userDataPath_temp, currentNpySamplePath).then(returnedValue => {
        resolve(returnedValue)
      })
    })

    allPromise.push(npySampleProcessorPromise)
  }

  const values = await Promise.all(allPromise)

  if (values.length !== samplePaths.length) {
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
}

module.exports = {
  multipleNpySamplesProcessor,
}