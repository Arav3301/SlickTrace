# SlickTrace

SIH26143 — marine oil-spill detection and vessel-correlation investigation-support prototype.

## Pipeline

Sentinel-1 SAR
→ U-Net segmentation (best-val-Dice checkpoint, threshold 0.55)
→ thresholded slick mask
→ georeferenced slick polygons
→ 12-hour historical AIS screening (15.5M rows → 225 vessels)
→ trajectory + spatial + temporal + route-alignment correlation
→ explainable ranked potential-source candidates

## Prototype scope

This website replays validated outputs from a single real investigation run
(Sentinel-1A scene `2018-09-26`, northern Gulf of Mexico, acquisition ~00:01:45 UTC).

It performs **no live GPU inference in the browser**.

## Validated investigation replay

All results shown by the application are precomputed outputs from the SlickTrace
segmentation and AIS-correlation pipeline, replayed in the web interface for
reliable demonstration.

Association scores rank potential source candidates and do **not** establish legal
responsibility.

## Screens

| Route | Purpose |
| --- | --- |
| `/` | Investigation workspace: interactive map, candidate rail, evidence breakdown, PDF export |
| `/detection` | SAR input, segmentation probability, thresholded mask, slick geometry, model performance |

## Tech stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript (strict)
- Tailwind CSS v4
- MapLibre GL JS (OpenStreetMap raster basemap, no API key)
- @react-pdf/renderer (client-side PDF generation)
- Playwright (dev-only verification)

## Data

Runtime data lives in `public/data/`:

- `investigation.json` — scene, model, and screening metadata
- `slick_polygons.geojson` — detected slick regions (region\_id 1 = main slick)
- `candidates.json` — top-5 ranked potential source candidates
- `candidate_ranking.csv` — full screening output (225 vessels)
- `vessel_tracks.geojson` — top-5 vessel trajectories
- `model_metrics.csv`, `model_scene_metrics.csv` — held-out test metrics
- `detection/` — SAR, probability, and binary preview images

Data provenance is documented in `demo-data/data_provenance.md` and
`public/data/detection/model_output_provenance.json`.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

```bash
npm run lint          # ESLint (app, components, lib)
npx tsc --noEmit      # strict type check
npm run build         # production build
```

## Scientific disclaimer

Model metrics are held-out test results. Performance varies between satellite scenes.

> Association scores rank potential source candidates and do not establish legal
> responsibility.
