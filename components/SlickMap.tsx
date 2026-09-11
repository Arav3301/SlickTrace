"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MlMap } from "maplibre-gl";
import type { SlickCollection } from "@/lib/types";
import { supportsWebGL2 } from "@/lib/map-support";
import { SlickFigure } from "./SlickFigure";

interface Props {
  slick: SlickCollection;
  height?: number;
}

function mainSlickBounds(slick: SlickCollection) {
  const [main] = slick.features.filter(
    (f) => f.properties.region_id === 1,
  );
  const bbox = {
    minLon: Infinity,
    maxLon: -Infinity,
    minLat: Infinity,
    maxLat: -Infinity,
  };
  if (main) {
    for (const ring of main.geometry.coordinates) {
      for (const [lon, lat] of ring) {
        if (lon < bbox.minLon) bbox.minLon = lon;
        if (lon > bbox.maxLon) bbox.maxLon = lon;
        if (lat < bbox.minLat) bbox.minLat = lat;
        if (lat > bbox.maxLat) bbox.maxLat = lat;
      }
    }
  } else {
    for (const f of slick.features) {
      for (const ring of f.geometry.coordinates) {
        for (const [lon, lat] of ring) {
          if (lon < bbox.minLon) bbox.minLon = lon;
          if (lon > bbox.maxLon) bbox.maxLon = lon;
          if (lat < bbox.minLat) bbox.minLat = lat;
          if (lat > bbox.maxLat) bbox.maxLat = lat;
        }
      }
    }
  }
  return bbox;
}

