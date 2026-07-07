import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { store } from "./db";
import { env } from "./env";

export const authRouter = Router();

authRouter.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body ?? {};
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "username y password son obligatorios" });
  }

  const user = store.getAdminUser(username);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }

  const token = jwt.sign({ sub: username }, env.jwtSecret, { expiresIn: "30d" });
  res.json({ token });
});

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No autenticado" });

  try {
    jwt.verify(token, env.jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o caducado" });
  }
}
