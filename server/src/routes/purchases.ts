import { Router, Response } from "express";
import { store } from "../db";
import { requireUser, requireAdminUser, AuthedRequest } from "../userAuth";

export const purchasesRouter = Router();

function withProduct(purchase: ReturnType<typeof store.getPurchasesForUser>[number]) {
  const product = store.getProductById(purchase.product_id);
  return {
    ...purchase,
    products: product
      ? { name: product.name, slug: product.slug, type: product.type, description: product.description }
      : null,
  };
}

purchasesRouter.get("/mine", requireUser, (req: AuthedRequest, res: Response) => {
  res.json(store.getPurchasesForUser(req.userId!).map(withProduct));
});

purchasesRouter.get("/", requireAdminUser, (_req: AuthedRequest, res: Response) => {
  res.json(store.listAllPurchases().map(withProduct));
});

// Mirrors the Supabase RPC check_membership_eligible(): true if all 4 pack-4-sesiones credits
// are used, or the user has any completed purchase of a "course" product.
purchasesRouter.get("/membership-eligible", requireUser, (req: AuthedRequest, res: Response) => {
  const credits = store.getSessionCreditsForUser(req.userId!);
  const packUsed = credits.filter((c) => {
    if (c.status !== "used") return false;
    const product = store.getProductById(c.product_id);
    return product?.slug === "pack-4-sesiones";
  });
  const packEligible = packUsed.length >= 4;

  const purchases = store.getPurchasesForUser(req.userId!);
  const courseEligible = purchases.some((p) => {
    if (p.status !== "completed") return false;
    const product = store.getProductById(p.product_id);
    return product?.type === "course";
  });

  res.json({ eligible: packEligible || courseEligible });
});
