#!/usr/bin/env python3
"""
Interactive local web UI for editing `priority` and `featured` status in
Portfolio project MDX frontmatter headers.

Usage:
    python3 manage_projects.py
    python3 manage_projects.py --port 8765 --no-open
    python3 manage_projects.py --list
"""

from __future__ import annotations

import argparse
import html
import json
import mimetypes
import os
import re
import socket
import sys
import urllib.parse
import webbrowser
from dataclasses import dataclass
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

ROOT_DIR = Path(__file__).resolve().parent
PROJECTS_DIR = ROOT_DIR / "src" / "content" / "projects"
HIDDEN_DIR = ROOT_DIR / "src" / "content" / "projects-hidden"
PUBLIC_DIR = ROOT_DIR / "public"
DEFAULT_PRIORITY = 99

FRONTMATTER_RE = re.compile(r"^(---\r?\n)(.*?)(\r?\n---\r?\n?)(.*)$", re.DOTALL)


@dataclass
class ProjectRecord:
    id: str
    collection: str  # "projects" | "projects-hidden"
    path: Path
    title: str
    role: str
    year: int
    status: str
    priority: int
    filters: list[str]
    featured: bool
    thumbnail: str


def _parse_string_field(fm: str, key: str, default: str = "") -> str:
    m = re.search(rf'^{re.escape(key)}:\s*(?:"([^"]*)"|\'([^\']*)\'|([^\r\n#]+))', fm, re.MULTILINE)
    if not m:
        return default
    for group in m.groups():
        if group is not None:
            return group.strip()
    return default


def _parse_int_field(fm: str, key: str, default: int = 0) -> int:
    m = re.search(rf"^{re.escape(key)}:\s*(-?\d+)", fm, re.MULTILINE)
    return int(m.group(1)) if m else default


def _parse_filters(fm: str) -> list[str]:
    # Inline array: filters: ["featured", "vastlab", "VR"]
    m = re.search(r"^filters:\s*\[([^\]]*)\]", fm, re.MULTILINE)
    if m:
        raw_items = m.group(1).strip()
        if not raw_items:
            return []
        items: list[str] = []
        for part in raw_items.split(","):
            val = part.strip().strip('"').strip("'").strip()
            if val:
                items.append(val)
        return items

    # Multiline YAML list fallback
    m_block = re.search(r"^filters:\s*\r?\n((?:\s*-\s*[^\r\n]+\r?\n?)+)", fm, re.MULTILINE)
    if m_block:
        items = []
        for line in m_block.group(1).splitlines():
            item = line.strip().lstrip("-").strip().strip('"').strip("'")
            if item:
                items.append(item)
        return items

    return []


def resolve_thumbnail_url(slug: str, thumbnail: str) -> str:
    trimmed = thumbnail.strip()
    if not trimmed:
        return f"/images/projects/{slug}/thumbnail.jpg"
    if trimmed.startswith("/") or trimmed.startswith("http://") or trimmed.startswith("https://"):
        return trimmed
    return f"/images/projects/{slug}/{trimmed}"


def load_projects() -> list[ProjectRecord]:
    records: list[ProjectRecord] = []
    for collection_name, directory in (("projects", PROJECTS_DIR), ("projects-hidden", HIDDEN_DIR)):
        if not directory.exists():
            continue
        for path in sorted(directory.glob("*.md*")):
            if path.suffix.lower() not in (".md", ".mdx"):
                continue
            text = path.read_text(encoding="utf-8")
            m = FRONTMATTER_RE.match(text)
            if not m:
                continue
            fm = m.group(2)
            filters = _parse_filters(fm)
            priority = _parse_int_field(fm, "priority", DEFAULT_PRIORITY)
            title = _parse_string_field(fm, "title", path.stem)
            role = _parse_string_field(fm, "role", "")
            year = _parse_int_field(fm, "year", 0)
            thumbnail_raw = _parse_string_field(fm, "thumbnail", "")
            thumbnail = resolve_thumbnail_url(path.stem, thumbnail_raw)
            status = "Hidden" if collection_name == "projects-hidden" else _parse_string_field(fm, "status", "")
            records.append(
                ProjectRecord(
                    id=f"{collection_name}/{path.name}",
                    collection=collection_name,
                    path=path,
                    title=title,
                    role=role,
                    year=year,
                    status=status,
                    priority=priority,
                    filters=filters,
                    featured="featured" in filters,
                    thumbnail=thumbnail,
                )
            )
    records.sort(key=lambda r: (r.collection != "projects", r.priority, r.title.lower()))
    return records


