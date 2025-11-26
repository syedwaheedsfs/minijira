import Card from "../models/Card.js";

export const createCard = async (req, res) => {
  console.log("Incoming Request Body:", req.body);
  try {
    const {
      boardId,
      columnId,
      title,
      description,
      assigneeId,
      reporterId,
      actualTimeToComplete,
      priority,
      labels,
      ticketType,
    } = req.body;

    // Get next position in column
    const count = await Card.countDocuments({ columnId });
  const normalizedTicketType = ticketType.toLowerCase();
   const normalizedPriority = (priority || "medium").toLowerCase();
    const card = await Card.create({
      boardId,
      columnId,
      title,
      description,
      assigneeId,
      reporterId,
      actualTimeToComplete: actualTimeToComplete ?? 0,
      priority: normalizedPriority,
      labels: Array.isArray(labels) ? labels : [],
      ticketType: normalizedTicketType,
      position: count, // card goes last
    });

    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const moveCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { fromColumnId, toColumnId, fromPosition, toPosition } = req.body;

    if (
      fromColumnId == null ||
      toColumnId == null ||
      fromPosition == null ||
      toPosition == null
    ) {
      return res
        .status(400)
        .json({
          error:
            "fromColumnId, toColumnId, fromPosition, toPosition are required",
        });
    }

    // 1) Moving inside the SAME column
    if (fromColumnId === toColumnId) {
      const columnId = fromColumnId;

      if (fromPosition < toPosition) {
        // card moved down
        await Card.updateMany(
          {
            columnId,
            position: { $gt: fromPosition, $lte: toPosition },
          },
          { $inc: { position: -1 } } // shift up
        );
      } else if (fromPosition > toPosition) {
        // card moved up
        await Card.updateMany(
          {
            columnId,
            position: { $gte: toPosition, $lt: fromPosition },
          },
          { $inc: { position: 1 } } // shift down
        );
      }

      const card = await Card.findByIdAndUpdate(
        id,
        { position: toPosition },
        { new: true, runValidators: false }
      );

      if (!card) return res.status(404).json({ error: "Card not found" });
      return res.json({ message: "Card reordered", card });
    }

    // 2) Moving to a DIFFERENT column
    // 2a) Pull from old column: close the gap
    await Card.updateMany(
      {
        columnId: fromColumnId,
        position: { $gt: fromPosition },
      },
      { $inc: { position: -1 } }
    );

    // 2b) Make space in new column
    await Card.updateMany(
      {
        columnId: toColumnId,
        position: { $gte: toPosition },
      },
      { $inc: { position: 1 } }
    );

    // 2c) Move the card
    const card = await Card.findByIdAndUpdate(
      id,
      {
        columnId: toColumnId,
        position: toPosition,
      },
      { new: true, runValidators: false }
    );

    if (!card) return res.status(404).json({ error: "Card not found" });

    res.json({ message: "Card moved", card });
  } catch (err) {
    console.error("moveCard error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateCard = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await Card.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const { id } = req.params;

    await Card.findByIdAndDelete(id);

    res.json({ message: "Card deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCard = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await Card.findById(id);
    if (!card) return res.status(404).json({ error: "Card not found" });
    res.json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
