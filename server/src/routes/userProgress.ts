import { Router, Response } from "express";
import crypto from "node:crypto";
import { store } from "../db";
import { requireUser, AuthedRequest } from "../userAuth";

export const userProgressRouter = Router();

userProgressRouter.get("/mine", requireUser, (req: AuthedRequest, res: Response) => {
  res.json(store.getProgressForUser(req.userId!));
});

userProgressRouter.put("/", requireUser, (req: AuthedRequest, res: Response) => {
  const { course_content_id, completed } = req.body ?? {};
  if (typeof course_content_id !== "string") {
    return res.status(400).json({ error: "course_content_id es obligatorio" });
  }

  store.upsertProgress({
    id: crypto.randomUUID(),
    user_id: req.userId!,
    course_content_id,
    completed: !!completed,
    completed_at: completed ? new Date().toISOString() : null,
    created_at: new Date().toISOString(),
  });

  res.json({ ok: true });
});
