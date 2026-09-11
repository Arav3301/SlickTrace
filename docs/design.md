# SlickTrace — Design Direction

## Non-negotiable Rule

SlickTrace must NOT look AI-generated.

If a design decision resembles a generic AI-produced SaaS dashboard, reject it and redesign it.

Forbidden visual patterns:

- purple/blue startup gradients
- gradient blobs
- excessive rounded cards
- every section inside a bordered rectangle
- glassmorphism
- neon
- giant KPI cards
- generic bento grids
- excessive pills
- random illustrations
- excessive drop shadows
- generic Lucide icon beside every heading
- dashboard templates
- huge empty hero sections
- generic "AI-powered" visual language
- arbitrary 3D shapes
- glowing maps
- fake futuristic HUD effects
- excessive border-radius
- centered landing-page hero followed by feature cards

The interface should feel like a maritime intelligence / investigation workstation designed by a strong product-design team.

Desired qualities:

- editorial
- cartographic
- precise
- restrained
- information-dense
- serious
- calm
- premium
- spatial
- tactile
- investigative

The map is not decoration.
The map is the product.

Whitespace should organize information, not create emptiness.

Prefer:
- typography
- rules
- alignment
- hierarchy
- layering
- map overlays
- subtle motion
- meaningful states

over:
- containers
- cards
- decoration
- gradients

# SlickTrace — Design System & Art Direction

## 1. Core Design Goal

SlickTrace should feel like a serious maritime investigation instrument, not a startup dashboard.

The product should feel:

- precise
- spatial
- investigative
- calm
- premium
- technical
- editorial
- cartographic
- trustworthy

The interface should look like it was designed specifically for marine surveillance and evidence analysis.

It should NOT look like:

- a generic SaaS dashboard
- an AI analytics template
- a cybersecurity HUD
- a crypto platform
- a startup landing page
- a glassmorphism interface
- a bento-grid website
- a dashboard made from 20 rounded cards


## 2. Design Principle

The map is the product.

Every major screen should revolve around geospatial context, evidence, or investigation flow.

Avoid shrinking the map into a card.

On the main investigation screen, the map should occupy roughly 60–75% of the visual attention.

Information should feel layered around the map rather than stacked into dashboard cards.


## 3. Visual Language

Use a restrained maritime palette.

Suggested base colors:

Background:
- warm off-white
- very light stone
- subtle paper-like gray

Primary text:
- deep navy
- almost-black blue

Secondary text:
- muted blue-gray

Primary accent:
- deep marine blue

Secondary accent:
- burnt orange / signal amber

Success / strong association:
- muted green

Warning / uncertain:
- amber

Critical:
- muted red

Do NOT use:
- bright cyan everywhere
- purple
- neon blue
- large gradients
- glowing elements
- glossy effects


## 4. Typography

Typography should carry the product.

Use a strong sans-serif system with high readability.

Possible direction:

Primary UI font:
- Inter
- Geist
- IBM Plex Sans

Optional editorial/display font:
- Source Serif 4
- IBM Plex Serif
- Instrument Serif

Do not use more than two font families.

Use typography to create hierarchy instead of boxes.

Examples:

Investigation title:
large but not oversized

Section headings:
compact uppercase or strong sentence case

Metadata:
smaller, tightly spaced, muted

Numbers:
tabular numerals where possible

Coordinates and timestamps:
monospace font can be used selectively


## 5. Layout Philosophy

Avoid a standard sidebar + cards layout.

Instead, use an investigation workspace.

Recommended desktop structure:

Top utility bar
↓
Investigation header
↓
Main split workspace

Left / center:
large map canvas

Right:
evidence rail / ranked candidates

Bottom or expandable:
timeline / processing / details


## 6. Main Navigation

Keep navigation minimal.

Suggested navigation:

Investigations
Detection
Vessels
Method
Model
About

Do not use a giant sidebar.

Preferred navigation:
compact top bar or slim vertical rail.

The navigation should not compete with the map.


## 7. Investigation Overview Screen

This is the most important screen.

### Overall Composition

Header:

SLICKTRACE

Investigation:
SLICKTRACE-DEMO-20180926

Subtitle:
Sentinel-1A • 26 Sep 2018 • Gulf of Mexico

Status:
Validated Investigation Replay


### Main Canvas

Large map occupying most of the screen.

Map layers:

- main slick polygon
- vessel routes
- closest-approach markers
- slick centroid
- candidate ranking markers

Possible map controls:

- Slick
- Vessel Tracks
- Candidate Routes
- Satellite Bounds
- AIS Density

Keep controls compact.


### Right Evidence Rail

Do NOT put each candidate inside a large card.

Use a dense ranked list.

Example:

#01
CHIQUITA EXPRESS
92.08
Strong association

Track intersects slick
1.90 h before acquisition

--------------------------------

#02
CAPT RUDY
90.73
Strong association

Track intersects slick
1.75 h before acquisition


