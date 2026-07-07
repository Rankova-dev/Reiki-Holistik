import { Router } from "express";
import { store } from "../db";
import { requireAdmin } from "../auth";

export const contentRouter = Router();

contentRouter.get("/:key", (req, res) => {
  const value = store.getContent(req.params.key);
  if (value === undefined) return res.status(404).json({ error: "No encontrado" });
  res.json(value);
});

contentRouter.put("/:key", requireAdmin, (req, res) => {
  store.setContent(req.params.key, req.body ?? {});
  res.json({ ok: true });
});
