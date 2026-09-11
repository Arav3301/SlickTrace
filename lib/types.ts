export type AssociationLabel =
  | "Strong association"
  | "Moderate association"
  | "Possible association";

export interface MainSlick {
  area_km2: number;
  centroid_lat: number;
  centroid_lon: number;
}

export interface ModelMetrics {
  dice: number;
  iou: number;
  precision: number;
  recall: number;
  specificity: number;
}

export interface Investigation {
  investigation_id: string;
  satellite: string;
  scene_date: string;
  satellite_time_utc: string;
  model: string;
  threshold: number;
  main_slick: MainSlick;
  model_metrics: ModelMetrics;
  candidate_count: number;
  disclaimer: string;
}

export interface ScoreComponents {
  intersection: number | null;
  proximity: number | null;
  temporal: number | null;
  alignment: number | null;
}

export interface Candidate {
  candidate_rank: number;
  evidence_rank: number;
  mmsi: string;
  imo: string | null;
  callsign: string | null;
  vessel_name: string;
  vessel_type: number | null;
  track_intersects_slick: boolean;
  track_distance_to_slick_km: number | null;
  closest_AIS_distance_km: number | null;
  closest_approach_time: string | null;
  hours_before_satellite: number | null;
  speed_at_closest_knots: number | null;
  course_at_closest_deg: number | null;
  points_inside_slick: number | null;
  first_inside_time: string | null;
  last_inside_time: string | null;
  hours_before_first_inside: number | null;
  hours_before_last_inside: number | null;
  median_speed_knots: number | null;
  max_speed_knots: number | null;
  ais_points: number | null;
  first_seen: string | null;
  last_seen: string | null;
  observation_hours: number | null;
  alignment_difference_deg: number | null;
  intersection_score: number | null;
  proximity_score: number | null;
  temporal_score: number | null;
  alignment_score: number | null;
  association_score: number | null;
  association_label: string;
}

export type ScoreComponentKey = keyof ScoreComponents;

/* ---- GeoJSON shapes (matched to the real demo files) ---- */

export interface SlickProperties {
  area_km2: number;
  centroid_lat: number;
  centroid_lon: number;
  region_id: number;
}

export interface SlickFeature {
  type: "Feature";
  properties: SlickProperties;
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

export interface SlickCollection {
  type: "FeatureCollection";
  features: SlickFeature[];
}

export interface TrackProperties {
  rank: number;
  vessel_name: string;
  mmsi: number;
  association_score: number;
  association_label: string;
  track_intersects_slick: boolean;
  distance_to_slick_km: number;
  hours_before_satellite: number;
  course_deg: number;
  alignment_difference_deg: number;
  closest_approach_lat: number;
  closest_approach_lon: number;
}

export interface TrackFeature {
  type: "Feature";
  properties: TrackProperties;
  geometry: {
    type: "LineString";
    coordinates: number[][];
  };
}

export interface TrackCollection {
  type: "FeatureCollection";
  features: TrackFeature[];
}