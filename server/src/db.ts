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

export interface StoredUser {
  id: string;
  email: string;
  password_hash: string | null;
  google_sub: string | null;
  name: string | null;
  phone: string | null;
  role: "user" | "admin";
  created_at: string;
}

export interface StoredPurchase {
  id: string;
  user_id: string;
  product_id: string;
  price_paid: number;
  status: string;
  product_type: string | null;
  granted_at: string;
  expires_at: string | null;
  created_at: string;
}

export interface StoredPaymentRequest {
  id: string;
  user_id: string;
  product_id: string;
  pricing_option: string;
  amount: number;
  proof_url: string | null;
  format: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoredSessionCredit {
  id: string;
  user_id: string;
  product_id: string;
  status: "available" | "used" | "expired";
  used_at: string | null;
  booking_id: string | null;
  created_at: string;
}

export interface StoredMonthlyBookingLimit {
  id: string;
  user_id: string;
  product_type: string;
  month: string;
  bookings_used: number;
  max_bookings: number;
  created_at: string;
}

export interface StoredCourseContent {
  id: string;
  product_id: string;
  lesson_number: number;
  title: string;
  description: string | null;
  video_path: string | null;
  downloadable_path: string | null;
  is_free_preview: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoredUserProgress {
  id: string;
  user_id: string;
  course_content_id: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface StoredBooking {
  id: string;
  user_id: string;
  service_type: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  modality: string;
  duration_minutes: number;
  jitsi_room_url: string | null;
  session_type: string;
  created_at: string;
  updated_at: string;
}

export interface StoredGroupSession {
  id: string;
  course_id: string;
  title: string;
  proposed_datetime: string;
  duration_minutes: number;
  format: string;
  status: string;
  jitsi_room_url: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoredGroupSessionAttendance {
  id: string;
  session_id: string;
  user_id: string;
  registered_at: string;
  cancelled_at: string | null;
  attended: boolean;
}

interface StoreShape {
  site_content: Record<string, { value: unknown; updated_at: string }>;
  products: Record<string, StoredProduct>; // keyed by slug
  admin_users: Record<string, { password_hash: string }>;
  users: Record<string, StoredUser>;
  purchases: Record<string, StoredPurchase>;
  payment_requests: Record<string, StoredPaymentRequest>;
  session_credits: Record<string, StoredSessionCredit>;
  monthly_booking_limits: Record<string, StoredMonthlyBookingLimit>;
  course_content: Record<string, StoredCourseContent>;
  user_progress: Record<string, StoredUserProgress>;
  bookings: Record<string, StoredBooking>;
  group_sessions: Record<string, StoredGroupSession>;
  group_session_attendance: Record<string, StoredGroupSessionAttendance>;
}

const EMPTY: StoreShape = {
  site_content: {},
  products: {},
  admin_users: {},
  users: {},
  purchases: {},
  payment_requests: {},
  session_credits: {},
  monthly_booking_limits: {},
  course_content: {},
  user_progress: {},
  bookings: {},
  group_sessions: {},
  group_session_attendance: {},
};

fs.mkdirSync(path.dirname(env.dbPath), { recursive: true });

let data: StoreShape;
if (fs.existsSync(env.dbPath)) {
  data = { ...structuredClone(EMPTY), ...JSON.parse(fs.readFileSync(env.dbPath, "utf8")) };
} else {
  data = structuredClone(EMPTY);
}

function persist() {
  const tmpPath = `${env.dbPath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2));
  fs.renameSync(tmpPath, env.dbPath);
}

function nowIso() {
  return new Date().toISOString();
}

export const store = {
  getContent(key: string) {
    return data.site_content[key]?.value;
  },
  setContent(key: string, value: unknown) {
    data.site_content[key] = { value, updated_at: nowIso() };
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
  getProductById(id: string) {
    return Object.values(data.products).find((p) => p.id === id);
  },
  upsertProduct(product: StoredProduct) {
    data.products[product.slug] = product;
    persist();
  },
  updateProduct(slug: string, patch: Partial<Omit<StoredProduct, "id" | "slug">>) {
    const existing = data.products[slug];
    if (!existing) return undefined;
    data.products[slug] = { ...existing, ...patch, updated_at: nowIso() };
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

  // ---- users ----
  getUserById(id: string): StoredUser | undefined {
    return data.users[id];
  },
  getUserByEmail(email: string): StoredUser | undefined {
    const needle = email.toLowerCase();
    return Object.values(data.users).find((u) => u.email.toLowerCase() === needle);
  },
  getUserByGoogleSub(sub: string): StoredUser | undefined {
    return Object.values(data.users).find((u) => u.google_sub === sub);
  },
  createUser(user: StoredUser) {
    data.users[user.id] = user;
    persist();
    return user;
  },
  updateUser(id: string, patch: Partial<Omit<StoredUser, "id">>) {
    const existing = data.users[id];
    if (!existing) return undefined;
    data.users[id] = { ...existing, ...patch };
    persist();
    return data.users[id];
  },
  listUsers(): StoredUser[] {
    return Object.values(data.users);
  },

  // ---- purchases ----
  createPurchase(purchase: StoredPurchase) {
    data.purchases[purchase.id] = purchase;
    persist();
    return purchase;
  },
  updatePurchase(id: string, patch: Partial<Omit<StoredPurchase, "id">>) {
    const existing = data.purchases[id];
    if (!existing) return undefined;
    data.purchases[id] = { ...existing, ...patch };
    persist();
    return data.purchases[id];
  },
  getPurchasesForUser(userId: string): StoredPurchase[] {
    return Object.values(data.purchases).filter((p) => p.user_id === userId);
  },
  findCompletedPurchase(userId: string, productId: string): StoredPurchase | undefined {
    return Object.values(data.purchases).find(
      (p) => p.user_id === userId && p.product_id === productId && p.status === "completed"
    );
  },
  hasCompletedPurchase(userId: string, productId: string): boolean {
    return !!this.findCompletedPurchase(userId, productId);
  },
  listAllPurchases(): StoredPurchase[] {
    return Object.values(data.purchases);
  },

  // ---- payment_requests ----
  createPaymentRequest(req: StoredPaymentRequest) {
    data.payment_requests[req.id] = req;
    persist();
    return req;
  },
  getPaymentRequest(id: string) {
    return data.payment_requests[id];
  },
  updatePaymentRequest(id: string, patch: Partial<Omit<StoredPaymentRequest, "id">>) {
    const existing = data.payment_requests[id];
    if (!existing) return undefined;
    data.payment_requests[id] = { ...existing, ...patch, updated_at: nowIso() };
    persist();
    return data.payment_requests[id];
  },
  deletePaymentRequest(id: string) {
    const existed = !!data.payment_requests[id];
    delete data.payment_requests[id];
    if (existed) persist();
    return existed;
  },
  getPaymentRequestsForUser(userId: string): StoredPaymentRequest[] {
    return Object.values(data.payment_requests)
      .filter((r) => r.user_id === userId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  listAllPaymentRequests(): StoredPaymentRequest[] {
    return Object.values(data.payment_requests).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  // ---- session_credits ----
  createSessionCredit(credit: StoredSessionCredit) {
    data.session_credits[credit.id] = credit;
    persist();
    return credit;
  },
  updateSessionCredit(id: string, patch: Partial<Omit<StoredSessionCredit, "id">>) {
    const existing = data.session_credits[id];
    if (!existing) return undefined;
    data.session_credits[id] = { ...existing, ...patch };
    persist();
    return data.session_credits[id];
  },
  getSessionCreditsForUser(userId: string): StoredSessionCredit[] {
    return Object.values(data.session_credits).filter((c) => c.user_id === userId);
  },
  listAllSessionCredits(): StoredSessionCredit[] {
    return Object.values(data.session_credits).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  // ---- monthly_booking_limits ----
  getMonthlyLimit(userId: string, month: string): StoredMonthlyBookingLimit | undefined {
    return Object.values(data.monthly_booking_limits).find((l) => l.user_id === userId && l.month === month);
  },
  getMonthlyLimitsForUser(userId: string, month?: string): StoredMonthlyBookingLimit[] {
    return Object.values(data.monthly_booking_limits).filter(
      (l) => l.user_id === userId && (!month || l.month === month)
    );
  },
  upsertMonthlyLimit(limit: StoredMonthlyBookingLimit) {
    const clamped = {
      ...limit,
      max_bookings: Math.min(2, Math.max(0, limit.max_bookings)),
      bookings_used: Math.max(0, limit.bookings_used),
    };
    data.monthly_booking_limits[clamped.id] = clamped;
    persist();
    return clamped;
  },

  // ---- course_content ----
  getCourseContentForProducts(productIds: string[]): StoredCourseContent[] {
    const set = new Set(productIds);
    return Object.values(data.course_content)
      .filter((c) => set.has(c.product_id))
      .sort((a, b) => a.lesson_number - b.lesson_number);
  },
  getCourseContentById(id: string): StoredCourseContent | undefined {
    return data.course_content[id];
  },
  createCourseContent(content: StoredCourseContent) {
    data.course_content[content.id] = content;
    persist();
    return content;
  },
  updateCourseContent(id: string, patch: Partial<Omit<StoredCourseContent, "id">>) {
    const existing = data.course_content[id];
    if (!existing) return undefined;
    data.course_content[id] = { ...existing, ...patch, updated_at: nowIso() };
    persist();
    return data.course_content[id];
  },
  deleteCourseContent(id: string) {
    const existed = !!data.course_content[id];
    delete data.course_content[id];
    if (existed) persist();
    return existed;
  },
  listCourseContentForProduct(productId: string): StoredCourseContent[] {
    return Object.values(data.course_content)
      .filter((c) => c.product_id === productId)
      .sort((a, b) => a.lesson_number - b.lesson_number);
  },

  // ---- user_progress ----
  getProgressForUser(userId: string): StoredUserProgress[] {
    return Object.values(data.user_progress).filter((p) => p.user_id === userId);
  },
  upsertProgress(progress: StoredUserProgress) {
    const existing = Object.values(data.user_progress).find(
      (p) => p.user_id === progress.user_id && p.course_content_id === progress.course_content_id
    );
    if (existing) {
      data.user_progress[existing.id] = { ...existing, ...progress, id: existing.id };
    } else {
      data.user_progress[progress.id] = progress;
    }
    persist();
  },

  // ---- bookings ----
  getBookingsForUser(userId: string): StoredBooking[] {
    return Object.values(data.bookings)
      .filter((b) => b.user_id === userId)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  },

  // ---- group_sessions ----
  listGroupSessions(): StoredGroupSession[] {
    return Object.values(data.group_sessions).sort((a, b) =>
      a.proposed_datetime.localeCompare(b.proposed_datetime)
    );
  },
  getGroupSession(id: string) {
    return data.group_sessions[id];
  },
  createGroupSession(session: StoredGroupSession) {
    data.group_sessions[session.id] = session;
    persist();
    return session;
  },
  updateGroupSession(id: string, patch: Partial<Omit<StoredGroupSession, "id">>) {
    const existing = data.group_sessions[id];
    if (!existing) return undefined;
    data.group_sessions[id] = { ...existing, ...patch, updated_at: nowIso() };
    persist();
    return data.group_sessions[id];
  },
  deleteGroupSession(id: string) {
    const existed = !!data.group_sessions[id];
    delete data.group_sessions[id];
    if (existed) {
      for (const att of Object.values(data.group_session_attendance)) {
        if (att.session_id === id) delete data.group_session_attendance[att.id];
      }
      persist();
    }
    return existed;
  },

  // ---- group_session_attendance ----
  getAttendanceForSession(sessionId: string): StoredGroupSessionAttendance[] {
    return Object.values(data.group_session_attendance).filter((a) => a.session_id === sessionId);
  },
  getAttendanceForUser(userId: string): StoredGroupSessionAttendance[] {
    return Object.values(data.group_session_attendance).filter((a) => a.user_id === userId);
  },
  findAttendance(sessionId: string, userId: string): StoredGroupSessionAttendance | undefined {
    return Object.values(data.group_session_attendance).find(
      (a) => a.session_id === sessionId && a.user_id === userId
    );
  },
  createAttendance(att: StoredGroupSessionAttendance) {
    data.group_session_attendance[att.id] = att;
    persist();
    return att;
  },
  updateAttendance(id: string, patch: Partial<Omit<StoredGroupSessionAttendance, "id">>) {
    const existing = data.group_session_attendance[id];
    if (!existing) return undefined;
    data.group_session_attendance[id] = { ...existing, ...patch };
    persist();
    return data.group_session_attendance[id];
  },
};
