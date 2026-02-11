import express from "express";
import cors from "cors";
import "dotenv/config";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { inngest, functions } from "./inngest/index.js";
import userRouter from "./routes/userRoutes.js";
import connectDB from "./config/db.js";
import postRouter from "./routes/postRoutes.js";
import storyRouter from "./routes/storyRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

await connectDB();

// ! App
const app = express();

// ! Middlewares
app.use(express.json());
app.use(clerkMiddleware());
app.use(cors());

// ! Routes
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/story", storyRouter);
app.use("/api/message", messageRouter);

// ! Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
