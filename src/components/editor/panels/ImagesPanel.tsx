"use client";

import { ImagePicker, SimpleImageField } from "../ImagePicker";
import { ColorInput, PanelSection, Slider, TextInput, Toggle } from "@/components/ui/Controls";
import type { DraftApi } from "../useSignatureDraft";

export function ImagesPanel({ api }: { api: DraftApi }) {
  const { draft, patch, patchAddon } = api;
  const signoff = draft.addons.signoff;

  return (
    <>
      <PanelSection
        title="Your photo"
        description="A headshot makes a signature feel like it came from a person. Upload one and it is hosted here, so it loads in every inbox."
      >
        <ImagePicker
          label="Profile photo"
          value={draft.photo}
          defaultWidth={96}
          maxWidth={240}
          onChange={(photo) => patch({ photo })}
        />
      </PanelSection>

      <PanelSection
        title="Company logo"
        description="Wide logos usually read better as a square shape with no border."
      >
        <ImagePicker
          label="Logo"
          value={draft.logo}
          defaultWidth={130}
          maxWidth={340}
          onChange={(logo) => patch({ logo })}
        />
      </PanelSection>

      <PanelSection
        title="Handwritten sign-off"
        description="A scripted 'thanks, Avery' above your details. Type it, or upload a scan of your real signature."
      >
        <Toggle
          label="Show a sign-off"
          checked={signoff.enabled}
          onChange={(enabled) => patchAddon("signoff", { enabled })}
        />
        {signoff.enabled ? (
          <>
            <TextInput
              label="Sign-off text"
              placeholder="Avery"
              value={signoff.text}
              onChange={(e) => patchAddon("signoff", { text: e.target.value })}
              hint="Rendered in a script face. Clients without that face fall back to their own cursive."
            />
            <SimpleImageField
              label="Or upload an image of your signature"
              value={signoff.imageUrl ?? ""}
              onChange={(imageUrl) => patchAddon("signoff", { imageUrl })}
              hint="An uploaded image always wins over the text above. A transparent PNG works best."
            />
            <div className="grid grid-cols-2 gap-3">
              <Slider
                label="Size"
                value={signoff.width}
                min={60}
                max={400}
                onChange={(width) => patchAddon("signoff", { width })}
              />
              <ColorInput
                label="Colour"
                value={signoff.color}
                onChange={(color) => patchAddon("signoff", { color })}
              />
            </div>
          </>
        ) : null}
      </PanelSection>
    </>
  );
}
