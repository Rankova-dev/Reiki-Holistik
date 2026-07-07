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
};
