import express from "express";
import cors from "cors";
import fs from "node:fs";
import { env } from "./env";
import "./db";
import { seedAdminUser, seedOwnerAdmin, seedContentIfEmpty } from "./seed";
import { authRouter } from "./auth";
import { userAuthRouter } from "./userAuth";
import { socialAuthRouter } from "./routes/socialAuth";
import { contentRouter } from "./routes/content";
import { productsRouter } from "./routes/products";
import { uploadsRouter } from "./routes/uploads";
import { paymentProofsRouter } from "./routes/paymentProofs";
import { paymentRequestsRouter } from "./routes/paymentRequests";
import { purchasesRouter } from "./routes/purchases";
import { sessionCreditsRouter } from "./routes/sessionCredits";
import { courseContentRouter } from "./routes/courseContent";
import { userProgressRouter } from "./routes/userProgress";
import { bookingsRouter } from "./routes/bookings";
import { groupSessionsRouter } from "./routes/groupSessions";

fs.mkdirSync(env.uploadsDir, { recursive: true });
fs.mkdirSync(env.courseMediaDir, { recursive: true });
fs.mkdirSync(env.paymentProofsDir, { recursive: true });
seedAdminUser();
seedOwnerAdmin();
seedContentIfEmpty();

const app = express();
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(env.uploadsDir));

// Content-admin login (site text/prices editor) — unrelated to customer accounts below.
app.use("/api/auth", authRouter);
// Customer accounts (register/login/Google/profile) — separate prefix so its own /login route
// doesn't collide with the content-admin's /api/auth/login above.
app.use("/api/account", userAuthRouter);
app.use("/api/account", socialAuthRouter);
app.use("/api/content", contentRouter);
app.use("/api/products", productsRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/payment-proofs", paymentProofsRouter);
app.use("/api/payment-requests", paymentRequestsRouter);
app.use("/api/purchases", purchasesRouter);
app.use("/api/session-credits", sessionCreditsRouter);
app.use("/api/course-content", courseContentRouter);
app.use("/api/user-progress", userProgressRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/group-sessions", groupSessionsRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(env.port, () => {
  console.log(`Content server listening on port ${env.port}`);
});
