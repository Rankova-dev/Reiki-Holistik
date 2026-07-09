import { Router, Response } from "express";
import { store } from "../db";
import { requireUser, requireAdminUser, AuthedRequest } from "../userAuth";

export const sessionCreditsRouter = Router();

function withProduct(credit: ReturnType<typeof store.getSessionCreditsForUser>[number]) {
  const product = store.getProductById(credit.product_id);
  return { ...credit, products: product ? { name: product.name, slug: product.slug } : null };
}

sessionCreditsRouter.get("/mine", requireUser, (req: AuthedRequest, res: Response) => {
  res.json(store.getSessionCreditsForUser(req.userId!).map(withProduct));
});

sessionCreditsRouter.get("/", requireAdminUser, (_req: AuthedRequest, res: Response) => {
  res.json(store.listAllSessionCredits().map(withProduct));
});
