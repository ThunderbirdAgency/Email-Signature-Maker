"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders signature HTML inside an iframe.
 *
 * The isolation matters twice over: the page's own stylesheet must not leak
 * into the signature (which would make the preview lie about what recipients
 * see), and the signature's markup must not disturb the app. The frame
 * measures its content and reports its height so it can size to fit.
 */
export function SignatureFrame({
  html,
  background = "#ffffff",
  padding = 24,
  className = "",
  title = "Signature preview",
  interactive = true,
  onMeasure,
}: {
  html: string;
  background?: string;
  padding?: number;
  className?: string;
  title?: string;
  /** Set false when the frame sits inside a clickable card — an iframe
      captures pointer events and would otherwise eat the click. */
  interactive?: boolean;
  /** Reports content height, so a parent can scale the frame to fit. */
  onMeasure?: (height: number) => void;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(140);

  // Held in a ref so a caller passing an inline callback does not re-run the
  // measurement effect on every render.
  const onMeasureRef = useRef(onMeasure);
  onMeasureRef.current = onMeasure;

  const doc = `<!DOCTYPE html><html><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  html,body{margin:0;padding:0;background:${background};}
  body{padding:${padding}px;-webkit-font-smoothing:antialiased;}
  img{max-width:100%;}
</style></head><body><div id="root">${html}</div></body></html>`;

  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;

    const measure = () => {
      const body = frame.contentDocument?.body;
      if (!body) return;
      // scrollHeight settles only after images load, so this runs on load too.
      const next = Math.max(60, Math.ceil(body.scrollHeight));
      setHeight((prev) => (Math.abs(prev - next) > 1 ? next : prev));
      onMeasureRef.current?.(next);
    };

    measure();
    frame.addEventListener("load", measure);

    // Images arriving late (icons, uploads) change the height after first paint.
    const timers = [60, 200, 600, 1500].map((ms) => window.setTimeout(measure, ms));
    return () => {
      frame.removeEventListener("load", measure);
      timers.forEach(window.clearTimeout);
    };
  }, [doc]);

  return (
    <iframe
      ref={ref}
      title={title}
      srcDoc={doc}
      scrolling="no"
      // The preview renders user-supplied markup; keep it sandboxed.
      sandbox="allow-same-origin"
      className={`w-full border-0 ${className}`}
      style={{ height, pointerEvents: interactive ? undefined : "none" }}
    />
  );
}
