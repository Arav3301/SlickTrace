"use client";

import { useEffect, useRef, useState } from "react";
import type {
  Map as MapLibreMap,
  Popup as MapLibrePopup,
} from "maplibre-gl";
import type * as Maplibre from "maplibre-gl";
import type { FeatureCollection, LineString, Point, Polygon } from "geojson";
import type {
  Investigation,
  SlickCollection,
  TrackCollection,
} from "@/lib/types";
import { MAP_LAYER_IDS, MAP_SOURCE_IDS } from "@/lib/constants";
import { formatCoordDecimal, formatScore } from "@/lib/format";
import { supportsWebGL2 } from "@/lib/map-support";
import { InvestigationStaticMap } from "./InvestigationStaticMap";

interface MapCanvasProps {
  investigation: Investigation;
  slickMain: SlickCollection;
  slickSecondary: SlickCollection;
  tracks: TrackCollection;
  selectedRank: number | null;
  onSelect: (rank: number) => void;
}

type ToggleId = "slick" | "secondary" | "tracks";

const TOGGLES: { id: ToggleId; label: string }[] = [
  { id: "slick", label: "Main slick" },
  { id: "secondary", label: "Detected regions" },
  { id: "tracks", label: "Vessel tracks" },
];

const BASEMAP_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

// Focus distance (degrees) from each vessel's closest-approach marker used to
// include nearby AIS track points in the initial framing bounds. A generous
// radius ensures the full near-slick trajectory arc is visible.
const FOCUS_RADIUS_DEG = 0.4;

const TRACK_SELECTED_COLOR = "#23252f";
const TRACK_MUTED_COLOR = "#83899a";
const SLICK_FILL = "#c9843a";
const SLICK_LINE = "#8a5a1e";
const SIGNAL = "#c5521f";
const MARKER_MUTED = "#a7adbb";

function framingBounds(
  ml: typeof Maplibre,
  slickMain: SlickCollection,
  tracks: TrackCollection,
): Maplibre.LngLatBounds {
  const bounds = new ml.LngLatBounds();
  // The slick region drives the sympathetic framing: everything shown must be
  // interpretable relative to it, so start from its true extent.
  slickMain.features.forEach((f) =>
    f.geometry.coordinates.forEach((ring) => ring.forEach(([lon, lat]) => bounds.extend([lon, lat]))),
  );
  // Each candidate contributes its closest-approach marker plus the portion of
  // its AIS trace that is geographically near the slick. Detached far-field
  // sailing points are left out so the relevant interaction stays large.
  tracks.features.forEach((f) => {
    const cxLat = f.properties.closest_approach_lat;
    const cxLon = f.properties.closest_approach_lon;
    bounds.extend([cxLon, cxLat]);
    f.geometry.coordinates.forEach(([lon, lat]) => {
      const dLat = Math.abs(lat - cxLat);
      const dLon = Math.abs(lon - cxLon);
      if (dLat <= FOCUS_RADIUS_DEG && dLon <= FOCUS_RADIUS_DEG) {
        bounds.extend([lon, lat]);
      }
    });
  });
  return bounds;
}

const FOCUS_PADDING = 120;
const FOCUS_MAX_ZOOM = 11;
const FOCUS_DURATION = 1000;

