<div align="center">

<a href="https://loli.by/LCYLYM/studio/">
  <img src="./assets/studio-hero.gif" width="100%" alt="生鱼安乐的 3D 开源工作室：Agent 系统、原生工具与浏览器实验">
</a>

<br>

[中文](#中文) · [English](#english) · [进入 3D 工作室](https://loli.by/LCYLYM/studio/) · [Blog](https://loli.by/)

</div>

<a id="中文"></a>

## 我是生鱼安乐

喜欢把新东西接进真实世界。

Agent 会连 SSH、保存自己的工作现场；AI 额度可以住进 Touch Bar；群友的歌单也能变成一场实时游戏。语言和平台随问题换，比起把概念讲得漂亮，我更在意它能不能在真实机器、真实网络和真实用户路径上跑起来。

`Agent systems` · `MCP / SSH` · `Local-first tools` · `macOS / Windows` · `Browser experiments`

## Selected builds

<table>
<tr>
<td width="50%" valign="top">

### [ssh-connector-mcp](https://github.com/LCYLYM/ssh-connector-mcp) ↗

让 Agent 通过 MCP 安全进入真实 SSH 会话：加密凭据、PTY、SFTP 与操作审计形成完整闭环。

<sub><code>RUST</code> · <code>SSH</code> · <code>MCP</code> · <code>PTY</code></sub>

</td>
<td width="50%" valign="top">

### [QuotaBar](https://github.com/LCYLYM/QuotaBar) ↗

把 AI 额度放进 macOS 菜单栏，也放进物理 Touch Bar。一个非常具体、也很个人的界面实验。

<sub><code>SWIFT</code> · <code>MACOS</code> · <code>TOUCH BAR</code></sub>

</td>
</tr>
<tr>
<td width="50%" valign="top">

### [codex-record-sync](https://github.com/LCYLYM/codex-record-sync) ↗

同步主任务、子代理与多会话记录，提供隐私视图和幂等导出，让 Agent 的工作现场真正归自己所有。

<sub><code>PYTHON</code> · <code>CODEX</code> · <code>LOCAL-FIRST</code></sub>

</td>
<td width="50%" valign="top">

### [guess-song](https://github.com/LCYLYM/guess-song) ↗

用 Durable Objects、WebSocket 和 viewer-specific state，把群友歌单做成一场可部署的实时盲猜。

<sub><code>TYPESCRIPT</code> · <code>CLOUDFLARE</code> · <code>WEBSOCKET</code></sub>

</td>
</tr>
</table>

## More from the workbench

<table>
<tr>
<td width="50%" valign="top">

**[mac-markdown-pad](https://github.com/LCYLYM/mac-markdown-pad)**<br>
原生 Markdown 编辑器与源码感知滚动同步。`Swift`

</td>
<td width="50%" valign="top">

**[lqreadervideosync](https://github.com/LCYLYM/lqreadervideosync)**<br>
从真实 Reader 使用场景长出来的视频同步工具。`TypeScript`

</td>
</tr>
<tr>
<td width="50%" valign="top">

**[ai-tabs-organizer](https://github.com/LCYLYM/ai-tabs-organizer)**<br>
OpenAI-compatible API 与 Chrome Prompt API / Gemini Nano 的 MV3 浏览器实验。`JavaScript`

</td>
<td width="50%" valign="top">

**[ai-release-guardian](https://github.com/LCYLYM/ai-release-guardian)**<br>
在 AI 参与开发之后，继续守住发布产物与敏感上下文边界。`Python`

</td>
</tr>
</table>

## 我在意的那一层

模型会回答只是起点。我更常折腾的是它真正开始行动之后的部分：

```text
intent → policy → tool → evidence → verdict
          │          │
       凭据边界    失败恢复 / 审计 / 回放
```

也会认真做一些很具体的小东西——因为「奇怪但真实的需求」通常比抽象概念更能检验产品和工程。

---

<a id="english"></a>

## English

I'm LCYLYM, an independent builder working around the boundary between models and real systems.

I build agent infrastructure, local-first utilities, native interface experiments, and browser tools. The stack changes with the problem; the standard does not: it should survive real machines, real networks, and real user paths.

- **Agent infrastructure:** [ssh-connector-mcp](https://github.com/LCYLYM/ssh-connector-mcp), [codex-record-sync](https://github.com/LCYLYM/codex-record-sync), [ai-release-guardian](https://github.com/LCYLYM/ai-release-guardian)
- **Native tools:** [QuotaBar](https://github.com/LCYLYM/QuotaBar), [mac-markdown-pad](https://github.com/LCYLYM/mac-markdown-pad)
- **Browser and realtime experiments:** [guess-song](https://github.com/LCYLYM/guess-song), [lqreadervideosync](https://github.com/LCYLYM/lqreadervideosync), [ai-tabs-organizer](https://github.com/LCYLYM/ai-tabs-organizer)

<div align="center">

[Back to 中文](#中文) · [Explore the 3D studio](https://loli.by/LCYLYM/studio/)

</div>
