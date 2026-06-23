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

### What needs the original backend

A few features call storymaps.io's server and won't function on a local mirror:

- **Real-time collaboration / shared boards** — the board content behind share
  URLs (e.g. `/85s8v6mv`) syncs over a Yjs **WebSocket** to the live backend, so
  it cannot be reconstructed from static files.
- **`/api/*` endpoints** — e.g. `/api/stats`, new-map IDs, server-side backups.

The UI, layout, and colour system are fully intact regardless.

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
