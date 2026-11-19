# Validation: M01 Markdown Viewer

Status: MANUAL_VERIFY_REQUIRED

## Required Checks

- `python3 -m json.tool manifest.json`
- `node --check src/content.js`
- Manual Chrome loading and rendered-page inspection
- GitHub preview preservation regression check
- Mermaid flowchart rendering and unsupported-syntax fallback check

## Evidence

| Date | Check | Result | Notes |
| --- | --- | --- | --- |
| 2026-09-30 | `python3 -m json.tool manifest.json` | PASS | Valid Manifest V3 JSON. |
| 2026-09-30 | `node --check src/content.js` | PASS | JavaScript syntax is valid. |
| 2026-09-30 | Chrome load and page inspection | PENDING | Requires manual Chrome verification. |
| 2026-10-08 | `node --check src/content.js` | PASS | GitHub preview guard parses successfully. |
| 2026-10-08 | GitHub Enterprise preview regression | PENDING | Open supplied `/blob/master/links.md` URL with extension enabled. |
| 2026-10-27 | `node --check src/content.js` | PASS | Mermaid flowchart and sequence rendering parse successfully. |
| 2026-10-27 | Chrome Mermaid sequence diagrams | PASS | All five diagrams in `coding-agent-demo/docs/design.md` appeared as SVG images. |
| 2026-10-27 | Mermaid unsupported-syntax fallback | PENDING | Verify an unsupported Mermaid block stays visible as code. |

## Final Decision

Decision: MANUAL_VERIFY_REQUIRED
