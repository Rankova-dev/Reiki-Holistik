import { Router, Response } from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { env } from "../env";
import { requireUser, AuthedRequest } from "../userAuth";

export const paymentProofsRouter = Router();

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]);

const storage = multer.diskStorage({
  destination: (req: AuthedRequest, _file, cb) => {
    const dir = path.join(env.paymentProofsDir, req.userId!);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
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
      cb(new Error("Tipo de archivo no permitido. Usa JPG, PNG, WEBP, GIF o PDF."));
      return;
    }
    cb(null, true);
  },
});

paymentProofsRouter.post("/", requireUser, upload.single("file"), (req: AuthedRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: "No se recibió ningún archivo" });
  res.json({ path: `${req.userId}/${req.file.filename}` });
});

paymentProofsRouter.get("/:userId/:filename", requireUser, (req: AuthedRequest, res: Response) => {
  const { userId, filename } = req.params;
  if (req.userId !== userId && req.userRole !== "admin") {
    return res.status(403).json({ error: "No autorizado" });
  }
  const filePath = path.join(env.paymentProofsDir, userId, filename);
  fs.access(filePath, fs.constants.R_OK, (err) => {
    if (err) return res.status(404).json({ error: "Archivo no encontrado" });
    res.sendFile(path.resolve(filePath));
  });
});

paymentProofsRouter.use((err: Error, _req: any, res: any, _next: any) => {
  res.status(400).json({ error: err.message });
});
