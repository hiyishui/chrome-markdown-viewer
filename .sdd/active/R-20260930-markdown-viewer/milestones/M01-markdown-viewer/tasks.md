# Tasks: M01 Markdown Viewer

- [x] T01: Render Markdown files in Chrome
  - Status: DONE
  - Boundary: Create the manifest, content script, renderer styles, and user instructions.
  - Depends On: None
  - RED Test: No automated test harness; validate the static extension and manually load it in Chrome.
  - Done Criteria:
    - Extension implements the acceptance criteria.
    - Manifest JSON and JavaScript syntax checks pass.
    - Chrome manual verification is documented as outstanding.

- [ ] T02: Preserve GitHub's rendered Markdown preview
  - Status: NEEDS_REVIEW
  - Boundary: Skip only repository `blob` / `tree` routes with GitHub's rendered Markdown DOM marker.
  - Depends On: T01
  - RED Test: Manually open the supplied GitHub Enterprise `.md` preview and observe the extension replacing the GitHub page with extracted text.
  - Done Criteria:
    - GitHub preview routes with `.markdown-body` are not modified.
    - Raw Markdown documents and local files still use the extension renderer.
    - JavaScript syntax check passes; Chrome regression check remains pending in this environment.

- [x] T03: Render Mermaid diagrams offline
  - Status: DONE
  - Boundary: Render basic Mermaid `graph` / `flowchart` and `sequenceDiagram` fenced blocks as SVG using DOM APIs in the content script.
  - Depends On: T01
  - RED Test: No automated test harness is included; use the Mermaid manual acceptance scenarios.
  - Done Criteria:
    - Basic directed flowcharts and sequence diagrams with common messages, notes, and control sections render locally.
    - Unsupported flowchart syntax remains readable as source.
    - README documents the supported Mermaid subset.
    - Chrome verification of all five sequence diagrams in `coding-agent-demo/docs/design.md` completed.
