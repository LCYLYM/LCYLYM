const pair = (zh, en) => ({ zh, en });
export const places = [
  {
    id: "gate",
    name: pair("月门", "Moon gate"),
    category: "AGENT / SSH",
    label: "SSH Connector",
    project: "ssh-connector-mcp",
    anchor: [-3, 7.9, 0],
    position: [-3, 0, 0],
    camera: [7, 7, 22],
    target: [1, 4, 0],
    arc: [-5, 1, 3],
    caption: pair(
      "让一道边界成为入口。场景演示 MCP → 主机 → 审计的流向。",
      "A boundary becomes an entrance. This scene illustrates MCP → host → audit.",
    ),
    action: pair("走一次连接路径", "Trace a connection"),
    result: pair("MCP → host_id → SSH → audit", "MCP → host_id → SSH → audit"),
  },
  {
    id: "bridge",
    name: pair("溪桥", "Stream bridge"),
    category: "PROTOCOL / STREAM",
    label: "Umans Gateway",
    project: "umans-transparent-gateway",
    anchor: [-16, 5.5, -7],
    position: [-15, 0, -7],
    camera: [-12, 12, 15],
    target: [-9, 3, -7],
    arc: [-4, 5, -3],
    caption: pair(
      "桥上的光点表示请求；水道表示连续流。只演示调度关系。",
      "Requests cross the bridge as a continuous stream. An illustration of scheduling.",
    ),
    action: pair("送入一组请求", "Send a request group"),
    result: pair(
      "4 active · queued → streaming → released",
      "4 active · queued → streaming → released",
    ),
  },
  {
    id: "pagoda",
    name: pair("层阁", "Plugin pavilion"),
    category: "DSH / COMMUNITY",
    label: "DSH Plugins",
    project: "dsh-plugin-compat-guardian",
    anchor: [7, 11.8, -11],
    position: [7, 0, -11],
    camera: [20, 15, 8],
    target: [11, 6, -11],
    arc: [5, 7, -5],
    caption: pair(
      "阁层逐次点亮，对应检查、修复与独立复验。",
      "The pavilion lights up through check, repair, and independent verification.",
    ),
    action: pair("展开维护流程", "Trace the maintenance loop"),
    result: pair(
      "check → repair → verify → pull request",
      "check → repair → verify → pull request",
    ),
  },
  {
    id: "music",
    name: pair("听雨台", "Listening garden"),
    category: "PLAY / REALTIME",
    label: "Guess Song",
    project: "guess-song",
    anchor: [-10, 4.1, 10],
    position: [-10, 0, 10],
    camera: [-1, 13, 27],
    target: [-5, 2, 10],
    arc: [-6, 2, 4],
    caption: pair(
      "一声落下，波纹传向同一房间的每位参与者。",
      "One note sends ripples to every participant in the room.",
    ),
    action: pair("拨动一声", "Play a note"),
    result: pair(
      "room → projection per viewer → reveal",
      "room → projection per viewer → reveal",
    ),
  },
  {
    id: "desk",
    name: pair("临窗", "Writing room"),
    category: "NATIVE / EVERYDAY",
    label: "Native Apps",
    project: "mac-markdown-pad",
    anchor: [7, 5, 6],
    position: [7, 0, 6],
    camera: [12, 10, 20],
    target: [10, 2.8, 6],
    arc: [4, 5, 0],
    caption: pair(
      "左右纸面通过同一条源码锚点连起来，映射编辑与预览。",
      "A source anchor connects the two pages: editor and preview.",
    ),
    action: pair("移动源码锚点", "Move the source anchor"),
    result: pair(
      "source line → syntax block → preview anchor",
      "source line → syntax block → preview anchor",
    ),
  },
];

