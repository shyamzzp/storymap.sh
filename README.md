# Storymap

A lightweight **user story mapping board** — a clean-room clone of the
[storymaps.io](https://storymaps.io) interface, reproducing its exact colour
palette, light/dark themes, and layout.

Organise a product backlog into **activities** (the backbone), break each into
**tasks**, then slot **stories** into **releases** (swimlanes).

## Features

- **Activities backbone** with spanning header cards and per-task columns.
- **Releases as swimlanes** — drop stories under the relevant task column.
- **Exact colour palette** — the 14 card colours, status colours, and the
  full light + dark theme variables match storymaps.io values exactly.
- **Inline editing** — click any card title, activity, or release to edit.
- **Colour picker & status pills** per story (Done / In Progress / Planned / Blocked).
- **Theme toggle** (light / dark).
- **Export to JSON** and **localStorage persistence** — your board is saved automatically.
- Zero build step, zero dependencies — pure HTML/CSS/JS.

## Run locally

It's a static site. Open `index.html` directly, or serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files

| File         | Purpose                                            |
|--------------|----------------------------------------------------|
| `index.html` | Page shell — header bar and board container.       |
| `styles.css` | Colour system (light + dark) and board layout.     |
| `app.js`     | Board model, rendering, and interactivity.         |

## Colour reference

Card palette (`CARD_COLORS`) and default card-type colours match storymaps.io:

| Type       | Hex       |
|------------|-----------|
| Users      | `#fca5a5` |
| Activities | `#93c5fd` |
| Story      | `#fef08a` |

Status colours: Done `#22c55e`, In Progress `#eab308`, Planned `#3b82f6`, Blocked `#ef4444`.

## Attribution

This is an independent, from-scratch reimplementation inspired by
[storymaps.io](https://storymaps.io), which is licensed under **AGPL-3.0**.
No source code from the original project was copied; only publicly visible
colour values and the general UI layout were referenced. See `NOTICE.md`.
