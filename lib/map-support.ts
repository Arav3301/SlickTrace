"use client";

let cached: boolean | null = null;

function probe(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", {
      failIfMajorPerformanceCaveat: false,
    });
    if (!gl) return false;
    if (
      typeof (gl as { isContextLost?: () => boolean }).isContextLost === "function" &&
      (gl as { isContextLost: () => boolean }).isContextLost()
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Safe WebGL2 capability probe — never throws, safe to call on the server. */
export function supportsWebGL2(): boolean {
  if (cached === null) cached = probe();
  return cached;
}