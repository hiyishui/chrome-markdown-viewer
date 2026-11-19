# Design: M01 Markdown Viewer

## Approach

Use a Manifest V3 content script on web and local file URLs. The script proceeds only when the pathname ends in `.md` or `.markdown`. Before extracting text, it checks repository `blob` / `tree` pages for GitHub's `.markdown-body` rendered-content marker and exits when present. Other matching pages have their text extracted, parsed as a documented Markdown subset, and rendered into a Shadow DOM. Build all elements through DOM APIs and assign untrusted text with `textContent`.

## Boundaries and Contracts

- No remote code or runtime network dependency.
- Non-Markdown URLs remain untouched.
- Already-rendered GitHub repository pages remain untouched when both the repository route and rendered Markdown marker are present.
- Links allow only HTTP(S), mailto, and same-document fragment destinations; images allow HTTP(S) and local relative paths.
- Parsing produces DOM elements, never HTML strings.

## Data and Control Flow

URL extension check → GitHub rendered-preview guard → source text extraction → block parsing (including Mermaid flowchart SVG) → safe inline parsing → replace document body with isolated reader surface.

## File Structure Plan

| File | Responsibility | Change |
| --- | --- | --- |
| `manifest.json` | MV3 metadata and URL matching | create |
| `src/content.js` | Detection, safe parser, DOM rendering | create |
| `README.md` | Install and use instructions | create |
| `src/content.js` | Detection, safe parser, DOM rendering | update: render supported Mermaid flowcharts locally as SVG |

## Risks

- The parser supports a useful Markdown subset rather than all CommonMark/GFM edge cases.
- Browser file access must be enabled manually for local files.
- Mermaid syntax is broad; the offline renderer supports basic `graph` / `flowchart` nodes and edges plus common `sequenceDiagram` participants, messages, notes, and control sections. Unsupported diagrams remain code, and wide SVGs scroll horizontally.

## Change Log

| Date | Source | Change | Impact |
| --- | --- | --- | --- |
| 2026-09-30 | User request | Initial design | New extension |
| 2026-10-08 | GitHub preview feedback | Add `.markdown-body` guard for repository routes | Avoid double-rendering GitHub's HTML preview |
| 2026-10-27 | User request | Render local Mermaid flowchart and sequence diagram subsets | Keep the extension offline and avoid injecting diagram text as markup |
