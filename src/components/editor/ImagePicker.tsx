"use client";

import { useRef, useState } from "react";
import type { ImageSpec, ImageShape } from "@/lib/signature/types";
import { ColorInput, Field, GhostButton, SegmentedControl, Slider, TextInput } from "@/components/ui/Controls";

/**
 * Picks an image for a signature slot (photo, logo, banner, badge…).
 *
 * Two routes in: upload a file, which is hosted here and given a public URL, or
 * paste a URL you already host. Both end up as the same absolute URL, because
 * the recipient's mail client has to be able to fetch it.
 */
export function ImagePicker({
  value,
  onChange,
  label,
  defaultWidth,
  showShape = true,
  maxWidth = 400,
  hint,
}: {
  value: ImageSpec | null;
  onChange: (value: ImageSpec | null) => void;
  label: string;
  defaultWidth: number;
  showShape?: boolean;
  maxWidth?: number;
  hint?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "That upload did not work.");
        return;
      }
      onChange({
        url: data.url,
        width: value?.width ?? defaultWidth,
        shape: value?.shape ?? "circle",
        link: value?.link,
        alt: value?.alt,
        borderWidth: value?.borderWidth ?? 0,
        borderColor: value?.borderColor ?? "#e2e8f0",
      });
    } catch {
      setError("That upload did not work. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  if (!value?.url) {
    return (
      <Field label={label} hint={hint}>
        <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/60 p-5 text-center">
          <p className="text-xs text-ink-500">PNG, JPG, WebP or animated GIF, up to 5 MB.</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <GhostButton onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? "Uploading…" : "Upload image"}
            </GhostButton>
            <button
              type="button"
              onClick={() =>
                onChange({ url: "https://", width: defaultWidth, shape: "circle", borderWidth: 0, borderColor: "#e2e8f0" })
              }
              className="text-xs font-medium text-brand-600 underline-offset-2 hover:underline"
            >
              or paste a URL
            </button>
          </div>
          {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
            e.target.value = "";
          }}
        />
      </Field>
    );
  }

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold text-ink-700">{label}</span>
        <div className="flex items-center gap-1">
          <GhostButton onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? "Uploading…" : "Replace"}
          </GhostButton>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-lg px-2 py-1.5 text-xs font-medium text-ink-400 transition hover:bg-red-50 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink-50 ring-1 ring-ink-100">
          {/* Deliberately a plain img: the source is an arbitrary remote URL
              the user supplied, which the Next image optimiser cannot proxy. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.url}
            alt=""
            className="max-h-16 max-w-16 object-contain"
            style={{ borderRadius: value.shape === "circle" ? "50%" : value.shape === "rounded" ? 8 : 0 }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <TextInput
            value={value.url}
            spellCheck={false}
            aria-label={`${label} URL`}
            onChange={(e) => onChange({ ...value, url: e.target.value })}
          />
        </div>
      </div>

      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

      <div className="mt-4 space-y-4">
        <Slider
          label="Width"
          value={value.width}
          min={24}
          max={maxWidth}
          onChange={(width) => onChange({ ...value, width })}
        />

        {showShape ? (
          <SegmentedControl<ImageShape>
            label="Shape"
            value={value.shape}
            onChange={(shape) => onChange({ ...value, shape })}
            options={[
              { value: "square", label: "Square" },
              { value: "rounded", label: "Rounded" },
              { value: "circle", label: "Circle" },
            ]}
          />
        ) : null}

        <TextInput
          label="Links to (optional)"
          placeholder="https://yourcompany.com"
          value={value.link ?? ""}
          onChange={(e) => onChange({ ...value, link: e.target.value })}
        />

        <TextInput
          label="Alt text"
          placeholder="Describe the image for screen readers"
          value={value.alt ?? ""}
          onChange={(e) => onChange({ ...value, alt: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <Slider
            label="Border"
            value={value.borderWidth ?? 0}
            min={0}
            max={8}
            onChange={(borderWidth) => onChange({ ...value, borderWidth })}
          />
          <ColorInput
            label="Border colour"
            value={value.borderColor ?? "#e2e8f0"}
            onChange={(borderColor) => onChange({ ...value, borderColor })}
          />
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/** A bare image URL field with upload, for slots without shape/border options. */
export function SimpleImageField({
  label,
  value,
  onChange,
  hint,
  placeholder = "https://…",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  placeholder?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) setError(data.error ?? "That upload did not work.");
      else onChange(data.url);
    } catch {
      setError("That upload did not work.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-2">
        <input
          value={value}
          placeholder={placeholder}
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300 transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15"
        />
        <GhostButton className="shrink-0" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? "…" : "Upload"}
        </GhostButton>
      </div>
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
    </Field>
  );
}
