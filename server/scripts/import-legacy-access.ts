// One-off script — NOT part of the running server. Imports course access that customers already
// had before the Supabase cutover, so they don't lose it.
//
// Usage: npx tsx scripts/import-legacy-access.ts path/to/legacy-access.json
// (run from the server/ directory, with the same .env / DB_PATH as the target environment)
//
// Input file shape — a JSON array of:
//   { "email": "alumna@example.com", "name": "Nombre (opcional)", "slug": "curso-completo", "granted_at": "2026-03-01" (opcional) }
//
// Each entry creates the user if it doesn't exist yet (password_hash: null — they activate the
// account either via Google login with the same email, or once password-reset-by-email ships)
// and a completed purchase for the given product slug. Safe to re-run: existing users are
// reused by email, and a duplicate completed purchase for the same user+product is skipped.

import fs from "node:fs";
import crypto from "node:crypto";
import { store } from "../src/db";
import { seedContentIfEmpty } from "../src/seed";

// Safe no-op if products already exist (normal case — the server has booted at least once);
// only seeds from scratch on a completely empty DB, so this script also works standalone.
seedContentIfEmpty();

interface LegacyEntry {
  email: string;
  name?: string;
  slug: string;
  granted_at?: string;
}

function nowIso() {
  return new Date().toISOString();
}

function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Uso: npx tsx scripts/import-legacy-access.ts path/to/legacy-access.json");
    process.exit(1);
  }

  const entries: LegacyEntry[] = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let created = 0;
  let skipped = 0;

  for (const entry of entries) {
    const email = entry.email?.trim().toLowerCase();
    if (!email || !entry.slug) {
      console.warn(`Entrada inválida (falta email o slug), se omite: ${JSON.stringify(entry)}`);
      skipped++;
      continue;
    }

    const product = store.getProduct(entry.slug);
    if (!product) {
      console.warn(`Producto no encontrado para slug "${entry.slug}" (${email}), se omite.`);
      skipped++;
      continue;
    }

    let user = store.getUserByEmail(email);
    if (!user) {
      user = store.createUser({
        id: crypto.randomUUID(),
        email,
        password_hash: null,
        google_sub: null,
        name: entry.name ?? null,
        phone: null,
        role: "user",
        created_at: nowIso(),
      });
      console.log(`Usuario creado: ${email}`);
    }

    if (store.hasCompletedPurchase(user.id, product.id)) {
      console.log(`Ya tenía acceso a "${product.name}": ${email} — se omite.`);
      skipped++;
      continue;
    }

    store.createPurchase({
      id: crypto.randomUUID(),
      user_id: user.id,
      product_id: product.id,
      price_paid: product.price,
      status: "completed",
      product_type: product.type,
      granted_at: entry.granted_at ?? nowIso(),
      expires_at: null,
      created_at: nowIso(),
    });
    console.log(`Acceso concedido: ${email} → "${product.name}"`);
    created++;
  }

  console.log(`\nListo. ${created} accesos concedidos, ${skipped} entradas omitidas.`);
}

main();
