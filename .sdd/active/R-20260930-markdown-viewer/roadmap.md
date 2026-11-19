# Roadmap: Chrome Markdown Viewer

## Milestones

| Milestone | Goal | Boundary | Depends On | Validation Focus | Status |
| --- | --- | --- | --- | --- | --- |
| M01-markdown-viewer | Deliver an installable extension that renders Markdown pages | Manifest, content script, rendering styles, usage docs | None | Manifest and script syntax; manual Chrome loading and rendering | IN_PROGRESS |

## Sequencing

One milestone is sufficient for this first, bounded deliverable.

## Risks

- Markdown has many dialect features; the initial renderer documents its supported subset.
- Broad host matching is needed for automatic rendering; rendering is restricted to Markdown file extensions.
