# Optional watercolor garden

Four original AI-generated specimens: two trees and two flowers, eight transparent illustrated keyframes each. Delivery uses 384×512 alpha WebP frames, about 941 KB for the entire library. Original PNG sheets and prompts are under `source/`; these are never loaded by the garden.

The browser blends adjacent illustrated stages. This is an eight-keyframe animation system, not a generated 30 fps video or physically exact growth simulation. Within a sequence, source root anchors are measured and registered to a fixed landing point; frame dimensions and world scale remain constant. Small painted details change between stages, so the transition deliberately uses a slow dissolve.

## Playback

The first seed starts stage 0→1. Nearby arrivals queue one or two more stages, capped at stage 6. The selected specimen and root stay fixed. Stage 7 is decline and is unlocked only after the garden reaches maturity. One older specimen declines at a time; soil and other specimens remain. Later seeds can start another specimen in an emptied patch.

Only the current and adjacent required frame are requested, with two fetches in flight and at most 16 decoded frames retained. Assets use browser HTTP caching. Hidden tabs stop rendering and starting new requests. A request/decode failure restores the lightweight procedural garden.

## Connection policy

`Watercolor garden: on/off` is a small fixed control; preference is stored locally. Auto enables only with reported 4g, downlink at least 5 Mbps, and low RTT. Unknown connections default to light and permit opt-in. Save-Data, reduced-data, reduced-motion, offline, or reported slow connections block artwork loading even when the stored preference is on. The light garden no longer fetches the earlier multi-megabyte foliage atlases.

Network Information API coverage varies; it is not a bandwidth guarantee. Conservative default and explicit control are intentional.

## Local review

- `/output/sequence-garden/`: controlled dandelion drops, 6× playback, source-sheet links.
- `/output/growth-preview/`: naturally falling seeds, 25× playback.
- Main pages: normal speed and connection-aware behavior.

`python3 scripts/build-garden-assets.py` extracts and compresses equal-sized frames and updates the root-anchor manifest embedded in `garden-sequences.js` (requires Pillow). This is deterministic asset preparation, not additional AI generation.

`node --test tests/garden-sequences.test.cjs` checks loading policy, opt-in, frame-level lazy loading, fixed roots, seed-driven targets, bounded caching, selective renewal, and failure/visibility behavior.
