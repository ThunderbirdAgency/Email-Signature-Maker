/**
 * Resolving the public origin.
 *
 * Images inside a signature are fetched by the recipient's mail client, so
 * every URL the renderer emits has to be absolute and publicly reachable.
 * NEXT_PUBLIC_APP_URL wins when set; otherwise the request's own host is used,
 * which is right for local development and preview deployments.
 */

import { headers } from "next/headers";

export function configuredOrigin(): string | null {
  const value = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!value) return null;
  return value.replace(/\/+$/, "");
}

export async function resolveOrigin(): Promise<string> {
  const configured = configuredOrigin();
  if (configured) return configured;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export function originFromRequest(request: Request): string {
  const configured = configuredOrigin();
  if (configured) return configured;
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? url.host;
  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}
