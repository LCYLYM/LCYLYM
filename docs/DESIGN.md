# 山水之间 · LCYLYM

## Art direction

A navigable ink landscape connects the work. A moon gate, a covered bridge, a terraced pavilion, a listening garden, and a writing room form a continuous world. Their interactions explain credential boundaries, streaming transport, plugin maintenance, multiplayer state, and native editing.

The landscape is modeled in Three.js. Contoured stone, curved eaves, pine branches, stippled vegetation, ink shading, and distance wash share one camera and one light language. Small cinnabar signals travel through the architecture. The visual reference informs depth, framing and restraint.

Palette: soot `#151e20`, ink `#283638`, mist `#b5c1bf`, rice paper `#e3e5dc`, cinnabar `#b74736`, jade `#658f8c`.

Type: Songti SC / Noto Serif CJK SC for Chinese display, PingFang SC for reading, Georgia for English display, SFMono-Regular for technical labels. Use the person's name as the title. The signature is the traversable moon gate carrying the SSH tool route across a stone bridge.

Layout: full viewport landscape; personal introduction in negative space at right; projected labels attached to places; a quiet route along the bottom. Selecting a place moves the camera and reveals the relevant project in the same composition. An indexed HTML reading view contains all project descriptions and source links.

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

- R1: continuous, original 3D ink environment with depth, framing and subtle technological motion.
- R2: camera and object interactions vary by place and explain the associated project.
- R3: primary and supporting projects have defensible weights, concrete implementation details and public links.
- R4: complete Chinese/English reading, keyboard navigation, reduced motion, mobile layout, and readable content when WebGL is unavailable.
- R5: a data-driven extension path and a matching GitHub README entry.
- R6: local preview and browser evidence precede publication of this design.

## Local review

The browser review on 2026-09-05 exercised all five project routes, the SSH explanatory interaction, both languages and all 15 index entries. Desktop composition was checked at 1280 × 720 and mobile at 390 × 844. The reduced-motion preference freezes ambient time. A deliberately lost WebGL context opens the complete reading index with an explanatory status. The final scene loaded in a fresh browser tab without console errors or warnings. Five principal source links were read back from GitHub's contents API.

The README animation is captured from the working scene. Public project descriptions are grounded in source and repository documentation; this portfolio review does not re-certify every project's deployment. Visual acceptance and publication are the next review step.
