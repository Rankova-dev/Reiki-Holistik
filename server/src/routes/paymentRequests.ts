import { Router, Response } from "express";
import crypto from "node:crypto";
import { store, StoredPurchase, StoredSessionCredit } from "../db";
import { requireUser, requireAdminUser, AuthedRequest } from "../userAuth";

export const paymentRequestsRouter = Router();

function nowIso() {
  return new Date().toISOString();
}

function withProduct(req: ReturnType<typeof store.getPaymentRequest>) {
  if (!req) return req;
  const product = store.getProductById(req.product_id);
  return { ...req, products: product ? { name: product.name, slug: product.slug, type: product.type } : null };
}

const CREDIT_COUNT_BY_SLUG: Record<string, number> = {
  "sesion-online": 1,
  "sesion-presencial": 1,
  "pack-4-sesiones": 4,
};

// Mirrors the Supabase trigger handle_payment_approval(): creates/renews the purchase and
// mints session credits when a payment request transitions into "approved".
function grantAccessForApprovedRequest(request: NonNullable<ReturnType<typeof store.getPaymentRequest>>) {
  const product = store.getProductById(request.product_id);
  const isMonthly = /mensual/i.test(request.pricing_option);
  const expiresAt = isMonthly ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null;

  const existing = store.findCompletedPurchase(request.user_id, request.product_id);
  let purchase: StoredPurchase;
  if (isMonthly && existing) {
    purchase = store.updatePurchase(existing.id, { granted_at: nowIso(), expires_at: expiresAt })!;
  } else if (existing) {
    purchase = existing;
  } else {
    purchase = store.createPurchase({
      id: crypto.randomUUID(),
      user_id: request.user_id,
      product_id: request.product_id,
      price_paid: request.amount,
      status: "completed",
      product_type: product?.type ?? null,
      granted_at: nowIso(),
      expires_at: expiresAt,
      created_at: nowIso(),
    });
  }

  const creditCount = product ? CREDIT_COUNT_BY_SLUG[product.slug] ?? 0 : 0;
  for (let i = 0; i < creditCount; i++) {
    const credit: StoredSessionCredit = {
      id: crypto.randomUUID(),
      user_id: request.user_id,
      product_id: request.product_id,
      status: "available",
      used_at: null,
      booking_id: null,
      created_at: nowIso(),
    };
    store.createSessionCredit(credit);
  }

  return purchase;
}

paymentRequestsRouter.post("/", requireUser, (req: AuthedRequest, res: Response) => {
  const { product_id, pricing_option, amount, proof_url, format, contact_note } = req.body ?? {};
  if (typeof product_id !== "string" || typeof amount !== "number") {
    return res.status(400).json({ error: "product_id y amount son obligatorios" });
  }

  const request = store.createPaymentRequest({
    id: crypto.randomUUID(),
    user_id: req.userId!,
    product_id,
    pricing_option: typeof pricing_option === "string" ? pricing_option : "",
    amount,
    proof_url: typeof proof_url === "string" ? proof_url : null,
    format: typeof format === "string" ? format : "online",
    status: "pending",
    admin_notes: typeof contact_note === "string" ? contact_note : null,
    created_at: nowIso(),
    updated_at: nowIso(),
  });

  res.json(withProduct(request));
});

paymentRequestsRouter.get("/mine", requireUser, (req: AuthedRequest, res: Response) => {
  res.json(store.getPaymentRequestsForUser(req.userId!).map(withProduct));
});

paymentRequestsRouter.get("/", requireAdminUser, (_req: AuthedRequest, res: Response) => {
  res.json(store.listAllPaymentRequests().map(withProduct));
});

paymentRequestsRouter.patch("/:id", requireAdminUser, (req: AuthedRequest, res: Response) => {
  const { status } = req.body ?? {};
  if (status !== "approved" && status !== "rejected" && status !== "pending") {
    return res.status(400).json({ error: "status debe ser 'approved', 'rejected' o 'pending'" });
  }

  const existing = store.getPaymentRequest(req.params.id);
  if (!existing) return res.status(404).json({ error: "No encontrado" });

  const wasApproved = existing.status === "approved";
  const updated = store.updatePaymentRequest(req.params.id, { status })!;

  if (status === "approved" && !wasApproved) {
    grantAccessForApprovedRequest(updated);
  }

  res.json(withProduct(updated));
});

paymentRequestsRouter.delete("/:id", requireAdminUser, (req: AuthedRequest, res: Response) => {
  const deleted = store.deletePaymentRequest(req.params.id);
  if (!deleted) return res.status(404).json({ error: "No encontrado" });
  res.json({ ok: true });
});
