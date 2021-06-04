const images = require("./images");

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    // random index from 0 to i
    let j = Math.floor(Math.random() * (i + 1));

    // swap elements array[i] and array[j] using destructuring assignment
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

module.exports = {
  getRandomCards: (numberOfCards) => {
    const orderedCardArray = images.images.slice(0, numberOfCards);

    // shuffle two sets of cards
    return shuffle(orderedCardArray.flat());
  },

  ellapsedSeconds: (startTime) => {
    currentTime = new Date();

    let timeDiff = currentTime - startTime; //in ms

    // strip the ms
    timeDiff /= 1000;

    // get seconds
    return Math.round(timeDiff);
  },
  matchCards: (cardOne, cardTwo) => {
    const cardIndex = images.images.findIndex((imageSet) => {
      if (
        imageSet.indexOf(cardOne) !== -1 &&
        imageSet.indexOf(cardTwo) !== -1
      ) {
        return true;
      }
      return false;
    });

    return cardIndex > -1 ? true : false;
  },
};
