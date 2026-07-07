import express from "express";
import cors from "cors";
import fs from "node:fs";
import { env } from "./env";
import "./db";
import { seedAdminUser, seedContentIfEmpty } from "./seed";
import { authRouter } from "./auth";
import { contentRouter } from "./routes/content";
import { productsRouter } from "./routes/products";
import { uploadsRouter } from "./routes/uploads";

fs.mkdirSync(env.uploadsDir, { recursive: true });
seedAdminUser();
seedContentIfEmpty();

const app = express();
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(env.uploadsDir));

app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);
app.use("/api/products", productsRouter);
app.use("/api/uploads", uploadsRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(env.port, () => {
  console.log(`Content server listening on port ${env.port}`);
});
