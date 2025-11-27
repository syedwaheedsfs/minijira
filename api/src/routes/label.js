import express from "express";
import {
  createLabel,
  getLabelsForBoard,
} from "../controllers/label.js";

const router = express.Router();

router.get("/board/:boardId", getLabelsForBoard);
router.post("/", createLabel);

export default router;
