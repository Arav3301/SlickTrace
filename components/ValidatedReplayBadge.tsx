"use client";

import { useState } from "react";

const EXPLANATION =
  "This investigation was precomputed by the SlickTrace segmentation and AIS-correlation pipeline on the real 2018-09-26 Sentinel-1A scene. Results are replayed from stored outputs for reliable demonstration — they are not computed live in the browser.";

export function ValidatedReplayBadge() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex items-center gap-3">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="replay-explanation"
        onClick={() => setOpen((v) => !v)}
        className="group inline-flex items-center gap-2 rounded-[4px] border border-line-strong bg-paper-2 px-3 py-1.5 text-[12.5px] font-medium uppercase tracking-[0.06em] text-ink-2 transition-colors hover:border-sl hover:text-ink"
      >
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full bg-green"
        />
        Validated replay
      </button>
      {open ? (
        <div
          id="replay-explanation"
          role="region"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(360px,90vw)] border border-line-strong bg-paper p-4 text-[14px] leading-relaxed text-ink-2 shadow-[0_2px_10px_rgba(35,37,47,0.12)]"
        >
          {EXPLANATION}
        </div>
      ) : null}
    </div>
  );
}