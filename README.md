# 生鱼安乐 / LCYLYM

I build reliable agent harnesses, local-first AI infrastructure, and small tools
that solve real operational problems.

我关注的不是让 Agent "看起来会做事"，而是让真实输入经过受约束的工具面，得到可验证、
可审计、可恢复的结果。目前主要使用 Rust、Go、Python、TypeScript 和 Swift。

[Blog](https://loli.by/) · [All repositories](https://github.com/LCYLYM?tab=repositories)

## Selected Systems

| Project | What it proves | Stack |
| --- | --- | --- |
| [SSH Connector MCP](https://github.com/LCYLYM/ssh-connector-mcp) | A local MCP daemon that keeps SSH credentials in an encrypted human-owned vault while exposing typed `exec`, PTY, SFTP, and audit operations to agents. | Rust |
| [AI Release Guardian](https://github.com/LCYLYM/ai-release-guardian) | A release-artifact gate for catching secrets, prompts, MCP configuration, source maps, and other AI-era leakage before shipping. | Python |
| [Umans Transparent Gateway](https://github.com/LCYLYM/umans-transparent-gateway) | A self-hosted compatibility gateway for Anthropic and OpenAI coding traffic, with transparent forwarding and operational controls. | Go |

## Useful Products

| Project | Description |
| --- | --- |
| [MacoPowerMonitor](https://github.com/LCYLYM/MacoPowerMonitor) | Native macOS menu-bar telemetry for battery, adapter, and Apple Silicon power data. |
| [mac-markdown-pad](https://github.com/LCYLYM/mac-markdown-pad) | Native bilingual Markdown editor with live preview and source-aware scroll synchronization. |
| [lqreadervideosync](https://github.com/LCYLYM/lqreadervideosync) | Browser extension for synchronizing Reader episodes with multiple video-source formats. |
| [yuanbao-route-export](https://github.com/LCYLYM/yuanbao-route-export) | Local Web UI that converts public Tencent Yuanbao recording shares into Markdown. |

## Current Focus

- Deterministic browser control: compact observations, stable element identity,
  bounded actions, stale-reference recovery, and business-result verification.
- Coding-agent evaluation: solve rate, token/cost/time accounting, regression
  tracking, and replayable evidence from real engineering tasks.
- Privacy-preserving agent data: deterministic redaction, normalized event
  schemas, evidence-grounded trajectories, and strict separation of raw records
  from shareable artifacts.

## Engineering Principles

```text
real runtime > mock success
typed capability > raw shell access
verified outcome > action completed
human-owned credentials > secrets in agent context
reproducible evidence > confident prose
```

I keep research mirrors and historical experiments out of this front page. The
repositories above are the projects I currently consider representative.
