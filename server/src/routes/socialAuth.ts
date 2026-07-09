import { Router, Request, Response } from "express";
import crypto from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../env";
import { store } from "../db";
import { signUserToken } from "../userAuth";

export const socialAuthRouter = Router();

const appleJwks = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

interface VerifiedIdentity {
  email: string;
  name: string | null;
}

async function verifyGoogle(accessToken: string): Promise<VerifiedIdentity & { sub: string }> {
  if (!env.googleClientId) throw new Error("Google login no está configurado en el servidor");

  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`);
  if (!res.ok) throw new Error("Token de Google inválido o caducado");
  const payload = await res.json();

  if (payload.aud !== env.googleClientId) throw new Error("Token de Google emitido para otra aplicación");
  if (!payload.email || payload.email_verified !== "true") throw new Error("Email de Google no verificado");

  return { email: String(payload.email).toLowerCase(), name: payload.name ?? null, sub: String(payload.sub) };
}

async function verifyApple(idToken: string): Promise<VerifiedIdentity> {
  if (!env.appleServicesId) throw new Error("Apple login no está configurado en el servidor");

  const { payload } = await jwtVerify(idToken, appleJwks, {
    issuer: "https://appleid.apple.com",
    audience: env.appleServicesId,
  });

  const email = typeof payload.email === "string" ? payload.email.toLowerCase() : null;
  const emailVerified = payload.email_verified === true || payload.email_verified === "true";
  if (!email || !emailVerified) throw new Error("Email de Apple no verificado");

  return { email, name: null };
}

socialAuthRouter.post("/social", async (req: Request, res: Response) => {
  const { provider, credential, name: clientName } = req.body ?? {};

  if (provider !== "google" && provider !== "apple") {
    return res.status(400).json({ error: "provider debe ser 'google' o 'apple'" });
  }
  if (typeof credential !== "string" || !credential) {
    return res.status(400).json({ error: "Falta el credential" });
  }

  try {
    let email: string;
    let name: string | null;
    let googleSub: string | null = null;

    if (provider === "google") {
      const identity = await verifyGoogle(credential);
      email = identity.email;
      name = identity.name;
      googleSub = identity.sub;
    } else {
      const identity = await verifyApple(credential);
      email = identity.email;
      name = identity.name;
    }

    let user = googleSub ? store.getUserByGoogleSub(googleSub) : undefined;
    if (!user) user = store.getUserByEmail(email);

    if (user) {
      if (googleSub && user.google_sub !== googleSub) {
        user = store.updateUser(user.id, { google_sub: googleSub })!;
      }
    } else {
      user = store.createUser({
        id: crypto.randomUUID(),
        email,
        password_hash: null,
        google_sub: googleSub,
        name: name ?? (typeof clientName === "string" ? clientName : null),
        phone: null,
        role: "user",
        created_at: new Date().toISOString(),
      });
    }

    res.json({ token: signUserToken(user) });
  } catch (err: any) {
    res.status(401).json({ error: err.message || "No se pudo verificar el inicio de sesión" });
  }
});
