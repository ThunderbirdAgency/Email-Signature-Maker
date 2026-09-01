/**
 * Filesystem storage driver.
 *
 * One JSON document plus a blob directory. This is what makes the app runnable
 * from a fresh clone with nothing to provision; set `DATABASE_URL` to swap in
 * Postgres instead.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import type { Signature, SignatureDraft } from "../signature/types";
import {
  hashPassword, isSafeUploadId, newId, newSlug, normaliseEmail,
  type CreditBalance, type StoreDriver, type UploadMeta, type User,
} from "./shared";
import { BONUS_CREDITS, BONUS_THRESHOLD, BONUS_WINDOW_MONTHS } from "../billing";

interface LedgerEntry {
  id: string;
  userId: string;
  delta: number;
  reason: "purchase" | "bonus" | "unlock" | "adjustment";
  signatureId?: string;
  purchaseId?: string;
  stripeSessionId?: string;
  createdAt: string;
}

interface Database {
  users: User[];
  signatures: Signature[];
  uploads: UploadMeta[];
  ledger: LedgerEntry[];
}

function windowStart(): number {
  const from = new Date();
  from.setMonth(from.getMonth() - BONUS_WINDOW_MONTHS);
  return from.getTime();
}

function summarise(entries: LedgerEntry[], userId: string): CreditBalance {
  const mine = entries.filter((e) => e.userId === userId);
  const since = windowStart();
  const inWindow = mine.filter((e) => new Date(e.createdAt).getTime() > since);
  return {
    balance: mine.reduce((total, e) => total + e.delta, 0),
    paidInWindow: inWindow.filter((e) => e.reason === "purchase").reduce((t, e) => t + e.delta, 0),
    bonusGranted: inWindow.some((e) => e.reason === "bonus"),
  };
}

/**
 * Serverless hosts give you a read-only filesystem apart from the temp
 * directory, so writing beside the source would fail outright there. Falling
 * back to temp keeps such a deployment usable, at the cost of durability —
 * which `ephemeral` reports so the UI can say so.
 */
function resolveDataDir(): string {
  if (process.env.DATA_DIR) return process.env.DATA_DIR;
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "smartstamp");
  }
  return path.join(process.cwd(), ".data");
}

const DATA_DIR = resolveDataDir();
const DB_PATH = path.join(DATA_DIR, "db.json");
const BLOB_DIR = path.join(DATA_DIR, "uploads");

/**
 * Serialises writes. Node interleaves awaits within a process, and a
 * read-modify-write over one JSON file would otherwise drop concurrent updates.
 */
let queue: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

async function readDb(): Promise<Database> {
  try {
    const parsed = JSON.parse(await fs.readFile(DB_PATH, "utf8")) as Partial<Database>;
    return {
      users: parsed.users ?? [],
      signatures: parsed.signatures ?? [],
      uploads: parsed.uploads ?? [],
      ledger: parsed.ledger ?? [],
    };
  } catch {
    return { users: [], signatures: [], uploads: [], ledger: [] };
  }
}

