import type { ScoreComponentKey } from "./types";

/** Maximum attainable points per evidence component (documented in decisions.md). */
export const SCORE_MAXIMA: Record<ScoreComponentKey, number> = {
  intersection: 35,
  proximity: 30,
  temporal: 25,
  alignment: 10,
};

export const SCORE_LABELS: Record<ScoreComponentKey, string> = {
  intersection: "Track intersection",
  proximity: "Spatial proximity",
  temporal: "Temporal relevance",
  alignment: "Route alignment",
};

export const SCORE_DESCRIPTIONS: Record<ScoreComponentKey, string> = {
  intersection:
    "The reconstructed AIS trajectory enters the detected slick region.",
  proximity: "Minimum distance between the reconstructed trajectory and the detected slick.",
  temporal: "Temporal gap between closest approach and satellite acquisition (spatially gated).",
  alignment: "Vessel course alignment with the main slick orientation.",
};

export const AIS_LOOKBACK_HOURS = 12;

export const COMPONENT_ORDER: ScoreComponentKey[] = [
  "intersection",
  "proximity",
  "temporal",
  "alignment",
];

export const INVESTIGATION_ID = "SLICKTRACE-DEMO-20180926";
export const INVESTIGATION_REGION = "Gulf of Mexico";

/** Readability floor — never smaller than this, per the design gate. */
export const MIN_LABEL_SIZE_PX = 12;

export const MAP_LAYER_IDS = {
  basemap: "basemap",
  slickSecondary: "slick-secondary",
  slickMainFill: "slick-main-fill",
  slickMainOutline: "slick-main-outline",
  trackCasing: "track-casing",
  tracks: "tracks",
  closestHalo: "closest-approach-halo",
  closestPoint: "closest-approach-point",
  centroid: "slick-centroid",
} as const;

export const MAP_SOURCE_IDS = {
  basemap: "basemap",
  slick: "slick",
  tracks: "tracks",
  closestApproach: "closest-approach",
  centroid: "centroid",
} as const;