# 山水之间 · LCYLYM

## Art direction

A navigable ink landscape connects the work. A moon gate, a covered bridge, a terraced pavilion, a listening garden, and a writing room form a continuous world. Their interactions explain credential boundaries, streaming transport, plugin maintenance, multiplayer state, and native editing.

The landscape is modeled in Three.js. Contoured stone, curved eaves, pine branches, stippled vegetation, ink shading, and distance wash share one camera and one light language. Small cinnabar signals travel through the architecture. The visual reference informs depth, framing and restraint.

Palette: soot `#20252a`, dry ink `#62645f`, rice paper `#f3f1e9`, cinnabar `#9d3029`, celadon `#476868`. Pigment accumulates in object space; fibers and slight diffusion belong to the paper plane. Five-tone surface shading, granular brush marks and softened contours create a 2D ink impression while the geometry keeps its depth and parallax.

Type: Songti SC / Noto Serif CJK SC for Chinese display, PingFang SC for reading, Georgia for English display, SFMono-Regular for technical labels. Use the person's name as the title. The signature is the traversable moon gate carrying the SSH tool route across a stone bridge.

Layout: a full-viewport landscape with personal introduction in the right-hand negative space. A selected project occupies the same composition with a calligraphic heading and three mechanism stops. Each stop coordinates the camera, a world-space annotation and concise reading copy. Engineering notes expand into a complete document containing the problem, mechanism diagram, design choices, boundaries, source entry and related work. Small projects receive proportionate, independent notes. The searchable HTML index covers the entire catalog.

```
 identity / navigation                                  language / index
 dark pine       mist mountains       pavilion
       bridge — moon gate             name / introduction
  stream      stone path   listening garden      project text
             route / previous / next / motion
```

## Curation

The public inventory was refreshed on 2026-09-05. Placement is an editorial judgment based on implementation boundaries, meaningful decisions, scope, and available public evidence. These are AI-assisted projects; contribution is described as problem selection, design, integration and iteration.

| Place  | Principal project                            | Why it carries the scene                                                                                                                                                                    | Source inspected                                                                                             |
| ------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 月门   | ssh-connector-mcp                            | Credential ownership, pooled SSH, persistent PTY, and binary transfer with commit/rollback semantics form one coherent subsystem.                                                           | `src/vault/mod.rs`, `src/ssh/mod.rs`, `src/mcp/mod.rs`; published hardening commit `92084e2`                 |
| 溪桥   | umans-transparent-gateway                    | Protocol preservation, per-key concurrency, streaming failure handling and Responses translation involve actual runtime tradeoffs.                                                          | `internal/gateway/key_limiter.go`, `responses.go`, `retry.go`, public README                                 |
| 层阁   | dsh-plugin-compat-guardian + dsh-attachments | Plugin integration followed by contract-based compatibility maintenance. The community work is distinct from the official DeepSeek Harness.                                                 | Guardian repair/verifier scripts and public README; attachment Host/client implementation and protocol tests |
| 听雨台 | guess-song                                   | A stateful multiplayer product with timer persistence, reconnect and viewer-specific projections. Visibility depends on game mode and identity; it is not universally hidden from the host. | `worker/src/room-do.ts`, `web/src/hooks/useAudioSync.ts`                                                     |
| 临窗   | mac-markdown-pad + QuotaBar                  | Source-position mapping and native system integration demonstrate care beyond a model wrapper. QuotaBar is a focused companion rather than the largest engineering claim.                   | `PreviewScrollAnchorExtractor.swift`; QuotaBar public implementation and README                              |

`ops_terminator` is a substantial complementary system: policy, runner, approval and audit are visible in the public tree. It is linked beside SSH, with no claim that this portfolio review re-ran its remote deployment.

The extended index includes MacoPowerMonitor, lqreadervideosync, ai-tabs-organizer, ai-release-guardian, QuietType, codex-record-sync and wechat-report-agent. They have proportionate descriptions, with QuietType marked experimental and the report agent described as a pipeline with synthetic examples.

Private work is described only at the level of browser automation and agent workflow research. No private repository names, customer material, screenshots or source paths are included.

## Extension contract

`studio/js/projects.js` owns the reading data and scene associations. A new project can join an existing place without changing the renderer. A new place adds a scene builder, position and camera pose. Project names, descriptions, source evidence, limits, language variants and links live together. Scene interaction is an illustrative explanation, not a live connection to a server or provider.

## Review targets

- R1: continuous, original 3D environment rendered as a Chinese ink drawing; visible pigment, dry brush, calligraphic character, depth and technological detail.
- R2: camera, mechanism annotations and reading state move together; project-specific interaction explains the associated implementation.
- R3: primary and supporting projects have defensible weights, concrete implementation details and public links.
- R4: complete Chinese/English reading, keyboard navigation, reduced motion, mobile layout, and readable content when WebGL is unavailable.
- R5: a data-driven extension path and a matching GitHub README entry.
- R6: local preview and browser evidence precede publication of this design.
- R7: bounded scene complexity, adaptive render scale, frame-rate control and complete suspension while paused, hidden or reading.
- R8: retain the local baseline commit `c137dc9`; subsequent revisions remain local for visual review.

## Local review

The functional review on 2026-09-05 covers the five project routes, synchronized mechanism steps, engineering notes and source entry links, both languages, index search and small-project reading. Responsive checks use 1280 × 720 and 390 × 844. Six catalog tests cover extensions, references, bilingual copy, annotation positions and public media paths. The current iteration remains a local visual-review candidate.

The README entry preview is versioned with the profile. Capture a matching animation from the visually approved scene revision before publication. Public project descriptions are grounded in source and repository documentation; this portfolio review does not re-certify every project's deployment.

The visual pass inspected five specific aspects: neutral ink density on pale paper, calligraphic Chinese titles, object-space brush marks, alignment of scene annotations with the selected mechanism, and narrow-screen reading hierarchy. This rendering follows the Chinese ink-painting direction with a light paper ground. Visual acceptance remains with the owner.

In the local browser, a reduced-motion load remained at frame 1 with time 0 across successive observations. Reading dialogs likewise held their frame count steady. The five current scene routes returned matching UI and renderer step indices. Keyboard navigation changed the URL and browser Back restored the preceding project. Eco selected render scale 0.8. Browser logs were clear during the final checks. These are local desktop-browser observations, not a physical-phone or cross-browser performance certification.
