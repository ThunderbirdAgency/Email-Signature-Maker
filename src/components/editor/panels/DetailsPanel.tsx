"use client";

import { FIELD_ICONS } from "@/lib/icon-url";
import { GhostButton, DangerButton, PanelSection, Select, TextInput } from "@/components/ui/Controls";
import { localId, type DraftApi } from "../useSignatureDraft";

export function DetailsPanel({ api }: { api: DraftApi }) {
  const { draft, patch, patchDetails } = api;
  const d = draft.details;

  return (
    <>
      <PanelSection title="Who you are" description="The only field most signatures truly need is your name — everything else is optional.">
        <TextInput label="Full name" placeholder="Avery Sinclair" value={d.fullName} onChange={(e) => patchDetails({ fullName: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <TextInput label="Pronouns" placeholder="she/her" value={d.pronouns} onChange={(e) => patchDetails({ pronouns: e.target.value })} />
          <TextInput label="Credentials" placeholder="MBA, PhD" value={d.credentials} onChange={(e) => patchDetails({ credentials: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextInput label="Job title" placeholder="Director of Partnerships" value={d.jobTitle} onChange={(e) => patchDetails({ jobTitle: e.target.value })} />
          <TextInput label="Department" placeholder="Revenue" value={d.department} onChange={(e) => patchDetails({ department: e.target.value })} />
        </div>
        <TextInput label="Company" placeholder="Northwind Studio" value={d.company} onChange={(e) => patchDetails({ company: e.target.value })} />
        <TextInput label="Tagline" placeholder="Brand systems for companies that ship." hint="A short line under your company name." value={d.tagline} onChange={(e) => patchDetails({ tagline: e.target.value })} />
      </PanelSection>

      <PanelSection title="How to reach you" description="Phone numbers become tap-to-call links and the address links to a map.">
        <TextInput label="Email" type="email" placeholder="you@company.com" value={d.email} onChange={(e) => patchDetails({ email: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <TextInput label="Phone" placeholder="+1 (415) 555 0142" value={d.phone} onChange={(e) => patchDetails({ phone: e.target.value })} />
          <TextInput label="Mobile" placeholder="+1 (415) 555 0188" value={d.mobile} onChange={(e) => patchDetails({ mobile: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextInput label="Fax" placeholder="+1 (415) 555 0190" value={d.fax} onChange={(e) => patchDetails({ fax: e.target.value })} />
          <TextInput label="Website" placeholder="yourcompany.com" value={d.website} onChange={(e) => patchDetails({ website: e.target.value })} />
        </div>
        <TextInput label="Address" placeholder="540 Howard St, San Francisco, CA" value={d.address} onChange={(e) => patchDetails({ address: e.target.value })} />
      </PanelSection>

      <PanelSection
        title="Custom fields"
        description="Anything the fields above do not cover — licence numbers, office hours, a booking code."
        action={
          <GhostButton
            onClick={() =>
              patch({
                customFields: [
                  ...draft.customFields,
                  { id: localId("cf"), label: "", value: "", icon: "star", link: "" },
                ],
              })
            }
          >
            Add field
          </GhostButton>
        }
      >
        {draft.customFields.length === 0 ? (
          <p className="rounded-lg bg-ink-50 px-3 py-3 text-xs text-ink-400">No custom fields yet.</p>
        ) : (
          draft.customFields.map((field, index) => (
            <div key={field.id} className="rounded-xl border border-ink-200 bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-500">Field {index + 1}</span>
                <DangerButton
                  onClick={() => patch({ customFields: draft.customFields.filter((f) => f.id !== field.id) })}
                >
                  Remove
                </DangerButton>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <TextInput label="Label" placeholder="Licence" value={field.label} onChange={(e) => updateField(index, { label: e.target.value })} />
                <TextInput label="Value" placeholder="CA #01234567" value={field.value} onChange={(e) => updateField(index, { value: e.target.value })} />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Select label="Icon" value={field.icon ?? "star"} onChange={(e) => updateField(index, { icon: e.target.value })}>
                  {FIELD_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon.charAt(0).toUpperCase() + icon.slice(1)}
                    </option>
                  ))}
                </Select>
                <TextInput label="Links to" placeholder="https://…" value={field.link ?? ""} onChange={(e) => updateField(index, { link: e.target.value })} />
              </div>
            </div>
          ))
        )}
      </PanelSection>
    </>
  );

  function updateField(index: number, partial: Partial<(typeof draft.customFields)[number]>) {
    const next = draft.customFields.map((f, i) => (i === index ? { ...f, ...partial } : f));
    patch({ customFields: next });
  }
}
