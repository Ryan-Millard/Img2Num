// In-memory handoff for the image-processor → editor transition.
//
// The editor needs the generated SVG plus the original pixel buffer (tens of
// MB for a high-resolution photo) so it can re-process with new settings.
// Passing these through React Router's `location.state` serializes them into
// the History API — an extra full structured-clone that the browser also
// persists to disk. For a large image that oversized history entry OOM-kills
// the tab ("Aw, Snap"), and on the auto-reload it fails to rehydrate, so the
// editor falls back to "No SVG data found".
//
// Stashing the payload in this module-level store instead keeps it as a single
// in-memory reference: it survives client-side navigation with no cloning and
// nothing written to history. (A hard page reload still clears it — that's
// expected; we can't keep 48 MB of pixels across reloads without IndexedDB.)
let handoff = null;

export function setEditorHandoff(payload) {
  handoff = payload;
}

export function getEditorHandoff() {
  return handoff;
}

export function clearEditorHandoff() {
  handoff = null;
}
