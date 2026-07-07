import { Router } from "express";
import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import { requireAdmin } from "../auth";
import { env } from "../env";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const storage = multer.diskStorage({
  destination: env.uploadsDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new Error("Tipo de archivo no permitido. Usa JPG, PNG, WEBP o GIF."));
      return;
    }
    cb(null, true);
  },
});

export const uploadsRouter = Router();

uploadsRouter.post("/", requireAdmin, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No se recibió ningún archivo" });
  res.json({ url: `/uploads/${req.file.filename}` });
});

uploadsRouter.use((err: Error, _req: any, res: any, _next: any) => {
  res.status(400).json({ error: err.message });
});