Use thin rules between candidates.

When a candidate is selected:
- emphasize its route
- dim other vessel tracks
- open evidence details


## 8. Investigation Header

Avoid KPI cards.

Instead, use an inline investigation strip.

Example:

34.1 km²
MAIN PREDICTED SLICK

225
VESSELS SCREENED

12 h
AIS LOOKBACK

00:01 UTC
SATELLITE ACQUISITION

These should feel like compact data points, not four rounded cards.


## 9. Association Score Design

Association score must NOT look like a "guilt percentage."

Never use:

"92% guilty"

Use:

92.08
ASSOCIATION SCORE

Strong association

Breakdown:

Track intersection     35 / 35
Spatial proximity      30 / 30
Temporal relevance     21 / 25
Route alignment         6 / 10

Visually show the breakdown with restrained horizontal bars or line indicators.

Avoid circular progress rings.


## 10. Vessel Detail Interaction

Clicking a vessel should:

1. Highlight its complete AIS trajectory.
2. Dim other tracks.
3. Show closest approach.
4. Show time relative to satellite acquisition.
5. Show route direction.
6. Show evidence breakdown.
7. Show data quality.

Possible detail layout:

VESSEL
CHIQUITA EXPRESS

MMSI
636017218

ASSOCIATION
92.08 — Strong

DISTANCE
0.00 km

TIME
1.90 h before satellite pass

COURSE
236.6°

ROUTE ALIGNMENT
35.7° difference

TRACK
Intersects detected slick

DATA QUALITY
Medium


## 11. Evidence Language

Use investigator-style language.

Good:

Evidence
Observation
Association
Track
Closest approach
Detected region
Predicted slick
AIS trajectory
Source candidate
Confidence
Uncertainty

Avoid dramatic terms:

Suspect ship
Criminal
Guilty
Caught
Confirmed polluter


## 12. Detection Analysis Screen

This screen should visually explain:

SAR input
→ model prediction
→ binary mask
→ polygon

Prefer a horizontal or layered scientific visualization.

Do NOT use four generic cards.

Possible layout:

LEFT
Raw Sentinel-1 SAR scene

CENTER
Probability / segmentation view

RIGHT
Extracted geospatial slick

Bottom:
processing metadata

Model:
U-Net

Threshold:
0.55

Scene:
5083 × 2555

Resolution:
10 m

CRS:
EPSG:32616


## 13. SAR Imagery Style

SAR imagery is naturally grayscale.

Keep it grayscale.

Do not artificially make satellite images blue/purple.

Detected slick overlay can use:

- amber
- orange
- restrained red-orange

Polygon should be visible but not fluorescent.


## 14. Vessel Tracks

Use clear route lines.

Primary selected candidate:
strongest visual emphasis

Other top candidates:
medium opacity

Background vessels:
very faint

Do not assign rainbow colors to every vessel.

Prefer:
- one main accent
- muted secondary routes
- selected state


## 15. Map Style

Use a clean cartographic basemap.

Map should prioritize:

- coastlines
- ocean
- vessel tracks
- slick geometry

Avoid cluttered labels.

Do not use satellite imagery as the default basemap unless specifically useful.

The initial map can use OpenStreetMap / MapLibre-compatible sources.

Map should have:

- minimal zoom controls
- layer toggle
- reset view
- coordinate readout
- scale

No fake radar HUD.


## 16. Investigation Timeline

A small timeline can show:

12 h before
↓
vessel movements
↓
1.90 h
CHIQUITA EXPRESS intersects slick region
↓
1.75 h
CAPT RUDY intersects slick region
↓
00:01 UTC
Sentinel-1 acquisition

This can be a horizontal time ruler or slim bottom rail.

Avoid another card.


## 17. Model Performance Screen

Show actual results.

Held-out test:

Dice
0.5277

IoU
0.3584

Precision
0.4214

Recall
0.7055

Specificity
0.9649

Do not visually exaggerate performance.

Explain each metric in plain language.

Example:

Recall:
"Of the oil pixels present in the test data, the model detected about 70.6%."

Include a short note:

"Performance varies between scenes; the current model is a validated prototype, not a production monitoring system."


## 18. Method Screen

Show the real pipeline:

Sentinel-1 SAR
↓
Normalization
↓
U-Net Segmentation
↓
Probability Map
↓
Threshold + Polygon Extraction
↓
Historical AIS Filtering
↓
Trajectory Reconstruction
↓
Spatial + Temporal + Route Correlation
↓
Analyst Review

Avoid generic icons in boxes.

Prefer:
- timeline
- technical diagram
- connected labels
- data-flow lines


## 19. Motion

Motion should be subtle and purposeful.

Allowed:

- map route fade-in
- panel transitions
- selected trajectory emphasis
- subtle number transitions
- layer toggles
- evidence panel slide
- map fly-to

Avoid:

- bouncing cards
- floating elements
- parallax everywhere
- dramatic page transitions
- glowing hover effects


