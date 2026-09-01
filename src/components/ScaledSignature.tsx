"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { SignatureFrame } from "./SignatureFrame";

/**
 * Shows a signature at its true proportions, shrunk to fit the space available.
 *
 * A signature is laid out for a ~560px desktop email column. Dropping that into
 * a narrow card or a phone screen used to reflow it into a tall ragged mess
 * that looked nothing like the real thing. Instead the frame is always rendered
 * at its natural width and then scaled down, so a preview on a phone is the
 * same picture as on a desktop — just smaller.
 *
 * The scaled frame is taken out of flow on purpose. A CSS transform changes
 * what you see but not the space the element claims, so leaving it in flow let
 * a 560px frame force its container — and the whole grid — wider than the
 * viewport, which is exactly the horizontal overflow this component exists to
 * prevent.
 */
export function ScaledSignature({
  html,
  naturalWidth = 600,
  maxScale = 1,
  maxHeight,
  padding = 20,
  background = "#ffffff",
  title,
}: {
  html: string;
  /** The width the signature is laid out at before scaling. */
  naturalWidth?: number;
  /** Never enlarge past this; 1 keeps it at most life-size. */
  maxScale?: number;
  /** Cap the rendered height, so a row of cards lines up. */
  maxHeight?: number;
  padding?: number;
  background?: string;
  title?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(0);
  const [contentHeight, setContentHeight] = useState(160);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => setAvailable(host.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const byWidth = available ? available / naturalWidth : maxScale;
  // A tall signature must also shrink to fit the height it is given, or cards
  // in the same row end up different sizes.
  const byHeight = maxHeight && contentHeight ? maxHeight / contentHeight : Infinity;
  const scale = Math.max(0.05, Math.min(maxScale, byWidth, byHeight));

  const scaledWidth = Math.ceil(naturalWidth * scale);
  const scaledHeight = Math.ceil(contentHeight * scale);

  return (
    <div
      ref={hostRef}
      className="relative w-full overflow-hidden"
      style={{ background, height: maxHeight ?? scaledHeight }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{ width: scaledWidth, height: scaledHeight, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: naturalWidth,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <SignatureFrame
              html={html}
              background={background}
              padding={padding}
              title={title}
              interactive={false}
              onMeasure={setContentHeight}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
