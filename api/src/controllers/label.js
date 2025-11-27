import Label from "../models/Label.js";

export const getLabelsForBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const labels = await Label.find({ boardId }).lean();
    res.json(labels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createLabel = async (req, res) => {
  try {
    const { name } = req.body;
    const trimmed = name.trim();
    if (!trimmed) return res.status(400).json({ error: "Name required" });

    // ✅ Find or create label WITHOUT boardId
    const label = await Label.findOneAndUpdate(
      { name: trimmed.toLowerCase() }, // ✅ Only check by name
      {
        name: trimmed.toLowerCase(),
        displayName: trimmed,
      },
      { upsert: true, new: true }
    );

    res.status(201).json(label);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
