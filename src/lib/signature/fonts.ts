/**
 * Font stacks that survive the trip into a mail client.
 *
 * Webfonts are unavailable in Outlook and stripped by Gmail, so every option is
 * a stack of faces already installed on Windows/macOS, ending in a generic.
 */

export interface FontOption {
  id: string;
  label: string;
  stack: string;
  category: "sans" | "serif" | "mono" | "script";
}

export const FONTS: FontOption[] = [
  { id: "system", label: "System UI", category: "sans", stack: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
  { id: "helvetica", label: "Helvetica", category: "sans", stack: "Helvetica, Arial, sans-serif" },
  { id: "arial", label: "Arial", category: "sans", stack: "Arial, Helvetica, sans-serif" },
  { id: "verdana", label: "Verdana", category: "sans", stack: "Verdana, Geneva, sans-serif" },
  { id: "tahoma", label: "Tahoma", category: "sans", stack: "Tahoma, Verdana, Segoe, sans-serif" },
  { id: "trebuchet", label: "Trebuchet MS", category: "sans", stack: "'Trebuchet MS', Tahoma, sans-serif" },
  { id: "segoe", label: "Segoe UI", category: "sans", stack: "'Segoe UI', Tahoma, Geneva, sans-serif" },
  { id: "calibri", label: "Calibri", category: "sans", stack: "Calibri, Candara, Segoe, Optima, sans-serif" },
  { id: "georgia", label: "Georgia", category: "serif", stack: "Georgia, 'Times New Roman', serif" },
  { id: "times", label: "Times New Roman", category: "serif", stack: "'Times New Roman', Times, serif" },
  { id: "garamond", label: "Garamond", category: "serif", stack: "Garamond, Baskerville, 'Times New Roman', serif" },
  { id: "palatino", label: "Palatino", category: "serif", stack: "'Palatino Linotype', Palatino, Georgia, serif" },
  { id: "courier", label: "Courier New", category: "mono", stack: "'Courier New', Courier, monospace" },
  { id: "consolas", label: "Consolas", category: "mono", stack: "Consolas, 'Lucida Console', Monaco, monospace" },
  { id: "brush", label: "Script (sign-off)", category: "script", stack: "'Brush Script MT', 'Segoe Script', cursive" },
];

export const FONT_BY_ID: Record<string, FontOption> = Object.fromEntries(
  FONTS.map((f) => [f.id, f]),
);

export function fontStack(id: string): string {
  return FONT_BY_ID[id]?.stack ?? FONT_BY_ID.system.stack;
}
