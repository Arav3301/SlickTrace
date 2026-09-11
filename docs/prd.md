# SlickTrace — Product Requirements Document

## 1. Product

SlickTrace is an investigation-support platform for detecting possible marine oil slicks from Sentinel-1 SAR satellite imagery and correlating them with historical AIS vessel movement to rank potential source vessels.

Problem Statement:
SIH26143 — Leveraging satellite imagery to determine oil spills at sea along with AIS data correlations to identify vessel responsible for the spill.

Sponsor:
National Technical Research Organisation (NTRO)

Theme:
Space Technology

SlickTrace must NOT claim that a vessel is legally responsible for a spill.

Terminology to use:
- potential source candidate
- vessel association
- association score
- investigation evidence
- analyst review
- confidence / uncertainty

Terminology to avoid:
- guilty vessel
- culprit confirmed
- ship definitely caused spill
- legal proof


## 2. What Already Exists

This is NOT a fake UI project.

A real technical pipeline has already been built outside the web application.

Working pipeline:

Sentinel-1 SAR imagery
→ U-Net segmentation
→ probability map
→ thresholding
→ georeferenced oil-slick polygon
→ historical AIS filtering
→ vessel trajectory reconstruction
→ spatial + temporal + route correlation
→ ranked potential source vessels
→ interactive geospatial visualization


## 3. Real ML Results

Model:
U-Net

Input:
Single-channel Sentinel-1 SAR VV imagery

Patch size:
256 × 256

Model parameters:
7,762,465

Training:
1,566 balanced training patches

Validation:
1,106 patches from completely separate satellite scenes

Test:
2,869 patches across 7 untouched test scenes

Selected checkpoint:
best validation Dice checkpoint

Selected validation threshold:
0.55

Held-out test results:

Dice:
0.5277

IoU:
0.3584

Precision:
0.4214

Recall:
0.7055

Specificity:
0.9649


## 4. Demo Investigation

Primary website demo case:

Scene:
2018_09_26

Satellite:
Sentinel-1A

Acquisition time:
approximately 2018-09-26 00:01:45 UTC

Scene dimensions:
5083 × 2555 pixels

Spatial resolution:
10 metres

Coordinate reference system:
EPSG:32616


## 5. Oil Slick Detection Result

Whole-scene inference used:

Checkpoint:
best_val_dice.pt

Threshold:
0.55

Predicted oil pixels:
473,772

Approximate total predicted oil area:
47.377 km²

After removal of very small regions:

Retained regions:
48

Total retained area:
47.195 km²

Dominant/main predicted slick:

Area:
34.103 km²

Centroid:
28.905266, -89.022854

Important:
These values describe model predictions.
They must not be presented as guaranteed ground truth.


## 6. AIS Investigation

Historical AIS data comes from NOAA / MarineCadastre.

Investigation window:
12 hours before satellite acquisition.

Dates involved:
25 September 2018
26 September 2018

Raw AIS rows scanned:
15,506,250

Rows inside time window:
3,886,089

Rows inside time + geographic window:
64,106

Valid vessels after cleaning:
225


## 7. Candidate Correlation

Evidence used for ranking:

1. Does reconstructed vessel trajectory intersect the detected slick?
2. Minimum trajectory distance from slick.
3. Temporal difference between closest approach and satellite acquisition.
4. Vessel course alignment with the main slick orientation.

AIS data quality must be shown separately from association score.

Do NOT treat additional AIS observations as evidence that a vessel caused pollution.


## 8. Current Candidate Ranking

Rank 1:
CHIQUITA EXPRESS
Association score: 92.08
Classification: Strong association

Rank 2:
CAPT RUDY
Association score: 90.73
Classification: Strong association

Rank 3:
CAPT DONALD LOWE SR
Association score: 69.73
Classification: Moderate association

Rank 4:
LA CHEVAL
Association score: 46.00
Classification: Possible association

Rank 5:
CAPT MASON
Association score: 45.00
Classification: Possible association

Association score is an explainable prototype score.

It is NOT:
- probability of guilt
- legal evidence
- probability that the vessel discharged oil


## 9. Demo Data Policy

The website initially uses precomputed outputs from the real ML + AIS pipeline.

This is intentional.

The website must clearly distinguish:

REAL PIPELINE OUTPUT
from
LIVE COMPUTATION.

Do not claim the website is performing GPU inference live if it is loading previously generated output.

Suggested label:

"Validated Investigation Replay"

Supporting description:

"This investigation was processed using SlickTrace's trained segmentation and AIS-correlation pipeline. Results are replayed in the web prototype for reliable demonstration."