async function writeDb(db: Database): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(BLOB_DIR, { recursive: true });
  // Write-then-rename so a crash mid-write cannot truncate the database.
  const tmp = `${DB_PATH}.${crypto.randomBytes(6).toString("hex")}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, DB_PATH);
}

function mutate<T>(fn: (db: Database) => Promise<T> | T): Promise<T> {
  return withLock(async () => {
    const db = await readDb();
    const result = await fn(db);
    await writeDb(db);
    return result;
  });
}

export const fileDriver: StoreDriver = {
  get ephemeral() {
    return !process.env.DATA_DIR && Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  },

  async findUserByEmail(email) {
    const db = await readDb();
    const target = normaliseEmail(email);
    return db.users.find((u) => u.email === target) ?? null;
  },

  async findUserById(id) {
    const db = await readDb();
    return db.users.find((u) => u.id === id) ?? null;
  },

  async createUser({ email, password, name }) {
    const address = normaliseEmail(email);
    return mutate((db) => {
      if (db.users.some((u) => u.email === address)) {
        return { error: "An account with that email already exists." };
      }
      const { hash, salt } = hashPassword(password);
      const user: User = {
        id: newId("usr"),
        email: address,
        name: name.trim() || address.split("@")[0],
        passwordHash: hash,
        salt,
        plan: "free",
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
      return { user };
    });
  },

  async setUserPlan(userId, plan) {
    await mutate((db) => {
      const user = db.users.find((u) => u.id === userId);
      if (user) user.plan = plan;
    });
  },

  async listSignatures(ownerId) {
    const db = await readDb();
    return db.signatures
      .filter((s) => s.ownerId === ownerId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async getSignature(id) {
    const db = await readDb();
    return db.signatures.find((s) => s.id === id) ?? null;
  },

  async getSignatureBySlug(slug) {
    const db = await readDb();
    return db.signatures.find((s) => s.slug === slug) ?? null;
  },

  async createSignature(draft: SignatureDraft, ownerId: string) {
    return mutate((db) => {
      const now = new Date().toISOString();
      const signature: Signature = {
        ...draft,
        id: newId("sig"),
        ownerId,
        slug: newSlug(),
        createdAt: now,
        updatedAt: now,
      };
      db.signatures.push(signature);
      return signature;
    });
  },

  async updateSignature(id, ownerId, draft) {
    return mutate((db) => {
      const existing = db.signatures.find((s) => s.id === id && s.ownerId === ownerId);
      if (!existing) return null;
      Object.assign(existing, draft, { updatedAt: new Date().toISOString() });
      return existing;
    });
  },

  async deleteSignature(id, ownerId) {
    return mutate((db) => {
      const index = db.signatures.findIndex((s) => s.id === id && s.ownerId === ownerId);
      if (index === -1) return false;
      db.signatures.splice(index, 1);
      return true;
    });
  },

  async countSignatures(ownerId) {
    const db = await readDb();
    return db.signatures.filter((s) => s.ownerId === ownerId).length;
  },

  async creditBalance(userId) {
    const db = await readDb();
    return summarise(db.ledger, userId);
  },

  async recordPurchase({ userId, stripeSessionId, credits, amountCents: _amountCents, currency: _currency }) {
    return mutate((db) => {
      // Idempotent on the Stripe session, the same as the Postgres driver:
      // a retried webhook must never credit an account twice.
      if (db.ledger.some((e) => e.stripeSessionId === stripeSessionId)) return null;

      const purchaseId = newId("pur");
      const now = new Date().toISOString();
      db.ledger.push({
        id: newId("led"), userId, delta: credits, reason: "purchase",
        purchaseId, stripeSessionId, createdAt: now,
      });

      const { paidInWindow, bonusGranted } = summarise(db.ledger, userId);
      let bonus = 0;
      if (!bonusGranted && paidInWindow >= BONUS_THRESHOLD) {
        bonus = BONUS_CREDITS;
        db.ledger.push({
          id: newId("led"), userId, delta: bonus, reason: "bonus", purchaseId, createdAt: now,
        });
      }
      return { granted: credits, bonus };
    });
  },

  async unlockSignature(signatureId, userId) {
    return mutate((db) => {
      if (summarise(db.ledger, userId).balance < 1) return false;
      const signature = db.signatures.find(
        (s) => s.id === signatureId && s.ownerId === userId && !s.paid,
      );
      if (!signature) return false;
      signature.paid = true;
      signature.paidAt = new Date().toISOString();
      db.ledger.push({
        id: newId("led"), userId, delta: -1, reason: "unlock",
        signatureId, createdAt: new Date().toISOString(),
      });
      return true;
    });
  },

  async saveUpload(data, contentType, ownerId, extension) {
    await fs.mkdir(BLOB_DIR, { recursive: true });
    const id = `${newSlug()}${extension}`;
    await fs.writeFile(path.join(BLOB_DIR, id), data);
    const meta: UploadMeta = {
      id,
      ownerId,
      contentType,
      bytes: data.byteLength,
      createdAt: new Date().toISOString(),
    };
    await mutate((db) => {
      db.uploads.push(meta);
    });
    return meta;
  },

  async readUpload(id) {
    if (!isSafeUploadId(id)) return null;
    const db = await readDb();
    const meta = db.uploads.find((u) => u.id === id);
    if (!meta) return null;
    try {
      return { data: await fs.readFile(path.join(BLOB_DIR, id)), meta };
    } catch {
      return null;
    }
  },
};
