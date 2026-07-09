import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT || 3001),
  adminUsername: required("ADMIN_USERNAME"),
  adminPassword: required("ADMIN_PASSWORD"),
  jwtSecret: required("JWT_SECRET"),
  corsOrigin: process.env.CORS_ORIGIN || "*",
  dbPath: process.env.DB_PATH || "./data/content.json",
  uploadsDir: process.env.UPLOADS_DIR || "./uploads",
  // Deliberately NOT served by express.static — course videos/PDFs are only reachable through
  // the authenticated, purchase-gated streaming routes in routes/courseContent.ts.
  courseMediaDir: process.env.COURSE_MEDIA_DIR || "./course-media",
  // Same reasoning — payment proof screenshots are personal financial documents, only reachable
  // by their owner or an admin via routes/paymentProofs.ts.
  paymentProofsDir: process.env.PAYMENT_PROOFS_DIR || "./payment-proofs",

  // Customer accounts (register/login/Google) — own JWT, independent of the
  // content-admin login above.
  userJwtSecret: required("USER_JWT_SECRET"),

  // Google login — optional. Unset until the client provisions her own OAuth
  // credentials; the /api/auth/social route reports a clear "not configured"
  // error while it's missing. Apple is unused for now (no client-side button).
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  appleServicesId: process.env.APPLE_SERVICES_ID,

  // Seeds/re-syncs Elisabet's business-admin customer account (role: admin)
  // on every boot, same pattern as the content-admin user above. Optional —
  // without it, no account has the admin role until one is granted manually.
  ownerEmail: process.env.OWNER_EMAIL,
  ownerPassword: process.env.OWNER_PASSWORD,
};
