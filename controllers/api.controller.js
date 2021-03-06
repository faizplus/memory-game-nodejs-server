const game = require("../lib/game");

module.exports = {
  startGame: async ({ body }, res) => {
    const { difficulty } = body;
    if (!difficulty) {
      return res.status(400).json({ msg: "Invalid request" });
    }

    try {
      const result = await game.startGame(difficulty);
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: "Something went wrong..." });
    }
  },
  selectCard: async ({ body }, res) => {
    const { fileId, cardIndex } = body;
    if (!fileId) {
      return res.status(400).json({ msg: "Invalid request" });
    }

    try {
      const result = await game.setGameData(fileId, cardIndex);
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: "Something went wrong..." });
    }
  },
};