def _format_inline_array(items: list[str]) -> str:
    escaped = [f'"{item.replace(chr(34), chr(92) + chr(34))}"' for item in items]
    return "[" + ", ".join(escaped) + "]"


def update_project_frontmatter(path: Path, new_priority: int, new_filters: list[str]) -> bool:
    """Update only `priority` and `filters` in frontmatter, preserving line endings and body."""
    raw_bytes = path.read_bytes()
    eol = "\r\n" if b"\r\n" in raw_bytes else "\n"
    text = raw_bytes.decode("utf-8")
    m = FRONTMATTER_RE.match(text)
    if not m:
        raise ValueError(f"Invalid frontmatter in {path}")

    open_delim, fm, close_delim, body = m.groups()
    current_priority = _parse_int_field(fm, "priority", DEFAULT_PRIORITY)
    current_filters = _parse_filters(fm)

    if current_priority == new_priority and current_filters == new_filters:
        return False

    updated_fm = fm

    # Update or insert priority
    if re.search(r"^priority:\s*-?\d+.*$", updated_fm, re.MULTILINE):
        updated_fm = re.sub(
            r"^priority:\s*-?\d+.*$",
            f"priority: {new_priority}",
            updated_fm,
            count=1,
            flags=re.MULTILINE,
        )
    else:
        updated_fm = updated_fm.rstrip("\r\n") + f"{eol}priority: {new_priority}"

    # Update filters if changed
    if current_filters != new_filters:
        filters_line = f"filters: {_format_inline_array(new_filters)}"

        if re.search(r"^filters:\s*\[[^\]]*\].*$", updated_fm, re.MULTILINE):
            updated_fm = re.sub(
                r"^filters:\s*\[[^\]]*\].*$",
                filters_line,
                updated_fm,
                count=1,
                flags=re.MULTILINE,
            )
        elif re.search(r"^filters:\s*\r?\n(?:\s*-\s*[^\r\n]+\r?\n?)+", updated_fm, re.MULTILINE):
            updated_fm = re.sub(
                r"^filters:\s*\r?\n(?:\s*-\s*[^\r\n]+\r?\n?)+",
                filters_line + eol,
                updated_fm,
                count=1,
                flags=re.MULTILINE,
            )
        else:
            updated_fm = updated_fm.rstrip("\r\n") + f"{eol}{filters_line}"

    new_text = f"{open_delim}{updated_fm}{close_delim}{body}"
    if new_text == text:
        return False

    tmp_path = path.with_suffix(path.suffix + ".tmp")
    tmp_path.write_bytes(new_text.encode("utf-8"))
    os.replace(tmp_path, path)
    return True


def move_project_collection(path: Path, target_collection: str) -> Path:
    """Move a project MDX file between `projects` and `projects-hidden`."""
    dest_dir = PROJECTS_DIR if target_collection == "projects" else HIDDEN_DIR
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_path = dest_dir / path.name
    if dest_path.resolve() == path.resolve():
        return path
    if dest_path.exists():
        raise FileExistsError(f"Destination already exists: {dest_path}")
    os.replace(path, dest_path)
    return dest_path


