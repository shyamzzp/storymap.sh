# storymap.sh

A pixel-for-pixel static replica of [storymaps.io](https://storymaps.io) — the
free user story mapping tool. This repository mirrors the application's complete
client-side source tree (HTML, CSS, ES modules, vendored libraries, fonts, and
image assets) exactly as served, so the layout, colour codings, and theming are
byte-identical to the original.

> storymaps.io is published under the **GNU Affero General Public License v3.0**.
> This mirror preserves that license. See `LICENSE` and `NOTICE.md`.

## Run locally

It's a static, build-free site of native ES modules. Serve it over HTTP (ES
modules won't load from `file://`):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Everything client-side renders identically: the welcome screen, the board, the
full colour palette, light/dark themes, exports (JSON/YAML/CSV), and image
rendering.

### Offline / static mode

This mirror runs **standalone with static, local data** — no backend required:

- **Built-in templates** work fully — pick one from the welcome screen (Coffee
  Ordering App, Holiday Rentals, etc.) or open `/sample/<name>` directly.
- **Create, edit, and persist** boards locally. Maps are saved to the browser's
  `localStorage` and restored on reload.
- **Real-time sync is disabled.** `src/core/yjs.js` defines `OFFLINE_MODE`
  (default **on**), which skips the Yjs **WebSocket** connection. Editing still
  works because Yjs is a local CRDT; only cross-device collaboration is off. To
  re-enable sync against a real backend, set `window.STORYMAP_OFFLINE = false`
  before `app.js` loads.
- `api/stats` is included as a small **static snapshot** so the welcome counter
  shows a value. Other `/api/*` calls (server backups, locks) fail silently and
  are non-essential.

Shared boards behind live URLs (e.g. `/85s8v6mv`) can't be reconstructed — their
content lived only in the original server's Yjs store — so an unknown map URL
gracefully falls back to the welcome screen.

## Structure

| Path           | Contents                                                      |
|----------------|--------------------------------------------------------------|
| `index.html`   | App shell, import map, header markup.                         |
| `styles.css`   | Complete colour system (light + dark) and layout.            |
| `fonts.css`    | `@font-face` for Inter + Outfit (woff2 in `fonts/`).          |
| `src/`         | Application ES modules — `core/`, `ui/`, `features/`, `transfer/`. |
| `vendor/`      | Bundled libraries — Yjs, CodeMirror, js-yaml, html2canvas, html-to-image. |
| `resources/`   | Screenshot and reference PDFs.                                |
| `privacy.html`, `terms.html` | Static legal pages.                            |

## Provenance

Mirrored from `https://storymaps.io` by recursively following every `import`,
`href`, and `url()` reference from the entry point until the dependency graph was
closed. See `NOTICE.md` for details and the AGPL-3.0 obligations.
