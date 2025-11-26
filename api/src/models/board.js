import mongoose from "mongoose";

const BoardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    columns: [
      {
        title: { type: String, required: true },
        cards: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Card",
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Board", BoardSchema);
