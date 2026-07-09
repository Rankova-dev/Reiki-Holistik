import { Router, Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { store, StoredUser } from "./db";
import { env } from "./env";

export const userAuthRouter = Router();

export interface AuthedRequest extends Request {
  userId?: string;
  userRole?: "user" | "admin";
}

export function signUserToken(user: StoredUser) {
  return jwt.sign({ sub: user.id, role: user.role }, env.userJwtSecret, { expiresIn: "30d" });
}

function publicUser(user: StoredUser) {
  return { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role };
}

export function requireUser(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No autenticado" });

  try {
    const payload = jwt.verify(token, env.userJwtSecret) as { sub: string; role: "user" | "admin" };
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o caducado" });
  }
}

export function requireAdminUser(req: AuthedRequest, res: Response, next: NextFunction) {
  requireUser(req, res, () => {
    if (req.userRole !== "admin") return res.status(403).json({ error: "No autorizado" });
    next();
  });
}

userAuthRouter.post("/register", async (req: Request, res: Response) => {
  const { email, password, name } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ error: "Email y contraseña (mín. 6 caracteres) son obligatorios" });
  }
  if (store.getUserByEmail(email)) {
    return res.status(409).json({ error: "Ya existe una cuenta con este email" });
  }

  const user = store.createUser({
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    password_hash: bcrypt.hashSync(password, 10),
    google_sub: null,
    name: typeof name === "string" && name.trim() ? name.trim() : null,
    phone: null,
    role: "user",
    created_at: new Date().toISOString(),
  });

  res.json({ token: signUserToken(user), user: publicUser(user) });
});

userAuthRouter.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Email y contraseña son obligatorios" });
  }

  const user = store.getUserByEmail(email);
  if (!user || !user.password_hash || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Email o contraseña incorrectos" });
  }

  res.json({ token: signUserToken(user), user: publicUser(user) });
});

userAuthRouter.get("/me", requireUser, (req: AuthedRequest, res: Response) => {
  const user = store.getUserById(req.userId!);
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
  res.json(publicUser(user));
});

userAuthRouter.patch("/me", requireUser, (req: AuthedRequest, res: Response) => {
  const { name, phone } = req.body ?? {};
  const updated = store.updateUser(req.userId!, {
    ...(typeof name === "string" ? { name } : {}),
    ...(typeof phone === "string" ? { phone } : {}),
  });
  if (!updated) return res.status(404).json({ error: "Usuario no encontrado" });
  res.json(publicUser(updated));
});

// Admin-only lookup used to resolve display names next to user_id-keyed rows
// (payment requests, session credits) — replaces the old "profiles" join.
userAuthRouter.get("/users", requireAdminUser, (req: Request, res: Response) => {
  const idsParam = typeof req.query.ids === "string" ? req.query.ids : "";
  const ids = new Set(idsParam.split(",").map((s) => s.trim()).filter(Boolean));
  const users = store.listUsers().filter((u) => ids.size === 0 || ids.has(u.id));
  res.json(users.map((u) => ({ id: u.id, name: u.name, email: u.email })));
});
