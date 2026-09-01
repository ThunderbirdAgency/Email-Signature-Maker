/**
 * Types, ids and password hashing shared by every storage driver.
 */

import crypto from "node:crypto";
import type { Signature, SignatureDraft } from "../signature/types";

export interface User {
  id: string;
  email: string;
  name: string;
  /** scrypt hash, hex. */
  passwordHash: string;
  salt: string;
  plan: "free" | "pro";
  createdAt: string;
}

export interface CreditBalance {
  /** Spendable credits: everything granted minus everything used. */
  balance: number;
  /** Paid credits bought inside the bonus window, which drive the bonus. */
  paidInWindow: number;
  bonusGranted: boolean;
}

export interface UploadMeta {
  id: string;
  ownerId: string | null;
  contentType: string;
  bytes: number;
  createdAt: string;
}

/**
 * What a storage backend must provide. Both drivers implement this, so the
 * rest of the app never learns which one is in use.
 */
export interface StoreDriver {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  createUser(input: { email: string; password: string; name: string }): Promise<{ user: User } | { error: string }>;
  setUserPlan(userId: string, plan: User["plan"]): Promise<void>;

  listSignatures(ownerId: string): Promise<Signature[]>;
  getSignature(id: string): Promise<Signature | null>;
  getSignatureBySlug(slug: string): Promise<Signature | null>;
  createSignature(draft: SignatureDraft, ownerId: string): Promise<Signature>;
  updateSignature(id: string, ownerId: string, draft: SignatureDraft): Promise<Signature | null>;
  deleteSignature(id: string, ownerId: string): Promise<boolean>;
  countSignatures(ownerId: string): Promise<number>;

  /** Spendable credits and progress toward the volume bonus. */
  creditBalance(userId: string): Promise<CreditBalance>;
  /**
   * Record a completed Stripe payment and grant its credits.
   *
   * Must be idempotent on `stripeSessionId`: Stripe retries webhooks, and
   * crediting an account twice for one payment is the worst bug this code
   * could have. Returns null when the session was already recorded.
   */
  recordPurchase(input: {
    userId: string;
    stripeSessionId: string;
    credits: number;
    amountCents: number;
    currency: string;
  }): Promise<{ granted: number; bonus: number } | null>;
  /**
   * Spend one credit to unlock a signature for export. Returns false when the
   * balance is empty or the signature is not the user's.
   */
  unlockSignature(signatureId: string, userId: string): Promise<boolean>;

  saveUpload(data: Buffer, contentType: string, ownerId: string | null, extension: string): Promise<UploadMeta>;
  readUpload(id: string): Promise<{ data: Buffer; meta: UploadMeta } | null>;

  /** True when data will not survive, so the UI can warn rather than mislead. */
  readonly ephemeral: boolean;
}

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(12).toString("base64url")}`;
}

/** Short, URL-friendly, unambiguous slug for public share links. */
export function newSlug(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(10);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt ?? crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, s, 64).toString("hex");
  return { hash, salt: s };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return crypto.timingSafeEqual(candidate, expected);
}

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Uploads are addressed by filename, so reject anything path-like. */
export function isSafeUploadId(id: string): boolean {
  return /^[a-z0-9]+\.[a-z0-9]+$/i.test(id);
}
