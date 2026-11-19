# Requirements: M01 Markdown Viewer

## User Need

Open a Markdown file in Chrome and see its formatted content.

## Acceptance Criteria

- The extension can be loaded unpacked in Chrome using Manifest V3.
- Navigating to an HTTP(S) or local `.md` / `.markdown` file renders Markdown in a readable layout.
- Common headings, paragraphs, emphasis, links, images, lists, blockquotes, fenced code, and tables are rendered.
- Fenced Mermaid `graph` / `flowchart` and `sequenceDiagram` blocks render common constructs as diagrams, with unsupported syntax shown as readable source.
- Untrusted raw HTML is displayed as text or ignored; Markdown cannot inject page markup or scripts.
- Non-Markdown pages are not changed.
- GitHub repository `blob` / `tree` pages that already contain rendered Markdown are left intact.

## Boundary

This milestone owns the unpacked Chrome extension, Markdown presentation, and installation instructions.

This milestone does not own editing, syntax highlighting, settings, or full dialect compatibility.

## Dependencies

- Chrome supporting Manifest V3.

## Change Impact

If the rendering boundary changes, revalidate URL detection, safe DOM construction, and installation steps.

## Change Log

| Date | Source | Change | Impact |
| --- | --- | --- | --- |
| 2026-09-30 | User request | Initial scope | New extension |
| 2026-10-08 | GitHub preview feedback | Skip already-rendered GitHub repository Markdown pages | Add page-signature guard before source extraction |
| 2026-10-27 | User request | Render Mermaid from fenced code blocks | Add offline SVG rendering for documented flowchart and sequence diagram subsets |
