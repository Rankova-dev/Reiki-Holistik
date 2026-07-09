import { Router, Response } from "express";
import crypto from "node:crypto";
import { store } from "../db";
import { requireUser, requireAdminUser, AuthedRequest } from "../userAuth";

export const groupSessionsRouter = Router();

function withProduct(session: ReturnType<typeof store.listGroupSessions>[number]) {
  const product = store.getProductById(session.course_id);
  return { ...session, products: product ? { name: product.name } : null };
}

// Student view: only confirmed sessions for courses the user has purchased (or all, if admin).
groupSessionsRouter.get("/", requireUser, (req: AuthedRequest, res: Response) => {
  const isAdmin = req.userRole === "admin";
  const sessions = store
    .listGroupSessions()
    .filter((s) => isAdmin || (s.status === "confirmed" && store.hasCompletedPurchase(req.userId!, s.course_id)));
  res.json(sessions.map(withProduct));
});

// Admin management view: every session regardless of status.
groupSessionsRouter.get("/admin", requireAdminUser, (_req: AuthedRequest, res: Response) => {
  res.json(store.listGroupSessions().map(withProduct));
});

groupSessionsRouter.post("/", requireAdminUser, (req: AuthedRequest, res: Response) => {
  const { course_id, title, proposed_datetime, duration_minutes, format, status, admin_notes } = req.body ?? {};
  if (typeof course_id !== "string" || typeof title !== "string" || typeof proposed_datetime !== "string") {
    return res.status(400).json({ error: "course_id, title y proposed_datetime son obligatorios" });
  }

  const session = store.createGroupSession({
    id: crypto.randomUUID(),
    course_id,
    title,
    proposed_datetime,
    duration_minutes: typeof duration_minutes === "number" ? duration_minutes : 240,
    format: typeof format === "string" ? format : "online",
    status: typeof status === "string" ? status : "draft",
    jitsi_room_url: `https://meet.jit.si/reiki-holistik-${crypto.randomUUID()}`,
    admin_notes: typeof admin_notes === "string" ? admin_notes : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  res.json(withProduct(session));
});

groupSessionsRouter.patch("/:id", requireAdminUser, (req: AuthedRequest, res: Response) => {
  const { title, proposed_datetime, duration_minutes, format, status, admin_notes } = req.body ?? {};
  const updated = store.updateGroupSession(req.params.id, {
    ...(typeof title === "string" ? { title } : {}),
    ...(typeof proposed_datetime === "string" ? { proposed_datetime } : {}),
    ...(typeof duration_minutes === "number" ? { duration_minutes } : {}),
    ...(typeof format === "string" ? { format } : {}),
    ...(typeof status === "string" ? { status } : {}),
    ...(admin_notes !== undefined ? { admin_notes } : {}),
  });
  if (!updated) return res.status(404).json({ error: "No encontrado" });
  res.json(withProduct(updated));
});

groupSessionsRouter.delete("/:id", requireAdminUser, (req: AuthedRequest, res: Response) => {
  const deleted = store.deleteGroupSession(req.params.id);
  if (!deleted) return res.status(404).json({ error: "No encontrado" });
  res.json({ ok: true });
});

groupSessionsRouter.get("/:id/attendance", requireAdminUser, (req: AuthedRequest, res: Response) => {
  const attendance = store.getAttendanceForSession(req.params.id);
  res.json(
    attendance.map((a) => {
      const user = store.getUserById(a.user_id);
      return { ...a, users: user ? { name: user.name, email: user.email } : null };
    })
  );
});

groupSessionsRouter.get("/attendance/mine", requireUser, (req: AuthedRequest, res: Response) => {
  res.json(store.getAttendanceForUser(req.userId!).filter((a) => !a.cancelled_at));
});

groupSessionsRouter.patch("/attendance/:attendanceId", requireAdminUser, (req: AuthedRequest, res: Response) => {
  const { attended } = req.body ?? {};
  const updated = store.updateAttendance(req.params.attendanceId, { attended: !!attended });
  if (!updated) return res.status(404).json({ error: "No encontrado" });
  res.json(updated);
});

// Used by MiBiblioteca to check whether the user attended a past, confirmed group session for
// a given course (gates content behind the "first encounter" for some products).
groupSessionsRouter.get("/attended", requireUser, (req: AuthedRequest, res: Response) => {
  const courseId = typeof req.query.course_id === "string" ? req.query.course_id : "";
  const now = new Date().toISOString();
  const attended = store.getAttendanceForUser(req.userId!).filter((a) => {
    if (a.cancelled_at) return false;
    const session = store.getGroupSession(a.session_id);
    return session && session.course_id === courseId && session.status === "confirmed" && session.proposed_datetime <= now;
  });
  res.json(attended);
});

groupSessionsRouter.post("/:id/register", requireUser, (req: AuthedRequest, res: Response) => {
  const session = store.getGroupSession(req.params.id);
  if (!session) return res.status(404).json({ error: "No encontrado" });

  const existing = store.findAttendance(req.params.id, req.userId!);
  if (existing) {
    const updated = store.updateAttendance(existing.id, { cancelled_at: null });
    return res.json(updated);
  }

  const attendance = store.createAttendance({
    id: crypto.randomUUID(),
    session_id: req.params.id,
    user_id: req.userId!,
    registered_at: new Date().toISOString(),
    cancelled_at: null,
    attended: false,
  });
  res.json(attendance);
});

groupSessionsRouter.post("/:id/cancel", requireUser, (req: AuthedRequest, res: Response) => {
  const existing = store.findAttendance(req.params.id, req.userId!);
  if (!existing) return res.status(404).json({ error: "No estás inscrita en esta sesión" });
  const updated = store.updateAttendance(existing.id, { cancelled_at: new Date().toISOString() });
  res.json(updated);
});
