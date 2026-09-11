import type {
  Candidate,
  Investigation,
  SlickCollection,
  TrackCollection,
} from "./types";

export interface LoadedInvestigation {
  investigation: Investigation;
  slickMain: SlickCollection;
  slickSecondary: SlickCollection;
  tracks: TrackCollection;
  candidates: Candidate[];
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load ${url} (${res.status})`);
  }
  return (await res.json()) as T;
}

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

function validateInvestigation(v: Investigation): Investigation {
  assert(
    typeof v.investigation_id === "string" && v.investigation_id.length > 0,
    "investigation.json: missing investigation_id",
  );
  assert(typeof v.main_slick?.area_km2 === "number", "investigation.json: missing main_slick.area_km2");
  return v;
}

function validateSlick(v: SlickCollection): SlickCollection {
  assert(v.type === "FeatureCollection" && Array.isArray(v.features), "slick: not a FeatureCollection");
  assert(v.features.length > 0, "slick: empty feature set");
  return v;
}

function validateTracks(v: TrackCollection): TrackCollection {
  assert(v.type === "FeatureCollection" && Array.isArray(v.features), "tracks: not a FeatureCollection");
  assert(v.features.length === 5, `tracks: expected 5 tracks, got ${v.features.length}`);
  return v;
}

function validateCandidates(v: Candidate[]): Candidate[] {
  assert(Array.isArray(v) && v.length > 0, "candidates: empty list");
  return v;
}

export async function loadInvestigation(): Promise<LoadedInvestigation> {
  const [investigation, slick, tracks, candidatePayload] = await Promise.all([
    fetchJSON<Investigation>("/data/investigation.json"),
    fetchJSON<SlickCollection>("/data/slick_polygons.geojson"),
    fetchJSON<TrackCollection>("/data/vessel_tracks.geojson"),
    fetchJSON<{ candidates: Candidate[] }>("/data/candidates.json"),
  ]);

  validateInvestigation(investigation);
  validateSlick(slick);
  validateTracks(tracks);
  const candidates = validateCandidates(candidatePayload.candidates);

  const slickMain: SlickCollection = {
    type: "FeatureCollection",
    features: slick.features.filter((f) => f.properties.region_id === 1),
  };
  const slickSecondary: SlickCollection = {
    type: "FeatureCollection",
    features: slick.features.filter((f) => f.properties.region_id !== 1),
  };

  if (slickMain.features.length === 0) {
    throw new Error("slick: main region (region_id 1) not found");
  }

  return { investigation, slickMain, slickSecondary, tracks, candidates };
}