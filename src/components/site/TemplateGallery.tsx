"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ScaledSignature } from "@/components/ScaledSignature";

export interface GalleryItem {
  id: string;
  name: string;
  description: string;
  tags: string[];
  html: string;
}

/**
 * The template gallery.
 *
 * Each template is presented as a postage stamp — perforated edge, a postmark
 * over the corner — which is both the product's own visual language and a
 * useful frame: it caps how much vertical space a preview can take, so the
 * page stays browsable instead of turning into thousands of pixels of scroll.
 */
const FILTERS = [
  "Popular", "Photo", "No photo", "Minimal", "Bold", "Corporate",
  "Creative", "Card", "Marketing", "Developer", "QR",
];

export function TemplateGallery({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState<string>("All");
  const [expanded, setExpanded] = useState(false);

  // A curated handful, not every tag in the data — two rows of chips is
  // navigation the reader has to parse before they get to look at anything.
  const tags = useMemo(() => {
    const present = new Set(items.flatMap((i) => i.tags));
    return ["All", ...FILTERS.filter((t) => present.has(t))];
  }, [items]);

  const matching = filter === "All" ? items : items.filter((i) => i.tags.includes(filter));
  const INITIAL = 9;
  const visible = expanded ? matching : matching.slice(0, INITIAL);
  const hidden = matching.length - visible.length;

  return (
    <>
      <div className="flex flex-wrap justify-center gap-1.5">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            aria-pressed={filter === tag}
            onClick={() => {
              setFilter(tag);
              setExpanded(false);
            }}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              filter === tag
                ? "bg-ink-900 text-white"
                : "border border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-x-6 gap-y-9 min-[520px]:grid-cols-2 xl:grid-cols-3">
        {visible.map((item) => (
          <article key={item.id} className="group flex min-w-0 flex-col">
            <div
              className="stamp relative shadow-[0_2px_14px_rgba(15,23,42,0.09)] transition group-hover:shadow-[0_10px_30px_rgba(15,23,42,0.14)]"
              style={{ ["--perf" as string]: "#f4f6fb" }}
            >
              <span className="stamp-sides" aria-hidden="true" />

              <span
                className="postmark pointer-events-none absolute right-2.5 top-2.5 z-2 flex h-11 w-11 items-center justify-center text-[7px] font-bold uppercase leading-tight tracking-wider text-ink-400"
                aria-hidden="true"
              >
                Smart
                <br />
                Stamp
              </span>

              {/* A fixed preview height is what makes a row of stamps line up
                  and keeps the page from running to thousands of pixels. */}
              <div className="overflow-hidden px-3 py-3">
                <ScaledSignature
                  html={item.html}
                  naturalWidth={560}
                  maxHeight={230}
                  padding={10}
                  title={`${item.name} template preview`}
                />
              </div>
            </div>

            <div className="mt-4 px-1">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[15px] font-semibold text-ink-900">{item.name}</h3>
                <Link
                  href="/app/editor/new"
                  className="shrink-0 text-xs font-semibold text-brand-600 underline-offset-2 hover:underline"
                >
                  Use it &rarr;
                </Link>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-ink-500">{item.description}</p>
              <div className="mt-2.5 flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      {hidden > 0 ? (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="rounded-xl border border-ink-200 bg-white px-6 py-3 text-sm font-semibold text-ink-800 transition hover:border-ink-300"
          >
            Show {hidden} more {hidden === 1 ? "template" : "templates"}
          </button>
        </div>
      ) : null}

      {matching.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-400">No templates tagged “{filter}”.</p>
      ) : null}
    </>
  );
}