Later architecture may expose the Python inference and correlation pipeline through FastAPI.


## 10. Core Website Experience

This should NOT be a generic analytics dashboard.

The website should feel like a purpose-built maritime investigation instrument.

The primary experience should revolve around the investigation canvas.

An analyst should immediately understand:

- where the detected slick is
- when the satellite captured it
- which vessels passed nearby
- which vessels rank highest
- why each vessel received its score
- what evidence is strong
- what evidence is uncertain


## 11. Required Screens

### A. Investigation Overview

This is the main product screen.

It should contain:

- large geospatial map
- detected slick polygon
- vessel trajectories
- satellite acquisition timestamp
- investigation identifier
- main slick area
- number of vessels screened
- ranked potential source candidates
- evidence breakdown
- model confidence / limitations

The map should dominate the composition.

Do NOT place the map inside a tiny dashboard card.


### B. Detection Analysis

Show:

- SAR scene
- segmentation result
- probability representation
- detected polygon
- area
- centroid
- processing stages

Make the transformation from SAR image → detected slick visually understandable.


### C. Vessel Investigation

Show ranked vessels.

Each vessel entry should contain:

- rank
- vessel name
- MMSI
- association score
- association classification
- whether track intersects slick
- minimum distance
- hours before satellite
- route-alignment evidence
- AIS track quality


### D. Vessel Detail

Selecting a vessel should focus its trajectory on the map.

Show:

- complete route
- closest approach
- time of closest approach
- distance
- speed
- course
- intersection evidence
- individual scoring factors

The interface must explain WHY the vessel ranks where it does.


### E. Method / Pipeline

Create a concise technical explanation:

Sentinel-1
→ preprocessing
→ U-Net segmentation
→ geospatial polygon
→ AIS filtering
→ trajectory reconstruction
→ correlation
→ analyst review

This should be visually designed, not a generic row of rounded cards.


### F. Model Performance

Show actual held-out metrics.

Explain metrics in plain language when hovered/clicked.

Do not hide weaknesses.

Mention that performance varies between satellite scenes and further dataset expansion is planned.


## 12. Primary Demo Flow

The judge should be able to follow this sequence in under 90 seconds:

1. Open investigation.
2. See Sentinel-1 scene and detected oil slick.
3. See that 15.5M AIS rows were searched.
4. See that the investigation reduced them to 225 vessels.
5. Turn vessel trajectories on.
6. See the highest-ranked candidates.
7. Select CHIQUITA EXPRESS.
8. Show that its route intersects the detected slick approximately 1.9 hours before acquisition.
9. Open evidence breakdown.
10. Explain that association is ranked but not treated as proof.


## 13. Required Data Files

Open and inspect the contents of:

demo-data/SlickTrace_Demo_Bundle.zip

Use the actual values from those files.

Expected data includes:

- investigation.json
- slick_polygons.geojson
- candidate_ranking.csv
- candidate_map.html
- model_metrics.csv
- model_scene_metrics.csv

Do not invent replacement values if something is absent.


## 14. Architecture

Frontend:
Next.js
React
TypeScript
Tailwind CSS
MapLibre GL JS

Future / integration backend:
Python
FastAPI

Geospatial:
GeoJSON
Rasterio
Shapely
PyProj
PostGIS

ML:
PyTorch
U-Net

Database:
PostgreSQL + PostGIS if persistence becomes necessary.

Do not introduce unnecessary infrastructure during the prototype.


## 15. Prototype Strategy

Phase 1:
Build a premium frontend around genuine precomputed investigation outputs.

Phase 2:
Create a FastAPI adapter around model inference and vessel correlation.

Phase 3:
Support additional Sentinel-1 scenes and investigation creation.

Do not block Phase 1 waiting for Phase 2.


## 16. Product Truthfulness

The interface must be scientifically careful.

Always distinguish:

prediction
vs
observation
vs
association
vs
confirmed fact.

Examples:

Good:
"Predicted slick area: 34.1 km²"

Bad:
"Oil spill size: exactly 34.1 km²"

Good:
"Highest-ranked potential source candidate"

Bad:
"Responsible ship"

Good:
"Association score"

Bad:
"Guilt probability"


## 17. Success Criteria

The prototype succeeds if a judge can understand within roughly one minute:

1. What the satellite detected.
2. Where it happened.
3. Which vessels were investigated.
4. Why specific vessels ranked highly.
5. That the result is explainable.
6. That the system assists investigators rather than falsely assigning guilt.