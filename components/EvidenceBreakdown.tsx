"use client";

import type { Candidate } from "@/lib/types";
import { SCORE_MAXIMA, SCORE_LABELS, COMPONENT_ORDER } from "@/lib/constants";
import {
  formatScore,
  formatHours,
  formatKm,
  formatCompactKm,
  formatKnots,
  formatDegrees,
  formatRank,
  associationTone,
} from "@/lib/format";

interface DetailProps {
  candidate: Candidate;
  candidates: Candidate[];
  onBack: () => void;
  onNavigate: (rank: number) => void;
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const shown = Number.isInteger(value) && Number.isInteger(max)
    ? String(value)
    : formatScore(value);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[14px] font-medium text-ink-2">{label}</span>
        <span className="tnum text-[14px] text-ink">
          {shown}
          <span className="text-faint"> / {max}</span>
        </span>
      </div>
      <div
        role="img"
        aria-label={`${label}: ${value.toFixed(1)} of ${max}`}
        className="mt-1.5 h-[5px] w-full bg-line"
      >
        <div
          className="h-full bg-ink transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function VesselDetail({ candidate, candidates, onBack, onNavigate }: DetailProps) {
  const tone = associationTone(candidate.association_label);
  const score = candidate.association_score ?? 0;
  const intersects = candidate.track_intersects_slick;
  const maxRank = candidates.length;

  const narrative = intersects
    ? `The reconstructed AIS trajectory passes through the detected slick region, entering ${formatHours(
        candidate.hours_before_first_inside,
      )} before acquisition. Spatial, temporal and route evidence are all consistent with a nearby passage.`
    : `The trajectory does not intersect the detected region; the closest approach is ${formatKm(
        candidate.track_distance_to_slick_km,
      )}. Evidence leans on proximity and timing rather than direct intersection.`;

