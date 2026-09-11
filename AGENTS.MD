# SlickTrace Agent Instructions

Before implementing ANY UI:

1. Read docs/prd.md.
2. Read docs/design.md.
3. Read docs/decisions.md.
4. Inspect demo-data/SlickTrace_Demo_Bundle.zip and use its real outputs.
5. Load relevant project skills from .opencode/skills/.

Do not immediately generate the whole application.

First:
- understand the product
- inspect the available data
- propose the information architecture
- propose the visual composition
- identify generic AI design risks
- then implement

Never invent scientific results, candidate scores, vessel details, model metrics or satellite values.

Never present precomputed results as live inference.

## Design Quality Gate

For every major screen ask:

"Could this screen plausibly come from a generic AI dashboard prompt?"

If yes, redesign it.

Avoid:
- card grids
- gradient SaaS aesthetics
- excessive border radius
- decorative icons
- generic sidebars
- generic KPI rows

Prefer a custom investigation workspace driven by map, evidence and typography.

## Use Available Capabilities

Before substantial tasks, inspect the available OpenCode skills and tools.

Use relevant skills deliberately rather than ignoring them.

Use web research when useful for:
- cartographic interfaces
- maritime surveillance interfaces
- geospatial UX patterns
- accessibility
- implementation documentation

Do not copy another product's visual design.

Use references only to learn interaction and information-design principles.

## Engineering Quality

- TypeScript strict mode.
- Components should have clear responsibility.
- No fake APIs.
- No dead buttons.
- No placeholder lorem ipsum.
- No console errors.
- No horizontal overflow.
- Responsive but desktop investigation workspace is priority.
- Preserve data provenance.
- Add loading, empty and failure states.
- Run build and lint before considering a feature complete.

## Readability Gate

Never reduce font size just to make a screen look more "premium" or "technical."

The interface must remain readable during a live presentation.

If a map label, metric, candidate name, or evidence value cannot be read comfortably on a laptop screen from normal viewing distance, increase its size.

Avoid excessive blue. Use color only when it communicates hierarchy, state, evidence, or selection.