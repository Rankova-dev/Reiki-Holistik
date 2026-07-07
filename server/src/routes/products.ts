import { Router } from "express";
import { store } from "../db";
import { requireAdmin } from "../auth";

export const productsRouter = Router();

productsRouter.get("/", (req, res) => {
  const slugsParam = typeof req.query.slugs === "string" ? req.query.slugs : "";
  const slugs = slugsParam.split(",").map((s) => s.trim()).filter(Boolean);
  res.json(store.getProducts(slugs.length > 0 ? slugs : undefined));
});

productsRouter.get("/:slug", (req, res) => {
  const product = store.getProduct(req.params.slug);
  if (!product) return res.status(404).json({ error: "No encontrado" });
  res.json(product);
});

productsRouter.put("/:slug", requireAdmin, (req, res) => {
  const { name, description, price, metadata } = req.body ?? {};
  const updated = store.updateProduct(req.params.slug, {
    ...(name !== undefined ? { name } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(typeof price === "number" ? { price } : {}),
    ...(metadata !== undefined ? { metadata } : {}),
  });
  if (!updated) return res.status(404).json({ error: "No encontrado" });
  res.json(updated);
});
