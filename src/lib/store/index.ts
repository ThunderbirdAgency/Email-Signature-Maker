/**
 * Storage.
 *
 * Picks a driver once, at module load, and re-exports its methods under the
 * names the rest of the app already uses — so call sites never learn whether
 * they are talking to Postgres or a JSON file.
 *
 * Set `DATABASE_URL` for Postgres. With it unset the app falls back to the
 * filesystem, which is what lets it run from a fresh clone with nothing to
 * provision.
 */

import { fileDriver } from "./file";
import { postgresDriver } from "./postgres";
import type { StoreDriver } from "./shared";

const driver: StoreDriver = process.env.DATABASE_URL ? postgresDriver : fileDriver;

export type { User, UploadMeta } from "./shared";
export { hashPassword, verifyPassword, newId, newSlug } from "./shared";

/** Which backend is live, for diagnostics and the storage warning. */
export function storageBackend(): "postgres" | "file" {
  return process.env.DATABASE_URL ? "postgres" : "file";
}

/** True when saved data will not survive, so the UI can warn rather than mislead. */
export function storageIsEphemeral(): boolean {
  return driver.ephemeral;
}

export const findUserByEmail: StoreDriver["findUserByEmail"] = (...a) => driver.findUserByEmail(...a);
export const findUserById: StoreDriver["findUserById"] = (...a) => driver.findUserById(...a);
export const createUser: StoreDriver["createUser"] = (...a) => driver.createUser(...a);
export const setUserPlan: StoreDriver["setUserPlan"] = (...a) => driver.setUserPlan(...a);

export const listSignatures: StoreDriver["listSignatures"] = (...a) => driver.listSignatures(...a);
export const getSignature: StoreDriver["getSignature"] = (...a) => driver.getSignature(...a);
export const getSignatureBySlug: StoreDriver["getSignatureBySlug"] = (...a) => driver.getSignatureBySlug(...a);
export const createSignature: StoreDriver["createSignature"] = (...a) => driver.createSignature(...a);
export const updateSignature: StoreDriver["updateSignature"] = (...a) => driver.updateSignature(...a);
export const deleteSignature: StoreDriver["deleteSignature"] = (...a) => driver.deleteSignature(...a);
export const countSignatures: StoreDriver["countSignatures"] = (...a) => driver.countSignatures(...a);

export const saveUpload: StoreDriver["saveUpload"] = (...a) => driver.saveUpload(...a);
export const readUpload: StoreDriver["readUpload"] = (...a) => driver.readUpload(...a);
