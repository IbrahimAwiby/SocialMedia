import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import { inngest, functions} from "./inngest/index.js"

// ! App
const app = express();

// ! connect to database
await connectDB();

// ! Middlewares
app.use(express.json());
app.use(cors());

// ! Routes
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/inngest", server({client: inngest, functions}))

// ! Run The Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT} 🚀🚀`);
});
