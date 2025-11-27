import Board from "../models/Board.js";
import Column from "../models/Column.js";
import Card from "../models/Card.js";
import Label from "../models/Label.js";

export const getBoard = async (req, res) => {
  try {
    const boardId = req.params.id;

    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ error: "Board not found" });

    const columns = await Column.find({ boardId }).sort({ position: 1 });

    const cards = await Card.find({ boardId })
      .sort({ position: 1 })
      .populate("labels");

    const labels = await Label.find({}).lean();
    // OR if you want board-specific:
    // const labels = await label.find({ boardId }).lean();

    res.status(200).json({ board, columns, cards, labels });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// controllers/boardController.js
// import Board from "../models/Board.js";
// import Column from "../models/Column.js";
// import Card from "../models/Card.js";

// export const getBoard = async (req, res) => {
//   try {
//     const boardId = req.params.id;

//     const board = await Board.findById(boardId).lean();
//     if (!board) return res.status(404).json({ error: "Board not found" });

//     const columns = await Column.find({ boardId }).sort({ position: 1 }).lean();
//     const cards = await Card.find({ boardId }).sort({ position: 1 }).lean();

//     // ---- GROUP CARDS UNDER COLUMNS ----
//     const cardsByColumn = cards.reduce((acc, card) => {
//       const colId = String(card.columnId);
//       if (!acc[colId]) acc[colId] = [];
//       acc[colId].push(card);
//       return acc;
//     }, {});

//     const columnsWithCards = columns.map((col) => ({
//       id: col._id,
//       title: col.title,
//       position: col.position,
//       cards: cardsByColumn[String(col._id)] || [],
//     }));

//     res.status(200).json({
//       _id: board._id,
//       title: board.title,
//       description: board.description,
//       columns: columnsWithCards,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
