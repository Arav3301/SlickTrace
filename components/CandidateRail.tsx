"use client";

import type { Candidate, Investigation } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import { CandidateEntry } from "./CandidateEntry";

interface BrowseProps {
  candidates: Candidate[];
  investigation: Investigation;
  onOpen: (rank: number) => void;
}

export function CandidateBrowseList({ candidates, investigation, onOpen }: BrowseProps) {
  return (
    <section
      aria-label="Potential source candidates"
      className="flex min-h-0 flex-1 flex-col bg-paper"
    >
      <div className="flex-none border-b border-line px-5 py-4">
        <h2 className="text-[14px] font-semibold uppercase tracking-[0.08em] text-ink">
          Candidate vessels
        </h2>
        <p className="mt-1 text-[13px] text-sl">
          {formatNumber(investigation.candidate_count)} screened · top 5 by score
        </p>
      </div>
      <ol className="rail-scroll min-h-0 flex-1 overflow-y-auto">
        {candidates.map((c) => (
          <CandidateEntry
            key={c.candidate_rank}
            candidate={c}
            onOpen={onOpen}
          />
        ))}
      </ol>
    </section>
  );
}
