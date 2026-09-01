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
  type CreditBalance, type StoreDriver, type UploadMeta, type User,
} from "./shared";
import { BONUS_CREDITS, BONUS_THRESHOLD, BONUS_WINDOW_MONTHS } from "../billing";

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
  paid: boolean;
  paid_at: Date | null;
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
    paid: row.paid,
    paidAt: row.paid_at ? row.paid_at.toISOString() : null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

const WINDOW = `${BONUS_WINDOW_MONTHS} months`;

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

  async creditBalance(userId) {
    const rows = await sql()<{ balance: string; paid_in_window: string; bonus_grants: string }[]>`
      select
        coalesce(sum(delta), 0)::text as balance,
        coalesce(sum(delta) filter (
          where reason = 'purchase' and created_at > now() - ${WINDOW}::interval
        ), 0)::text as paid_in_window,
        count(*) filter (
          where reason = 'bonus' and created_at > now() - ${WINDOW}::interval
        )::text as bonus_grants
      from smartstamp.credit_ledger
      where user_id = ${userId}
    `;
    const row = rows[0];
    return {
      balance: Number(row?.balance ?? 0),
      paidInWindow: Number(row?.paid_in_window ?? 0),
      bonusGranted: Number(row?.bonus_grants ?? 0) > 0,
    } satisfies CreditBalance;
  },

  async recordPurchase({ userId, stripeSessionId, credits, amountCents, currency }) {
    return sql().begin(async (tx) => {
      const purchaseId = newId("pur");
      // The unique index on stripe_session_id is what makes a retried webhook
      // a no-op; nothing is granted when this insert finds an existing row.
      const inserted = await tx`
        insert into smartstamp.purchases (id, user_id, stripe_session_id, credits, amount_cents, currency)
        values (${purchaseId}, ${userId}, ${stripeSessionId}, ${credits}, ${amountCents}, ${currency})
        on conflict (stripe_session_id) do nothing
        returning id
      `;
      if (!inserted[0]) return null;

      await tx`
        insert into smartstamp.credit_ledger (id, user_id, delta, reason, purchase_id)
        values (${newId("led")}, ${userId}, ${credits}, 'purchase', ${purchaseId})
      `;

      // Evaluate the volume bonus against everything bought in the window,
      // so five single purchases earn it exactly like one purchase of five.
      const totals = await tx<{ paid_in_window: string; bonus_grants: string }[]>`
        select
          coalesce(sum(delta) filter (
            where reason = 'purchase' and created_at > now() - ${WINDOW}::interval
          ), 0)::text as paid_in_window,
          count(*) filter (
            where reason = 'bonus' and created_at > now() - ${WINDOW}::interval
          )::text as bonus_grants
        from smartstamp.credit_ledger
        where user_id = ${userId}
      `;
      const paidInWindow = Number(totals[0]?.paid_in_window ?? 0);
      const alreadyBonused = Number(totals[0]?.bonus_grants ?? 0) > 0;

      let bonus = 0;
      if (!alreadyBonused && paidInWindow >= BONUS_THRESHOLD) {
        bonus = BONUS_CREDITS;
        await tx`
          insert into smartstamp.credit_ledger (id, user_id, delta, reason, purchase_id)
          values (${newId("led")}, ${userId}, ${bonus}, 'bonus', ${purchaseId})
        `;
      }

      return { granted: credits, bonus };
    });
  },

  async unlockSignature(signatureId, userId) {
    return sql().begin(async (tx) => {
      // Take a row lock on the user first, so two tabs cannot both read the
      // same balance and each spend the last credit. Postgres refuses FOR
      // UPDATE on an aggregate, so the user row is what gets locked and the
      // balance is summed underneath it.
      await tx`select id from smartstamp.users where id = ${userId} for update`;

      const rows = await tx<{ balance: string }[]>`
        select coalesce(sum(delta), 0)::text as balance
        from smartstamp.credit_ledger
        where user_id = ${userId}
      `;
      if (Number(rows[0]?.balance ?? 0) < 1) return false;

      const updated = await tx`
        update smartstamp.signatures
        set paid = true, paid_at = now()
        where id = ${signatureId} and owner_id = ${userId} and paid = false
        returning id
      `;
      // Already paid, or not this user's: spend nothing.
      if (!updated[0]) return false;

      await tx`
        insert into smartstamp.credit_ledger (id, user_id, delta, reason, signature_id)
        values (${newId("led")}, ${userId}, -1, 'unlock', ${signatureId})
      `;
      return true;
    });
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
