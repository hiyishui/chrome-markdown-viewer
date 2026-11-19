# Notes: M01 Markdown Viewer

## Decisions

- 2026-09-30: Use a dependency-free parser and Shadow DOM so the extension can be loaded directly and page CSS cannot affect the reader.

## Manual-Test Findings

- Chrome loading and rendering could not be exercised in this environment; follow the manual steps in README.md.

## Bug Notes

- GitHub Enterprise renders repository Markdown before the content script runs. Replacing the body with `innerText` then parsing it again destroys GitHub's page layout and can damage already formatted content. Guard on repository `/blob/` or `/tree/` routes plus `.markdown-body` before reading the page.

## Implementation Notes

- None.