export const projects = [
  {
    id: "ssh-connector-mcp",
    title: "SSH Connector MCP",
    place: "gate",
    tier: "SYSTEM",
    stack: "RUST · MCP · SSH · PTY · SFTP",
    subtitle: pair(
      "把机器交给 Agent，把凭据留给人。",
      "Agents operate machines. People own credentials.",
    ),
    description: pair(
      "一个本地 SSH daemon，把主机管理、加密凭据、命令执行、持久终端和文件传输接在同一条链上。Agent 使用 host_id，日常操作不需要把已保存的密码或私钥放进上下文。",
      "A local SSH daemon connecting host management, encrypted credentials, commands, persistent terminals, and file transfer. Agents work with host_id without receiving stored passwords or keys.",
    ),
    details: [
      pair(
        [
          "我花心思的部分",
          "把短命令、长会话和二进制传输分开建模；上传涉及临时文件、覆盖回滚、完整性校验和失败清理。",
        ],
        [
          "Design decisions",
          "Separate one-shot commands, persistent sessions and binary transfers. Uploads have temporary files, rollback, integrity checks and cleanup.",
        ],
      ),
      pair(
        [
          "边界",
          "凭据库与 MCP 视图分离，服务绑定 loopback；真实远端的权限仍由 SSH 账户决定。",
        ],
        [
          "Boundary",
          "Separate vault and MCP views; loopback binding. Remote permissions still belong to the SSH account.",
        ],
      ),
    ],
    source: "src/mcp/mod.rs",
    branch: "main",
    related: ["ops_terminator", "ai-release-guardian"],
  },
  {
    id: "umans-transparent-gateway",
    title: "Umans Transparent Gateway",
    place: "bridge",
    tier: "SYSTEM",
    stack: "GO · SSE · WEBSOCKET · API COMPATIBILITY",
    subtitle: pair(
      "让不同协议，穿过同一条水道。",
      "Different protocols, one continuous stream.",
    ),
    description: pair(
      "自托管的 coding API 网关，连接 Anthropic、Chat Completions 与 Responses 客户端。重点是流式传输、工具与图片载荷、并发队列和失败语义在真实调用中如何保持一致。",
      "A self-hosted coding API gateway for Anthropic, Chat Completions and Responses clients. It handles streaming, tool and image payloads, concurrency queues and failure semantics.",
    ),
    details: [
      pair(
        [
          "我花心思的部分",
          "按 key 调度与取消回收、上游瞬时失败的重试、Responses 转换和流式结束处理。",
        ],
        [
          "Design decisions",
          "Per-key scheduling and cancellation, transient retries, Responses translation and streaming termination.",
        ],
      ),
      pair(
        [
          "边界",
          "请求使用调用者自己的上游凭据；兼容层的行为取决于上游协议和模型能力。",
        ],
        [
          "Boundary",
          "Requests use the caller’s own upstream credentials. Compatibility depends on upstream protocols and model capabilities.",
        ],
      ),
    ],
    source: "internal/gateway/key_limiter.go",
    branch: "main",
    related: [],
  },
  {
    id: "dsh-plugin-compat-guardian",
    title: "DSH Plugin Compat Guardian",
    place: "pagoda",
    tier: "SYSTEM",
    stack: "JAVASCRIPT · GITHUB ACTIONS · DSH",
    subtitle: pair(
      "插件写完之后，维护才刚开始。",
      "A plugin’s life continues after release.",
    ),
    description: pair(
      "安装在插件仓库里的兼容维护机器人。上游 DSH 更新后，先按插件自己的 smoke contract 检查，再让有预算的 Agent 修复，由独立 verifier 复验并形成 PR。",
      "A compatibility maintainer installed in a plugin repository. It checks new DSH versions against a plugin-specific smoke contract, runs budgeted agent repairs, and independently verifies the resulting patch before a PR.",
    ),
    details: [
      pair(
        [
          "我花心思的部分",
          "将发现、修复、复验和发布权限分开；补丁范围、摘要和运行预算都有明确边界。",
        ],
        [
          "Design decisions",
          "Separate discovery, repair, verification and publishing authority; bound patch scope, integrity and execution budget.",
        ],
      ),
      pair(
        [
          "边界",
          "社区工具。验证结论取决于 smoke contract 覆盖的行为；启动成功不等于所有插件功能兼容。",
        ],
        [
          "Boundary",
          "A community tool. A verdict covers only the behavior exercised by the smoke contract.",
        ],
      ),
    ],
    source: "docs/DESIGN.md",
    branch: "main",
    related: ["dsh-attachments"],
  },
  {
    id: "guess-song",
    title: "Guess Song",
    place: "music",
    tier: "PRODUCT",
    stack: "TYPESCRIPT · DURABLE OBJECTS · WEBSOCKET",
    subtitle: pair(
      "朋友的歌单，变成一场实时游戏。",
      "Turn friends’ playlists into a live game.",
    ),
    description: pair(
      "投歌、播放、猜测、揭晓，一间歌房把多人同步在同一轮游戏里。服务端持有房间状态与定时器，并根据模式和玩家身份裁剪每个人收到的信息。",
      "Submit, listen, guess, reveal. A shared room keeps players in the same round. Server-owned state and timers produce a different information view for each game mode and player.",
    ),
    details: [
      pair(
        [
          "我花心思的部分",
          "房间状态机、断线重连、播放时间同步，以及揭晓前后的字段可见性；隐藏规则在服务端执行。",
        ],
        [
          "Design decisions",
          "Room state, reconnect, synchronized playback and field visibility before and after reveal are enforced server-side.",
        ],
      ),
      pair(
        [
          "边界",
          "Cloudflare 部署；外部音源的可播放性依赖各平台。不同模式下房主可见范围不同。",
        ],
        [
          "Boundary",
          "Deploys to Cloudflare. Playback depends on external media providers, and host visibility differs by game mode.",
        ],
      ),
    ],
    source: "worker/src/room-do.ts",
    branch: "main",
    related: ["lqreadervideosync"],
  },
  {
    id: "mac-markdown-pad",
    title: "Mac Markdown Pad",
    place: "desk",
    tier: "PRODUCT",
    stack: "SWIFT · APPKIT · MARKDOWN",
    subtitle: pair(
      "写下去的时候，工具应该跟得上。",
      "An editor that follows the writing.",
    ),
    description: pair(
      "macOS 原生 Markdown 编辑器。源码、预览、打开文件和窗口生命周期都留在桌面应用的使用习惯里；滚动同步通过语法块的源码位置建立映射。",
      "A native macOS Markdown editor with source, preview, files and windows. Scroll synchronization maps parsed blocks back to their source positions.",
    ),
    details: [
      pair(
        [
          "我花心思的部分",
          "为渲染块提取源码行锚点，连接编辑与预览；处理高亮、文件打开和原生交互细节。",
        ],
        [
          "Design decisions",
          "Extract source-line anchors for rendered blocks; integrate highlighting, document opening and native interactions.",
        ],
      ),
      pair(
        [
          "同一侧的实验",
          "QuotaBar 把 AI 额度带到菜单栏和物理 Touch Bar；MacoPowerMonitor 关注机器本身的功耗。",
        ],
        [
          "Nearby experiments",
          "QuotaBar brings AI usage to the menu bar and physical Touch Bar. MacoPowerMonitor observes the machine’s power use.",
        ],
      ),
    ],
    source: "Sources/MacMarkdownPad/Preview/PreviewScrollAnchorExtractor.swift",
    branch: "main",
    related: ["QuotaBar", "MacoPowerMonitor"],
  },
  {
    id: "ops_terminator",
    title: "Ops Terminator",
    place: "gate",
    tier: "SYSTEM",
    stack: "GO · POLICY · SSH · EVENTS",
    description: pair(
      "运维 Agent 的执行控制台：主机绑定、策略判断、人工审批、真实 runner、事件审计与回放。将“允许执行什么”落在运行链路里。",
      "An operations agent console with host binding, policy, human approval, real runners, audit events and replay.",
    ),
  },
  {
    id: "dsh-attachments",
    title: "DSH Attachments",
    place: "pagoda",
    tier: "INTEGRATION",
    stack: "JAVASCRIPT · CORDIS · HOST / CLIENT",
    description: pair(
      "DSH 社区多媒体输入插件。发送时才把附件流式写入当前 workspace；失败保留草稿，清理只处理具有插件所有权标记的目录。",
      "A DSH community multimedia input plugin. Streams attachments into the active workspace at send time, preserves drafts on failure, and cleans only plugin-owned directories.",
    ),
  },
  {
    id: "QuotaBar",
    title: "QuotaBar",
    place: "desk",
    tier: "NATIVE EXPERIMENT",
    stack: "SWIFT · APPKIT · TOUCH BAR",
    description: pair(
      "让 AI 额度在 macOS 菜单栏和物理 Touch Bar 上常驻。小而具体的原生实验，涉及 provider 适配、真实额度读取与本地配置。",
      "AI usage on the macOS menu bar and physical Touch Bar. A focused native experiment with provider adapters and local configuration.",
    ),
  },
  {
    id: "MacoPowerMonitor",
    title: "MacoPowerMonitor",
    place: "desk",
    tier: "NATIVE TOOL",
    stack: "SWIFT · IOKIT · POWERMETRICS",
    description: pair(
      "原生菜单栏功耗监控，区分电池、适配器与系统功耗的含义，并处理遥测权限与历史显示。",
      "Native menu-bar power monitoring with battery, adapter and system telemetry, permissions and history.",
    ),
  },
  {
    id: "lqreadervideosync",
    title: "LQ Reader Video Sync",
    place: "music",
    tier: "BROWSER TOOL",
    stack: "TYPESCRIPT · PLAYER · SYNC",
    description: pair(
      "从日常 Reader 剧集播放需求长出来的浏览器工具，处理剧集识别、播放进度与同步。",
      "A browser player tool grown from an everyday Reader workflow, handling episodes, playback position and synchronization.",
    ),
  },
  {
    id: "ai-tabs-organizer",
    title: "AI Tabs Organizer",
    tier: "BROWSER TOOL",
    stack: "TYPESCRIPT · MV3 · CHROME AI",
    description: pair(
      "为浏览器标签分类和分组，接入 OpenAI-compatible API 与 Chrome 内置 AI。一个围绕浏览器工作习惯的应用实验。",
      "Classifies and groups browser tabs using an OpenAI-compatible API or Chrome built-in AI.",
    ),
  },
  {
    id: "ai-release-guardian",
    title: "AI Release Guardian",
    tier: "DEVELOPER TOOL",
    stack: "PYTHON · RELEASE ARTIFACTS",
    description: pair(
      "扫描发布物里的敏感配置、上下文文件和 source map，给 AI 参与开发后的打包步骤补一道检查。",
      "Scans release artifacts for sensitive configuration, context files and source maps.",
    ),
  },
  {
    id: "QuietType",
    title: "QuietType",
    tier: "EXPERIMENTAL",
    stack: "C++ · WINDOWS · SENSEVOICE",
    description: pair(
      "Windows 本地语音输入实验，SenseVoice 转写，可选 Qwen 轻度整理。体量克制，持续打磨设备和输入链路。",
      "An experimental local Windows dictation tool with SenseVoice and optional conservative Qwen cleanup.",
    ),
  },
  {
    id: "codex-record-sync",
    title: "Codex Record Sync",
    tier: "WORKFLOW UTILITY",
    stack: "PYTHON · LOCAL RECORDS",
    description: pair(
      "按项目发现并导出 Codex 会话，提供不同阅读视图与隐私处理。长期工作流里的一件小工具。",
      "A workflow utility for project-scoped Codex session discovery, export views and privacy processing.",
    ),
  },
  {
    id: "wechat-report-agent",
    title: "WeChat Report Agent",
    tier: "WORKFLOW EXPLORATION",
    stack: "TYPESCRIPT · SQLITE · SCHEDULING",
    description: pair(
      "聊天到报告的调度、切窗、分析与输出代码和思路，公开示例使用合成数据；真实数据接入依赖外部适配。",
      "A chat-to-report scheduling and analysis pipeline with synthetic public examples and external data adapters.",
    ),
  },
];
export const repoURL = (id) => `https://github.com/LCYLYM/${id}`;
export const textFor = (text, language) =>
  typeof text === "string" ? text : text[language];
