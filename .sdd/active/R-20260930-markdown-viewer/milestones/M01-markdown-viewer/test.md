# Test Plan: M01 Markdown Viewer

## RED Tests

- No automated test harness is included in this small static extension deliverable.

## Regression Tests

- Open a GitHub Enterprise repository `.md` preview such as `/blob/master/links.md`; the GitHub page chrome and rendered Markdown must remain intact.
- Open a raw `.md` document; the extension must continue to render it.
- Manual checks cover URL gating and safe rendering of raw HTML.
- Mermaid checks cover `graph TD` / `flowchart LR`, `sequenceDiagram` participants / messages / notes / control sections, and unsupported syntax fallback.

## Acceptance Checks

- Load unpacked extension successfully in Chrome.
- Open a Markdown sample containing supported blocks and confirm readable formatting.
- Confirm ordinary web pages are unchanged.
- Confirm raw HTML in Markdown is not executed.

## Manual Checks

- Enable the extension’s “Allow access to file URLs” permission and open a local `.md` file.
- Open a remote `.md` file and inspect headings, links, images, lists, code, and tables.
- Open `https://sqbu-github.cisco.com/yishwu/mynotes/blob/master/links.md` with the extension enabled and confirm GitHub's preview is unchanged.
- Confirm a raw Markdown URL on the same or another host is still rendered by the extension.
- Open a Markdown file containing a fenced Mermaid flowchart and confirm nodes and arrows render as SVG without network access.
- Confirm a fenced `mermaid` block containing unsupported syntax remains visible as code.
- Open `coding-agent-demo/docs/design.md` and confirm its sequence diagrams render as diagrams and remain legible in the horizontally scrollable view.

## Validation Commands

```bash
python3 -m json.tool manifest.json
node --check src/content.js
```

## Evidence Log

| Date | Task | Phase | Command | Result |
| --- | --- | --- | --- | --- |
| 2026-09-30 | T01 | Validate | `python3 -m json.tool manifest.json` | PASS |
| 2026-09-30 | T01 | Validate | `node --check src/content.js` | PASS |
| 2026-09-30 | T01 | Manual | Load unpacked in Chrome | Pending |
| 2026-10-27 | T03 | Validate | `node --check src/content.js` | PASS |
| 2026-10-27 | T03 | Browser | `coding-agent-demo/docs/design.md` sequence diagrams | PASS: all five rendered as SVG in Chrome |
| 2026-10-27 | T03 | Browser | Sequence diagram visual inspection | PASS: rendered at natural width with horizontal scrolling |
