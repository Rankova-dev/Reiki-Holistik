import { Router, Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import jwt from "jsonwebtoken";
import { store } from "../db";
import { env } from "../env";
import { requireUser, requireAdminUser, AuthedRequest } from "../userAuth";

export const courseContentRouter = Router();

function hasCourseAccess(userId: string, role: string | undefined, productId: string): boolean {
  if (role === "admin") return true;
  return store.hasCompletedPurchase(userId, productId);
}

// <video>/<iframe> tags can't send an Authorization header, so gated media is fetched via a
// short-lived signed URL (same idea as Supabase Storage's createSignedUrl) instead of the
// regular Bearer JWT: the access check happens once, when minting the link.
type MediaKind = "video" | "pdf";

function signMediaToken(lessonId: string, kind: MediaKind) {
  return jwt.sign({ lessonId, kind }, env.userJwtSecret, { expiresIn: "2h" });
}

function verifyMediaToken(token: string, lessonId: string, kind: MediaKind): boolean {
  try {
    const payload = jwt.verify(token, env.userJwtSecret) as { lessonId: string; kind: MediaKind };
    return payload.lessonId === lessonId && payload.kind === kind;
  } catch {
    return false;
  }
}

const MEDIA_MIME = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
]);

const mediaStorage = multer.diskStorage({
  destination: env.courseMediaDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || "";
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
  },
});

const uploadMedia = multer({
  storage: mediaStorage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB — course videos are much larger than site images
  fileFilter: (_req, file, cb) => {
    if (!MEDIA_MIME.has(file.mimetype)) {
      cb(new Error("Tipo de archivo no permitido. Usa MP4, WEBM, MOV o PDF."));
      return;
    }
    cb(null, true);
  },
});

courseContentRouter.get("/", requireUser, (req: AuthedRequest, res: Response) => {
  const idsParam = typeof req.query.product_ids === "string" ? req.query.product_ids : "";
  const productIds = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
  if (productIds.length === 0) return res.json([]);

  const lessons = store.getCourseContentForProducts(productIds).filter(
    (l) => l.is_free_preview || hasCourseAccess(req.userId!, req.userRole, l.product_id)
  );
  res.json(lessons);
});

courseContentRouter.get("/by-product/:productId", requireAdminUser, (req: AuthedRequest, res: Response) => {
  res.json(store.listCourseContentForProduct(req.params.productId));
});

