"use client";

import { useMemo } from "react";
import type {
  Investigation,
  SlickCollection,
  TrackCollection,
} from "@/lib/types";
import { formatRank, formatScore } from "@/lib/format";

interface Props {
  investigation: Investigation;
  slickMain: SlickCollection;
  slickSecondary: SlickCollection;
  tracks: TrackCollection;
  selectedRank: number | null;
  onSelect: (rank: number) => void;
}

const W = 960;
const MARGIN = 54;
const SCALE = 0.94;

const OCEAN = "#cfe3ee";
const SLICK_FILL = "#c9843a";
const SLICK_LINE = "#8a5a1e";
const SIGNAL = "#c5521f";
const TRACK_SELECTED = "#23252f";
const TRACK_MUTED = "#83899a";
const MARKER_MUTED = "#a7adbb";
const PAPER = "#f6f3ec";

// Keep the same near-slick radius used by the interactive framing so the
// static view shows the same geographic context.
const FOCUS_RADIUS_DEG = 0.4;

interface BBox {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
}

function dataBounds(
  slickMain: SlickCollection,
  slickSecondary: SlickCollection,
  tracks: TrackCollection,
): BBox {
  const b: BBox = {
    minLon: Infinity,
    maxLon: -Infinity,
    minLat: Infinity,
    maxLat: -Infinity,
  };
  const extend = ([lon, lat]: number[]) => {
    if (lon < b.minLon) b.minLon = lon;
    if (lon > b.maxLon) b.maxLon = lon;
    if (lat < b.minLat) b.minLat = lat;
    if (lat > b.maxLat) b.maxLat = lat;
  };
  slickMain.features.forEach((f) =>
    f.geometry.coordinates.forEach((ring) => ring.forEach(extend)),
  );
  for (const f of tracks.features) {
    const cxLon = f.properties.closest_approach_lon;
    const cxLat = f.properties.closest_approach_lat;
    extend([cxLon, cxLat]);
    f.geometry.coordinates.forEach(([lon, lat]) => {
      if (Math.abs(lat - cxLat) <= FOCUS_RADIUS_DEG && Math.abs(lon - cxLon) <= FOCUS_RADIUS_DEG) {
        extend([lon, lat]);
      }
    });
  }
  // Secondary regions are shown faintly; only include them if the main slick
  // alone would leave an absurdly tight frame.
  if (b.minLon === Infinity) {
    slickSecondary.features.forEach((f) =>
      f.geometry.coordinates.forEach((ring) => ring.forEach(extend)),
    );
  }
  return b;
}

function ringToPath(
  ring: number[][],
  tx: (lon: number) => number,
  ty: (lat: number) => number,
  step: number,
): string {
  let path = "";
  for (let i = 0; i < ring.length; i += step) {
    const [lon, lat] = ring[i];
    path += `${i === 0 ? "M" : "L"}${tx(lon).toFixed(1)},${ty(lat).toFixed(1)} `;
  }
  return `${path}Z`.trim();
}

function lineToPath(
  coords: number[][],
  tx: (lon: number) => number,
  ty: (lat: number) => number,
  step: number,
): string {
  let path = "";
  for (let i = 0; i < coords.length; i += step) {
    const [lon, lat] = coords[i];
    path += `${i === 0 ? "M" : "L"}${tx(lon).toFixed(1)},${ty(lat).toFixed(1)} `;
  }
  return path.trim();
}

