# Brief: Chrome Markdown Viewer

## Source Request

“开发一个chrome 插件，渲染markdown文件”

## Goal

Provide a loadable Chrome Manifest V3 extension that renders Markdown documents as readable pages when opened in the browser.

## Non-Goals

- Markdown editing, export, sync, or account features.
- Full CommonMark/GFM compatibility in the first release.

## Constraints

- Run locally as an unpacked Chrome extension without a build step or remote dependencies.
- Local file rendering requires Chrome’s “Allow access to file URLs” setting.
- Avoid interpreting Markdown content as executable HTML.

## Current Interpretation

Automatically render HTTP(S) and local `.md` / `.markdown` documents, including headings, paragraphs, links, images, lists, quotes, code fences, tables, and a documented offline Mermaid flowchart subset.
