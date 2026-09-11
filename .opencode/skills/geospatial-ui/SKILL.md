# SlickTrace Geospatial UI Skill

## Purpose

Use this skill whenever implementing maps, vessel trajectories, slick geometry, investigation layers, spatial controls, or geospatial interactions.

## Core Principle

The map is not a background illustration.

The map is the primary investigation surface.

Users should be able to understand:

- where the slick is
- where vessels travelled
- which vessel is selected
- where closest approach occurred
- when events occurred
- why a candidate is ranked highly

## Required Map Layers

Support these conceptual layers:

- detected main slick
- other detected regions if needed
- candidate vessel tracks
- closest-approach points
- slick centroid
- investigation bounds
- optional satellite footprint
- optional AIS density

Do not show all layers at maximum intensity simultaneously.

## Visual Hierarchy

Selected candidate:
highest visual priority.

Top candidates:
visible but secondary.

Unselected / background tracks:
muted.

Slick geometry:
clear and always understandable.

Map labels:
large enough for live presentation.

## Candidate Interaction

When a candidate is selected:

- highlight its full route
- dim unrelated routes
- focus or fly map to relevant region
- show closest approach
- show evidence details
- preserve orientation and spatial context

Do not make candidate selection feel like navigating to a completely unrelated page.

The map and evidence should remain connected.

## Tooltips

Tooltips must be short and readable.

Good:

CHIQUITA EXPRESS
Rank #1
92.08 association
1.90 h before acquisition

Avoid giant technical tooltips.

Detailed evidence belongs in the evidence rail or detail panel.

## Map Controls

Keep controls compact and understandable.

Possible controls:

- Slick
- Vessel tracks
- Candidate routes
- Reset view
- Layers

Avoid exposing raw GIS complexity to judges.

## Coordinates

Display coordinates only when useful.

Prefer:

28.9053° N
89.0229° W

over excessive decimal precision unless technical detail is explicitly requested.

## Temporal Context

Time is essential.

Map interactions should communicate:

- satellite acquisition
- closest approach
- hours before acquisition
- vessel timeline

Do not show routes without temporal context.

## Basemap

Use a clean, readable basemap.

Avoid:

- API-key-dependent tiles for the demo
- overly cluttered street labels
- dark cyber basemaps
- overly saturated satellite maps

OpenStreetMap / MapLibre-compatible clean tiles are preferred.

## Performance

Do not render huge raw AIS datasets in the browser.

Use only the precomputed and filtered demo data necessary for the investigation.

Keep route geometries lightweight.

## Truthfulness

Never imply:

- that the slick polygon is confirmed oil
- that vessel-track intersection proves discharge
- that association score is guilt probability

Map labels should use:

Predicted slick
Potential source candidate
Closest approach
Association score
AIS trajectory