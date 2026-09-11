"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Investigation, Candidate } from "@/lib/types";
import {
  SCORE_MAXIMA,
  SCORE_LABELS,
  AIS_LOOKBACK_HOURS,
} from "@/lib/constants";

/* ------------------------------------------------------------------ */
/*  PDF colour palette — mirrors globals.css editorial tokens          */
/* ------------------------------------------------------------------ */

const C = {
  white: "#ffffff",
  paper: "#f6f3ec",
  ink: "#23252f",
  ink2: "#3a3e4c",
  sl: "#62687a",
  faint: "#8d93a3",
  line: "#d9d5c9",
  lineStrong: "#c6c1b3",
  marine: "#37607c",
  marineInk: "#2a4a60",
  amber: "#a9712c",
  signal: "#c5521f",
  green: "#3f6d52",
};

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
  /* page */
  page: {
    padding: "56pt 60pt 64pt 60pt",
    fontSize: 10,
    fontFamily: "Helvetica",
    color: C.ink,
    backgroundColor: C.white,
    lineHeight: 1.55,
  },
  pageCompact: {
    padding: "44pt 60pt 64pt 60pt",
    fontSize: 10,
    fontFamily: "Helvetica",
    color: C.ink,
    backgroundColor: C.white,
    lineHeight: 1.55,
  },

  /* hierarchy — explicit line heights keep the masthead airy and
     non-overlapping (the page default lineHeight of 1.55 inflates the
     title line box and can push the sub-lines into one another). */
  title: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.4,
    lineHeight: 1.18,
    marginBottom: 10,
    color: C.ink,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Helvetica",
    lineHeight: 1.35,
    color: C.sl,
    marginBottom: 10,
  },
  validatedBadge: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.7,
    lineHeight: 1.2,
    textTransform: "uppercase",
    color: C.green,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: C.ink,
    marginBottom: 8,
    paddingBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: C.line,
  },
  candidateTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.2,
    color: C.ink,
    marginBottom: 2,
  },
  candidateSub: {
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.3,
    color: C.sl,
    marginBottom: 14,
  },

  /* labels */
  label: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: C.faint,
    marginBottom: 1,
  },
  labelGreen: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: C.green,
    marginBottom: 1,
  },

  /* value text */
  value: {
    fontSize: 10,
    fontFamily: "Helvetica",
    color: C.ink2,
    marginBottom: 7,
  },
  valueLg: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: C.ink,
  },
  valueMono: {
    fontSize: 9.5,
    fontFamily: "Courier",
    color: C.ink2,
    marginBottom: 7,
  },

  /* divider */
  divider: {
    borderTopWidth: 0.5,
    borderTopColor: C.line,
    marginVertical: 10,
  },
  dividerStrong: {
    borderTopWidth: 0.8,
    borderTopColor: C.lineStrong,
    marginVertical: 12,
  },

  /* layout helpers */
  row: { flexDirection: "row" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  col: { flexDirection: "column" },
  grid2: { flexDirection: "row", gap: 24 },
  grid3: { flexDirection: "row", gap: 16 },
  mb4: { marginBottom: 4 },
  mb6: { marginBottom: 6 },
  mb8: { marginBottom: 8 },
  mb10: { marginBottom: 10 },
  mb12: { marginBottom: 12 },
  mb14: { marginBottom: 14 },
  mb16: { marginBottom: 16 },
  mb20: { marginBottom: 20 },
  mb24: { marginBottom: 24 },
  my16: { marginVertical: 16 },

  /* metric card */
  metricBox: { width: "25%", marginBottom: 14 },
  metricValue: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: C.ink,
    marginBottom: 1,
  },
  metricLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: C.sl,
  },

  /* table */
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 0.8,
    borderBottomColor: C.ink,
    paddingBottom: 5,
    marginBottom: 5,
    alignItems: "center",
  },
  tableHeaderText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: C.faint,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.3,
    borderBottomColor: C.line,
    paddingVertical: 6,
    alignItems: "center",
  },
  tableRowSelected: {
    flexDirection: "row",
    borderBottomWidth: 0.3,
    borderBottomColor: C.line,
    paddingVertical: 6,
    backgroundColor: "#f0ede5",
    alignItems: "center",
  },
  cell: { fontFamily: "Helvetica", color: C.ink2, fontSize: 9 },
  cellBold: {
    fontFamily: "Helvetica-Bold",
    color: C.ink,
    fontSize: 9,
  },

  /* score bar */
  barOuter: {
    height: "4",
    backgroundColor: "#e8e5dc",
    borderRadius: "2",
  },

  /* scoring breakdown row */
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  scoreLabel: {
    width: 130,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: C.ink2,
  },
  scoreValue: {
    width: 70,
    fontFamily: "Courier",
    fontSize: 9.5,
    color: C.ink,
    textAlign: "right",
    marginRight: 12,
  },

  /* evidence row */
  evidenceLabel: {
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: C.ink2,
    marginBottom: 1,
  },
  evidenceValue: {
    fontSize: 9,
    fontFamily: "Helvetica",
    color: C.sl,
    marginBottom: 8,
  },

  /* detail section */
  detailSectionTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: C.ink,
    marginBottom: 6,
    marginTop: 14,
    paddingBottom: 3,
    borderBottomWidth: 0.3,
    borderBottomColor: C.line,
  },

  /* explanation */
  explanation: {
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: C.ink2,
    lineHeight: 1.5,
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "#f6f3ec",
    borderLeftWidth: 2,
    borderLeftColor: C.marine,
  },

  /* footer */
  footer: {
    position: "absolute",
    bottom: 30,
    left: 60,
    right: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.3,
    borderTopColor: C.line,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    fontFamily: "Helvetica",
    color: C.faint,
  },
  pageNum: {
    fontSize: 8,
    fontFamily: "Helvetica",
    color: C.faint,
  },

  /* disclaimer */
  disclaimer: {
    fontSize: 9,
    fontFamily: "Helvetica-Oblique",
    color: C.sl,
    lineHeight: 1.5,
    marginBottom: 10,
  },
});

