import express from "express";
import { getBoard } from "../controllers/boardController.js";

const router = express.Router();

router.get("/:id/data", getBoard);

export default router;