export function SlickMap({ slick, height = 420 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const [fallbackActive, setFallbackActive] = useState(false);

  useEffect(() => {
    let disposed = false;
    let map: MlMap | null = null;
    let settleTimer: number | null = null;

    async function init() {
      // 1. Fast-path: fail before MapLibre ever touches a GPU context.
      if (!supportsWebGL2()) {
        setFallbackActive(true);
        return;
      }

      // 2. Guarded initialisation — capture constructor and import failures.
      try {
        const ml = await import("maplibre-gl");
        // maplibre resolves its worker relative to import.meta.url, which is not
        // http(s) under a bundler — its internal fallback produces an empty URL
        // and the GeoJSON worker pipeline silently dies (raster tiles still
        // render, but nothing data-driven ever loads). Serve the worker from the
        // public dir instead so sources are processed.
        const setWorkerUrl = (ml as { setWorkerUrl?: (url: string) => void }).setWorkerUrl;
        if (setWorkerUrl) setWorkerUrl("/maplibre-gl-worker.mjs");
        if (disposed || !containerRef.current) return;

        map = new ml.Map({
          container: containerRef.current,
          style: {
            version: 8,
            sources: {
              osm: {
                type: "raster",
                tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                tileSize: 256,
                attribution: "\u00a9 OpenStreetMap contributors",
              },
            },
            layers: [
              { id: "ground", type: "background", paint: { "background-color": "#e9edf0" } },
              {
                id: "osm",
                type: "raster",
                source: "osm",
                paint: { "raster-opacity": 0.7 },
              },
            ],
          },
          // Fully interactive on supported browsers — pan, wheel zoom, tap zoom,
          // double-click zoom and keyboard navigation all stay enabled. The
          // static SVG figure is used only when WebGL2 is unavailable.
          interactive: true,
          dragPan: true,
          scrollZoom: true,
          doubleClickZoom: true,
          keyboard: true,
          touchZoomRotate: true,
          attributionControl: false,
          center: [-89.021, 28.907],
          zoom: 12.5,
        });
        mapRef.current = map;

        map.addControl(
          new ml.NavigationControl({ visualizePitch: false, showZoom: true, showCompass: false }),
          "top-right",
        );

        const geojson: Parameters<typeof map.addSource>[1] = {
          type: "geojson",
          data: slick,
        };

        map.on("load", () => {
          if (disposed) return;

          map?.addSource("slick", geojson);

          // Secondary detected regions — faint, subordinate
          map?.addLayer({
            id: "slick-secondary",
            type: "fill",
            source: "slick",
            filter: ["!=", ["get", "region_id"], 1],
            paint: {
              "fill-color": "#c9a05c",
              "fill-opacity": 0.25,
            },
          });

          // Main slick — dominant amber
          map?.addLayer({
            id: "slick-main-fill",
            type: "fill",
            source: "slick",
            filter: ["==", ["get", "region_id"], 1],
            paint: {
              "fill-color": "#c9843a",
              "fill-opacity": 0.55,
            },
          });

          // Main slick outline — clear dark amber
          map?.addLayer({
            id: "slick-main-outline",
            type: "line",
            source: "slick",
            filter: ["==", ["get", "region_id"], 1],
            paint: {
              "line-color": "#8a5a1e",
              "line-width": 2,
            },
          });

          // Centroid marker
          const centroid = slick.features[0].properties;
          map?.addSource("centroid", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "Point",
                    coordinates: [centroid.centroid_lon, centroid.centroid_lat],
                  },
                },
              ],
            },
          });

          map?.addLayer({
            id: "centroid-halo",
            type: "circle",
            source: "centroid",
            paint: {
              "circle-radius": 9,
              "circle-color": "#c9843a",
              "circle-opacity": 0.25,
            },
          });
          map?.addLayer({
            id: "centroid",
            type: "circle",
            source: "centroid",
            paint: {
              "circle-radius": 5,
              "circle-color": "#c5521f",
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": 1.5,
            },
          });

          // Frame to the MAIN slick so it dominates the viewport. Rather than
          // trusting fitBounds (whose internal size bookkeeping can drift from
          // the real render scale in some environments), measure the slick's
          // actual projected footprint and correct the camera iteratively.
          const FRAME_TARGET = 0.68; // slick bbox target share of the shorter viewport axis
          const FRAME_MAX_ZOOM = 13.5;
          const frameToMainSlick = () => {
            if (!map || disposed) return;
            const b = mainSlickBounds(slick);
            if (b.minLon === Infinity) return;
            const rect = map.getContainer().getBoundingClientRect();
            const cw = rect.width;
            const ch = rect.height;
            if (cw < 60 || ch < 60) return;
            const center: [number, number] = [
              (b.minLon + b.maxLon) / 2,
              (b.minLat + b.maxLat) / 2,
            ];
            map.jumpTo({ center });
            let zoom = map.getZoom();
            for (let i = 0; i < 3; i += 1) {
              const tl = map.project([b.minLon, b.maxLat]);
              const br = map.project([b.maxLon, b.minLat]);
              const bw = Math.abs(br.x - tl.x);
              const bh = Math.abs(br.y - tl.y);
              const want = Math.min(cw, ch) * FRAME_TARGET;
              const scale = want / Math.max(bw, bh);
              const next = Math.min(zoom + Math.log2(scale), FRAME_MAX_ZOOM);
              if (Math.abs(next - zoom) < 0.02) {
                zoom = next;
                break;
              }
              zoom = next;
              map.jumpTo({ center, zoom });
            }
            map.jumpTo({ center, zoom });
          };
          // Once the analyst moves the map, stop re-fitting.
          map?.once("movestart", () => {
            if (settleTimer !== null) {
              clearTimeout(settleTimer);
              settleTimer = null;
            }
          });
          frameToMainSlick();
          settleTimer = window.setTimeout(frameToMainSlick, 400);

          if (typeof window !== "undefined") {
            (window as unknown as Record<string, unknown>).__slicktraceMap = map;
          }
        });
      } catch {
        // 3. Some browsers report WebGL2 but still fail GPU initialisation.
        //    Remove any partially constructed map and fall back cleanly.
        if (map && typeof map.remove === "function") {
          try {
            map.remove();
          } catch {
            // ignore cleanup failures on a partial map
          }
        }
        map = null;
        mapRef.current = null;
        if (!disposed) setFallbackActive(true);
      }
    }

    void init();

    return () => {
      disposed = true;
      if (settleTimer !== null) {
        clearTimeout(settleTimer);
        settleTimer = null;
      }
      if (map && typeof map.remove === "function") {
        try {
          map.remove();
        } catch {
          // ignore
        }
      }
      mapRef.current = null;
    };
  }, [slick]);

  if (fallbackActive) {
    return (
      <div className="w-full border border-line bg-[#f3f0e8]" style={{ minHeight: height }}>
        <SlickFigure slick={slick} notice="Static view — interactive map unavailable" />
        <p className="border-t border-[#e4e0d6] px-4 py-2.5 text-[12.5px] text-faint">
          Interactive map unavailable in this browser. Showing verified static geometry.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full border border-line"
      aria-label="Predicted slick polygon map"
    />
  );
}