export function InvestigationStaticMap({
  investigation,
  slickMain,
  slickSecondary,
  tracks,
  selectedRank,
  onSelect,
}: Props) {
  const { bbox, H, tx, ty } = useMemo(() => {
    const b = dataBounds(slickMain, slickSecondary, tracks);
    const spanLon = b.maxLon - b.minLon || 1e-9;
    const spanLat = b.maxLat - b.minLat || 1e-9;
    const midLon = (b.minLon + b.maxLon) / 2;
    const midLat = (b.minLat + b.maxLat) / 2;
    const k = Math.max(Math.cos((midLat * Math.PI) / 180), 1e-9);
    const aspectH = spanLat;
    const aspectW = spanLon * k;
    const H = Math.round(
      Math.min(760, Math.max(430, (W * aspectH) / aspectW || 1)),
    );
    const tx = (lon: number) =>
      (0.5 + (lon - midLon) / (spanLon / SCALE)) * (W - MARGIN * 2) + MARGIN;
    const ty = (lat: number) =>
      (0.5 - (lat - midLat) / (spanLat / SCALE)) * (H - MARGIN * 2) + MARGIN;
    return { bbox: b, H, tx, ty };
  }, [slickMain, slickSecondary, tracks]);

  const { mainPaths, secondaryPaths, trackPaths } = useMemo(() => {
      const mainFeatures = slickMain.features;
      const secondaryFeatures = slickSecondary.features;

      const mainPts = mainFeatures.reduce(
        (n, f) => n + f.geometry.coordinates.reduce((m, r) => m + r.length, 0),
        0,
      );
      const secPts = secondaryFeatures.reduce(
        (n, f) => n + f.geometry.coordinates.reduce((m, r) => m + r.length, 0),
        0,
      );
      const mainStep = Math.max(1, Math.floor(mainPts / 2600));
      const secondaryStep = Math.max(2, Math.floor(secPts / 1000));

      const mainPaths = mainFeatures.flatMap((f) =>
        f.geometry.coordinates.map((ring) => ringToPath(ring, tx, ty, mainStep)),
      );
      const secondaryPaths = secondaryFeatures.flatMap((f) =>
        f.geometry.coordinates.map((ring) => ringToPath(ring, tx, ty, secondaryStep)),
      );

      const trackFeatures = tracks.features;
      const ptsPerTrack = Math.max(
        1,
        Math.floor(Math.max(...trackFeatures.map((f) => f.geometry.coordinates.length).concat([1])) / 400),
      );
      const trackPaths = trackFeatures.map((f) => ({
        rank: f.properties.rank,
        name: f.properties.vessel_name,
        score: f.properties.association_score,
        cx: tx(f.properties.closest_approach_lon),
        cy: ty(f.properties.closest_approach_lat),
        d: lineToPath(f.geometry.coordinates, tx, ty, ptsPerTrack),
      }));

      return {
        mainPaths,
        secondaryPaths,
        trackPaths,
      };
    }, [slickMain, slickSecondary, tracks, tx, ty]);

  const centroid = slickMain.features[0]?.properties;
  const cx = centroid ? tx(centroid.centroid_lon) : W / 2;
  const cy = centroid ? ty(centroid.centroid_lat) : H / 2;

  const latN = Math.abs(bbox.maxLat).toFixed(3);
  const lonW = Math.abs(bbox.minLon).toFixed(3);

  const selected = trackPaths.find((t) => t.rank === selectedRank);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Investigation geometry — predicted slick and vessel tracks"
      className="block h-full w-full"
      style={{ background: OCEAN }}
    >
      <defs>
        <style>{`
          .ist-title { font-family: Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 600; fill: #23252f; }
          .ist-sub { font-family: 'Courier New', monospace; font-size: 11px; fill: #4c5566; }
          .ist-notice { font-family: Helvetica, Arial, sans-serif; font-size: 12px; fill: #4c5566; }
          .ist-corners { font-family: 'Courier New', monospace; font-size: 10px; fill: #62687a; }
          .ist-name { font-family: Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; fill: #23252f; }
          .ist-clickable { cursor: pointer; }
        `}</style>
      </defs>

      {/* Secondary detected regions — faint context */}
      {secondaryPaths.map((d, i) => (
        <path key={`sec-${i}`} d={d} fill={SLICK_FILL} fillOpacity={0.12} />
      ))}

      {/* Main slick */}
      {mainPaths.map((d, i) => (
        <path
          key={`main-${i}`}
          d={d}
          fill={SLICK_FILL}
          fillOpacity={0.42}
          stroke={SLICK_LINE}
          strokeOpacity={0.85}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      ))}

      {/* Muted vessel tracks (non-selected drawn first) */}
      {trackPaths
        .filter((t) => t.rank !== selectedRank)
        .map((t) => (
          <g key={`m-${t.rank}`} className="ist-clickable" data-rank={t.rank} onClick={() => onSelect(t.rank)}>
            <path d={t.d} fill="none" stroke="transparent" strokeWidth={12} />
            <path
              d={t.d}
              fill="none"
              stroke={TRACK_MUTED}
              strokeWidth={1.5}
              strokeOpacity={0.45}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>
        ))}

      {/* Muted closest-approach markers */}
      {trackPaths
        .filter((t) => t.rank !== selectedRank)
        .map((t) => (
          <g key={`cm-${t.rank}`} className="ist-clickable" data-rank={t.rank} onClick={() => onSelect(t.rank)}>
            <circle cx={t.cx} cy={t.cy} r={7} fill="transparent" />
            <circle cx={t.cx} cy={t.cy} r={4} fill={MARKER_MUTED} stroke={PAPER} strokeWidth={2} opacity={0.55} />
          </g>
        ))}

      {/* Selected vessel route — emphasized above everything */}
      {selected ? (
        <g
          className="ist-clickable"
          data-rank={selected.rank}
          onClick={() => onSelect(selected.rank)}
          role="button"
          aria-label={`${selected.name} track`}
        >
          <path d={selected.d} fill="none" stroke="transparent" strokeWidth={12} />
          <path d={selected.d} fill="none" stroke={TRACK_SELECTED} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={selected.cx} cy={selected.cy} r={13} fill={SIGNAL} opacity={0.18} />
          <circle cx={selected.cx} cy={selected.cy} r={7} fill={SIGNAL} stroke={PAPER} strokeWidth={2} />
          <text
            x={selected.cx + 12}
            y={selected.cy - 8}
            className="ist-name"
          >
            {formatRank(selected.rank)} {selected.name} · {formatScore(selected.score)}
          </text>
        </g>
      ) : null}

      {/* Slick centroid */}
      <circle cx={cx} cy={cy} r={5} fill={SLICK_LINE} stroke={PAPER} strokeWidth={1.5} />

      {/* Caption block */}
      <text x={MARGIN} y={34} className="ist-title">
        Investigation geometry
      </text>
      <text x={W - MARGIN} y={34} textAnchor="end" className="ist-sub">
        Predicted slick · {formatRank(trackPaths.length)} vessel routes
      </text>
      <text x={W - MARGIN} y={H - 30} textAnchor="end" className="ist-corners">
        {investigation.investigation_id}
      </text>
      <text x={W - MARGIN} y={H - 16} textAnchor="end" className="ist-corners">
        {latN}° N · {lonW}° W
      </text>
      <text x={W / 2} y={H - 16} textAnchor="middle" className="ist-notice">
        Interactive map unavailable in this browser. Showing verified static investigation geometry.
      </text>
    </svg>
  );
}