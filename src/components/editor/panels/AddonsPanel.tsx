"use client";

import { SimpleImageField } from "../ImagePicker";
import {
  ColorInput, DangerButton, GhostButton, PanelSection, SegmentedControl, Select,
  Slider, TextArea, TextInput, Toggle,
} from "@/components/ui/Controls";
import { DISCLAIMER_PRESETS } from "@/lib/signature/defaults";
import { localId, type DraftApi } from "../useSignatureDraft";

export function AddonsPanel({ api, canSaveQr }: { api: DraftApi; canSaveQr: boolean }) {
  const { draft, patchAddon } = api;
  const { qr, video, badges, quote, green, disclaimer } = draft.addons;

  return (
    <>
      <PanelSection
        title="QR code"
        description="Scanning it saves your contact card to a phone — useful at events and on printed material."
      >
        <Toggle label="Show a QR code" checked={qr.enabled} onChange={(enabled) => patchAddon("qr", { enabled })} />
        {qr.enabled ? (
          <>
            <SegmentedControl
              label="Encodes"
              value={qr.mode}
              onChange={(mode) => patchAddon("qr", { mode })}
              options={[
                { value: "vcard" as const, label: "My contact card" },
                { value: "url" as const, label: "A link" },
              ]}
            />
            {qr.mode === "url" ? (
              <TextInput
                label="Link"
                placeholder="https://yourcompany.com"
                value={qr.value}
                onChange={(e) => patchAddon("qr", { value: e.target.value })}
              />
            ) : !canSaveQr ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
                A contact-card QR reads its details from a saved signature. Save this
                signature and the code will start working — until then it shows as a
                broken image.
              </p>
            ) : null}
            <TextInput label="Caption" placeholder="Save my contact" value={qr.caption ?? ""} onChange={(e) => patchAddon("qr", { caption: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Slider label="Size" value={qr.size} min={48} max={200} onChange={(size) => patchAddon("qr", { size })} />
              <ColorInput label="Colour" value={qr.darkColor} onChange={(darkColor) => patchAddon("qr", { darkColor })} />
            </div>
          </>
        ) : null}
      </PanelSection>

      <PanelSection
        title="Video"
        description="Mail clients cannot play video, so this is a thumbnail with a play badge that links out."
      >
        <Toggle label="Show a video card" checked={video.enabled} onChange={(enabled) => patchAddon("video", { enabled })} />
        {video.enabled ? (
          <>
            <SimpleImageField label="Thumbnail" value={video.thumbnailUrl} onChange={(thumbnailUrl) => patchAddon("video", { thumbnailUrl })} />
            <TextInput label="Video link" placeholder="https://youtube.com/watch?v=…" value={video.link} onChange={(e) => patchAddon("video", { link: e.target.value })} />
            <TextInput label="Caption" placeholder="Watch the 90-second tour" value={video.caption ?? ""} onChange={(e) => patchAddon("video", { caption: e.target.value })} />
            <Slider label="Width" value={video.width} min={100} max={600} onChange={(width) => patchAddon("video", { width })} />
          </>
        ) : null}
      </PanelSection>

      <PanelSection
        title="Badges"
        description="Awards, certifications or app-store badges, in a single row."
        action={
          badges.enabled ? (
            <GhostButton
              onClick={() =>
                patchAddon("badges", {
                  items: [...badges.items, { id: localId("bg"), imageUrl: "", link: "", alt: "", width: 90 }],
                })
              }
            >
              Add badge
            </GhostButton>
          ) : undefined
        }
      >
        <Toggle label="Show badges" checked={badges.enabled} onChange={(enabled) => patchAddon("badges", { enabled })} />
        {badges.enabled
          ? badges.items.map((badge, index) => (
              <div key={badge.id} className="rounded-xl border border-ink-200 bg-white p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-500">Badge {index + 1}</span>
                  <DangerButton
                    onClick={() =>
                      patchAddon("badges", { items: badges.items.filter((b) => b.id !== badge.id) })
                    }
                  >
                    Remove
                  </DangerButton>
                </div>
                <SimpleImageField
                  label="Image"
                  value={badge.imageUrl}
                  onChange={(imageUrl) =>
                    patchAddon("badges", {
                      items: badges.items.map((b) => (b.id === badge.id ? { ...b, imageUrl } : b)),
                    })
                  }
                />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <TextInput
                    label="Links to"
                    placeholder="https://…"
                    value={badge.link ?? ""}
                    onChange={(e) =>
                      patchAddon("badges", {
                        items: badges.items.map((b) => (b.id === badge.id ? { ...b, link: e.target.value } : b)),
                      })
                    }
                  />
                  <TextInput
                    label="Alt text"
                    value={badge.alt ?? ""}
                    onChange={(e) =>
                      patchAddon("badges", {
                        items: badges.items.map((b) => (b.id === badge.id ? { ...b, alt: e.target.value } : b)),
                      })
                    }
                  />
                </div>
                <div className="mt-2">
                  <Slider
                    label="Width"
                    value={badge.width}
                    min={20}
                    max={300}
                    onChange={(width) =>
                      patchAddon("badges", {
                        items: badges.items.map((b) => (b.id === badge.id ? { ...b, width } : b)),
                      })
                    }
                  />
                </div>
              </div>
            ))
          : null}
      </PanelSection>

      <PanelSection title="Quote" description="A short line of positioning, a company motto, or a favourite quotation.">
        <Toggle label="Show a quote" checked={quote.enabled} onChange={(enabled) => patchAddon("quote", { enabled })} />
        {quote.enabled ? (
          <>
            <TextArea rows={2} label="Quote" placeholder="Design is how it works." value={quote.text} onChange={(e) => patchAddon("quote", { text: e.target.value })} />
            <TextInput label="Attributed to" placeholder="Steve Jobs" value={quote.author ?? ""} onChange={(e) => patchAddon("quote", { author: e.target.value })} />
          </>
        ) : null}
      </PanelSection>

      <PanelSection title="Green footer" description="The familiar note asking people not to print the email.">
        <Toggle label="Show the green footer" checked={green.enabled} onChange={(enabled) => patchAddon("green", { enabled })} />
        {green.enabled ? (
          <TextInput value={green.text} aria-label="Green footer text" onChange={(e) => patchAddon("green", { text: e.target.value })} />
        ) : null}
      </PanelSection>

      <PanelSection
        title="Legal disclaimer"
        description="Pick a starting point and edit it. These are drafting aids, not legal advice — have your own counsel check anything binding."
      >
        <Toggle label="Show a disclaimer" checked={disclaimer.enabled} onChange={(enabled) => patchAddon("disclaimer", { enabled })} />
        {disclaimer.enabled ? (
          <>
            <Select
              label="Start from"
              value=""
              onChange={(e) => {
                const preset = DISCLAIMER_PRESETS.find((p) => p.id === e.target.value);
                if (preset) patchAddon("disclaimer", { text: preset.text });
              }}
            >
              <option value="">Choose a preset…</option>
              {DISCLAIMER_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </Select>
            <TextArea rows={6} label="Text" value={disclaimer.text} onChange={(e) => patchAddon("disclaimer", { text: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Slider label="Font size" value={disclaimer.fontSize} min={8} max={16} onChange={(fontSize) => patchAddon("disclaimer", { fontSize })} />
              <ColorInput label="Colour" value={disclaimer.color} onChange={(color) => patchAddon("disclaimer", { color })} />
            </div>
          </>
        ) : null}
      </PanelSection>
    </>
  );
}