HTML_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Portfolio Project Priority &amp; Featured Manager</title>
  <style>
    :root {
      --bg: #16171a;
      --surface: #1f2126;
      --elevated: #292c33;
      --border: #383c46;
      --text: #f3f4f6;
      --muted: #9ca3af;
      --accent: #35bfff;
      --accent-fg: #08131a;
      --featured: #f59e0b;
      --hidden-bg: rgba(161, 98, 39, 0.22);
      --hidden-fg: #e6b17a;
      --success: #22c55e;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.45;
    }
    header {
      position: sticky;
      top: 0;
      z-index: 20;
      background: rgba(22, 23, 26, 0.92);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border);
      padding: 14px 24px;
    }
    .container { max-width: 1120px; margin: 0 auto; }
    .header-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    h1 { margin: 0; font-size: 1.2rem; font-weight: 700; }
    .sub { color: var(--muted); font-size: 0.85rem; margin-top: 2px; }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    button {
      border: 1px solid var(--border);
      background: var(--elevated);
      color: var(--text);
      padding: 7px 12px;
      border-radius: 5px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
    }
    button:hover { border-color: var(--accent); color: var(--accent); }
    button.primary {
      background: var(--accent);
      color: var(--accent-fg);
      border-color: var(--accent);
    }
    button.primary:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    main { padding: 20px 24px 48px; }
    .toolbar {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 12px 14px;
    }
    .toolbar-top {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      justify-content: space-between;
    }
    .tags-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      padding-top: 10px;
      border-top: 1px solid var(--border);
    }
    .tags-label {
      font-family: ui-monospace, monospace;
      font-size: 0.74rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--muted);
      margin-right: 4px;
    }
    .palette-chip {
      padding: 4px 9px;
      font-size: 0.78rem;
      font-family: ui-monospace, monospace;
      border-radius: 4px;
      background: var(--bg);
      color: var(--muted);
      border: 1px solid var(--border);
    }
    .palette-chip.active {
      background: var(--accent);
      color: var(--accent-fg);
      border-color: var(--accent);
    }
    .add-tag-wrap {
      display: inline-flex;
      gap: 4px;
      align-items: center;
      margin-left: auto;
    }
    .add-tag-input {
      background: var(--bg);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 0.8rem;
      width: 130px;
    }
    .add-tag-btn {
      padding: 4px 9px;
      font-size: 0.82rem;
    }
    .tabs { display: flex; flex-wrap: wrap; gap: 6px; }
    .tab.active {
      background: var(--accent);
      color: var(--accent-fg);
      border-color: var(--accent);
    }
    input[type="search"] {
      background: var(--bg);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 5px;
      padding: 7px 11px;
      font-size: 0.88rem;
      min-width: 240px;
    }
    .list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .list.dragging-active .row * {
      pointer-events: none;
    }
    .row {
      display: grid;
      grid-template-columns: 32px 84px 88px 1fr auto auto auto;
      gap: 12px;
      align-items: center;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 10px 14px;
      transition: border-color 0.12s, background 0.12s;
    }
    .thumb {
      width: 88px;
      height: 50px;
      object-fit: cover;
      border-radius: 4px;
      border: 1px solid var(--border);
      background: var(--bg);
      display: block;
    }
    .row.dragging { opacity: 0.45; }
    .row.drop-before { box-shadow: inset 0 3px 0 0 var(--accent); border-top-color: var(--accent); }
    .row.drop-after { box-shadow: inset 0 -3px 0 0 var(--accent); border-bottom-color: var(--accent); }
    .row.dirty { border-left: 3px solid var(--accent); }
    .handle {
      cursor: grab;
      color: var(--muted);
      font-size: 1.1rem;
      user-select: none;
      text-align: center;
    }
    .prio-input {
      width: 78px;
      background: var(--bg);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 6px 8px;
      font-family: ui-monospace, monospace;
      font-size: 0.9rem;
      text-align: center;
    }
    .meta { min-width: 0; }
    .title-line {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    .title { font-weight: 600; font-size: 0.96rem; }
    .slug { font-family: ui-monospace, monospace; font-size: 0.74rem; color: var(--muted); margin-top: 2px; }
    .row-tags {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 5px;
      margin-top: 6px;
    }
    .tag-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-family: ui-monospace, monospace;
      font-size: 0.72rem;
      padding: 2px 6px;
      border-radius: 3px;
      background: var(--elevated);
      border: 1px solid var(--border);
      color: var(--text);
    }
    .tag-remove {
      border: none;
      background: transparent;
      color: var(--muted);
      padding: 0 2px;
      font-size: 0.85rem;
      line-height: 1;
      cursor: pointer;
    }
    .tag-remove:hover { color: #f87171; border: none; }
    .tag-add-select {
      background: var(--bg);
      color: var(--muted);
      border: 1px dashed var(--border);
      border-radius: 3px;
      padding: 2px 6px;
      font-family: ui-monospace, monospace;
      font-size: 0.72rem;
      cursor: pointer;
    }
    .badge {
      font-family: ui-monospace, monospace;
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 3px;
      border: 1px solid var(--border);
      color: var(--muted);
    }
    .visibility-btn.is-hidden {
      background: var(--hidden-bg);
      color: var(--hidden-fg);
      border-color: rgba(214, 146, 84, 0.5);
    }
    .featured-btn.on {
      background: rgba(245, 158, 11, 0.18);
      color: #fbbf24;
      border-color: rgba(245, 158, 11, 0.5);
    }
    .move-btns { display: flex; gap: 4px; }
    .move-btns button { padding: 5px 8px; font-size: 0.78rem; }
    .toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #14532d;
      color: #dcfce7;
      border: 1px solid #22c55e;
      padding: 10px 16px;
      border-radius: 6px;
      font-size: 0.88rem;
      display: none;
      z-index: 50;
    }
    @media (max-width: 820px) {
      .row { grid-template-columns: 24px 72px 72px 1fr; }
      .thumb { width: 72px; height: 42px; }
      .visibility-btn, .featured-btn, .move-btns { grid-column: 2 / -1; justify-self: start; }
    }
  </style>
