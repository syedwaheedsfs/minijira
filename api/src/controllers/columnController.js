import Column from "../models/Column.js";
import mongoose from "mongoose";

import Board from "../models/Board.js";

export const createColumn = async (req, res) => {
  try {
    const { title } = req.body;
    const { boardId } = req.params;

    // board exists?
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ error: "Board not found" });

    // get next position
    const count = await Column.countDocuments({ boardId });

    const newColumn = await Column.create({
      title,
      position: count, // next available index
      boardId,
    });

    res.status(201).json(newColumn);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getAllColumns = async (req, res) => {
 try {
   console.log("=== DEBUG INFO ===");
   console.log("Collection name:", Column.collection.name);
   console.log("Database name:", Column.db.name);
//    console.log("Connection state:", mongoose.connection.readyState); // 1 = connected

   // Try to count documents first
   const count = await Column.countDocuments();
   console.log("Total documents in collection:", count);

   // Get all columns without any filters
   const columns = await Column.find({}).lean();
   console.log("Found columns:", columns.length);
   console.log("Columns data:", JSON.stringify(columns, null, 2));

   res.status(200).json(columns);
 } catch (err) {
   console.error("Error fetching columns:", err);
   res.status(500).json({ error: err.message });
 }
};
