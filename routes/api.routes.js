const express = require("express");
const router = express.Router();
const apiController = require("../controllers/api.controller");

router.post("/start-game", apiController.startGame);
router.post("/get-game-data", apiController.getGameData);
router.post("/select-card", apiController.selectCard);

module.exports = router;