## 20. Border Radius

Use minimal radius.

Preferred:
4–8px

Large 20–30px rounded cards are not allowed unless there is a very specific reason.

Some panels may have zero radius.


## 21. Borders & Dividers

Use thin rules extensively.

Suggested:

1px neutral / blue-gray

Dividers should organize information.

Prefer lines over containers.


## 22. Shadows

Use almost no shadows.

If necessary:
very soft, very low-opacity shadow.

Do not use deep floating shadows.


## 23. Icons

Icons should be rare.

Do not place icons beside every heading.

Use icons only when they genuinely improve scanning.

Examples:
- layers
- reset map
- time
- download

Prefer text labels.


## 24. Buttons

Buttons should feel utilitarian.

Primary:
dark navy background

Secondary:
outline / text action

Avoid huge pill buttons.

Suggested actions:

View Evidence
Focus Track
Compare Candidates
Toggle Slick
Export Investigation


## 25. Data Tables

Tables should be dense and clean.

Candidate table columns:

Rank
Vessel
Association
Distance
Time
Intersection
Alignment
AIS quality

Use:
- tabular numbers
- light row dividers
- sticky header
- strong selected state

Avoid:
- card-based tables
- oversized row height


## 26. Responsive Design

Desktop is priority.

SIH demo should look exceptional on laptop.

Tablet:
maintain map + collapsible evidence rail

Mobile:
map first
bottom sheet for candidates

Do not compromise desktop layout just to make everything mobile-first.


## 27. Empty / Loading States

No skeleton-card spam.

Loading example:

"Loading investigation geometry…"

"Reconstructing vessel tracks…"

"Loading candidate evidence…"

Empty example:

"No vessel trajectories match the current filters."


## 28. Scientific Trust

Every major result should indicate provenance.

Examples:

Source:
Sentinel-1A

AIS:
NOAA Historical AIS

Model:
U-Net

Processing:
Precomputed validated investigation

Timestamp:
2018-09-26 00:01 UTC

This should feel subtle but always available.


## 29. Demo Mode Indicator

Use a small persistent label:

VALIDATED REPLAY

Tooltip / info:

"Results shown here were generated by the SlickTrace ML and AIS-correlation pipeline and are replayed for demonstration reliability."

Avoid giant "DEMO" banners.


## 30. Landing Experience

Do not create a traditional marketing landing page.

The app should open directly into the investigation environment.

Possible opening:

SLICKTRACE
Marine spill investigation

Recent investigation:

26 SEP 2018
Gulf of Mexico
Sentinel-1A

OPEN INVESTIGATION →

This screen should be minimal and editorial.

No:
hero illustration
gradient
testimonial
pricing
feature cards


## 31. Microcopy Style

Writing should be short and professional.

Examples:

"Detected slick"
"Vessel track"
"Closest approach"
"Source association"
"Satellite acquisition"
"Evidence breakdown"

Avoid:

"AI-powered insights"
"Unlock powerful intelligence"
"Revolutionize maritime monitoring"
"Next-generation platform"


## 32. Anti-AI Design Checklist

Before accepting any screen, check:

- Are there too many rounded rectangles?
- Are all metrics inside cards?
- Is there a giant gradient?
- Does every title have an icon?
- Is the page basically sidebar + bento grid?
- Is there unnecessary glass?
- Are buttons pills for no reason?
- Is whitespace being used to hide weak hierarchy?
- Does it look like a generic dashboard template?
- Could the design belong to any SaaS product?

If yes, redesign.


## 33. Reference Mental Model

Think:

maritime investigation room
+
cartographic intelligence tool
+
editorial scientific report
+
modern mapping product

Not:

AI startup dashboard


## 34. Final Quality Standard

The final interface should make someone think:

"This was designed specifically for investigating marine pollution."

Not:

"This was generated by an AI website builder."

## 35. Readability Over Technical Aesthetic

SlickTrace must never sacrifice readability in order to look technical.

Avoid the common geospatial / AI interface pattern of:

- tiny typography
- tiny map annotations
- excessive blue
- dense dark dashboards
- microscopic metadata
- low-contrast gray text
- cramped technical panels
- fake command-center aesthetics

Premium does NOT mean small text.

Premium means:

- strong hierarchy
- excellent spacing
- confident typography
- restrained color
- easy scanning
- information that can be understood from a distance

The website will likely be shown to judges on a laptop or projector.

Therefore:

Body text:
minimum comfortable reading size.

Map labels:
clearly readable without zooming browser UI.

Candidate vessel names:
visually prominent.

Important numbers:
large enough to understand instantly.

Metadata:
smaller than primary text but never microscopic.

Avoid using blue as the default color for every element.

Preferred visual balance:

warm off-white / stone background
+
dark ink / navy text
+
muted marine blue
+
signal orange / amber accents
+
neutral gray dividers

The product should feel premium and human-readable,
not like a military HUD or a research lab dashboard.