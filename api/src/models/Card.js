import mongoose from "mongoose";

const CardSchema = new mongoose.Schema(
  {
    // Basic card fields
    title: { type: String, required: true },
    description: { type: String, default: "" },

    assigneeId: { type: String, required: true },
    reporterId: { type: String, required: true },
    storyPoints: { type: Number, default: 0 },

    ticketType: {
      type: String,
      enum: ["bug", "feature", "enhancement", "task"],
      required: true,
    },

    createdAt: { type: Date, default: Date.now },

    // Kanban structure
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    columnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Column",
      required: true,
    },

    position: { type: Number, default: 0 }, // sorting inside column
  },
  { timestamps: true }
);

export default mongoose.model("Card", CardSchema);
