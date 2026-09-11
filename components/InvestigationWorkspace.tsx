"use client";

import { useEffect, useState, useCallback } from "react";
import type { Candidate } from "@/lib/types";
import { loadInvestigation, type LoadedInvestigation } from "@/lib/loadData";
import { InvestigationHeader, InvestigationTitleRow } from "./InvestigationHeader";
import { MetadataStrip, ProvenanceFooter } from "./MetadataStrip";
import { MapCanvas } from "./MapCanvas";
import { CandidateBrowseList } from "./CandidateRail";
import { VesselDetail } from "./EvidenceBreakdown";
import { ExportReportButton } from "./ExportReportButton";

type Status = "loading" | "ready" | "error";

export function InvestigationWorkspace() {
  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<LoadedInvestigation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedRank, setSelectedRank] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loadInvestigation()
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setStatus("ready");
        setSelectedRank(1);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const openDetail = useCallback((rank: number) => {
    setSelectedRank(rank);
    setDetailOpen(true);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailOpen(false);
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="max-w-sm px-6 text-center">
          <div className="text-[15px] font-semibold uppercase tracking-[0.14em] text-ink">
            SlickTrace
          </div>
          <p className="mt-3 text-[15px] text-ink-2">
            Loading investigation geometry and AIS data from the validated replay…
          </p>
          <p className="mt-1 font-mono text-[13px] text-faint">
            SLICKTRACE-DEMO-20180926
          </p>
        </div>
      </div>
    );
  }

  if (status === "error" || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="max-w-md border border-line-strong bg-paper-2 px-6 py-5">
          <div className="text-[14px] font-semibold uppercase tracking-[0.08em] text-ink">
            Investigation data unavailable
          </div>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
            {error ?? "The investigation replay could not be loaded."}
          </p>
          <button
            type="button"
            onClick={() => {
              setStatus("loading");
              setError(null);
              setAttempt((a) => a + 1);
            }}
            className="mt-4 border border-ink bg-ink px-4 py-2 text-[14px] font-medium text-paper hover:bg-ink-2"
          >
            Retry load
          </button>
        </div>
      </div>
    );
  }

  const { investigation, slickMain, slickSecondary, tracks, candidates } = data;

  if (candidates.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-[15px] text-ink-2">
          No candidate data is available for this investigation.
        </p>
      </div>
    );
  }

  const selectedCandidate: Candidate | null =
    selectedRank !== null
      ? candidates.find((c) => c.candidate_rank === selectedRank) ?? null
      : null;

  return (
    <div className="flex min-h-0 flex-col bg-paper lg:h-screen lg:overflow-hidden">
      <InvestigationHeader />
      <InvestigationTitleRow investigation={investigation}>
        <ExportReportButton
          investigation={investigation}
          candidates={candidates}
        />
      </InvestigationTitleRow>

      <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative min-h-[50vh] w-full lg:min-h-0 lg:flex-[7]">
          <MapCanvas
            investigation={investigation}
            slickMain={slickMain}
            slickSecondary={slickSecondary}
            tracks={tracks}
            selectedRank={selectedRank}
            onSelect={setSelectedRank}
          />
        </div>

        <aside
          aria-label="Candidate evidence"
          className="flex w-full flex-col border-t border-line bg-paper lg:h-full lg:min-h-0 lg:flex-[3] lg:shrink-0 lg:border-l lg:border-t-0 lg:overflow-hidden"
        >
          {detailOpen && selectedCandidate ? (
            <VesselDetail
              candidate={selectedCandidate}
              candidates={candidates}
              onBack={closeDetail}
              onNavigate={setSelectedRank}
            />
          ) : (
            <CandidateBrowseList
              candidates={candidates}
              investigation={investigation}
              onOpen={openDetail}
            />
          )}
        </aside>
      </main>

      <MetadataStrip investigation={investigation} />
      <ProvenanceFooter investigation={investigation} />
    </div>
  );
}
