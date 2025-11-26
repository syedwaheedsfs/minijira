import express from "express";
import {
  createCard,
  updateCard,
  deleteCard,
  moveCard,
  getCard,
} from "../controllers/cardController.js";

const router = express.Router();

router.post("/", createCard);
router.put("/:id", updateCard);
router.patch("/:id/move", moveCard);
router.delete("/:id", deleteCard);
router.get("/:id", getCard);

export default router;
