"use client";

import { SimpleImageField } from "../ImagePicker";
import {
  ColorInput, DangerButton, GhostButton, PanelSection, SegmentedControl, Slider,
  TextInput, Toggle,
} from "@/components/ui/Controls";
import { localId, type DraftApi } from "../useSignatureDraft";
import type { CtaButton } from "@/lib/signature/types";

const MAX_BUTTONS = 4;

export function CtaPanel({ api }: { api: DraftApi }) {
  const { draft, patch, patchAddon } = api;
  const banner = draft.addons.banner;
  const meeting = draft.addons.meeting;

  function updateButton(id: string, partial: Partial<CtaButton>) {
    patch({ buttons: draft.buttons.map((b) => (b.id === id ? { ...b, ...partial } : b)) });
  }

  return (
    <>
      <PanelSection
        title="Buttons"
        description="A single clear button outperforms three competing ones. Up to four are allowed."
        action={
          <GhostButton
            disabled={draft.buttons.length >= MAX_BUTTONS}
            onClick={() =>
              patch({
                buttons: [
                  ...draft.buttons,
                  {
                    id: localId("btn"),
                    label: "Book a call",
                    url: "",
                    background: draft.style.accentColor,
                    color: "#ffffff",
                    radius: 6,
                    style: "solid",
                    size: "md",
                  },
                ],
              })
            }
          >
            Add button
          </GhostButton>
        }
      >
        {draft.buttons.length === 0 ? (
          <p className="rounded-lg bg-ink-50 px-3 py-3 text-xs text-ink-400">No buttons yet.</p>
        ) : (
          draft.buttons.map((button, index) => (
            <div key={button.id} className="rounded-xl border border-ink-200 bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-500">Button {index + 1}</span>
                <DangerButton onClick={() => patch({ buttons: draft.buttons.filter((b) => b.id !== button.id) })}>
                  Remove
                </DangerButton>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <TextInput label="Label" value={button.label} onChange={(e) => updateButton(button.id, { label: e.target.value })} />
                <TextInput label="Links to" placeholder="https://…" value={button.url} onChange={(e) => updateButton(button.id, { url: e.target.value })} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <ColorInput label="Background" value={button.background} onChange={(background) => updateButton(button.id, { background })} />
                <ColorInput label="Text" value={button.color} onChange={(color) => updateButton(button.id, { color })} />
              </div>

              <div className="mt-3 space-y-3">
                <SegmentedControl
                  label="Style"
                  value={button.style}
                  onChange={(style) => updateButton(button.id, { style })}
                  options={[
                    { value: "solid" as const, label: "Solid" },
                    { value: "outline" as const, label: "Outline" },
                  ]}
                />
                <SegmentedControl
                  label="Size"
                  value={button.size}
                  onChange={(size) => updateButton(button.id, { size })}
                  options={[
                    { value: "sm" as const, label: "Small" },
                    { value: "md" as const, label: "Medium" },
                    { value: "lg" as const, label: "Large" },
                  ]}
                />
                <Slider
                  label="Corner radius"
                  value={button.radius}
                  min={0}
                  max={40}
                  onChange={(radius) => updateButton(button.id, { radius })}
                />
              </div>
            </div>
          ))
        )}
      </PanelSection>

      <PanelSection
        title="Promo banner"
        description="A wide image below your details. Swap it when a campaign changes and every future email follows."
      >
        <Toggle
          label="Show a banner"
          checked={banner.enabled}
          onChange={(enabled) => patchAddon("banner", { enabled })}
        />
        {banner.enabled ? (
          <>
            <SimpleImageField
              label="Banner image"
              value={banner.imageUrl}
              onChange={(imageUrl) => patchAddon("banner", { imageUrl })}
              hint="Around 1000×250 works well. It is scaled down to the width below."
            />
            <TextInput label="Links to" placeholder="https://…" value={banner.link ?? ""} onChange={(e) => patchAddon("banner", { link: e.target.value })} />
            <TextInput label="Alt text" placeholder="Spring launch — 20% off" value={banner.alt ?? ""} onChange={(e) => patchAddon("banner", { alt: e.target.value })} />
            <Slider label="Width" value={banner.width} min={100} max={700} onChange={(width) => patchAddon("banner", { width })} />
          </>
        ) : null}
      </PanelSection>

      <PanelSection
        title="Scheduling link"
        description="A calendar row that sends people straight to your booking page."
      >
        <Toggle
          label="Show a scheduling link"
          checked={meeting.enabled}
          onChange={(enabled) => patchAddon("meeting", { enabled })}
        />
        {meeting.enabled ? (
          <>
            <TextInput label="Label" placeholder="Book a 30-minute call" value={meeting.label} onChange={(e) => patchAddon("meeting", { label: e.target.value })} />
            <TextInput label="Link" placeholder="https://calendly.com/you" value={meeting.url} onChange={(e) => patchAddon("meeting", { url: e.target.value })} />
          </>
        ) : null}
      </PanelSection>
    </>
  );
}