courseContentRouter.post("/", requireAdminUser, (req: AuthedRequest, res: Response) => {
  const { product_id, lesson_number, title, description, is_free_preview } = req.body ?? {};
  if (typeof product_id !== "string" || typeof lesson_number !== "number" || typeof title !== "string") {
    return res.status(400).json({ error: "product_id, lesson_number y title son obligatorios" });
  }

  const lesson = store.createCourseContent({
    id: crypto.randomUUID(),
    product_id,
    lesson_number,
    title,
    description: typeof description === "string" ? description : null,
    video_path: null,
    downloadable_path: null,
    is_free_preview: !!is_free_preview,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  res.json(lesson);
});

courseContentRouter.patch("/:id", requireAdminUser, (req: AuthedRequest, res: Response) => {
  const { lesson_number, title, description, is_free_preview } = req.body ?? {};
  const updated = store.updateCourseContent(req.params.id, {
    ...(typeof lesson_number === "number" ? { lesson_number } : {}),
    ...(typeof title === "string" ? { title } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(is_free_preview !== undefined ? { is_free_preview: !!is_free_preview } : {}),
  });
  if (!updated) return res.status(404).json({ error: "No encontrado" });
  res.json(updated);
});

courseContentRouter.delete("/:id", requireAdminUser, (req: AuthedRequest, res: Response) => {
  const lesson = store.getCourseContentById(req.params.id);
  if (!lesson) return res.status(404).json({ error: "No encontrado" });
  for (const [field, dir] of [
    ["video_path", env.courseMediaDir],
    ["downloadable_path", env.courseMediaDir],
  ] as const) {
    const value = lesson[field];
    if (value) fs.rm(path.join(dir, value), { force: true }, () => {});
  }
  store.deleteCourseContent(req.params.id);
  res.json({ ok: true });
});

courseContentRouter.post(
  "/:id/video",
  requireAdminUser,
  uploadMedia.single("file"),
  (req: AuthedRequest, res: Response) => {
    if (!req.file) return res.status(400).json({ error: "No se recibió ningún archivo" });
    const updated = store.updateCourseContent(req.params.id, { video_path: req.file.filename });
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    res.json(updated);
  }
);

courseContentRouter.post(
  "/:id/pdf",
  requireAdminUser,
  uploadMedia.single("file"),
  (req: AuthedRequest, res: Response) => {
    if (!req.file) return res.status(400).json({ error: "No se recibió ningún archivo" });
    const updated = store.updateCourseContent(req.params.id, { downloadable_path: req.file.filename });
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    res.json(updated);
  }
);

function streamFile(req: Request, res: Response, filePath: string, mimeType: string) {
  fs.stat(filePath, (err, stat) => {
    if (err) return res.status(404).json({ error: "Archivo no encontrado" });

    const range = req.headers.range;
    if (!range) {
      res.writeHead(200, { "Content-Type": mimeType, "Content-Length": stat.size, "Accept-Ranges": "bytes" });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    const match = /bytes=(\d*)-(\d*)/.exec(range);
    const start = match?.[1] ? parseInt(match[1], 10) : 0;
    const end = match?.[2] ? parseInt(match[2], 10) : stat.size - 1;
    const chunkSize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": mimeType,
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  });
}

// Returns a short-lived signed URL for the video/PDF, after checking purchase access once —
// mirrors Supabase Storage's createSignedUrl(path, 3600) used previously.
courseContentRouter.get("/:id/video-url", requireUser, (req: AuthedRequest, res: Response) => {
  const lesson = store.getCourseContentById(req.params.id);
  if (!lesson || !lesson.video_path) return res.status(404).json({ error: "No encontrado" });
  if (!lesson.is_free_preview && !hasCourseAccess(req.userId!, req.userRole, lesson.product_id)) {
    return res.status(403).json({ error: "No tienes acceso a este contenido" });
  }
  res.json({ url: `/api/course-content/${lesson.id}/video?token=${signMediaToken(lesson.id, "video")}` });
});

courseContentRouter.get("/:id/pdf-url", requireUser, (req: AuthedRequest, res: Response) => {
  const lesson = store.getCourseContentById(req.params.id);
  if (!lesson || !lesson.downloadable_path) return res.status(404).json({ error: "No encontrado" });
  if (!lesson.is_free_preview && !hasCourseAccess(req.userId!, req.userRole, lesson.product_id)) {
    return res.status(403).json({ error: "No tienes acceso a este contenido" });
  }
  res.json({ url: `/api/course-content/${lesson.id}/pdf?token=${signMediaToken(lesson.id, "pdf")}` });
});

courseContentRouter.get("/:id/video", (req: Request, res: Response) => {
  const lesson = store.getCourseContentById(req.params.id);
  const token = typeof req.query.token === "string" ? req.query.token : "";
  if (!lesson || !lesson.video_path) return res.status(404).json({ error: "No encontrado" });
  if (!verifyMediaToken(token, lesson.id, "video")) return res.status(403).json({ error: "Enlace caducado" });
  streamFile(req, res, path.join(env.courseMediaDir, lesson.video_path), "video/mp4");
});

courseContentRouter.get("/:id/pdf", (req: Request, res: Response) => {
  const lesson = store.getCourseContentById(req.params.id);
  const token = typeof req.query.token === "string" ? req.query.token : "";
  if (!lesson || !lesson.downloadable_path) return res.status(404).json({ error: "No encontrado" });
  if (!verifyMediaToken(token, lesson.id, "pdf")) return res.status(403).json({ error: "Enlace caducado" });
  streamFile(req, res, path.join(env.courseMediaDir, lesson.downloadable_path), "application/pdf");
});
