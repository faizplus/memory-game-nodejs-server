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
    // generate array from 1 to numberOfCards
    const orderedCardArray = Array.from(
      { length: numberOfCards },
      (_, i) => i + 1
    );

    // shuffle two sets of cards
    return shuffle([...orderedCardArray, ...orderedCardArray]);
  },

  ellapsedSeconds: (startTime) => {
    currentTime = new Date();

    let timeDiff = currentTime - startTime; //in ms

    // strip the ms
    timeDiff /= 1000;

    // get seconds
    return Math.round(timeDiff);
  },
};
