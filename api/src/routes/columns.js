import {
  createColumn,
  getAllColumns,
} from "../controllers/columnController.js";
import express from "express";
const router = express.Router();

router.post("/boards/:boardId", createColumn);
router.get("/", getAllColumns);

export default router;