# Notice & Provenance

This repository is a **static mirror** of the client-side application served at
`https://storymaps.io`, captured by recursively downloading the entry HTML and
following every `import` / `href` / `url()` reference until the dependency graph
was closed (source modules, vendored libraries, fonts, icons, and images).

## License

storymaps.io is free software released under the **GNU Affero General Public
License, version 3.0 (AGPL-3.0)** — every source module carries the header
`Storymaps.io — AGPL-3.0`. The full license text is in `LICENSE`.

Under the AGPL-3.0 you are free to use, study, copy, modify, and redistribute
this code. Two obligations to remember if you go beyond private use:

- **Network use is distribution.** If you run a modified version and let others
  interact with it over a network, you must offer those users the corresponding
  source.
- **Keep it AGPL.** Derivatives must remain under AGPL-3.0 with notices intact.

All original copyright and authorship belong to the storymaps.io authors. This
mirror is provided for personal study and reference.

## Not included

- Server-side code and `/api/*` responses (only the client is publicly served).
- Real-time collaboration data — shared boards sync over a Yjs WebSocket to the
  live backend and are not part of the static asset tree.