</head>
<body>
  <header>
    <div class="container header-row">
      <div>
        <h1>Portfolio Priority &amp; Featured Manager</h1>
        <div class="sub" id="summary">Loading projects...</div>
      </div>
      <div class="actions">
        <button id="renumber-featured-btn" title="Assign priorities 1..N to featured projects in current order">Renumber Featured (1..N)</button>
        <button id="renumber-all-btn" title="Assign priorities 1..N to all visible public projects in current order">Renumber Public (1..N)</button>
        <button id="reload-btn">Reload Disk</button>
        <button id="save-btn" class="primary" disabled>Save Changes (0)</button>
      </div>
    </div>
  </header>

  <main class="container">
    <div class="toolbar">
      <div class="toolbar-top">
        <div class="tabs">
          <button class="tab active" data-tab="all" id="tab-all">All (0)</button>
          <button class="tab" data-tab="public" id="tab-public">Public (0)</button>
          <button class="tab" data-tab="hidden" id="tab-hidden">Hidden (0)</button>
        </div>
        <input type="search" id="search" placeholder="Filter by title, filename, or tag..." />
      </div>
      <div class="tags-bar" id="tags-bar">
        <span class="tags-label">Tags:</span>
        <div id="tag-palette" style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;"></div>
        <div class="add-tag-wrap">
          <input type="text" id="new-tag-input" class="add-tag-input" placeholder="New tag..." />
          <button type="button" id="add-tag-btn" class="add-tag-btn" title="Add tag to available tag list">+</button>
        </div>
      </div>
    </div>

    <div class="list" id="project-list"></div>
  </main>

  <div class="toast" id="toast"></div>

  <script>
    const DEFAULT_TAGS = ["game", "VR", "AR", "graphics", "utility", "vastlab", "gamelab", "milab", "metaverse", "gamejam"];
    let projects = [];
    let originalMap = new Map();
    let availableTags = [...DEFAULT_TAGS];
    let activeTab = "all";
    let activeTagFilter = "";
    let searchQuery = "";
    let dragSrcId = null;
    let dropTargetInfo = null; // { id, position: "before" | "after" }

    const listEl = document.getElementById("project-list");
    const summaryEl = document.getElementById("summary");
    const saveBtn = document.getElementById("save-btn");
    const toastEl = document.getElementById("toast");
    const tagPaletteEl = document.getElementById("tag-palette");

    function showToast(msg, isError = false) {
      toastEl.textContent = msg;
      toastEl.style.background = isError ? "#7f1d1d" : "#14532d";
      toastEl.style.borderColor = isError ? "#ef4444" : "#22c55e";
      toastEl.style.color = isError ? "#fee2e2" : "#dcfce7";
      toastEl.style.display = "block";
      clearTimeout(showToast._timer);
      showToast._timer = setTimeout(() => { toastEl.style.display = "none"; }, 2600);
    }

    function arraysEqual(a, b) {
      return a.length === b.length && a.every((v, i) => v === b[i]);
    }

    function buildFullFilters(p) {
      const base = p.tags.filter((t) => t !== "featured");
      return p.featured ? ["featured", ...base] : base;
    }

    function isRowDirty(p) {
      const orig = originalMap.get(p.id);
      if (!orig) return true;
      return (
        orig.priority !== p.priority ||
        orig.featured !== p.featured ||
        orig.collection !== p.collection ||
        !arraysEqual(orig.tags, p.tags)
      );
    }

    function getDirtyItems() {
      return projects.filter(isRowDirty);
    }

    function syncAvailableTagsFromProjects() {
      const set = new Set(availableTags);
      for (const p of projects) {
        for (const t of p.tags) {
          if (t && t !== "featured") set.add(t);
        }
      }
      availableTags = Array.from(set);
    }

    function renderTagPalette() {
      syncAvailableTagsFromProjects();
      tagPaletteEl.innerHTML = "";

      const allChip = document.createElement("button");
      allChip.type = "button";
      allChip.className = "palette-chip" + (activeTagFilter === "" ? " active" : "");
      allChip.textContent = "All Tags";
      allChip.addEventListener("click", () => {
        activeTagFilter = "";
        render();
      });
      tagPaletteEl.appendChild(allChip);

      for (const tag of availableTags) {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "palette-chip" + (activeTagFilter.toLowerCase() === tag.toLowerCase() ? " active" : "");
        const count = projects.filter((p) => p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())).length;
        chip.textContent = `${tag} (${count})`;
        chip.title = `Filter projects with "${tag}"`;
        chip.addEventListener("click", () => {
          activeTagFilter = activeTagFilter.toLowerCase() === tag.toLowerCase() ? "" : tag;
          render();
        });
        tagPaletteEl.appendChild(chip);
      }
    }

    function updateSummaryAndSaveButton() {
      const publicList = projects.filter((p) => p.collection === "projects");
      const featuredCount = publicList.filter((p) => p.featured).length;
      const hiddenCount = projects.filter((p) => p.collection === "projects-hidden").length;
      summaryEl.textContent = `${publicList.length} public (${featuredCount} featured) • ${hiddenCount} hidden`;

      document.getElementById("tab-all").textContent = `All (${projects.length})`;
      document.getElementById("tab-public").textContent = `Public (${publicList.length})`;
      document.getElementById("tab-hidden").textContent = `Hidden (${hiddenCount})`;

      const dirtyCount = getDirtyItems().length;
      saveBtn.textContent = `Save Changes (${dirtyCount})`;
      saveBtn.disabled = dirtyCount === 0;
    }

    function getVisibleProjects() {
      return projects
        .filter((p) => {
          if (activeTab === "all") return true;
          if (activeTab === "public") return p.collection === "projects";
          if (activeTab === "hidden") return p.collection === "projects-hidden";
          return true;
        })
        .filter((p) => {
          if (!activeTagFilter) return true;
          return p.tags.some((t) => t.toLowerCase() === activeTagFilter.toLowerCase());
        })
        .filter((p) => {
          if (!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return (
            p.title.toLowerCase().includes(q) ||
            p.id.toLowerCase().includes(q) ||
            p.tags.join(" ").toLowerCase().includes(q)
          );
        })
        .sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title));
    }

    function clearDropIndicators() {
      document.querySelectorAll(".row.drop-before, .row.drop-after").forEach((el) => {
        el.classList.remove("drop-before", "drop-after");
      });
    }

    function render() {
      renderTagPalette();
      const visible = getVisibleProjects();
      listEl.innerHTML = "";

      for (const p of visible) {
        const isDirty = isRowDirty(p);

        const row = document.createElement("div");
        row.className = "row" + (isDirty ? " dirty" : "");
        row.draggable = true;
        row.dataset.id = p.id;

        const handle = document.createElement("div");
        handle.className = "handle";
        handle.textContent = "⋮⋮";
        handle.title = "Drag to reorder";

        const prioInput = document.createElement("input");
        prioInput.type = "number";
        prioInput.className = "prio-input";
        prioInput.value = String(p.priority);
        prioInput.addEventListener("change", () => {
          const val = parseInt(prioInput.value, 10);
          p.priority = Number.isFinite(val) ? val : 99;
          render();
        });

        const thumb = document.createElement("img");
        thumb.className = "thumb";
        thumb.src = p.thumbnail || "/images/default.jpg";
        thumb.alt = p.title;
        thumb.loading = "lazy";
        thumb.onerror = () => {
          thumb.onerror = null;
          thumb.src = "/images/default.jpg";
        };

        const meta = document.createElement("div");
        meta.className = "meta";
        meta.innerHTML = `
          <div class="title-line">
            <span class="title"></span>
            ${p.year ? `<span class="badge">${p.year}</span>` : ""}
          </div>
          <div class="slug">${p.collection}/${p.filename}</div>
        `;
        meta.querySelector(".title").textContent = p.title;

        const rowTags = document.createElement("div");
        rowTags.className = "row-tags";
        for (const tag of p.tags) {
          const chip = document.createElement("span");
          chip.className = "tag-chip";
          const labelSpan = document.createElement("span");
          labelSpan.textContent = tag;
          const removeBtn = document.createElement("button");
          removeBtn.type = "button";
          removeBtn.className = "tag-remove";
          removeBtn.textContent = "×";
          removeBtn.title = `Remove "${tag}"`;
          removeBtn.addEventListener("click", () => {
            p.tags = p.tags.filter((t) => t !== tag);
            render();
          });
          chip.append(labelSpan, removeBtn);
          rowTags.appendChild(chip);
        }

        const missingTags = availableTags.filter(
          (t) => !p.tags.some((existing) => existing.toLowerCase() === t.toLowerCase())
        );
        const addSelect = document.createElement("select");
        addSelect.className = "tag-add-select";
        const placeholderOpt = document.createElement("option");
        placeholderOpt.value = "";
        placeholderOpt.textContent = "+ Tag";
        addSelect.appendChild(placeholderOpt);
        for (const t of missingTags) {
          const opt = document.createElement("option");
          opt.value = t;
          opt.textContent = t;
          addSelect.appendChild(opt);
        }
        addSelect.addEventListener("change", () => {
          const chosen = addSelect.value;
          if (chosen && !p.tags.some((t) => t.toLowerCase() === chosen.toLowerCase())) {
            p.tags.push(chosen);
            render();
          }
        });
        rowTags.appendChild(addSelect);
        meta.appendChild(rowTags);

        const visBtn = document.createElement("button");
        const isHidden = p.collection === "projects-hidden";
        visBtn.className = "visibility-btn" + (isHidden ? " is-hidden" : "");
        visBtn.textContent = isHidden ? "Hidden" : "Public";
        visBtn.title = isHidden ? "Click to move to public projects" : "Click to move to projects-hidden";
        visBtn.addEventListener("click", () => {
          p.collection = p.collection === "projects" ? "projects-hidden" : "projects";
          render();
        });

        const featBtn = document.createElement("button");
        featBtn.className = "featured-btn" + (p.featured ? " on" : "");
        featBtn.textContent = p.featured ? "★ Featured" : "☆ Not Featured";
        featBtn.addEventListener("click", () => {
          p.featured = !p.featured;
          render();
        });

        const moves = document.createElement("div");
        moves.className = "move-btns";
        const upBtn = document.createElement("button");
        upBtn.textContent = "▲";
        upBtn.title = "Move up";
        upBtn.addEventListener("click", () => shiftItem(p.id, -1));
        const downBtn = document.createElement("button");
        downBtn.textContent = "▼";
        downBtn.title = "Move down";
        downBtn.addEventListener("click", () => shiftItem(p.id, 1));
        moves.append(upBtn, downBtn);

        row.addEventListener("dragstart", (e) => {
          dragSrcId = p.id;
          dropTargetInfo = null;
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", p.id);
          row.classList.add("dragging");
          listEl.classList.add("dragging-active");
        });
        row.addEventListener("dragend", () => {
          dragSrcId = null;
          dropTargetInfo = null;
          row.classList.remove("dragging");
          listEl.classList.remove("dragging-active");
          clearDropIndicators();
        });

        row.append(handle, prioInput, thumb, meta, visBtn, featBtn, moves);
        listEl.appendChild(row);
      }

      updateSummaryAndSaveButton();
    }

    listEl.addEventListener("dragenter", (e) => {
      if (!dragSrcId) return;
      e.preventDefault();
    });

    listEl.addEventListener("dragover", (e) => {
      if (!dragSrcId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      const rows = Array.from(listEl.querySelectorAll(".row"));
      if (rows.length === 0) return;

      let chosen = null;
      for (const r of rows) {
        const rect = r.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        if (e.clientY < mid) {
          chosen = { el: r, id: r.dataset.id, position: "before" };
          break;
        }
      }
      if (!chosen) {
        const last = rows[rows.length - 1];
        chosen = { el: last, id: last.dataset.id, position: "after" };
      }

      clearDropIndicators();
      if (chosen.id !== dragSrcId) {
        chosen.el.classList.add(chosen.position === "before" ? "drop-before" : "drop-after");
      }
      dropTargetInfo = { id: chosen.id, position: chosen.position };
    });

    listEl.addEventListener("drop", (e) => {
      if (!dragSrcId) return;
      e.preventDefault();
      const target = dropTargetInfo;
      const src = dragSrcId;
      dragSrcId = null;
      dropTargetInfo = null;
      listEl.classList.remove("dragging-active");
      clearDropIndicators();
      if (target && target.id && src !== target.id) {
        reorderItems(src, target.id, target.position);
      }
    });

    function reorderItems(srcId, targetId, position = "before") {
      const visible = getVisibleProjects();
      const srcIdx = visible.findIndex((x) => x.id === srcId);
      let tgtIdx = visible.findIndex((x) => x.id === targetId);
      if (srcIdx === -1 || tgtIdx === -1) return;

      const priorities = visible.map((x) => x.priority).sort((a, b) => a - b);
      for (let i = 1; i < priorities.length; i++) {
        if (priorities[i] <= priorities[i - 1]) priorities[i] = priorities[i - 1] + 1;
      }

      const [moved] = visible.splice(srcIdx, 1);
      tgtIdx = visible.findIndex((x) => x.id === targetId);
      const insertIdx = position === "after" ? tgtIdx + 1 : tgtIdx;
      visible.splice(insertIdx, 0, moved);
      visible.forEach((item, idx) => { item.priority = priorities[idx]; });
      render();
    }

    function shiftItem(id, delta) {
      const visible = getVisibleProjects();
      const idx = visible.findIndex((x) => x.id === id);
      const targetIdx = idx + delta;
      if (idx === -1 || targetIdx < 0 || targetIdx >= visible.length) return;
      reorderItems(id, visible[targetIdx].id, delta > 0 ? "after" : "before");
    }

    async function loadFromServer() {
      const res = await fetch("/api/projects");
      const data = await res.json();
      projects = data.projects.map((p) => ({
        ...p,
        filename: p.id.split("/").slice(1).join("/"),
        tags: (p.filters || []).filter((f) => f !== "featured"),
      }));
      originalMap = new Map(
        projects.map((p) => [
          p.id,
          {
            priority: p.priority,
            featured: p.featured,
            collection: p.collection,
            tags: [...p.tags],
          },
        ])
      );
      render();
    }

    function addPaletteTag() {
      const input = document.getElementById("new-tag-input");
      const val = input.value.trim();
      if (!val) return;
      if (val.toLowerCase() === "featured") {
        showToast('Use the "Featured" button on each project row for featured status', true);
        return;
      }
      if (!availableTags.some((t) => t.toLowerCase() === val.toLowerCase())) {
        availableTags.push(val);
        showToast(`Added "${val}" to tag list`);
      }
      input.value = "";
      render();
    }

    document.getElementById("add-tag-btn").addEventListener("click", addPaletteTag);
    document.getElementById("new-tag-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addPaletteTag();
      }
    });

    document.querySelectorAll(".tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeTab = btn.dataset.tab;
        render();
      });
    });

    document.getElementById("search").addEventListener("input", (e) => {
      searchQuery = e.target.value.trim();
      render();
    });

    document.getElementById("renumber-featured-btn").addEventListener("click", () => {
      const featured = projects
        .filter((p) => p.collection === "projects" && p.featured)
        .sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title));
      featured.forEach((p, idx) => { p.priority = idx + 1; });
      render();
    });

    document.getElementById("renumber-all-btn").addEventListener("click", () => {
      const pub = projects
        .filter((p) => p.collection === "projects")
        .sort((a, b) => (a.featured === b.featured ? a.priority - b.priority : a.featured ? -1 : 1) || a.title.localeCompare(b.title));
      pub.forEach((p, idx) => { p.priority = idx + 1; });
      render();
    });

    document.getElementById("reload-btn").addEventListener("click", async () => {
      await loadFromServer();
      showToast("Reloaded from disk");
    });

    saveBtn.addEventListener("click", async () => {
      const dirty = getDirtyItems().map((p) => ({
        id: p.id,
        priority: p.priority,
        filters: buildFullFilters(p),
        collection: p.collection,
      }));
      if (dirty.length === 0) return;

      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: dirty }),
      });
      const result = await res.json();
      if (!res.ok) {
        showToast(result.error || "Save failed", true);
        return;
      }
      await loadFromServer();
      showToast(`Updated ${result.updatedCount} project(s)`);
    });

    loadFromServer();
  </script>
