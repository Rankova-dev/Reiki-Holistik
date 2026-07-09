import { Router, Response } from "express";
import { store } from "../db";
import { requireUser, AuthedRequest } from "../userAuth";

export const bookingsRouter = Router();

bookingsRouter.get("/mine", requireUser, (req: AuthedRequest, res: Response) => {
  const all = store.getBookingsForUser(req.userId!);
  if (req.query.all === "true") return res.json(all);

  const upcoming = all.filter((b) => b.status === "confirmed" && b.start_time >= new Date().toISOString());
  res.json(upcoming);
});

bookingsRouter.get("/monthly-limit", requireUser, (req: AuthedRequest, res: Response) => {
  const month = typeof req.query.month === "string" ? req.query.month : new Date().toISOString().slice(0, 7);
  res.json(store.getMonthlyLimitsForUser(req.userId!, month));
});
