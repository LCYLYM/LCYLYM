# LCYLYM interactive portfolio

A Three.js ink landscape with five connected project areas and a bilingual reading index.

## Run locally

From the repository root:

```sh
python3 -m http.server 8766 --bind 127.0.0.1
```

Open `http://127.0.0.1:8766/studio/`. The scene, font and runtime are self-hosted. A static HTTP server is required for ES modules.

## Content and extension

- `js/projects.js`: bilingual project descriptions, source links, placement and camera poses.
- `js/studies.js`: mechanism stops, annotations, parallel/sequence diagrams and catalog validation.
- `js/landscape.js`: geometry, camera, animation, picking and render scheduling.
- `js/ink-renderer.js`: surface pigment, paper fibers, contour diffusion and final ink compositing.
- `js/main.js`: reading interface, routes, language, sound and accessibility.
- `styles/landscape.css`: desktop/mobile composition and typography.

To add a project, add its bilingual description and repository ID to `projects`. It immediately receives an index entry and an independent reading page. An optional `media` array accepts public local assets, each with `type` (`image` or `video`), an `assets/…` path and bilingual `alt` text. Images load lazily; videos load metadata and have playback controls.

To give a project a mechanism walkthrough, add a study in `studies.js`. Each stop has a bilingual title and explanation, a technical label, diagram tokens, and a 3D annotation position. Use `parallel: true` for alternative channels rather than an ordered sequence. Steps drive navigation, scene markers, the explanatory playback and engineering notes together. The number of stops can vary.

A project may join an existing place via `place`. A new place requires a scene builder, world anchor, camera pose and `places` entry. Keep project reading content in the catalog and visual construction in the renderer. Validate extensions with `node --test studio/tests/catalog.test.mjs`.

## Runtime budget

Ambient animation is capped at roughly 30 frames per second; camera interaction uses the display cadence. Opening either reading dialog, pausing motion, or hiding the document suspends drawing. Static meshes and line strokes are batched, pine needles are instanced brush stamps, and the static shadow map is 1024 pixels. The pigment composite uses one render target and one full-screen pass.

Automatic quality caps pixel ratio at 1.25 on desktop and 1 on narrow screens. Sustained expensive CPU submissions reduce the render scale; the explicit Eco setting uses 0.8. This heuristic measures CPU submission time, not GPU frame time. `window.portfolio.getState()` exposes frame count, draw calls, triangles, render scale and CPU submission time for inspection. Low-end physical devices and Safari require separate profiling.

The scene’s requests, notes and light paths are explanatory visualizations. They do not connect to providers or remote machines. Sound starts only when the visitor presses the listening button. Pause, reduced motion, keyboard navigation and a reading index are available. When WebGL is unavailable, the reading index opens with a visible explanation.

## Asset provenance

- Geometry, shaders, procedural markings and UI: authored for this portfolio.
- Three.js `0.160.1`: MIT, vendored from the official npm package. License: `vendor/THREE-LICENSE.txt`.
- Ma Shan Zheng: SIL Open Font License, from `google/fonts`, subset to display characters. License: `fonts/OFL.txt`.
- The README hero is captured from this application's real scene. It is linked to the interactive site because GitHub README does not execute WebGL.

The reference informs composition and atmosphere. All scene geometry and page artwork are original to this implementation.