export function MapCanvas({
  investigation,
  slickMain,
  slickSecondary,
  tracks,
  selectedRank,
  onSelect,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const mlRef = useRef<typeof Maplibre | null>(null);
  const popupRef = useRef<MapLibrePopup | null>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const tracksRef = useRef<TrackCollection>(tracks);
  const didInitFocusRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [fallbackActive, setFallbackActive] = useState(false);
  const [visible, setVisible] = useState<Record<ToggleId, boolean>>({
    slick: true,
    secondary: false,
    tracks: true,
  });

  // keep the latest track snapshot in a ref (effect-safe)
  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  const closePopup = () => {
    popupRef.current?.remove();
    popupRef.current = null;
  };

  useEffect(() => {
    let disposed = false;
    let map: MapLibreMap | null = null;

    async function mount() {
      if (!containerRef.current || disposed) return;
      // Fast-path: fail before MapLibre ever touches a GPU context. Static
      // SVG fallback is rendered instead — no WebGL2 error can escape.
      if (!supportsWebGL2()) {
        setFallbackActive(true);
        return;
      }

      try {
        const ml = await import("maplibre-gl");
        mlRef.current = ml;
        // maplibre resolves its worker relative to import.meta.url, which is not
        // http(s) under a bundler — its internal fallback produces an empty URL
        // and the GeoJSON worker pipeline silently dies (raster tiles still
        // render, but nothing data-driven ever loads). Serve the worker from the
        // public dir instead so sources are processed.
        const setWorkerUrl = (ml as { setWorkerUrl?: (url: string) => void }).setWorkerUrl;
        if (setWorkerUrl) setWorkerUrl("/maplibre-gl-worker.mjs");
        // React StrictMode mounts effects twice in development: the first
        // cleanup runs before the dynamic import resolves, so without this
        // guard the first mount would create a map that its cleanup can never
        // remove — leaving two map instances (and two canvases) on one container.
        if (disposed || !containerRef.current) return;

        map = new ml.Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {
            [MAP_SOURCE_IDS.basemap]: {
              type: "raster",
              tiles: [BASEMAP_TILES],
              tileSize: 256,
              maxzoom: 19,
              attribution: "© OpenStreetMap contributors",
            },
          },
          layers: [
            {
              id: MAP_LAYER_IDS.basemap,
              type: "background",
              paint: { "background-color": "#cfe3ee" },
            },
            {
              id: "basemap-raster",
              type: "raster",
              source: MAP_SOURCE_IDS.basemap,
              paint: {
                "raster-opacity": 0.9,
                "raster-saturation": -0.45,
                "raster-contrast": -0.08,
              },
            },
          ],
        },
        center: [-89.022854, 28.905266],
        zoom: 10.5,
        // Explicitly interactive — drag pan, wheel zoom, double-click zoom,
        // keyboard and touch gestures must stay enabled on supported browsers.
        interactive: true,
        dragPan: true,
        scrollZoom: true,
        doubleClickZoom: true,
        keyboard: true,
        touchZoomRotate: true,
        attributionControl: false,
      });
      mapRef.current = map;

      const slickMainData = slickMain as unknown as FeatureCollection<Polygon>;
      const slickSecondaryData = slickSecondary as unknown as FeatureCollection<Polygon>;
      const tracksData = tracks as unknown as FeatureCollection<LineString>;

      const closestData: FeatureCollection<Point> = {
        type: "FeatureCollection",
        features: tracks.features.map((f) => ({
          type: "Feature",
          properties: {
            rank: f.properties.rank,
            vessel_name: f.properties.vessel_name,
          },
          geometry: {
            type: "Point",
            coordinates: [f.properties.closest_approach_lon, f.properties.closest_approach_lat],
          },
        })),
      };

      const centroidData: FeatureCollection<Point> = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Point",
              coordinates: [
                investigation.main_slick.centroid_lon,
                investigation.main_slick.centroid_lat,
              ],
            },
          },
        ],
      };

      map.addControl(
        new ml.NavigationControl({ visualizePitch: false, showZoom: true, showCompass: false }),
        "top-right",
      );
      map.addControl(new ml.AttributionControl({ compact: true }), "bottom-right");
      map.addControl(new ml.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-left");

      map.on("load", () => {
        if (disposed || !map || !ml) return;

        map.addSource(MAP_SOURCE_IDS.slick, { type: "geojson", data: slickMainData });
        map.addSource("slick-secondary", { type: "geojson", data: slickSecondaryData });
        map.addSource(MAP_SOURCE_IDS.tracks, { type: "geojson", data: tracksData });
        map.addSource(MAP_SOURCE_IDS.closestApproach, { type: "geojson", data: closestData });
        map.addSource(MAP_SOURCE_IDS.centroid, { type: "geojson", data: centroidData });

        // Secondary detected regions — faint, additive context
        map.addLayer({
          id: MAP_LAYER_IDS.slickSecondary,
          type: "fill",
          source: "slick-secondary",
          paint: { "fill-color": "#c9843a", "fill-opacity": 0.12 },
        });

        // Main predicted slick
        map.addLayer({
          id: MAP_LAYER_IDS.slickMainFill,
          type: "fill",
          source: MAP_SOURCE_IDS.slick,
          paint: { "fill-color": SLICK_FILL, "fill-opacity": 0.42 },
        });
        map.addLayer({
          id: MAP_LAYER_IDS.slickMainOutline,
          type: "line",
          source: MAP_SOURCE_IDS.slick,
          paint: { "line-color": SLICK_LINE, "line-width": 1.4, "line-opacity": 0.85 },
        });

        // Track casing (subtle highlight under the selected route)
        map.addLayer({
          id: MAP_LAYER_IDS.trackCasing,
          type: "line",
          source: MAP_SOURCE_IDS.tracks,
          paint: {
            "line-color": "#f6f3ec",
            "line-width": ["case", ["==", ["get", "rank"], selectedRank ?? -1], 5, 0],
            "line-opacity": 0.7,
          },
        });

        // Vessel tracks
        map.addLayer({
          id: MAP_LAYER_IDS.tracks,
          type: "line",
          source: MAP_SOURCE_IDS.tracks,
          paint: {
            "line-color": ["case", ["==", ["get", "rank"], selectedRank ?? -1], TRACK_SELECTED_COLOR, TRACK_MUTED_COLOR],
            "line-width": ["case", ["==", ["get", "rank"], selectedRank ?? -1], 2.6, 1.2],
            "line-opacity": ["case", ["==", ["get", "rank"], selectedRank ?? -1], 1, 0.45],
          },
        });

        // Closest-approach markers
        map.addLayer({
          id: MAP_LAYER_IDS.closestHalo,
          type: "circle",
          source: MAP_SOURCE_IDS.closestApproach,
          paint: {
            "circle-radius": ["case", ["==", ["get", "rank"], selectedRank ?? -1], 13, 6],
            "circle-color": SIGNAL,
            "circle-opacity": ["case", ["==", ["get", "rank"], selectedRank ?? -1], 0.18, 0],
            "circle-stroke-width": 0,
          },
        });
        map.addLayer({
          id: MAP_LAYER_IDS.closestPoint,
          type: "circle",
          source: MAP_SOURCE_IDS.closestApproach,
          paint: {
            "circle-radius": ["case", ["==", ["get", "rank"], selectedRank ?? -1], 7, 4],
            "circle-color": ["case", ["==", ["get", "rank"], selectedRank ?? -1], SIGNAL, MARKER_MUTED],
            "circle-stroke-color": "#f6f3ec",
            "circle-stroke-width": 2,
            "circle-opacity": ["case", ["==", ["get", "rank"], selectedRank ?? -1], 1, 0.55],
          },
        });

        // Slick centroid
        map.addLayer({
          id: MAP_LAYER_IDS.centroid,
          type: "circle",
          source: MAP_SOURCE_IDS.centroid,
          paint: {
            "circle-radius": 5,
            "circle-color": SLICK_LINE,
            "circle-stroke-color": "#f6f3ec",
            "circle-stroke-width": 1.5,
          },
        });

        map.setLayoutProperty(MAP_LAYER_IDS.slickSecondary, "visibility", "none");

        // Initial view: fitted to the slick and each candidate's near-slick
        // approach segment so the spatial relationship is clear on first load.
        const bounds = framingBounds(ml, slickMain, tracks);
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, {
            padding: FOCUS_PADDING,
            maxZoom: FOCUS_MAX_ZOOM,
            duration: FOCUS_DURATION,
          });
        }

        // Track click → select candidate
        map.on("click", MAP_LAYER_IDS.tracks, (e) => {
          const feature = e.features?.[0];
          const rank = feature?.properties?.rank;
          if (typeof rank === "number") {
            onSelect(rank);
            closePopup();
            const name = String(feature?.properties?.vessel_name ?? "");
            const popup = new ml!
              .Popup({ closeButton: false, closeOnClick: true, offset: 12 })
              .setLngLat(e.lngLat)
              .setHTML(
                `<strong>${name}</strong><br/>Rank #${String(rank).padStart(2, "0")} · ${formatScore(
                  tracksRef.current.features.find((t) => t.properties.rank === rank)?.properties.association_score,
                )} association`,
              )
              .addTo(map!);
            popupRef.current = popup;
          }
        });

        // Slick click → context
        map.on("click", MAP_LAYER_IDS.slickMainFill, (e) => {
          const area = e.features?.[0]?.properties?.area_km2;
          const areaText = typeof area === "number" ? ` · ${area.toFixed(2)} km²` : "";
          closePopup();
          const popup = new ml!
            .Popup({ closeButton: false, closeOnClick: true, offset: 12 })
            .setLngLat(e.lngLat)
            .setHTML(`<strong>Predicted slick</strong><br/>Model output${areaText}`)
            .addTo(map!);
          popupRef.current = popup;
        });

        map.on("mouseenter", MAP_LAYER_IDS.tracks, () => {
          map!.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", MAP_LAYER_IDS.tracks, () => {
          map!.getCanvas().style.cursor = "";
        });
        map.on("mousemove", (e) => {
          if (readoutRef.current) {
            readoutRef.current.textContent = formatCoordDecimal(e.lngLat.lat, e.lngLat.lng);
          }
        });

        setReady(true);
        if (typeof window !== "undefined") {
          (window as unknown as Record<string, unknown>).__slicktraceMap = map;
        }
      });
      } catch {
        // Construction or import failed (e.g. a browser that reports WebGL2 but
        // still fails GPU initialisation). Remove any partial map, drop the
        // import reference and render the verified static geometry instead.
        if (map) {
          try {
            map.remove();
          } catch {
            // ignore cleanup failures on a partial map
          }
        }
        map = null;
        mapRef.current = null;
        mlRef.current = null;
        if (!disposed) setFallbackActive(true);
      }
    }

    void mount();

    return () => {
      disposed = true;
      closePopup();
      try {
        map?.remove();
      } catch {
        // ignore — partially initialised map removed on the error path
      }
      mapRef.current = null;
      mlRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-apply selection paint + focus whenever selection changes
  useEffect(() => {
    const map = mapRef.current;
    const ml = mlRef.current;
    if (!map || !ml || !ready) return;
    const rank = selectedRank ?? -1;

    map.setPaintProperty(MAP_LAYER_IDS.tracks, "line-color", [
      "case",
      ["==", ["get", "rank"], rank],
      TRACK_SELECTED_COLOR,
      TRACK_MUTED_COLOR,
    ]);
    map.setPaintProperty(MAP_LAYER_IDS.tracks, "line-width", [
      "case",
      ["==", ["get", "rank"], rank],
      2.6,
      1.2,
    ]);
    map.setPaintProperty(MAP_LAYER_IDS.tracks, "line-opacity", [
      "case",
      ["==", ["get", "rank"], rank],
      1,
      0.45,
    ]);
    map.setPaintProperty(MAP_LAYER_IDS.trackCasing, "line-width", [
      "case",
      ["==", ["get", "rank"], rank],
      5,
      0,
    ]);
    map.setPaintProperty(MAP_LAYER_IDS.closestHalo, "circle-radius", [
      "case",
      ["==", ["get", "rank"], rank],
      13,
      6,
    ]);
    map.setPaintProperty(MAP_LAYER_IDS.closestHalo, "circle-opacity", [
      "case",
      ["==", ["get", "rank"], rank],
      0.18,
      0,
    ]);
    map.setPaintProperty(MAP_LAYER_IDS.closestPoint, "circle-radius", [
      "case",
      ["==", ["get", "rank"], rank],
      7,
      4,
    ]);
    map.setPaintProperty(MAP_LAYER_IDS.closestPoint, "circle-color", [
      "case",
      ["==", ["get", "rank"], rank],
      SIGNAL,
      MARKER_MUTED,
    ]);
    map.setPaintProperty(MAP_LAYER_IDS.closestPoint, "circle-opacity", [
      "case",
      ["==", ["get", "rank"], rank],
      1,
      0.55,
    ]);

    // Focus the selected route without zooming too tightly
    // (the initial fit is handled once on map load)
    if (selectedRank !== null && !didInitFocusRef.current) {
      didInitFocusRef.current = true;
    } else if (selectedRank !== null) {
      const feature = tracksRef.current.features.find((f) => f.properties.rank === selectedRank);
      if (feature) {
        const bounds = new ml.LngLatBounds();
        slickMain.features.forEach((f) =>
          f.geometry.coordinates.forEach((ring) => ring.forEach(([lon, lat]) => bounds.extend([lon, lat]))),
        );
        feature.geometry.coordinates.forEach(([lon, lat]) => bounds.extend([lon, lat]));
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, { padding: FOCUS_PADDING, maxZoom: 10, duration: 1400 });
        }
      }
    }
  }, [selectedRank, ready, slickMain]);

  // Keep map sized
  // Keep map sized — observe the container so the canvas fills its full height
  // even though layout (flex heights) settles *after* the map initialises.
  useEffect(() => {
    const map = mapRef.current;
    const node = containerRef.current;
    if (!map || !node) return;
    const onResize = () => map.resize();
    map.resize();
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(() => onResize());
    ro.observe(node);
    // settle after layout animations complete
    const t = window.setTimeout(onResize, 500);
    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, [ready]);

  // Layer visibility toggles
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const setVis = (id: string, on: boolean) =>
      map.setLayoutProperty(id, "visibility", on ? "visible" : "none");
    setVis(MAP_LAYER_IDS.slickMainFill, visible.slick);
    setVis(MAP_LAYER_IDS.slickMainOutline, visible.slick);
    setVis(MAP_LAYER_IDS.slickSecondary, visible.secondary);
    setVis(MAP_LAYER_IDS.tracks, visible.tracks);
    setVis(MAP_LAYER_IDS.trackCasing, visible.tracks);
    setVis(MAP_LAYER_IDS.closestPoint, visible.tracks);
    setVis(MAP_LAYER_IDS.closestHalo, visible.tracks);
  }, [visible, ready]);

  if (fallbackActive) {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <InvestigationStaticMap
          investigation={investigation}
          slickMain={slickMain}
          slickSecondary={slickSecondary}
          tracks={tracks}
          selectedRank={selectedRank}
          onSelect={onSelect}
        />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#cfe3ee]">
      {/* Layer controls */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5 border border-line bg-paper/90 px-3 py-2.5">
        {TOGGLES.map((t) => (
          <label
            key={t.id}
            className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink-2"
          >
            <input
              type="checkbox"
              checked={visible[t.id]}
              onChange={() => setVisible((v) => ({ ...v, [t.id]: !v[t.id] }))}
              className="h-3.5 w-3.5 accent-[#37586e]"
            />
            {t.label}
          </label>
        ))}
        <button
          type="button"
          onClick={() => {
            const map = mapRef.current;
            const ml = mlRef.current;
            if (!map || !ml) return;
            const bounds = framingBounds(ml, slickMain, tracksRef.current);
            if (!bounds.isEmpty()) {
              map.fitBounds(bounds, {
                padding: FOCUS_PADDING,
                maxZoom: FOCUS_MAX_ZOOM,
                duration: 1200,
              });
            }
          }}
          className="mt-1 border-t border-line pt-2 text-left text-[12.5px] font-medium text-marine hover:text-ink"
        >
          Reset view
        </button>
      </div>

      {/* Coordinate readout */}
      <div className="pointer-events-none absolute bottom-2 left-4 z-10 font-mono text-[12px] text-ink-2">
        <span ref={readoutRef} className="border border-line-strong bg-paper px-2.5 py-1.5 shadow-sm">
          …
        </span>
      </div>

      <div
        ref={containerRef}
        className="relative h-full w-full"
        aria-label="Investigation map"
      />
    </div>
  );
}