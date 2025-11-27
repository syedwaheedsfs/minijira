import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cardRoutes from "./src/routes/cards.js";
import boardRoutes from "./src/routes/boards.js";
import columnRoutes from "./src/routes/columns.js";
import labelRoutes from "./src/routes/label.js";
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/jira")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


// Register your routes here
app.use("/api/columns", columnRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/labels", labelRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