/* ------------------------------------------------------------------ */
/*  Column widths for the candidate table (A4 = 595pt, 120pt margins) */
/*  Available width: 475pt.                                            */
/* ------------------------------------------------------------------ */

const COL = {
  rank: 28,
  vessel: 112,
  score: 44,
  classification: 100,
  distance: 60,
  time: 58,
  intersect: 50,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = d.toLocaleDateString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

function fmtN(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return new Intl.NumberFormat("en-US").format(v);
}

function fmtKm(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `${(Math.round(v * 100) / 100).toFixed(2)} km`;
}

function fmtKnots(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `${v.toFixed(1)} kn`;
}

function fmtDeg(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `${v.toFixed(1)}°`;
}

function fmtHrs(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `${v.toFixed(2)} h`;
}

function fmtScore(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return v.toFixed(2);
}

/**
 * Format a scoring component value.
 * Integer scores (intersection is always 0 or 35) show as integers.
 * Fractional scores round to 2 decimal places.
 */
function fmtComponent(
  obtained: number | null,
  maximum: number,
): string {
  if (obtained === null || Number.isNaN(obtained)) return "— / —";
  if (Number.isInteger(obtained) && Number.isInteger(maximum)) {
    return `${obtained} / ${maximum}`;
  }
  return `${obtained.toFixed(2)} / ${maximum}`;
}

/** Convert a hex colour to an inline style for the bar fill. */
function barFillStyle(pct: number, hex: string): Record<string, string> {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return {
    height: "4",
    width: `${Math.min(Math.max(pct, 0), 100)}%`,
    backgroundColor: `rgb(${r},${g},${b})`,
    borderRadius: "2",
  };
}

/* ------------------------------------------------------------------ */
/*  Evidence interpretation — deterministic prose from real evidence   */
/* ------------------------------------------------------------------ */

function interpretEvidence(c: Candidate): string {
  const parts: string[] = [];

  if (c.track_intersects_slick) {
    const timeRef =
      c.hours_before_satellite != null
        ? ` approximately ${fmtHrs(c.hours_before_satellite).replace(" h", " hours")} before Sentinel-1 acquisition`
        : "";
    parts.push(`Track intersected the predicted slick region${timeRef}.`);
  } else {
    const dist = c.track_distance_to_slick_km ?? c.closest_AIS_distance_km;
    if (dist != null) {
      parts.push(
        `Track did not intersect the predicted slick but passed approximately ${fmtKm(dist)} from the detected region.`,
      );
    } else {
      parts.push("Track did not intersect the predicted slick region.");
    }
  }

  if (c.alignment_difference_deg != null) {
    parts.push(
      `Course alignment difference: ${fmtDeg(c.alignment_difference_deg)}.`,
    );
  }

  return parts.join(" ");
}

/* ------------------------------------------------------------------ */
/*  Page footer                                                       */
/* ------------------------------------------------------------------ */

function Footer({ page }: { page: number }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>
        SlickTrace · SIH26143 · Validated Investigation Replay
      </Text>
      <Text style={s.pageNum}>{page}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Cover page                                                        */
/* ------------------------------------------------------------------ */

function CoverPage({
  investigation,
  page,
}: {
  investigation: Investigation;
  page: number;
}) {
  const { main_slick, model_metrics } = investigation;

  return (
    <Page size="A4" style={s.page}>
      <Text style={s.title}>SLICKTRACE</Text>
      <Text style={s.subtitle}>Marine Spill Investigation Report</Text>
      <Text style={s.validatedBadge}>Validated Investigation Replay</Text>

      <View style={s.dividerStrong} />

      <View style={[s.grid2, s.mb24]}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Investigation ID</Text>
          <Text style={s.valueMono}>{investigation.investigation_id}</Text>

          <Text style={s.label}>Status</Text>
          <Text style={s.value}>Validated Investigation Replay</Text>

          <Text style={s.label}>Satellite</Text>
          <Text style={s.value}>{investigation.satellite}</Text>

          <Text style={s.label}>Scene Date</Text>
          <Text style={s.value}>{formatDate(investigation.scene_date)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Acquisition Time</Text>
          <Text style={s.value}>~00:01:45 UTC</Text>

          <Text style={s.label}>Region</Text>
          <Text style={s.value}>Gulf of Mexico</Text>

          <Text style={s.label}>Segmentation Model</Text>
          <Text style={s.value}>{investigation.model}</Text>

          <Text style={s.label}>Detection Threshold</Text>
          <Text style={s.value}>{investigation.threshold.toFixed(2)}</Text>
        </View>
      </View>

      <View style={s.sectionTitle}>
        <Text>Investigation Overview</Text>
      </View>

      <View style={[s.row, s.mb24]}>
        <View style={s.metricBox}>
          <Text style={s.metricValue}>
            {main_slick.area_km2.toFixed(2)} km²
          </Text>
          <Text style={s.metricLabel}>Main predicted slick</Text>
        </View>
        <View style={s.metricBox}>
          <Text style={s.metricValue}>{fmtN(investigation.candidate_count)}</Text>
          <Text style={s.metricLabel}>Vessels screened</Text>
        </View>
        <View style={s.metricBox}>
          <Text style={s.metricValue}>15.5M</Text>
          <Text style={s.metricLabel}>AIS rows scanned</Text>
        </View>
        <View style={s.metricBox}>
          <Text style={s.metricValue}>{AIS_LOOKBACK_HOURS} h</Text>
          <Text style={s.metricLabel}>AIS lookback</Text>
        </View>
      </View>

      <View style={s.sectionTitle}>
        <Text>Model Performance (Held-out Test)</Text>
      </View>

      <View style={[s.grid3, s.mb20]}>
        {[
          ["Dice", model_metrics.dice.toFixed(4)],
          ["IoU", model_metrics.iou.toFixed(4)],
          ["Precision", model_metrics.precision.toFixed(4)],
          ["Recall", model_metrics.recall.toFixed(4)],
          ["Specificity", model_metrics.specificity.toFixed(4)],
        ].map(([label, val]) => (
          <View key={label} style={{ flex: 1 }}>
            <Text style={s.label}>{label}</Text>
            <Text style={s.valueMono}>{val}</Text>
          </View>
        ))}
      </View>

      <View style={s.sectionTitle}>
        <Text>Prototype Methodology</Text>
      </View>

      <Text style={[s.value, s.mb16]}>
        Sentinel-1 SAR imagery was processed using the SlickTrace U-Net
        segmentation pipeline. The resulting predicted slick geometry was
        correlated against historical AIS vessel trajectories using spatial
        proximity, temporal relevance, track intersection, and route alignment
        evidence. This is a prototype investigation method; results shown here
        were generated by the real SlickTrace processing pipeline and are
        replayed in the web prototype for demonstration reliability.
      </Text>

      <View style={[s.dividerStrong, s.mb12]} />

      <Text style={s.disclaimer}>{investigation.disclaimer}</Text>

      <Footer page={page} />
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/*  Candidate ranking table (compact summary)                         */
/* ------------------------------------------------------------------ */

function RankingTable({
  candidates,
  page,
}: {
  candidates: Candidate[];
  page: number;
}) {
  return (
    <Page size="A4" style={s.pageCompact}>
      <View style={[s.sectionTitle, s.mb16]}>
        <Text>Top 5 Potential Source Candidates</Text>
      </View>

      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderText, { width: COL.rank }]}>Rank</Text>
        <Text style={[s.tableHeaderText, { width: COL.vessel }]}>Vessel</Text>
        <Text
          style={[s.tableHeaderText, { width: COL.score, textAlign: "right", paddingRight: 8 }]}
        >
          Score
        </Text>
        <Text
          style={[s.tableHeaderText, { width: COL.classification }]}
        >
          Classification
        </Text>
        <Text
          style={[s.tableHeaderText, { width: COL.distance, textAlign: "right", paddingRight: 8 }]}
        >
          Distance
        </Text>
        <Text
          style={[s.tableHeaderText, { width: COL.time, textAlign: "right", paddingRight: 8 }]}
        >
          Time
        </Text>
        <Text
          style={[s.tableHeaderText, { width: COL.intersect }]}
        >
          Intersect
        </Text>
      </View>

      {candidates.map((c, i) => {
        const selected = i === 0;
        return (
          <View
            key={c.mmsi}
            style={selected ? s.tableRowSelected : s.tableRow}
          >
            <Text style={[s.cellBold, { width: COL.rank }]}>
              #{String(c.candidate_rank).padStart(2, "0")}
            </Text>
            <Text style={[s.cellBold, { width: COL.vessel }]}>
              {c.vessel_name}
            </Text>
            <Text style={[s.cellBold, { width: COL.score, textAlign: "right", paddingRight: 8 }]}>
              {fmtScore(c.association_score)}
            </Text>
            <Text style={[s.cell, { width: COL.classification }]}>
              {c.association_label}
            </Text>
            <Text
              style={[s.cell, { width: COL.distance, textAlign: "right", paddingRight: 8 }]}
            >
              {c.track_distance_to_slick_km != null
                ? fmtKm(c.track_distance_to_slick_km)
                : c.closest_AIS_distance_km != null
                  ? fmtKm(c.closest_AIS_distance_km)
                  : "—"}
            </Text>
            <Text style={[s.cell, { width: COL.time, textAlign: "right", paddingRight: 8 }]}>
              {fmtHrs(c.hours_before_satellite)}
            </Text>
            <Text style={[s.cell, { width: COL.intersect }]}>
              {c.track_intersects_slick ? "Yes" : "No"}
            </Text>
          </View>
        );
      })}

      <View style={[s.dividerStrong, s.mb16, { marginTop: 16 }]} />

      <Text style={s.label}>Association Score Components</Text>
      <Text style={[s.value, s.mb12]}>
        Each candidate is scored across four evidence dimensions: track
        intersection (max 35 pts), spatial proximity (max 30 pts), temporal
        relevance (max 25 pts), and route alignment (max 10 pts). The total
        association score is the sum of these components.
      </Text>

      <View style={s.sectionTitle}>
        <Text>Scores Ranked by Association</Text>
      </View>

      {candidates.map((c) => (
        <View
          key={c.mmsi}
          style={[s.row, s.mb8, { alignItems: "center" }]}
        >
          <Text style={[s.cellBold, { width: 26 }]}>
            #{String(c.candidate_rank).padStart(2, "0")}
          </Text>
          <Text style={[s.cellBold, { width: 120 }]}>{c.vessel_name}</Text>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={s.barOuter}>
              <View
                style={barFillStyle(
                  ((c.association_score ?? 0) / 100) * 100,
                  C.marine,
                )}
              />
            </View>
          </View>
          <Text style={[s.cellBold, { width: 48, textAlign: "right" }]}>
            {fmtScore(c.association_score)}
          </Text>
        </View>
      ))}

      <Footer page={page} />
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/*  Candidate detail page                                             */
/* ------------------------------------------------------------------ */

function CandidatePage({
  candidate,
  index,
  total,
  page,
}: {
  candidate: Candidate;
  index: number;
  total: number;
  page: number;
}) {
  const c = candidate;

  return (
    <Page size="A4" style={s.page}>
      <View style={[s.rowBetween, s.mb4, { alignItems: "flex-end" }]}>
        <Text style={s.candidateTitle}>
          #{String(c.candidate_rank).padStart(2, "0")} {c.vessel_name}
        </Text>
        <Text
          style={[
            s.candidateSub,
            { textAlign: "right", marginBottom: 0 },
          ]}
        >
          Candidate {index + 1} of {total}
        </Text>
      </View>

      <View style={[s.row, s.mb4]}>
        <View style={{ marginRight: 28 }}>
          <Text style={s.label}>Association Score</Text>
          <Text style={s.valueLg}>{fmtScore(c.association_score)}</Text>
        </View>
        <View>
          <Text style={s.labelGreen}>Classification</Text>
          <Text style={[s.valueLg, { color: C.green }]}>
            {c.association_label}
          </Text>
        </View>
      </View>

      <View style={[s.divider, s.mb14]} />

      {/* Identity */}
      <View style={[s.row, s.mb16]}>
        <View style={{ width: 110 }}>
          <Text style={s.label}>MMSI</Text>
          <Text style={s.valueMono}>{c.mmsi}</Text>
        </View>
        <View style={{ width: 110 }}>
          <Text style={s.label}>IMO</Text>
          <Text style={s.valueMono}>{c.imo ?? "—"}</Text>
        </View>
        <View style={{ width: 110 }}>
          <Text style={s.label}>Call Sign</Text>
          <Text style={s.valueMono}>{c.callsign ?? "—"}</Text>
        </View>
      </View>

      {/* Evidence summary */}
      <View style={s.detailSectionTitle}>
        <Text>Evidence Summary</Text>
      </View>

      <Text style={s.explanation}>{interpretEvidence(c)}</Text>

      {/* Scoring breakdown — stable 3-column layout */}
      <View style={s.detailSectionTitle}>
        <Text>Scoring Breakdown</Text>
      </View>

      {(
        [
          ["intersection", c.intersection_score, SCORE_MAXIMA.intersection],
          ["proximity", c.proximity_score, SCORE_MAXIMA.proximity],
          ["temporal", c.temporal_score, SCORE_MAXIMA.temporal],
          ["alignment", c.alignment_score, SCORE_MAXIMA.alignment],
        ] as const
      ).map(([key, obtained, maximum]) => (
        <View key={key} style={s.scoreRow}>
          <Text style={s.scoreLabel}>{SCORE_LABELS[key]}</Text>
          <Text style={s.scoreValue}>
            {fmtComponent(obtained, maximum)}
          </Text>
          <View style={{ flex: 1 }}>
            <View style={s.barOuter}>
              <View
                style={barFillStyle(
                  obtained != null ? (obtained / maximum) * 100 : 0,
                  C.marine,
                )}
              />
            </View>
          </View>
        </View>
      ))}

      {/* Vessel facts */}
      <View style={s.detailSectionTitle}>
        <Text>Vessel Facts</Text>
      </View>

      <View style={[s.grid2, s.mb12]}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Distance to Slick</Text>
          <Text style={s.value}>
            {c.track_distance_to_slick_km != null
              ? fmtKm(c.track_distance_to_slick_km)
              : c.closest_AIS_distance_km != null
                ? fmtKm(c.closest_AIS_distance_km)
                : "—"}
          </Text>

          <Text style={s.label}>Time Before Acquisition</Text>
          <Text style={s.value}>{fmtHrs(c.hours_before_satellite)}</Text>

          <Text style={s.label}>Speed at Closest</Text>
          <Text style={s.value}>{fmtKnots(c.speed_at_closest_knots)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Course at Closest</Text>
          <Text style={s.value}>{fmtDeg(c.course_at_closest_deg)}</Text>

          <Text style={s.label}>Alignment Difference</Text>
          <Text style={s.value}>{fmtDeg(c.alignment_difference_deg)}</Text>

          <Text style={s.label}>AIS Points</Text>
          <Text style={s.value}>{fmtN(c.ais_points)}</Text>
        </View>
      </View>

      <View style={[s.grid3, s.mb8]}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Max Speed</Text>
          <Text style={s.value}>{fmtKnots(c.max_speed_knots)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Median Speed</Text>
          <Text style={s.value}>{fmtKnots(c.median_speed_knots)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Observation Window</Text>
          <Text style={s.value}>{fmtHrs(c.observation_hours)}</Text>
        </View>
      </View>

      <Footer page={page} />
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/*  Sources & disclaimer page                                         */
/* ------------------------------------------------------------------ */

function SourcesPage({ page }: { page: number }) {
  return (
    <Page size="A4" style={s.page}>
      <View style={[s.sectionTitle, s.mb16]}>
        <Text>Data Sources &amp; Provenance</Text>
      </View>

      <Text style={[s.value, s.mb12]}>
        This report was generated from structured investigation outputs
        produced by the SlickTrace processing pipeline. No live inference
        was performed during PDF generation.
      </Text>

      <View style={s.detailSectionTitle}>
        <Text>Primary Data Sources</Text>
      </View>

      {[
        "Sentinel-1A SAR satellite imagery \u2014 European Space Agency Copernicus programme",
        "NOAA / MarineCadastre historical AIS vessel movement data",
        "SlickTrace U-Net segmentation model output (best validation Dice checkpoint)",
        "Georeferenced predicted slick polygon (threshold 0.55)",
        "Reconstructed AIS vessel trajectories from validated investigation output",
      ].map((src) => (
        <View key={src} style={[s.row, s.mb6]}>
          <Text style={[s.cell, { width: 12, color: C.marine }]}>
            {"\u2022"}
          </Text>
          <Text style={[s.cell, { flex: 1 }]}>{src}</Text>
        </View>
      ))}

      <View style={[s.dividerStrong, s.my16]} />

      <View style={s.detailSectionTitle}>
        <Text>Processing Pipeline</Text>
      </View>

      <Text style={[s.value, s.mb12]}>
        Sentinel-1 SAR imagery {"\u2192"} Normalization {"\u2192"} U-Net
        segmentation {"\u2192"} Probability map {"\u2192"} Thresholding
        (0.55) {"\u2192"} Polygon extraction {"\u2192"} Historical AIS
        filtering (12 h lookback) {"\u2192"} Trajectory reconstruction {"\u2192"} Spatial + temporal + route correlation {"\u2192"} Ranked
        potential source candidates {"\u2192"} Analyst review
      </Text>

      <View style={[s.dividerStrong, s.my16]} />

      <View style={s.detailSectionTitle}>
        <Text>Disclaimer</Text>
      </View>

      <Text style={s.disclaimer}>
        Association scores rank potential source candidates based on
        available spatial, temporal, and trajectory evidence. They do not
        establish legal responsibility or prove that a vessel discharged
        oil. This report is produced by a prototype investigation system
        for analytical review purposes only. Results are derived from
        precomputed pipeline outputs and are replayed for demonstration
        reliability.
      </Text>

      <Text style={[s.disclaimer, { marginTop: 6 }]}>
        Model performance metrics reflect held-out test results on a
        validated prototype. Performance varies between satellite scenes
        and further dataset expansion is planned. The interface assists
        investigators rather than assigning guilt.
      </Text>

      <Footer page={page} />
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/*  Root document                                                     */
/* ------------------------------------------------------------------ */

interface ReportProps {
  investigation: Investigation;
  candidates: Candidate[];
}

export function InvestigationReport({
  investigation,
  candidates,
}: ReportProps) {
  const top5 = candidates.slice(0, 5);

  return (
    <Document
      author="SlickTrace"
      title={`Investigation Report \u2014 ${investigation.investigation_id}`}
      subject="Marine Spill Investigation \u2014 Potential Source Candidate Analysis"
      creator="SlickTrace Investigation Platform"
    >
      <CoverPage investigation={investigation} page={1} />
      <RankingTable candidates={top5} page={2} />
      {top5.map((c, i) => (
        <CandidatePage
          key={c.mmsi}
          candidate={c}
          index={i}
          total={top5.length}
          page={3 + i}
        />
      ))}
      <SourcesPage page={3 + top5.length} />
    </Document>
  );
}
