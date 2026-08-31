"use client";

import { COLOR_PRESETS } from "@/lib/signature/defaults";
import { FONTS } from "@/lib/signature/fonts";
import {
  ColorInput, PanelSection, SegmentedControl, Select, Slider, Toggle,
} from "@/components/ui/Controls";
import type { Align, Density, DividerStyle } from "@/lib/signature/types";
import type { DraftApi } from "../useSignatureDraft";

export function DesignPanel({ api }: { api: DraftApi }) {
  const { draft, patch, patchStyle } = api;
  const s = draft.style;

  /**
   * Apply a palette across the whole signature.
   *
   * Buttons carry their own colours so they can be deliberately off-brand, but
   * a button still sitting on the previous accent was never a choice — it is
   * just the old default. Those follow the palette; anything customised stays.
   */
  function applyPalette(preset: (typeof COLOR_PRESETS)[number]) {
    patchStyle({
      primaryColor: preset.primary,
      accentColor: preset.accent,
      textColor: preset.text,
      mutedColor: preset.muted,
      linkColor: preset.link,
      backgroundColor: preset.background,
      dividerColor: preset.divider,
    });
    patch({
      buttons: draft.buttons.map((button) =>
        button.background === s.accentColor ? { ...button, background: preset.accent } : button,
      ),
    });
  }

  return (
    <>
      <PanelSection title="Colour palette" description="A starting point you can then adjust field by field.">
        <div className="grid grid-cols-5 gap-2">
          {COLOR_PRESETS.map((preset) => {
            const active = s.primaryColor === preset.primary && s.accentColor === preset.accent;
            return (
              <button
                key={preset.id}
                type="button"
                title={preset.label}
                aria-label={`Apply the ${preset.label} palette`}
                aria-pressed={active}
                onClick={() => applyPalette(preset)}
                className={`group rounded-lg border p-1.5 transition ${
                  active ? "border-brand-500 ring-2 ring-brand-500/20" : "border-ink-200 hover:border-ink-300"
                }`}
              >
                <span className="flex gap-0.5">
                  <span className="h-5 flex-1 rounded-l" style={{ background: preset.primary }} />
                  <span className="h-5 flex-1" style={{ background: preset.accent }} />
                  <span className="h-5 flex-1 rounded-r" style={{ background: preset.divider }} />
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ColorInput label="Name / primary" value={s.primaryColor} onChange={(primaryColor) => patchStyle({ primaryColor })} />
          <ColorInput label="Accent" value={s.accentColor} onChange={(accentColor) => patchStyle({ accentColor })} />
          <ColorInput label="Body text" value={s.textColor} onChange={(textColor) => patchStyle({ textColor })} />
          <ColorInput label="Muted text" value={s.mutedColor} onChange={(mutedColor) => patchStyle({ mutedColor })} />
          <ColorInput label="Links" value={s.linkColor} onChange={(linkColor) => patchStyle({ linkColor })} />
          <ColorInput label="Card background" value={s.backgroundColor} onChange={(backgroundColor) => patchStyle({ backgroundColor })} hint="Used by the card templates." />
        </div>
      </PanelSection>

      <PanelSection
        title="Typography"
        description="Only faces already installed on Windows and macOS are offered — web fonts do not survive the trip into a mail client."
      >
        <Select label="Font" value={s.fontFamily} onChange={(e) => patchStyle({ fontFamily: e.target.value })}>
          {(["sans", "serif", "mono", "script"] as const).map((category) => (
            <optgroup key={category} label={category === "sans" ? "Sans serif" : category === "serif" ? "Serif" : category === "mono" ? "Monospace" : "Script"}>
              {FONTS.filter((f) => f.category === category).map((font) => (
                <option key={font.id} value={font.id}>
                  {font.label}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Slider label="Body size" value={s.baseFontSize} min={9} max={22} onChange={(baseFontSize) => patchStyle({ baseFontSize })} />
          <Slider label="Name size" value={s.nameFontSize} min={11} max={40} onChange={(nameFontSize) => patchStyle({ nameFontSize })} />
        </div>
        <Toggle label="Uppercase name" description="Sets the name in capitals with a little extra letter spacing." checked={s.uppercaseName} onChange={(uppercaseName) => patchStyle({ uppercaseName })} />
        <Toggle label="Bold contact labels" description="Shows 'Phone:', 'Email:' and so on in bold, where the template uses labels." checked={s.boldLabels} onChange={(boldLabels) => patchStyle({ boldLabels })} />
      </PanelSection>

      <PanelSection title="Layout" description="Spacing, width and alignment of the whole signature.">
        <SegmentedControl<Density>
          label="Density"
          value={s.density}
          onChange={(density) => patchStyle({ density })}
          options={[
            { value: "compact", label: "Compact" },
            { value: "cosy", label: "Cosy" },
            { value: "roomy", label: "Roomy" },
          ]}
        />
        <SegmentedControl<Align>
          label="Alignment"
          value={s.align}
          onChange={(align) => patchStyle({ align })}
          options={[
            { value: "left", label: "Left" },
            { value: "center", label: "Centre" },
            { value: "right", label: "Right" },
          ]}
        />
        <Slider
          label="Maximum width"
          value={s.maxWidth}
          min={280}
          max={800}
          step={10}
          onChange={(maxWidth) => patchStyle({ maxWidth })}
        />
      </PanelSection>

      <PanelSection title="Dividers" description="The rules between sections.">
        <SegmentedControl<DividerStyle>
          label="Style"
          value={s.divider}
          onChange={(divider) => patchStyle({ divider })}
          options={[
            { value: "none", label: "None" },
            { value: "line", label: "Line" },
            { value: "bar", label: "Bar" },
            { value: "dots", label: "Dots" },
          ]}
        />
        {s.divider !== "none" ? (
          <div className="grid grid-cols-2 gap-3">
            <ColorInput label="Colour" value={s.dividerColor} onChange={(dividerColor) => patchStyle({ dividerColor })} />
            <Slider label="Thickness" value={s.dividerThickness} min={1} max={8} onChange={(dividerThickness) => patchStyle({ dividerThickness })} />
          </div>
        ) : null}
      </PanelSection>
    </>
  );
}
