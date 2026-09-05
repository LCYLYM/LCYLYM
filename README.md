<div align="center">

<a href="https://loli.by/LCYLYM/studio/">
  <img src="./assets/studio-hero.gif" width="100%" alt="生鱼安乐 LCYLYM：可交互的 3D 水墨山水作品集，包含 Agent 基础设施、DSH 插件、实时游戏与原生应用">
</a>

[中文](#中文) · [English](#english) · [沿着山径，看看作品 ↗](https://loli.by/LCYLYM/studio/) · [Blog](https://loli.by/)

</div>

<a id="中文"></a>

## 生鱼安乐 / LCYLYM

最近常做的事，是把 Agent 接到真实的机器和工作流里。会顺着一个问题，从协议、状态和权限一路做到界面；也会因为想和朋友玩点什么，做一个多人游戏。

这里放的是值得展开讲的几条线。项目里大量使用 AI 编程工具，我主要负责想清楚问题、设计、集成，以及把实际使用中暴露的问题继续修下去。

### Agent 与真实系统

**[SSH Connector MCP](https://github.com/LCYLYM/ssh-connector-mcp)** · Rust

主机、加密凭据库、MCP、持久 PTY 和 SFTP 形成一条操作链。Agent 使用主机标识；二进制传输处理临时文件、覆盖回滚、完整性校验与失败清理。[看实现](https://github.com/LCYLYM/ssh-connector-mcp/tree/main/src)

**[Umans Transparent Gateway](https://github.com/LCYLYM/umans-transparent-gateway)** · Go

连接 Anthropic、Chat Completions 与 Responses 客户端的自托管网关。重点在流式语义、工具与图片载荷、按 key 调度，以及上游失败后的处理。[看并发调度](https://github.com/LCYLYM/umans-transparent-gateway/blob/main/internal/gateway/key_limiter.go)

**[Ops Terminator](https://github.com/LCYLYM/ops_terminator)** · Go

把主机绑定、策略、人工审批、真实命令执行、审计和回放放在同一个运维控制台里。[看运行链路](https://github.com/LCYLYM/ops_terminator/tree/main/internal)

### 从插件到持续维护

**[DSH Plugin Compat Guardian](https://github.com/LCYLYM/dsh-plugin-compat-guardian)** · JavaScript / GitHub Actions

上游更新后，按插件的 smoke contract 检查兼容性，交给有预算的 Agent 修复，再由独立 verifier 复验并形成 PR。结论只覆盖实际检查到的行为。

**[DSH Attachments](https://github.com/LCYLYM/dsh-attachments)** · Host / WebUI

给 DSH 接入文件、文件夹和多媒体输入：发送时写入当前 workspace，失败保留草稿，清理按插件所有权处理。这两个都是围绕 DeepSeek Harness 的独立社区项目。

### 好玩，也好用

| 项目                                                                | 值得讲的部分                                                                             |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [Guess Song](https://github.com/LCYLYM/guess-song)                  | 多人投歌与盲猜。Durable Objects 持有房间和定时器，WebSocket 下发按模式与身份裁剪的状态。 |
| [Mac Markdown Pad](https://github.com/LCYLYM/mac-markdown-pad)      | 原生 macOS 编辑器，通过语法块的源码行锚点同步预览。                                      |
| [QuotaBar](https://github.com/LCYLYM/QuotaBar)                      | AI 额度进入菜单栏与物理 Touch Bar。一个很具体的原生实验。                                |
| [MacoPowerMonitor](https://github.com/LCYLYM/MacoPowerMonitor)      | 电池、适配器与系统功耗遥测，关注实际含义和权限边界。                                     |
| [LQ Reader Video Sync](https://github.com/LCYLYM/lqreadervideosync) | 来自日常 Reader 使用需求的剧集、进度与播放器同步。                                       |

其余工具：[AI Tabs Organizer](https://github.com/LCYLYM/ai-tabs-organizer) · [AI Release Guardian](https://github.com/LCYLYM/ai-release-guardian) · [QuietType](https://github.com/LCYLYM/QuietType)（本地语音输入实验） · [Codex Record Sync](https://github.com/LCYLYM/codex-record-sync) · [WeChat Report Agent](https://github.com/LCYLYM/wechat-report-agent)（报告流水线与合成示例）。

还有一些未公开的浏览器自动化、Agent 工作流和本地系统实验。等有适合分享的实现，会继续加进这片山水。

---

<a id="english"></a>

## English

I'm LCYLYM. I build tools that connect agents to real machines and workflows, native apps for everyday use, and games to play with friends. I use AI coding tools extensively; my work is in defining the problem, designing the system, integrating it, and iterating on what real use reveals.

- **Agent systems:** [SSH Connector MCP](https://github.com/LCYLYM/ssh-connector-mcp) separates credentials from agent operations and integrates PTY/SFTP; [Umans Transparent Gateway](https://github.com/LCYLYM/umans-transparent-gateway) handles protocol compatibility, streaming and per-key scheduling; [Ops Terminator](https://github.com/LCYLYM/ops_terminator) connects policy, approvals, execution and audit.
- **DSH community work:** [Compat Guardian](https://github.com/LCYLYM/dsh-plugin-compat-guardian) repairs plugin compatibility against explicit smoke contracts and independent verification. [Attachments](https://github.com/LCYLYM/dsh-attachments) adds workspace-bound file and multimedia input. These are independent community projects.
- **Games and native apps:** [Guess Song](https://github.com/LCYLYM/guess-song) is a stateful multiplayer music game. [Mac Markdown Pad](https://github.com/LCYLYM/mac-markdown-pad) uses source-aware preview synchronization. [QuotaBar](https://github.com/LCYLYM/QuotaBar) brings AI usage to a physical Touch Bar.

[Explore all 15 projects in the landscape ↗](https://loli.by/LCYLYM/studio/?lang=en) · [Back to 中文](#中文)