  return (
    <section
      aria-label="Vessel detail"
      className="rail-scroll flex min-h-0 flex-1 flex-col overflow-y-auto bg-paper"
    >
      {/* Back + navigation */}
      <div className="flex-none border-b border-line px-5 py-3">
        <button
          type="button"
          onClick={onBack}
          className="text-[13.5px] font-medium text-marine hover:text-ink"
        >
          ← All candidates
        </button>
        <div className="mt-2.5 flex items-center gap-1.5">
          {Array.from({ length: maxRank }, (_, i) => i + 1).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onNavigate(r)}
              className={`tnum h-7 min-w-[28px] px-1.5 text-[12.5px] font-semibold transition-colors ${
                r === candidate.candidate_rank
                  ? "border border-ink bg-ink text-paper"
                  : "border border-line text-sl hover:border-line-strong hover:text-ink"
              }`}
            >
              {String(r).padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>

      {/* Rank + vessel identity */}
      <div className="flex-none border-b border-line px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="tnum text-[15px] font-semibold text-faint">
              {formatRank(candidate.candidate_rank)}
            </span>
            <h2 className="mt-0.5 text-[22px] font-semibold tracking-tight text-ink">
              {candidate.vessel_name}
            </h2>
          </div>
          <div className="text-right">
            <div className="tnum text-[36px] font-semibold leading-none text-ink">
              {formatScore(score)}
            </div>
            <div className={`mt-1.5 text-[13px] font-medium uppercase tracking-[0.04em] ${
              tone === "green"
                ? "text-green"
                : tone === "amber"
                  ? "text-amber-deep"
                  : "text-sl"
            }`}>
              {candidate.association_label}
            </div>
          </div>
        </div>

        {/* Identity row */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[13px] text-ink-2">
          <span>
            <span className="text-faint">MMSI </span>
            {candidate.mmsi}
          </span>
          {candidate.imo ? (
            <span>
              <span className="text-faint">IMO </span>
              {candidate.imo}
            </span>
          ) : null}
          {candidate.callsign ? (
            <span>
              <span className="text-faint">CALL </span>
              {candidate.callsign}
            </span>
          ) : null}
        </div>
      </div>

      {/* Evidence summary */}
      <div className="flex-none border-b border-line px-5 py-5">
        <h3 className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-faint">
          Evidence summary
        </h3>

        <div className="mt-4 space-y-4">
          <div className="grid items-baseline" style={{ gridTemplateColumns: "minmax(150px, 1fr) minmax(190px, auto)" }}>
            <span className="text-[14px] font-medium text-ink-2">Track intersection</span>
            <span className="tnum text-right text-[14px] font-medium text-ink">
              {intersects ? "Intersects predicted slick" : "Does not intersect"}
            </span>
          </div>
          <div className="border-t border-line/50" />

          <div className="grid items-baseline" style={{ gridTemplateColumns: "minmax(150px, 1fr) minmax(190px, auto)" }}>
            <span className="text-[14px] font-medium text-ink-2">Spatial proximity</span>
            <span className="tnum text-right text-[14px] font-medium text-ink">
              {formatCompactKm(candidate.track_distance_to_slick_km)}
            </span>
          </div>
          <div className="border-t border-line/50" />

          <div className="grid items-baseline" style={{ gridTemplateColumns: "minmax(150px, 1fr) minmax(190px, auto)" }}>
            <span className="text-[14px] font-medium text-ink-2">Temporal relevance</span>
            <span className="tnum text-right text-[14px] font-medium text-ink">
              {formatHours(candidate.hours_before_satellite)} before satellite acquisition
            </span>
          </div>
          <div className="border-t border-line/50" />

          <div className="grid items-baseline" style={{ gridTemplateColumns: "minmax(150px, 1fr) minmax(190px, auto)" }}>
            <span className="text-[14px] font-medium text-ink-2">Route alignment</span>
            <span className="tnum text-right text-[14px] font-medium text-ink">
              {formatDegrees(candidate.alignment_difference_deg)} difference
            </span>
          </div>
        </div>
      </div>

      {/* Scoring breakdown */}
      <div className="flex-none border-b border-line px-5 py-5">
        <h3 className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-faint">
          Scoring breakdown
        </h3>
        <div className="mt-4 space-y-4">
          {COMPONENT_ORDER.map((key) => {
            const value =
              key === "intersection"
                ? candidate.intersection_score ?? 0
                : key === "proximity"
                  ? candidate.proximity_score ?? 0
                  : key === "temporal"
                    ? candidate.temporal_score ?? 0
                    : candidate.alignment_score ?? 0;
            return (
              <ScoreBar
                key={key}
                label={SCORE_LABELS[key]}
                value={value}
                max={SCORE_MAXIMA[key]}
              />
            );
          })}
        </div>
      </div>

      {/* Reading */}
      <div className="flex-none border-b border-line px-5 py-5">
        <h3 className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-faint">
          Reading
        </h3>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{narrative}</p>
      </div>

      {/* AIS data */}
      <div className="flex-none border-b border-line px-5 py-5">
        <h3 className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-faint">
          AIS track data
        </h3>
        <div className="mt-3 grid grid-cols-3 gap-x-4 gap-y-3">
          <div>
            <div className="tnum text-[20px] font-semibold leading-tight text-ink">
              {candidate.ais_points ?? "—"}
            </div>
            <div className="mt-0.5 text-[12.5px] leading-tight text-sl">track points</div>
          </div>
          <div>
            <div className="tnum text-[20px] font-semibold leading-tight text-ink">
              {candidate.observation_hours?.toFixed(1) ?? "—"}
            </div>
            <div className="mt-0.5 text-[12.5px] leading-tight text-sl">h observed</div>
          </div>
          <div>
            <div className="tnum text-[20px] font-semibold leading-tight text-ink">
              {formatKnots(candidate.max_speed_knots)}
            </div>
            <div className="mt-0.5 text-[12.5px] leading-tight text-sl">max speed</div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex-none px-5 py-5">
        <p className="text-[13px] leading-relaxed text-faint">
          Association scores indicate investigative relevance and do not establish legal responsibility.
        </p>
      </div>
    </section>
  );
}
