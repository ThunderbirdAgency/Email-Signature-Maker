/**
 * Persistence.
 *
 * A single JSON document on disk plus a blob directory for uploads. This keeps
 * the service dependency-free to run — clone, `npm run dev`, done — and every
 * read/write goes through the small interface below, so swapping in Postgres
 * later means reimplementing this file and nothing else.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import type { Signature, SignatureDraft } from "./signature/types";

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

export interface UploadMeta {
  id: string;
  ownerId: string | null;
  contentType: string;
  bytes: number;
  createdAt: string;
}

interface Database {
  users: User[];
  signatures: Signature[];
  uploads: UploadMeta[];
}

/**
 * Where data lives.
 *
 * Serverless hosts give you a read-only filesystem apart from the temp
 * directory, so writing beside the source would fail outright there. Falling
 * back to temp keeps a deployment fully usable for evaluation — but that
 * storage is per-instance and disappears, which `storageIsEphemeral` reports so
 * the UI can say so rather than quietly losing someone's work.
 */
function resolveDataDir(): string {
  if (process.env.DATA_DIR) return process.env.DATA_DIR;
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "signaturely");
  }
  return path.join(process.cwd(), ".data");
}

export function storageIsEphemeral(): boolean {
  return !process.env.DATA_DIR && Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

const DATA_DIR = resolveDataDir();
const DB_PATH = path.join(DATA_DIR, "db.json");
const BLOB_DIR = path.join(DATA_DIR, "uploads");

const EMPTY: Database = { users: [], signatures: [], uploads: [] };

/**
 * Serialises writes. Node can interleave awaits within a single process, and a
 * read-modify-write on one JSON file would otherwise drop concurrent updates.
 */
let queue: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  // Keep the chain alive even when a caller's promise rejects.
  queue = run.catch(() => undefined);
  return run;
}

async function ensureDirs(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(BLOB_DIR, { recursive: true });
}

async function readDb(): Promise<Database> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<Database>;
    return {
      users: parsed.users ?? [],
      signatures: parsed.signatures ?? [],
      uploads: parsed.uploads ?? [],
    };
  } catch {
    return { ...EMPTY };
  }
}

async function writeDb(db: Database): Promise<void> {
  await ensureDirs();
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

/* -------------------------------------------------------------------------- */
/* Ids                                                                         */
/* -------------------------------------------------------------------------- */

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(12).toString("base64url")}`;
}

/** Short, URL-friendly, unambiguous slug for public share links. */
export function newSlug(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(10);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

/* -------------------------------------------------------------------------- */
/* Passwords                                                                   */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Users                                                                       */
/* -------------------------------------------------------------------------- */

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await readDb();
  const target = normaliseEmail(email);
  return db.users.find((u) => u.email === target) ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const db = await readDb();
  return db.users.find((u) => u.id === id) ?? null;
}

export async function createUser(input: {
  email: string;
  password: string;
  name: string;
}): Promise<{ user: User } | { error: string }> {
  const email = normaliseEmail(input.email);
  return mutate((db) => {
    if (db.users.some((u) => u.email === email)) {
      return { error: "An account with that email already exists." };
    }
    const { hash, salt } = hashPassword(input.password);
    const user: User = {
      id: newId("usr"),
      email,
      name: input.name.trim() || email.split("@")[0],
      passwordHash: hash,
      salt,
      plan: "free",
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    return { user };
  });
}

export async function setUserPlan(userId: string, plan: User["plan"]): Promise<void> {
  await mutate((db) => {
    const user = db.users.find((u) => u.id === userId);
    if (user) user.plan = plan;
  });
}

/* -------------------------------------------------------------------------- */
/* Signatures                                                                  */
/* -------------------------------------------------------------------------- */

export async function listSignatures(ownerId: string): Promise<Signature[]> {
  const db = await readDb();
  return db.signatures
    .filter((s) => s.ownerId === ownerId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getSignature(id: string): Promise<Signature | null> {
  const db = await readDb();
  return db.signatures.find((s) => s.id === id) ?? null;
}

export async function getSignatureBySlug(slug: string): Promise<Signature | null> {
  const db = await readDb();
  return db.signatures.find((s) => s.slug === slug) ?? null;
}

export async function createSignature(draft: SignatureDraft, ownerId: string): Promise<Signature> {
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
}

export async function updateSignature(
  id: string,
  ownerId: string,
  draft: SignatureDraft,
): Promise<Signature | null> {
  return mutate((db) => {
    const existing = db.signatures.find((s) => s.id === id && s.ownerId === ownerId);
    if (!existing) return null;
    Object.assign(existing, draft, { updatedAt: new Date().toISOString() });
    return existing;
  });
}

export async function deleteSignature(id: string, ownerId: string): Promise<boolean> {
  return mutate((db) => {
    const index = db.signatures.findIndex((s) => s.id === id && s.ownerId === ownerId);
    if (index === -1) return false;
    db.signatures.splice(index, 1);
    return true;
  });
}

export async function countSignatures(ownerId: string): Promise<number> {
  const db = await readDb();
  return db.signatures.filter((s) => s.ownerId === ownerId).length;
}

/* -------------------------------------------------------------------------- */
/* Uploads                                                                     */
/* -------------------------------------------------------------------------- */

export async function saveUpload(
  data: Buffer,
  contentType: string,
  ownerId: string | null,
  extension: string,
): Promise<UploadMeta> {
  await ensureDirs();
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
}

export async function readUpload(id: string): Promise<{ data: Buffer; meta: UploadMeta } | null> {
  // Reject anything that could escape the blob directory.
  if (!/^[a-z0-9]+\.[a-z0-9]+$/i.test(id)) return null;
  const db = await readDb();
  const meta = db.uploads.find((u) => u.id === id);
  if (!meta) return null;
  try {
    const data = await fs.readFile(path.join(BLOB_DIR, id));
    return { data, meta };
  } catch {
    return null;
  }
}
