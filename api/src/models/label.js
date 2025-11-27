import mongoose from "mongoose";

const LabelSchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: true, // what you show in UI (case preserved)
      trim: true,
    },
  },
  { timestamps: true }
);

// avoid duplicates per board
LabelSchema.index({ boardId: 1, name: 1 }, { unique: true });

export default mongoose.model("Label", LabelSchema);
