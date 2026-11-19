(() => {
  "use strict";

  const pathname = window.location.pathname.toLowerCase();
  if (!/\.(md|markdown)$/.test(pathname) || !document.body) return;
  if (isGithubMarkdownPreview()) return;

  const source = getDocumentText();
  if (!source.trim()) return;

  const host = document.createElement("main");
  host.id = "markdown-viewer-root";
  const shadow = host.attachShadow({ mode: "open" });
  shadow.append(createStylesheet(), renderMarkdown(source));

  document.body.replaceChildren(host);
  document.body.style.cssText = "margin:0; min-width:320px; background:#fff;";

  function getDocumentText() {
    const onlyChild = document.body.children.length === 1 ? document.body.firstElementChild : null;
    if (onlyChild?.tagName === "PRE") return onlyChild.innerText || onlyChild.textContent || "";
    return document.body.innerText || document.body.textContent || "";
  }

  function isGithubMarkdownPreview() {
    const isRepositoryPage = /\/(?:blob|tree)\//.test(pathname);
    return isRepositoryPage && Boolean(document.querySelector(".markdown-body"));
  }

  function createStylesheet() {
    const style = document.createElement("style");
    style.textContent = `
      :host { display:block; color:#24292f; background:#fff; font:16px/1.75 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
      * { box-sizing:border-box; }
      article { max-width:880px; margin:0 auto; padding:48px 32px 80px; overflow-wrap:anywhere; }
      h1,h2,h3,h4,h5,h6 { line-height:1.3; margin:1.5em 0 .6em; font-weight:650; }
      h1 { font-size:2.15rem; border-bottom:1px solid #d8dee4; padding-bottom:.3em; margin-top:0; }
      h2 { font-size:1.65rem; border-bottom:1px solid #d8dee4; padding-bottom:.25em; }
      h3 { font-size:1.3rem; }
      p { margin:0 0 1rem; }
      a { color:#0969da; text-decoration:none; }
      a:hover { text-decoration:underline; }
      img { max-width:100%; height:auto; }
      blockquote { margin:0 0 1rem; padding:.1rem 1rem; color:#57606a; border-left:4px solid #d0d7de; }
      ul,ol { padding-left:2rem; margin:0 0 1rem; }
      li+li { margin-top:.25rem; }
      hr { height:1px; margin:2rem 0; border:0; background:#d8dee4; }
      code { padding:.15em .35em; border-radius:5px; background:#eff1f3; font: .88em ui-monospace,SFMono-Regular,Consolas,monospace; }
      pre { padding:16px; overflow:auto; border-radius:8px; background:#f6f8fa; line-height:1.5; }
      pre code { padding:0; background:transparent; }
      .mermaid-diagram { margin:0 0 1rem; overflow:auto; border:1px solid #d8dee4; border-radius:8px; background:#fff; }
      .mermaid-diagram svg { display:block; height:auto; margin:0 auto; }
      table { width:100%; border-collapse:collapse; margin:0 0 1rem; display:block; overflow:auto; }
      th,td { padding:7px 12px; border:1px solid #d0d7de; text-align:left; }
      th { font-weight:600; background:#f6f8fa; }
      @media (max-width:600px) { article { padding:28px 18px 56px; } h1 { font-size:1.8rem; } }
    `;
    return style;
  }

  function renderMarkdown(markdown) {
    const article = document.createElement("article");
    const lines = markdown.replace(/\r\n?/g, "\n").split("\n");

    for (let i = 0; i < lines.length;) {
      const line = lines[i];
      if (!line.trim()) { i += 1; continue; }

      const fence = line.match(/^\s*(```+|~~~+)\s*([^\s]*)?.*$/);
      if (fence) {
        const marker = fence[1][0];
        const codeLines = [];
        i += 1;
        while (i < lines.length && !new RegExp(`^\\s*${marker}{3,}\\s*$`).test(lines[i])) {
          codeLines.push(lines[i]);
          i += 1;
        }
        if (i < lines.length) i += 1;
        if (fence[2]?.toLowerCase() === "mermaid") {
          const diagram = renderMermaid(codeLines.join("\n"));
          if (diagram) {
            article.append(diagram);
            continue;
          }
        }
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        if (fence[2]) code.className = `language-${fence[2].replace(/[^\w+-]/g, "")}`;
        code.textContent = codeLines.join("\n");
        pre.append(code);
        article.append(pre);
        continue;
      }

      const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (heading) {
        const element = document.createElement(`h${heading[1].length}`);
        appendInline(element, heading[2]);
        article.append(element);
        i += 1;
        continue;
      }

      if (i + 1 < lines.length && /^\s*\|?.+\|.+\|?\s*$/.test(line) && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[i + 1])) {
        const rows = [splitTableRow(line)];
        i += 2;
        while (i < lines.length && lines[i].includes("|")) rows.push(splitTableRow(lines[i++]));
        article.append(renderTable(rows));
        continue;
      }

      if (/^\s*(?:[-*_]\s*){3,}$/.test(line)) {
        article.append(document.createElement("hr"));
        i += 1;
        continue;
      }

      if (/^\s*>/.test(line)) {
        const quoteLines = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) quoteLines.push(lines[i++].replace(/^\s*> ?/, ""));
        const quote = document.createElement("blockquote");
        const nested = renderMarkdown(quoteLines.join("\n"));
        while (nested.firstChild) quote.append(nested.firstChild);
        article.append(quote);
        continue;
      }

      const listMatch = line.match(/^\s{0,3}([-+*]|\d+[.)])\s+(.+)$/);
      if (listMatch) {
        const ordered = /^\d/.test(listMatch[1]);
        const list = document.createElement(ordered ? "ol" : "ul");
        while (i < lines.length) {
          const item = lines[i].match(/^\s{0,3}([-+*]|\d+[.)])\s+(.+)$/);
          if (!item || /^\d/.test(item[1]) !== ordered) break;
          const li = document.createElement("li");
          appendInline(li, item[2]);
          list.append(li);
          i += 1;
        }
        article.append(list);
        continue;
      }

      const paragraph = [];
      while (i < lines.length && lines[i].trim() && !startsBlock(lines, i)) paragraph.push(lines[i++].trim());
      if (!paragraph.length) paragraph.push(lines[i++]);
      const p = document.createElement("p");
      appendInline(p, paragraph.join(" "));
      article.append(p);
    }
    return article;
  }

  function renderMermaid(source) {
    return renderMermaidFlowchart(source) || renderMermaidSequence(source);
  }

  function renderMermaidSequence(source) {
    const lines = source.split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("%%"));
    if (lines.shift()?.toLowerCase() !== "sequencediagram") return null;

    const participants = new Map();
    const rows = [];
    const frames = [];
    const frameStack = [];
    let autonumber = false;
    let messageNumber = 0;
    for (const line of lines) {
      if (line.toLowerCase() === "autonumber") {
        autonumber = true;
        continue;
      }
      const participant = line.match(/^(?:participant|actor)\s+([\w-]+)(?:\s+as\s+(.+))?$/i);
      if (participant) {
        participants.set(participant[1], participant[2] || participant[1]);
        continue;
      }
      const control = line.match(/^(loop|alt|opt|par|critical|break|else|and)\b\s*(.*)$/i);
      if (control) {
        const kind = control[1].toLowerCase();
        const index = rows.length;
        rows.push({ type: "control", label: `${kind}${control[2] ? ` ${control[2]}` : ""}` });
        if (["loop", "alt", "opt", "par", "critical", "break"].includes(kind)) frameStack.push({ start: index, label: rows[index].label });
        else if ((kind === "else" || kind === "and") && frameStack.length) rows[index].label = control[2] ? `${kind} ${control[2]}` : kind;
        continue;
      }
      if (/^end$/i.test(line)) {
        const frame = frameStack.pop();
        rows.push({ type: "blockEnd" });
        if (frame) frames.push({ ...frame, end: rows.length - 1 });
        continue;
      }
      const note = line.match(/^Note\s+(left of|right of|over)\s+([\w-]+)(?:\s*,\s*([\w-]+))?\s*:\s*(.*)$/i);
      if (note) {
        rows.push({ type: "note", placement: note[1].toLowerCase(), first: note[2], second: note[3] || note[2], label: note[4] });
        continue;
      }
      const message = line.match(/^([\w-]+?)\s*(-->>|->>|--x|->x|-->|->|-\.->)\s*([\w-]+)\s*:\s*(.*)$/);
      if (message) {
        if (!participants.has(message[1]) || !participants.has(message[3])) return null;
        messageNumber += 1;
        rows.push({ type: "message", from: message[1], to: message[3], arrow: message[2], label: `${autonumber ? `${messageNumber}. ` : ""}${message[4]}` });
        continue;
      }
      return null;
    }
    if (participants.size < 2 || !rows.some((row) => row.type === "message")) return null;
    while (frameStack.length) frames.push({ ...frameStack.pop(), end: rows.length - 1 });

    const participantEntries = [...participants.entries()];
    const centerX = new Map(participantEntries.map(([id], index) => [id, 110 + index * 230]));
    const width = 220 + Math.max(0, participantEntries.length - 1) * 230;
    const rowHeight = 54;
    const top = 100;
    const height = top + Math.max(rows.length, 1) * rowHeight + 35;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Mermaid sequence diagram");

    participantEntries.forEach(([id, label], index) => {
      const x = centerX.get(id);
      const header = svgElement("rect", { x: x - 95, y: "20", width: "190", height: "54", rx: "8", fill: "#f6f8fa", stroke: "#0969da", "stroke-width": "2" });
      svg.append(header);
      const labelText = svgElement("text", { x, y: "43", "text-anchor": "middle", fill: "#24292f", "font-size": "14" });
      appendSvgLines(labelText, label, 22, 15);
      svg.append(labelText);
      svg.append(svgElement("line", { x1: x, y1: "74", x2: x, y2: String(height - 15), stroke: "#8c959f", "stroke-width": "1.5", "stroke-dasharray": "5 5" }));
    });

    frames.forEach((frame) => {
      const y = top + frame.start * rowHeight - 17;
      const endY = top + (frame.end + 1) * rowHeight - 8;
      svg.append(svgElement("rect", { x: "24", y, width: String(width - 48), height: String(Math.max(rowHeight, endY - y)), rx: "5", fill: "none", stroke: "#8c959f", "stroke-width": "1.5" }));
    });
    const frameStarts = new Map(frames.map((frame) => [frame.start, frame]));

    rows.forEach((row, index) => {
      const y = top + index * rowHeight;
      if (row.type === "message") {
        const fromX = centerX.get(row.from);
        const toX = centerX.get(row.to);
        const leftToRight = fromX <= toX;
        const line = svgElement("line", {
          x1: fromX === toX ? fromX : fromX,
          y1: y,
          x2: fromX === toX ? fromX + 40 : leftToRight ? toX - 12 : toX + 12,
          y2: fromX === toX ? y + 24 : y,
          stroke: "#57606a",
          "stroke-width": "2",
          "marker-end": "url(#sequence-arrow)",
          "stroke-dasharray": row.arrow.startsWith("-.-") ? "5 4" : "none"
        });
        svg.append(line);
        const text = svgElement("text", { x: String((fromX + toX) / 2), y: String(y - 8), "text-anchor": "middle", fill: "#24292f", "font-size": "13" });
        appendSvgLines(text, row.label, Math.max(18, Math.floor(Math.abs(toX - fromX) / 8)), 14);
        svg.append(text);
      } else if (row.type === "note") {
        const firstX = centerX.get(row.first);
        const secondX = centerX.get(row.second);
        if (firstX === undefined || secondX === undefined) return;
        const minX = Math.min(firstX, secondX);
        const maxX = Math.max(firstX, secondX);
        const x = row.placement === "left of" ? firstX - 168 : row.placement === "right of" ? firstX + 18 : minX - 80;
        const noteWidth = row.placement === "over" ? Math.max(160, maxX - minX + 160) : 150;
        const noteBox = svgElement("rect", { x: String(Math.max(4, Math.min(width - noteWidth - 4, x))), y: String(y - 17), width: String(noteWidth), height: "42", rx: "5", fill: "#fff8c5", stroke: "#9a6700", "stroke-width": "1" });
        svg.append(noteBox);
        const text = svgElement("text", { x: String(Math.max(4, Math.min(width - noteWidth - 4, x)) + 8), y: String(y), fill: "#24292f", "font-size": "12" });
        appendSvgLines(text, row.label, Math.max(16, Math.floor(noteWidth / 8)), 13);
        svg.append(text);
      } else if (row.type === "control") {
        const frame = frameStarts.get(index);
        if (frame) {
          const labelWidth = Math.min(width - 48, Math.max(150, Array.from(frame.label).length * 13 + 20));
          const tag = svgElement("rect", { x: "24", y: String(y - 16), width: String(labelWidth), height: String(rowHeight - 4), rx: "3", fill: "#ddf4ff", stroke: "#8c959f", "stroke-width": "1" });
          svg.append(tag);
          const label = svgElement("text", { x: "34", y: String(y + 5), fill: "#24292f", "font-size": "13" });
          appendSvgLines(label, frame.label, Math.max(12, Math.floor((labelWidth - 20) / 8)), 14);
          svg.append(label);
          return;
        }
        const text = svgElement("text", { x: "32", y: String(y + 4), fill: "#24292f", "font-size": "13" });
        text.textContent = row.label;
        svg.append(text);
      }
    });

    const defs = svgElement("defs");
    const marker = svgElement("marker", { id: "sequence-arrow", markerWidth: "10", markerHeight: "10", refX: "8", refY: "5", orient: "auto", markerUnits: "strokeWidth" });
    marker.append(svgElement("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: "#57606a" }));
    defs.append(marker);
    svg.prepend(defs);

    const wrapper = document.createElement("div");
    wrapper.className = "mermaid-diagram";
    wrapper.append(svg);
    return wrapper;
  }

  function appendSvgLines(parent, text, maxChars, lineHeight) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = "";
    for (const word of words) {
      const chunks = Array.from(word).reduce((parts, char) => {
        if (!parts.length || Array.from(parts[parts.length - 1]).length >= maxChars) parts.push(char);
        else parts[parts.length - 1] += char;
        return parts;
      }, []);
      for (const chunk of chunks) {
        const next = line ? `${line} ${chunk}` : chunk;
        if (line && Array.from(next).length > maxChars) {
          lines.push(line);
          line = chunk;
        } else line = next;
      }
    }
    if (line) lines.push(line);
    const startY = -(lines.length - 1) * lineHeight / 2;
    lines.forEach((value, index) => {
      const span = svgElement("tspan", { x: parent.getAttribute("x"), dy: index === 0 ? String(startY) : String(lineHeight) });
      span.textContent = value;
      parent.append(span);
    });
  }

  function renderMermaidFlowchart(source) {
    const lines = source.split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("%%"));
    const header = lines.shift()?.match(/^(?:graph|flowchart)\s+(TD|TB|BT|LR|RL)\s*;?$/i);
    if (!header || lines.some((line) => /^(?:subgraph|end|classDef|class|style|click)\b/i.test(line))) return null;

    const direction = header[1].toUpperCase();
    const nodes = new Map();
    const edges = [];
    const nodePattern = String.raw`[\w-]+(?:\[\[[^\]]*\]\]|\[[^\]]*\]|\(\([^)]*\)\)|\([^)]*\)|\{[^}]*\})?`;
    const nodeToken = /^([\w-]+)(?:\[\[([^\]]*)\]\]|\[([^\]]*)\]|\(\(([^)]*)\)\)|\(([^)]*)\)|\{([^}]*)\})?$/;
    const edgeLine = new RegExp(`^\\s*(${nodePattern})\\s*(-->|---|==>|-\\.->)(?:\\s*\\|([^|]*)\\|)?\\s*(${nodePattern})\\s*;?\\s*$`);

    function addNode(token) {
      const match = token.trim().match(nodeToken);
      if (!match) return null;
      const id = match[1];
      if (!nodes.has(id)) {
        const shape = match[4] !== undefined || match[5] !== undefined ? "circle" : match[6] !== undefined ? "diamond" : "rect";
        const label = match[2] ?? match[3] ?? match[4] ?? match[5] ?? match[6] ?? id;
        nodes.set(id, { id, label, shape });
      }
      return id;
    }

    for (const line of lines) {
      const match = line.match(edgeLine);
      if (match) {
        const from = addNode(match[1]);
        const to = addNode(match[4]);
        if (from && to) edges.push({ from, to, label: match[3] || "", kind: match[2] });
        continue;
      }
      const node = addNode(line.replace(/;$/, ""));
      if (!node) return null;
    }
    if (!nodes.size || !edges.length) return null;

    const incoming = new Map([...nodes.keys()].map((id) => [id, []]));
    edges.forEach((edge) => {
      incoming.get(edge.to).push(edge.from);
    });
    const rank = new Map();
    const visiting = new Set();
    function getRank(id) {
      if (rank.has(id)) return rank.get(id);
      if (visiting.has(id)) return 0;
      visiting.add(id);
      const value = incoming.get(id).length ? Math.max(...incoming.get(id).map((parent) => getRank(parent) + 1)) : 0;
      visiting.delete(id);
      rank.set(id, value);
      return value;
    }
    nodes.forEach((_, id) => getRank(id));

    const isHorizontal = direction === "LR" || direction === "RL";
    const reverse = direction === "BT" || direction === "RL";
    const levels = new Map();
    nodes.forEach((node, id) => {
      const depth = rank.get(id);
      if (!levels.has(depth)) levels.set(depth, []);
      levels.get(depth).push(node);
    });
    const levelEntries = [...levels.entries()].sort((a, b) => a[0] - b[0]);
    if (reverse) levelEntries.reverse();
    const nodeWidth = 180;
    const nodeHeight = 64;
    const gapX = 70;
    const gapY = 52;
    const maxInLevel = Math.max(...levelEntries.map(([, level]) => level.length));
    const width = isHorizontal ? levelEntries.length * (nodeWidth + gapX) + gapX : maxInLevel * (nodeWidth + gapX) + gapX;
    const height = isHorizontal ? maxInLevel * (nodeHeight + gapY) + gapY : levelEntries.length * (nodeHeight + gapY) + gapY;
    const positions = new Map();
    levelEntries.forEach(([, level], depthIndex) => level.forEach((node, rowIndex) => {
      const x = isHorizontal ? gapX + depthIndex * (nodeWidth + gapX) : gapX + rowIndex * (nodeWidth + gapX);
      const y = isHorizontal ? gapY + rowIndex * (nodeHeight + gapY) : gapY + depthIndex * (nodeHeight + gapY);
      positions.set(node.id, { x, y });
    }));

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Mermaid flowchart");
    const defs = svgElement("defs");
    const marker = svgElement("marker", { id: "mermaid-arrow", markerWidth: "10", markerHeight: "10", refX: "8", refY: "5", orient: "auto", markerUnits: "strokeWidth" });
    marker.append(svgElement("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: "#57606a" }));
    defs.append(marker);
    svg.append(defs);

    edges.forEach((edge) => {
      const from = positions.get(edge.from);
      const to = positions.get(edge.to);
      const start = { x: from.x + nodeWidth / 2, y: from.y + nodeHeight / 2 };
      const end = { x: to.x + nodeWidth / 2, y: to.y + nodeHeight / 2 };
      const line = svgElement("line", { x1: start.x, y1: start.y, x2: end.x, y2: end.y, stroke: "#57606a", "stroke-width": "2", "marker-end": "url(#mermaid-arrow)" });
      svg.append(line);
      if (edge.label) {
        const label = svgElement("text", { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 - 8, "text-anchor": "middle", fill: "#57606a", "font-size": "13" });
        label.textContent = edge.label;
        svg.append(label);
      }
    });
    nodes.forEach((node, id) => {
      const { x, y } = positions.get(id);
      const shape = node.shape === "diamond"
        ? svgElement("polygon", { points: `${x + nodeWidth / 2},${y} ${x + nodeWidth},${y + nodeHeight / 2} ${x + nodeWidth / 2},${y + nodeHeight} ${x},${y + nodeHeight / 2}` })
        : node.shape === "circle"
          ? svgElement("ellipse", { cx: x + nodeWidth / 2, cy: y + nodeHeight / 2, rx: nodeWidth / 2, ry: nodeHeight / 2 })
          : svgElement("rect", { x, y, width: nodeWidth, height: nodeHeight, rx: "8" });
      shape.setAttribute("fill", "#f6f8fa");
      shape.setAttribute("stroke", "#0969da");
      shape.setAttribute("stroke-width", "2");
      svg.append(shape);
      const label = svgElement("text", { x: x + nodeWidth / 2, y: y + nodeHeight / 2 + 5, "text-anchor": "middle", fill: "#24292f", "font-size": "15" });
      label.textContent = node.label;
      svg.append(label);
    });

    const wrapper = document.createElement("div");
    wrapper.className = "mermaid-diagram";
    wrapper.append(svg);
    return wrapper;
  }

  function svgElement(name, attributes = {}) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  }

  function startsBlock(lines, index) {
    const line = lines[index];
    return /^\s{0,3}(#{1,6}\s|>|```|~~~|([-+*]|\d+[.)])\s+)/.test(line)
      || /^\s*(?:[-*_]\s*){3,}$/.test(line)
      || (index + 1 < lines.length && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[index + 1]));
  }

  function appendInline(parent, text) {
    const pattern = /(!?)\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_|~~([^~]+)~~/g;
    let cursor = 0;
    let match;
    while ((match = pattern.exec(text))) {
      parent.append(document.createTextNode(text.slice(cursor, match.index)));
      if (match[2] !== undefined) {
        const destination = safeDestination(match[3], match[1] === "!");
        if (!destination) {
          parent.append(document.createTextNode(match[0]));
        } else if (match[1] === "!") {
          const image = document.createElement("img");
          image.src = destination;
          image.alt = match[2];
          if (match[4]) image.title = match[4];
          parent.append(image);
        } else {
          const link = document.createElement("a");
          link.href = destination;
          link.rel = "noopener noreferrer";
          link.textContent = match[2];
          if (match[4]) link.title = match[4];
          parent.append(link);
        }
      } else if (match[5] !== undefined) {
        const code = document.createElement("code");
        code.textContent = match[5];
        parent.append(code);
      } else {
        const content = match[6] ?? match[7] ?? match[8] ?? match[9] ?? match[10];
        const tag = match[6] || match[7] ? "strong" : match[10] ? "del" : "em";
        const emphasis = document.createElement(tag);
        appendInline(emphasis, content);
        parent.append(emphasis);
      }
      cursor = pattern.lastIndex;
    }
    parent.append(document.createTextNode(text.slice(cursor)));
  }

  function safeDestination(raw, isImage) {
    try {
      const url = new URL(raw, window.location.href);
      const explicitScheme = /^[a-z][a-z\d+.-]*:/i.test(raw);
      if (url.protocol === "http:" || url.protocol === "https:" || (!isImage && url.protocol === "mailto:")) return url.href;
      if (url.protocol === "file:" && window.location.protocol === "file:" && !explicitScheme) return url.href;
    } catch (_) { /* Keep invalid destinations as plain Markdown text. */ }
    return null;
  }

  function splitTableRow(line) {
    return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
  }

  function renderTable(rows) {
    const table = document.createElement("table");
    const head = document.createElement("thead");
    const header = document.createElement("tr");
    rows[0].forEach((value) => {
      const cell = document.createElement("th");
      appendInline(cell, value);
      header.append(cell);
    });
    head.append(header);
    table.append(head);
    const body = document.createElement("tbody");
    rows.slice(1).forEach((row) => {
      const tr = document.createElement("tr");
      rows[0].forEach((_, index) => {
        const cell = document.createElement("td");
        appendInline(cell, row[index] || "");
        tr.append(cell);
      });
      body.append(tr);
    });
    table.append(body);
    return table;
  }
})();
