import fs from "node:fs";
import path from "node:path";
import { env } from "./env";

export interface StoredProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  type: string;
  metadata: Record<string, unknown>;
  updated_at: string;
}

interface StoreShape {
  site_content: Record<string, { value: unknown; updated_at: string }>;
  products: Record<string, StoredProduct>; // keyed by slug
  admin_users: Record<string, { password_hash: string }>;
}

const EMPTY: StoreShape = { site_content: {}, products: {}, admin_users: {} };

fs.mkdirSync(path.dirname(env.dbPath), { recursive: true });

let data: StoreShape;
if (fs.existsSync(env.dbPath)) {
  data = { ...EMPTY, ...JSON.parse(fs.readFileSync(env.dbPath, "utf8")) };
} else {
  data = structuredClone(EMPTY);
}

function persist() {
  const tmpPath = `${env.dbPath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2));
  fs.renameSync(tmpPath, env.dbPath);
}

export const store = {
  getContent(key: string) {
    return data.site_content[key]?.value;
  },
  setContent(key: string, value: unknown) {
    data.site_content[key] = { value, updated_at: new Date().toISOString() };
    persist();
  },
  contentCount() {
    return Object.keys(data.site_content).length;
  },
  getProducts(slugs?: string[]) {
    const all = Object.values(data.products);
    if (!slugs || slugs.length === 0) return all;
    const set = new Set(slugs);
    return all.filter((p) => set.has(p.slug));
  },
  getProduct(slug: string) {
    return data.products[slug];
  },
  upsertProduct(product: StoredProduct) {
    data.products[product.slug] = product;
    persist();
  },
  updateProduct(slug: string, patch: Partial<Omit<StoredProduct, "id" | "slug">>) {
    const existing = data.products[slug];
    if (!existing) return undefined;
    data.products[slug] = { ...existing, ...patch, updated_at: new Date().toISOString() };
    persist();
    return data.products[slug];
  },
  productCount() {
    return Object.keys(data.products).length;
  },
  getAdminUser(username: string) {
    return data.admin_users[username];
  },
  setAdminUser(username: string, passwordHash: string) {
    data.admin_users[username] = { password_hash: passwordHash };
    persist();
  },
};
