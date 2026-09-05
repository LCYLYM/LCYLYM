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
- `js/landscape.js`: geometry, ink materials, shadows, animation and picking.
- `js/main.js`: reading interface, routes, language, sound and accessibility.
- `styles/landscape.css`: desktop/mobile composition and typography.

To add a project to the index, add its public description and repository ID to `projects`. To associate it with an existing place, set `place` to that place's ID. A new place needs a scene builder, a world anchor, camera/target positions, and an entry in `places`. Give it an interaction that explains an actual mechanism in the project.

The scene’s requests, notes and light paths are explanatory visualizations. They do not connect to providers or remote machines. Sound starts only when the visitor presses the listening button. Pause, reduced motion, keyboard navigation and a reading index are available. When WebGL is unavailable, the reading index opens with a visible explanation.

## Asset provenance

- Geometry, shaders, procedural markings and UI: authored for this portfolio.
- Three.js `0.160.1`: MIT, vendored from the official npm package. License: `vendor/THREE-LICENSE.txt`.
- Ma Shan Zheng: SIL Open Font License, from `google/fonts`, subset to display characters. License: `fonts/OFL.txt`.
- The README hero is captured from this application's real scene. It is linked to the interactive site because GitHub README does not execute WebGL.

The reference informs composition and atmosphere. All scene geometry and page artwork are original to this implementation.
