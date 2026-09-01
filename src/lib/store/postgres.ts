/**
 * Postgres storage driver.
 *
 * Used whenever `DATABASE_URL` is set. Signatures are stored as the same JSON
 * document the renderer consumes, with only the queried fields lifted into
 * columns, so adding a field to a signature never needs a migration.
 *
 * Image bytes live in `uploads.data` rather than an object store: they are
 * small, always fetched one at a time by id, and this keeps the whole service
 * on a single external dependency.
 */

import postgres from "postgres";
import type { Signature, SignatureDraft } from "../signature/types";
import {
  hashPassword, isSafeUploadId, newId, newSlug, normaliseEmail,
  type StoreDriver, type UploadMeta, type User,
} from "./shared";

/**
 * A signature draft is plain serialisable data by construction, but the
 * driver's JSON type is a closed union that a structural type cannot satisfy.
 */
function asJson(draft: SignatureDraft) {
  return sql().json(draft as unknown as Parameters<ReturnType<typeof sql>["json"]>[0]);
}

let client: ReturnType<typeof postgres> | null = null;

function sql() {
  if (client) return client;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  // Hosted Postgres requires TLS; a local development database generally has
  // none. Respect an explicit sslmode in the URL, otherwise decide by host.
  const isLocal = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url);
  const sslSpecified = /[?&]sslmode=/.test(url);

  client = postgres(url, {
    // Supabase's pooler (and pgbouncer generally) cannot use prepared
    // statements in transaction mode.
    prepare: false,
    // One connection per serverless instance: many short-lived instances each
    // holding a pool is how you exhaust a Postgres connection limit.
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    ...(sslSpecified || isLocal ? {} : { ssl: "require" as const }),
  });
  return client;
}

interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  salt: string;
  plan: string;
  created_at: Date;
}

interface SignatureRow {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  document: SignatureDraft;
  created_at: Date;
  updated_at: Date;
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    salt: row.salt,
    plan: row.plan === "pro" ? "pro" : "free",
    createdAt: row.created_at.toISOString(),
  };
}

function toSignature(row: SignatureRow): Signature {
  return {
    ...row.document,
    id: row.id,
    ownerId: row.owner_id,
    slug: row.slug,
    name: row.name,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export const postgresDriver: StoreDriver = {
  ephemeral: false,

  async findUserByEmail(email) {
    const rows = await sql()<UserRow[]>`
      select * from smartstamp.users where email = ${normaliseEmail(email)} limit 1
    `;
    return rows[0] ? toUser(rows[0]) : null;
  },

  async findUserById(id) {
    const rows = await sql()<UserRow[]>`
      select * from smartstamp.users where id = ${id} limit 1
    `;
    return rows[0] ? toUser(rows[0]) : null;
  },

  async createUser({ email, password, name }) {
    const address = normaliseEmail(email);
    const { hash, salt } = hashPassword(password);
    const displayName = name.trim() || address.split("@")[0];

    // The unique index on email is what actually prevents duplicates; relying
    // on it rather than a prior SELECT closes the race between two signups.
    const rows = await sql()<UserRow[]>`
      insert into smartstamp.users (id, email, name, password_hash, salt, plan)
      values (${newId("usr")}, ${address}, ${displayName}, ${hash}, ${salt}, 'free')
      on conflict (email) do nothing
      returning *
    `;
    if (!rows[0]) return { error: "An account with that email already exists." };
    return { user: toUser(rows[0]) };
  },

  async setUserPlan(userId, plan) {
    await sql()`update smartstamp.users set plan = ${plan} where id = ${userId}`;
  },

  async listSignatures(ownerId) {
    const rows = await sql()<SignatureRow[]>`
      select * from smartstamp.signatures
      where owner_id = ${ownerId}
      order by updated_at desc
    `;
    return rows.map(toSignature);
  },

  async getSignature(id) {
    const rows = await sql()<SignatureRow[]>`
      select * from smartstamp.signatures where id = ${id} limit 1
    `;
    return rows[0] ? toSignature(rows[0]) : null;
  },

  async getSignatureBySlug(slug) {
    const rows = await sql()<SignatureRow[]>`
      select * from smartstamp.signatures where slug = ${slug} limit 1
    `;
    return rows[0] ? toSignature(rows[0]) : null;
  },

  async createSignature(draft, ownerId) {
    const rows = await sql()<SignatureRow[]>`
      insert into smartstamp.signatures (id, owner_id, slug, name, document)
      values (${newId("sig")}, ${ownerId}, ${newSlug()}, ${draft.name},
              ${asJson(draft)})
      returning *
    `;
    return toSignature(rows[0]);
  },

  async updateSignature(id, ownerId, draft) {
    // Scoping the update by owner_id makes an unauthorized edit a no-op that
    // returns nothing, rather than something the caller has to remember to check.
    const rows = await sql()<SignatureRow[]>`
      update smartstamp.signatures
      set name = ${draft.name},
          document = ${asJson(draft)},
          updated_at = now()
      where id = ${id} and owner_id = ${ownerId}
      returning *
    `;
    return rows[0] ? toSignature(rows[0]) : null;
  },

  async deleteSignature(id, ownerId) {
    const rows = await sql()`
      delete from smartstamp.signatures where id = ${id} and owner_id = ${ownerId} returning id
    `;
    return rows.length > 0;
  },

  async countSignatures(ownerId) {
    const rows = await sql()<{ count: string }[]>`
      select count(*)::text as count from smartstamp.signatures where owner_id = ${ownerId}
    `;
    return Number(rows[0]?.count ?? 0);
  },

  async saveUpload(data, contentType, ownerId, extension) {
    const id = `${newSlug()}${extension}`;
    const rows = await sql()<{ created_at: Date }[]>`
      insert into smartstamp.uploads (id, owner_id, content_type, bytes, data)
      values (${id}, ${ownerId}, ${contentType}, ${data.byteLength}, ${data})
      returning created_at
    `;
    return {
      id,
      ownerId,
      contentType,
      bytes: data.byteLength,
      createdAt: rows[0].created_at.toISOString(),
    } satisfies UploadMeta;
  },

  async readUpload(id) {
    if (!isSafeUploadId(id)) return null;
    const rows = await sql()<
      { id: string; owner_id: string | null; content_type: string; bytes: number; data: Uint8Array; created_at: Date }[]
    >`select * from smartstamp.uploads where id = ${id} limit 1`;
    const row = rows[0];
    if (!row) return null;
    return {
      data: Buffer.from(row.data),
      meta: {
        id: row.id,
        ownerId: row.owner_id,
        contentType: row.content_type,
        bytes: row.bytes,
        createdAt: row.created_at.toISOString(),
      },
    };
  },
};
