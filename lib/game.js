const crypto = require("crypto");
const fs = require("fs");

const common = require("./common");

const getCrads = (difficulty) => {
  let cardsArray = [];
  switch (difficulty) {
    case "easy":
      cardsArray = common.getRandomCards(5);
      break;
    case "medium":
      cardsArray = common.getRandomCards(10);
      break;
    case "hard":
      cardsArray = common.getRandomCards(25);
      break;

    default:
      cardsArray = common.getRandomCards(5);
      break;
  }

  return cardsArray.reduce((a, c) => {
    a.push({ cardNum: c, isFlipped: false, isVisible: true });
    return a;
  }, []);
};

const rating = ({ error_score, elapsed_time, cards }) => {
  const rating = (error_score * 60 + elapsed_time) / cards.length;

  let stars = 0;
  switch (true) {
    case rating <= 100:
      stars = 5;
      break;
    case rating <= 150:
      stars = 4;
      break;
    case rating <= 200:
      stars = 3;
      break;
    case rating <= 250:
      stars = 2;
      break;
    default:
      stars = 1;
  }

  return stars;
};

const getFileContents = (fileId) => {
  return new Promise((resolve, reject) => {
    fs.readFile(`./game-boards/${fileId}.json`, (err, data) => {
      if (err) reject(err);
      resolve(JSON.parse(data));
    });
  });
};

const setFileContents = (fileId, fileData) => {
  const data = JSON.stringify(fileData);

  return new Promise((resolve, reject) => {
    fs.writeFile(`./game-boards/${fileId}.json`, data, (error) => {
      if (error) reject(error);
      resolve(data);
    });
  });
};

module.exports = {
  startGame: (difficulty) => {
    return new Promise(async (resolve, reject) => {
      const file_id = crypto.randomBytes(16).toString("hex");
      const cards = getCrads(difficulty);
      const created_at = new Date();
      const error_score = 0;
      const elapsed_time = 0;
      const game_ended = false;
      const rating = 0;

      const gameData = {
        file_id,
        created_at,
        error_score,
        elapsed_time,
        game_ended,
        rating,
        cards,
      };

      const cardNos = cards.reduce((a, c) => {
        a.push(c.cardNum);
        return a;
      }, []);

      try {
        await setFileContents(file_id, gameData);
        resolve({ file_id, cards: cardNos });
      } catch (error) {
        reject(error);
      }
    });
  },
  getGameData: async (fileId) => {
    return new Promise((resolve, reject) => {
      fs.readFile(`./game-boards/${fileId}.json`, (err, data) => {
        if (err) reject(err);
        let parsedData = JSON.parse(data);

        if (!parsedData.game_ended) {
          parsedData.elapsed_time = common.ellapsedSeconds(
            new Date(parsedData.created_at)
          );
        }
        resolve(parsedData);
      });
    });
  },
  setGameData: (fileId, cardIndex) => {
    return new Promise(async (resolve, reject) => {
      try {
        const gameData = await getFileContents(fileId);

        if (!gameData.game_ended) {
          gameData.elapsed_time = common.ellapsedSeconds(
            new Date(gameData.created_at)
          );
        }

        // check if the card is visible
        if (!gameData.cards[cardIndex].isVisible) {
          return resolve({
            elapsed_time: gameData.elapsed_time,
            error_score: gameData.error_score,
            cards: [],
          });
        }

        const { cards } = gameData;

        // find how many cards are flipped
        const flippedCards = cards.reduce((a, c, i) => {
          if (c.isFlipped) {
            c.index = i;
            a.push(c);
          }
          return a;
        }, []);

        if (flippedCards.length === 0) {
          // flip the first card if no card is flipped
          gameData.cards[cardIndex].isFlipped = true;
          gameData.cards[cardIndex].index = cardIndex;

          await setFileContents(fileId, gameData);

          return resolve({
            elapsed_time: gameData.elapsed_time,
            error_score: gameData.error_score,
            cards: [gameData.cards[cardIndex]],
          });
        }

        if (flippedCards.length === 1) {
          // flip the second card if one card is flipped

          gameData.cards[cardIndex].isFlipped = true;
          gameData.cards[cardIndex].index = cardIndex;

          const [firstCrad] = flippedCards;
          const secondCard = gameData.cards[cardIndex];

          // don't flip if same card clicked twice
          if (firstCrad.cardNum === secondCard.cardNum) {
            return resolve({
              elapsed_time: gameData.elapsed_time,
              error_score: gameData.error_score,
              cards: [],
            });
          }

          if (!common.matchCards(firstCrad.cardNum, secondCard.cardNum)) {
            gameData.error_score++;
          } else {
            gameData.cards[firstCrad.index].isVisible = false;
            gameData.cards[secondCard.index].isVisible = false;

            const visibleCount = gameData.cards.reduce((a, c) => {
              a = c.isVisible ? a + 1 : a;
              return a;
            }, 0);

            // end game if all cards have been flipped
            if (visibleCount === 0) {
              gameData.game_ended = true;
              gameData.rating = rating(gameData);
            }
          }

          const result = {
            game_ended: gameData.game_ended,
            rating: gameData.rating,
            elapsed_time: gameData.elapsed_time,
            error_score: gameData.error_score,
            cards: [
              gameData.cards[firstCrad.index],
              gameData.cards[secondCard.index],
            ],
          };

          await setFileContents(fileId, gameData);
          return resolve(result);
        }

        if (flippedCards.length > 1) {
          // unflip all cards
          gameData.cards = gameData.cards.reduce((a, c) => {
            c.isFlipped = false;
            a.push(c);
            return a;
          }, []);

          gameData.cards[cardIndex].isFlipped = true;
          gameData.cards[cardIndex].index = cardIndex;

          await setFileContents(fileId, gameData);

          return resolve({
            elapsed_time: gameData.elapsed_time,
            error_score: gameData.error_score,
            cards: [gameData.cards[cardIndex]],
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  },
};
