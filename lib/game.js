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

module.exports = {
  startGame: (difficulty) => {
    return new Promise((resolve, reject) => {
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

      let data = JSON.stringify(gameData);

      try {
        fs.writeFile(`./game-boards/${file_id}.json`, data, (error) => {
          if (error) throw error;
          resolve(gameData);
        });
      } catch (error) {
        reject(error);
      }
    });
  },
  getGameData: (fileId) => {
    return new Promise((resolve, reject) => {
      fs.readFile(`./game-boards/${fileId}.json`, (err, data) => {
        if (err) reject(error);
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
  setGameData: (gameData) => {
    return new Promise((resolve, reject) => {
      gameData.elapsed_time = common.ellapsedSeconds(
        new Date(gameData.created_at)
      );

      const { cards } = gameData;

      const flippedCards = cards.reduce((a, c, i) => {
        if (c.isFlipped) {
          c.index = i;
          a.push(c);
        }
        return a;
      }, []);

      if (flippedCards.length !== 2) {
        reject({ msg: "There must be two cards selected only" });
      }

      const [firstCrad, secondCard] = flippedCards;

      if (firstCrad.cardNum !== secondCard.cardNum) {
        gameData.error_score++;
      } else {
        gameData.cards[firstCrad.index].isVisible = false;
        gameData.cards[secondCard.index].isVisible = false;
      }

      const visibleCount = gameData.cards.reduce((a, c) => {
        a = c.isVisible ? a + 1 : a;
        return a;
      }, 0);

      // end game if all cards have been flipped
      if (visibleCount === 0) {
        gameData.game_ended = true;
        gameData.rating = rating(gameData);
      }

      const data = JSON.stringify(gameData);

      try {
        fs.writeFile(
          `./game-boards/${gameData.file_id}.json`,
          data,
          (error) => {
            if (error) throw error;
            resolve(gameData);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  },
};
