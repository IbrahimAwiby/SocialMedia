import express from "express";
import cors from "cors";
import "dotenv/config";
import { serve } from "inngest/express";

import { inngest, functions } from "./inngest/index.js";

// App
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.use("/api/inngest", serve({ client: inngest, functions }));

// Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
