import mongoose from "mongoose";

const CardSchema = new mongoose.Schema(
  {
    // Basic card fields
    title: { type: String, required: true },
    description: { type: String, default: "" },

    assigneeId: { type: String, required: true },
    reporterId: { type: String, required: true },
    actualTimeToComplete: {
      type: Number, // e.g. 2.5 = 2.5 hours
      default: 0,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      required: true,
    },

    // labels: {
    //   type: [String],
    //   default: [],
    // },
    labels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Label",
      },
    ],

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