</body>
</html>
"""


class ProjectManagerHandler(BaseHTTPRequestHandler):
    def log_message(self, format: str, *args: Any) -> None:
        return

    def _send_json(self, status: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path == "/" or self.path.startswith("/?"):
            body = HTML_PAGE.encode("utf-8")
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        if self.path.startswith("/images/"):
            rel_path = urllib.parse.unquote(self.path.split("?", 1)[0]).lstrip("/")
            images_root = (PUBLIC_DIR / "images").resolve()
            target = (PUBLIC_DIR / rel_path).resolve()
            if not str(target).startswith(str(images_root)) or not target.is_file():
                fallback = images_root / "default.jpg"
                target = fallback if fallback.is_file() else None
            if target is None:
                self.send_error(HTTPStatus.NOT_FOUND)
                return
            mime_type, _ = mimetypes.guess_type(str(target))
            data = target.read_bytes()
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", mime_type or "application/octet-stream")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        if self.path == "/api/projects":
            records = load_projects()
            self._send_json(
                HTTPStatus.OK,
                {
                    "projects": [
                        {
                            "id": r.id,
                            "collection": r.collection,
                            "title": r.title,
                            "role": r.role,
                            "year": r.year,
                            "status": r.status,
                            "priority": r.priority,
                            "filters": r.filters,
                            "featured": r.featured,
                            "thumbnail": r.thumbnail,
                        }
                        for r in records
                    ]
                },
            )
            return

        self.send_error(HTTPStatus.NOT_FOUND)

    def do_POST(self) -> None:
        if self.path != "/api/save":
            self.send_error(HTTPStatus.NOT_FOUND)
            return

        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length)
        try:
            payload = json.loads(raw.decode("utf-8"))
            updates = payload.get("updates", [])
        except Exception as exc:
            self._send_json(HTTPStatus.BAD_REQUEST, {"error": f"Invalid JSON: {exc}"})
            return

        records_by_id = {r.id: r for r in load_projects()}
        updated_count = 0
        updated_ids: list[str] = []

        for item in updates:
            proj_id = item.get("id")
            if proj_id not in records_by_id:
                continue
            record = records_by_id[proj_id]
            target_path = record.path
            new_priority = int(item.get("priority", DEFAULT_PRIORITY))
            raw_filters = item.get("filters")
            if isinstance(raw_filters, list):
                new_filters = [str(f).strip() for f in raw_filters if str(f).strip()]
            else:
                new_filters = record.filters
            target_collection = item.get("collection", record.collection)
            if target_collection not in ("projects", "projects-hidden"):
                target_collection = record.collection

            changed = update_project_frontmatter(target_path, new_priority, new_filters)
            if target_collection != record.collection:
                try:
                    move_project_collection(target_path, target_collection)
                    changed = True
                except FileExistsError as exc:
                    self._send_json(HTTPStatus.CONFLICT, {"error": str(exc)})
                    return

            if changed:
                updated_count += 1
                updated_ids.append(proj_id)

        self._send_json(HTTPStatus.OK, {"updatedCount": updated_count, "updatedIds": updated_ids})


def find_open_port(preferred: int) -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        if s.connect_ex(("127.0.0.1", preferred)) != 0:
            return preferred
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return int(s.getsockname()[1])


def print_table() -> None:
    records = load_projects()
    print(f"{'COLLECTION':16} | {'PRIO':4} | {'FEAT':4} | {'TITLE':40} | FILE")
    print("-" * 100)
    for r in records:
        feat = "YES" if r.featured else "no"
        print(f"{r.collection:16} | {r.priority:4} | {feat:4} | {r.title[:40]:40} | {r.path.name}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Interactive Portfolio Project Priority & Featured Manager")
    parser.add_argument("--port", type=int, default=8765, help="Local port for the web UI (default: 8765)")
    parser.add_argument("--no-open", action="store_true", help="Do not open a browser window automatically")
    parser.add_argument("--list", action="store_true", help="Print current priorities and featured status and exit")
    args = parser.parse_args()

    if args.list:
        print_table()
        return 0

    port = find_open_port(args.port)
    url = f"http://127.0.0.1:{port}"
    server = ThreadingHTTPServer(("127.0.0.1", port), ProjectManagerHandler)
    print(f"Portfolio Project Manager running at {url}")
    print("Press Ctrl+C to stop.")

    if not args.no_open:
        webbrowser.open(url)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
