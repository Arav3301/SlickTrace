"use client";

import { useCallback, useState } from "react";
import type { Investigation, Candidate } from "@/lib/types";

interface Props {
  investigation: Investigation;
  candidates: Candidate[];
}

export function ExportReportButton({ investigation, candidates }: Props) {
  const [busy, setBusy] = useState(false);

  const handleExport = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { InvestigationReport } = await import("./InvestigationReport");

      const doc = (
        <InvestigationReport
          investigation={investigation}
          candidates={candidates}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SlickTrace_Investigation_${investigation.scene_date}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setBusy(false);
    }
  }, [investigation, candidates, busy]);

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={busy}
      className="border border-line-strong bg-paper px-3 py-1.5 text-[13px] text-sl transition-colors hover:border-ink-2 hover:text-ink disabled:opacity-50"
    >
      {busy ? "Generating…" : "Export report"}
    </button>
  );
}
