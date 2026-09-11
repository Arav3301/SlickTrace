"use client";

import { useMemo } from "react";
import type { SlickFeature } from "@/lib/types";

interface Props {
  slick: { features: SlickFeature[] };
  /** Optional status line shown under the title when the live map is unavailable. */
  notice?: string;
}

const W = 720;
const H = 440;
const MARGIN = 46;
const SCALE = 0.86; // frame the slick to ~68% of the short axis, matching the interactive map

interface BBox {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
}

function featureBounds(features: SlickFeature[]): BBox {
  const b: BBox = {
    minLon: Infinity,
    maxLon: -Infinity,
    minLat: Infinity,
    maxLat: -Infinity,
  };
  for (const f of features) {
    for (const ring of f.geometry.coordinates) {
      for (const [lon, lat] of ring) {
        if (lon < b.minLon) b.minLon = lon;
        if (lon > b.maxLon) b.maxLon = lon;
        if (lat < b.minLat) b.minLat = lat;
        if (lat > b.maxLat) b.maxLat = lat;
      }
    }
  }
  return b;
}

/** Build an SVG path for a feature ring (downsampled for print weight). */
function ringToPath(
  ring: number[][],
  tx: (lon: number) => number,
  ty: (lat: number) => number,
  step: number,
): string {
  let path = "";
  for (let i = 0; i < ring.length; i += step) {
    const [lon, lat] = ring[i];
    const x = tx(lon);
    const y = ty(lat);
    path += `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)} `;
  }
  return `${path}Z`.trim();
}

export function SlickFigure({ slick, notice }: Props) {
  const { mainFeatures, secondaryFeatures } = useMemo(() => {
    const main = slick.features.filter((f) => f.properties.region_id === 1);
    const secondary = slick.features.filter((f) => f.properties.region_id !== 1);
    return { mainFeatures: main, secondaryFeatures: secondary };
  }, [slick]);

  const mainBbox = useMemo(() => featureBounds(mainFeatures), [mainFeatures]);

  const spanLon = mainBbox.maxLon - mainBbox.minLon || 1e-9;
  const spanLat = mainBbox.maxLat - mainBbox.minLat || 1e-9;
  const midLon = (mainBbox.minLon + mainBbox.maxLon) / 2;
  const midLat = (mainBbox.minLat + mainBbox.maxLat) / 2;

  const tx = (lon: number) =>
    ((lon - midLon) / (spanLon / SCALE) + 0.5) * (W - MARGIN * 2) + MARGIN;
  const ty = (lat: number) =>
    (0.5 - (lat - midLat) / (spanLat / SCALE)) * (H - MARGIN * 2) + MARGIN;

  // Downsample dense rasterised outlines so the figure stays light in print.
  const mainPts = mainFeatures.reduce(
    (n, f) => n + f.geometry.coordinates.reduce((m, r) => m + r.length, 0),
    0,
  );
  const secPts = secondaryFeatures.reduce(
    (n, f) => n + f.geometry.coordinates.reduce((m, r) => m + r.length, 0),
    0,
  );
  const mainStep = Math.max(1, Math.floor(mainPts / 3200));
  const secStep = Math.max(2, Math.floor(secPts / 1200));

  const mainPaths = mainFeatures.flatMap((f) =>
    f.geometry.coordinates.map((ring) => ringToPath(ring, tx, ty, mainStep)),
  );
  const secondaryPaths = secondaryFeatures.flatMap((f) =>
    f.geometry.coordinates.map((ring) => ringToPath(ring, tx, ty, secStep)),
  );

  const centroid = mainFeatures[0]?.properties;
  const cx = centroid ? tx(centroid.centroid_lon) : W / 2;
  const cy = centroid ? ty(centroid.centroid_lat) : H / 2;

  const areaKm2 = centroid ? Number(centroid.area_km2) : NaN;
  const areaText = Number.isFinite(areaKm2) ? `${areaKm2.toFixed(2)} km²` : "";
  const centroidLat = centroid ? Math.abs(centroid.centroid_lat).toFixed(4) : "";
  const centroidLon = centroid ? Math.abs(centroid.centroid_lon).toFixed(4) : "";

  const latN = Math.abs(mainBbox.maxLat).toFixed(3);
  const lonW = Math.abs(mainBbox.minLon).toFixed(3);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Predicted slick geometry from the SlickTrace U-Net output"
      className="block h-auto w-full"
      style={{ background: "#f3f0e8" }}
    >
      <defs>
        <style>{`
          .fig-title { font-family: Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 600; fill: #23252f; }
          .fig-notice { font-family: Helvetica, Arial, sans-serif; font-size: 11px; fill: #62687a; }
          .fig-sub { font-family: 'Courier New', monospace; font-size: 11px; fill: #62687a; }
          .fig-corners { font-family: 'Courier New', monospace; font-size: 10px; fill: #8d93a3; }
          .fig-anno { font-family: 'Courier New', monospace; font-size: 11px; fill: #3a3e4c; }
        `}</style>
      </defs>

      {/* Centroid marker */}
      <circle cx={cx} cy={cy} r={11} fill="#c9843a" opacity={0.25} />
      <circle cx={cx} cy={cy} r={5} fill="#c5521f" stroke="#ffffff" strokeWidth={1.5} />

      {/* Labels */}
      <text x={MARGIN} y={34} className="fig-title">
        Predicted slick geometry
      </text>
      {notice ? (
        <text x={MARGIN} y={54} className="fig-notice">
          {notice}
        </text>
      ) : null}
      <text x={W - MARGIN} y={34} textAnchor="end" className="fig-sub">
        U-Net output · threshold 0.55
      </text>
      <text x={MARGIN} y={H - 28} className="fig-anno">
        Main slick {areaText}
      </text>
      <text x={MARGIN} y={H - 14} className="fig-anno">
        Centroid {centroidLat}° N · {centroidLon}° W
      </text>
      <text x={W - MARGIN} y={H - 14} textAnchor="end" className="fig-corners">
        {latN}° N · {lonW}° W
      </text>

      {/* Secondary regions first (behind) */}
      {secondaryPaths.map((d, i) => (
        <path key={`s${i}`} d={d} fill="#c9a05c" fillOpacity={0.3} />
      ))}

      {/* Main slick */}
      {mainPaths.map((d, i) => (
        <path
          key={`m${i}`}
          d={d}
          fill="#c9843a"
          fillOpacity={0.6}
          stroke="#8a5a1e"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}