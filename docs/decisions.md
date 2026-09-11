# SlickTrace — Locked Decisions

## Product

SlickTrace is an investigation-support system.

It does not determine legal guilt.

## Demo

The first website version uses real precomputed pipeline outputs.

The demo investigation is a replay of a real processing run.

## Core Investigation

Scene:
2018_09_26

Satellite:
Sentinel-1A

Acquisition:
~00:01:45 UTC

## ML

Architecture:
U-Net

Input:
Sentinel-1 SAR VV

Threshold:
0.55

Selected checkpoint:
best validation Dice

Held-out Dice:
0.5277

## Slick

Primary region:
34.103 km²

Centroid:
28.905266, -89.022854

## AIS

Lookback:
12 hours

Raw AIS rows scanned:
15,506,250

Spatial + temporal rows:
64,106

Valid vessels:
225

## Candidate Ranking

Current explainable prototype score:

- track intersection: 35 points
- spatial proximity: 30 points
- temporal relevance: 25 points
- route alignment: 10 points

Temporal score is spatially gated.

Association score is not guilt probability.

## Current Ranking

1. CHIQUITA EXPRESS — 92.08
2. CAPT RUDY — 90.73
3. CAPT DONALD LOWE SR — 69.73
4. LA CHEVAL — 46.00
5. CAPT MASON — 45.00

## Frontend

Next.js
React
TypeScript
Tailwind CSS
MapLibre GL JS

## Initial Architecture

Website reads actual precomputed JSON / GeoJSON.

No fake live inference.

## Backend

FastAPI may be introduced only after frontend investigation experience is stable.

## Storage

Avoid database unless required.

Static investigation data is sufficient for the first prototype.

## Design

Map-centric.

No generic SaaS dashboard.

No purple gradient.

No glassmorphism.

No bento-grid design.

Minimal border radius.

Dense information.

Editorial typography.

## Priority

1. Investigation workspace
2. Interactive map
3. Vessel selection
4. Evidence breakdown
5. Detection visualization
6. Model performance
7. Methodology
8. Polish

## Not Priority

Authentication
User accounts
Payments
Admin panel
Mobile app
Complex database
Notifications
Real-time global monitoring