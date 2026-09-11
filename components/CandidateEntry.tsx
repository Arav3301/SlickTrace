"use client";

import type { Candidate } from "@/lib/types";
import {
  formatScore,
  formatHoursShort,
  formatCompactKm,
  formatRank,
  associationTone,
} from "@/lib/format";

interface Props {
  candidate: Candidate;
  onOpen: (rank: number) => void;
}

const toneText: Record<"green" | "amber" | "neutral", string> = {
  green: "text-green",
  amber: "text-amber-deep",
  neutral: "text-sl",
};

export function CandidateEntry({ candidate, onOpen }: Props) {
  const tone = associationTone(candidate.association_label);
  const intersects = candidate.track_intersects_slick;

  return (
    <li
      className="border-b border-line last:border-b-0"
      data-candidate-row
      data-rank={candidate.candidate_rank}
    >
      <button
        type="button"
        onClick={() => onOpen(candidate.candidate_rank)}
        className="group relative w-full cursor-pointer py-4 text-left transition-colors hover:bg-paper-2"
      >
        <div className="absolute inset-y-0 left-0 w-[3px] bg-transparent transition-colors group-hover:bg-line-strong" />
        <div className="pl-5 pr-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-baseline gap-3">
              <span className="tnum w-8 shrink-0 text-[19px] font-semibold text-faint">
                {formatRank(candidate.candidate_rank)}
              </span>
              <span className="min-w-0 truncate text-[18px] font-semibold tracking-tight text-ink">
                {candidate.vessel_name}
              </span>
            </div>
            <div className="w-[72px] shrink-0 text-right">
              <div className="tnum text-[26px] font-semibold leading-none text-ink">
                {formatScore(candidate.association_score)}
              </div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 pl-11">
            <span className={`text-[13.5px] font-medium uppercase tracking-[0.04em] ${toneText[tone]}`}>
              {candidate.association_label}
            </span>
            <span className="tnum min-w-0 text-[13.5px] text-sl">
              {intersects ? (
                <>
                  Track intersects slick ·{" "}
                  {formatHoursShort(candidate.hours_before_satellite)} before acquisition
                </>
              ) : (
                <>
                  {formatCompactKm(candidate.track_distance_to_slick_km)} from slick ·{" "}
                  {formatHoursShort(candidate.hours_before_satellite)} before acquisition
                </>
              )}
            </span>
          </div>
        </div>
      </button>
    </li>
  );
}
