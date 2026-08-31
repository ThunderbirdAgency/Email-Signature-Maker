"use client";

/**
 * Form primitives for the editor panels.
 *
 * The editor is a dense settings surface, so these are deliberately compact and
 * consistent: one label style, one focus treatment, one way to show help text.
 */

import { useId } from "react";

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label ? (
        <label className="mb-1.5 block text-xs font-medium text-ink-600">{label}</label>
      ) : null}
      {children}
      {hint ? <p className="mt-1.5 text-xs leading-relaxed text-ink-400">{hint}</p> : null}
    </div>
  );
}

const INPUT_CLASS =
  "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 " +
  "placeholder:text-ink-300 transition focus:border-brand-400 focus:outline-none " +
  "focus:ring-2 focus:ring-brand-500/15";

export function TextInput({
  label,
  hint,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <input {...props} className={INPUT_CLASS} />
    </Field>
  );
}

export function TextArea({
  label,
  hint,
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <textarea {...props} className={`${INPUT_CLASS} resize-y leading-relaxed`} />
    </Field>
  );
}

export function Select({
  label,
  hint,
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; hint?: string }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <select {...props} className={`${INPUT_CLASS} cursor-pointer pr-8`}>
        {children}
      </select>
    </Field>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-ink-800">
          {label}
        </label>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-ink-400">{description}</p>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-brand-600" : "bg-ink-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function ColorInput({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} colour picker`}
          className="h-9 w-11 shrink-0 rounded-lg"
        />
        <input
          type="text"
          value={value}
          spellCheck={false}
          aria-label={`${label} hex value`}
          onChange={(e) => {
            const next = e.target.value.trim();
            // Accept partial typing; only commit values that parse as a colour.
            if (/^#?[0-9a-fA-F]{0,6}$/.test(next)) {
              onChange(next.startsWith("#") ? next : `#${next}`);
            }
          }}
          className={`${INPUT_CLASS} font-mono text-xs uppercase`}
        />
      </div>
    </Field>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "px",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-xs font-medium text-ink-600">{label}</label>
        <span className="font-mono text-xs text-ink-400">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ink-200 accent-brand-600"
      />
    </div>
  );
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex gap-1 rounded-lg bg-ink-100 p-1" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition ${
              value === option.value
                ? "bg-white text-ink-900 shadow-sm"
                : "text-ink-500 hover:text-ink-700"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </Field>
  );
}

export function PanelSection({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="border-b border-ink-100 px-5 py-6 last:border-b-0">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
          {description ? (
            <p className="mt-1 text-xs leading-relaxed text-ink-400">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function GhostButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-ink-300 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function DangerButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`rounded-lg px-2 py-1 text-xs font-medium text-ink-400 transition hover:bg-red-50 hover:text-red-600 ${className}`}
    >
      {children}
    </button>
  );
}
