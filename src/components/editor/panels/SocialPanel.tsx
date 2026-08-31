"use client";

import { useMemo, useState } from "react";
import { CATEGORY_LABELS, NETWORKS, NETWORK_BY_SLUG, type NetworkCategory } from "@/lib/signature/networks";
import { iconUrl } from "@/lib/icon-url";
import { DangerButton, PanelSection, SegmentedControl, Slider, ColorInput } from "@/components/ui/Controls";
import { localId, type DraftApi } from "../useSignatureDraft";
import type { IconShape, IconStyle } from "@/lib/signature/types";

export function SocialPanel({ api, origin }: { api: DraftApi; origin: string }) {
  const { draft, patch, patchStyle } = api;
  const [query, setQuery] = useState("");

  const chosen = new Set(draft.socials.map((s) => s.network));

  const grouped = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matches = NETWORKS.filter(
      (n) => !term || n.title.toLowerCase().includes(term) || n.slug.includes(term),
    );
    const out = new Map<NetworkCategory, typeof NETWORKS>();
    for (const network of matches) {
      const list = out.get(network.category) ?? [];
      list.push(network);
      out.set(network.category, list);
    }
    return [...out.entries()];
  }, [query]);

  function add(slug: string) {
    if (chosen.has(slug)) return;
    patch({ socials: [...draft.socials, { id: localId("so"), network: slug, value: "" }] });
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= draft.socials.length) return;
    const next = [...draft.socials];
    [next[index], next[target]] = [next[target], next[index]];
    patch({ socials: next });
  }

  return (
    <>
      <PanelSection
        title="Your links"
        description="Paste a full profile URL or just your handle — both work."
      >
        {draft.socials.length === 0 ? (
          <p className="rounded-lg bg-ink-50 px-3 py-3 text-xs text-ink-400">
            Nothing added yet. Pick a network below to get started.
          </p>
        ) : (
          <ul className="space-y-2">
            {draft.socials.map((item, index) => {
              const network = NETWORK_BY_SLUG[item.network];
              return (
                <li key={item.id} className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white p-2">
                  <img
                    src={iconUrl(origin, { slug: item.network, style: "brand", shape: "rounded", size: 72 })}
                    alt=""
                    width={26}
                    height={26}
                    className="h-6.5 w-6.5 shrink-0 rounded"
                  />
                  <div className="min-w-0 flex-1">
                    <label className="sr-only">{network?.title ?? item.network}</label>
                    <input
                      value={item.value}
                      spellCheck={false}
                      placeholder={network?.placeholder ?? "https://…"}
                      onChange={(e) =>
                        patch({
                          socials: draft.socials.map((s) =>
                            s.id === item.id ? { ...s, value: e.target.value } : s,
                          ),
                        })
                      }
                      className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm text-ink-900 placeholder:text-ink-300 focus:border-brand-400 focus:bg-white focus:outline-none"
                    />
                    <span className="px-2 text-[11px] text-ink-400">{network?.title ?? item.network}</span>
                  </div>
                  <div className="flex shrink-0 items-center">
                    <button
                      type="button"
                      aria-label={`Move ${network?.title ?? item.network} up`}
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="rounded px-1.5 py-1 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${network?.title ?? item.network} down`}
                      onClick={() => move(index, 1)}
                      disabled={index === draft.socials.length - 1}
                      className="rounded px-1.5 py-1 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <DangerButton
                      onClick={() => patch({ socials: draft.socials.filter((s) => s.id !== item.id) })}
                    >
                      Remove
                    </DangerButton>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </PanelSection>

      <PanelSection title="Add a network" description={`${NETWORKS.length} to choose from.`}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search networks…"
          aria-label="Search networks"
          className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm placeholder:text-ink-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15"
        />
        <div className="max-h-80 space-y-4 overflow-y-auto thin-scroll pr-1">
          {grouped.map(([category, networks]) => (
            <div key={category}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                {CATEGORY_LABELS[category]}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {networks.map((network) => (
                  <button
                    key={network.slug}
                    type="button"
                    onClick={() => add(network.slug)}
                    disabled={chosen.has(network.slug)}
                    className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2 py-1.5 text-xs font-medium text-ink-700 transition hover:border-brand-300 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <img
                      src={iconUrl(origin, { slug: network.slug, style: "brand", shape: "plain", size: 48 })}
                      alt=""
                      width={14}
                      height={14}
                      className="h-3.5 w-3.5"
                    />
                    {network.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {grouped.length === 0 ? (
            <p className="py-4 text-center text-xs text-ink-400">No networks match “{query}”.</p>
          ) : null}
        </div>
      </PanelSection>

      <PanelSection title="Icon style" description="How the social icons are drawn.">
        <SegmentedControl<IconStyle>
          label="Colour"
          value={draft.style.iconStyle}
          onChange={(iconStyle) => patchStyle({ iconStyle })}
          options={[
            { value: "brand", label: "Brand" },
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
            { value: "grey", label: "Grey" },
          ]}
        />
        <SegmentedControl<IconShape>
          label="Shape"
          value={draft.style.iconShape}
          onChange={(iconShape) => patchStyle({ iconShape })}
          options={[
            { value: "plain", label: "Plain" },
            { value: "circle", label: "Circle" },
            { value: "rounded", label: "Rounded" },
            { value: "square", label: "Square" },
          ]}
        />
        <Slider
          label="Icon size"
          value={draft.style.iconSize}
          min={14}
          max={48}
          onChange={(iconSize) => patchStyle({ iconSize })}
        />
        <ColorInput
          label="Contact row icon colour"
          hint="Used for the small phone, email and address icons — not the brand social icons."
          value={draft.style.iconColor}
          onChange={(iconColor) => patchStyle({ iconColor })}
        />

        <div className="rounded-xl bg-ink-50 p-4">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">Preview</p>
          <div className="flex flex-wrap items-center gap-2">
            {(draft.socials.length ? draft.socials.map((s) => s.network) : ["linkedin", "x", "instagram", "github"]).map(
              (slug) => (
                <img
                  key={slug}
                  src={iconUrl(origin, {
                    slug,
                    style: draft.style.iconStyle,
                    shape: draft.style.iconShape,
                    size: draft.style.iconSize * 3,
                  })}
                  alt=""
                  width={draft.style.iconSize}
                  height={draft.style.iconSize}
                  style={{ width: draft.style.iconSize, height: draft.style.iconSize }}
                />
              ),
            )}
          </div>
        </div>
      </PanelSection>
    </>
  );
}
