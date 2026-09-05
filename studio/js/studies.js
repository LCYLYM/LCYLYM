const pair = (zh, en) => ({ zh, en });
const step = (title, label, text, at, tokens, parallel = false) => ({
  title,
  label,
  text,
  at,
  tokens,
  parallel,
});

// A study is a reading contract: each stop names a mechanism, explains it, and
// points into the same 3D space. Supporting projects can have their own study.
export const studies = {
  "ssh-connector-mcp": {
    heading: pair("连接与边界", "Connection & control"),
    summary: pair(
      "从一句指令，到一次可追溯的远程操作。",
      "From an instruction to a traceable remote operation.",
    ),
    question: pair(
      "Agent 需要操作机器，但不需要知道保存的密码和私钥。",
      "An agent needs to operate a machine, not receive its saved password or private key.",
    ),
    steps: [
      step(
        pair("凭据留在本地", "Keep credentials local"),
        "host_id",
        pair(
          "模型只拿到主机标识。daemon 在本地读取凭据，SSH 账户继续决定远端权限。",
          "The model receives a host identifier. The local daemon resolves credentials; the SSH account controls remote permissions.",
        ),
        [-3, 2.1, 4.5],
        ["MCP request", "host_id", "local vault"],
      ),
      step(
        pair("按任务选择通道", "Choose the right channel"),
        "exec / PTY / SFTP",
        pair(
          "短命令、持续终端、二进制传输各走自己的生命周期，避免把所有操作塞进一次 exec。",
          "Commands, persistent terminals and binary transfers each have their own lifecycle instead of sharing one exec path.",
        ),
        [-3, 5.3, 0],
        ["exec", "PTY session", "SFTP"],
        true,
      ),
      step(
        pair("交付也处理失败", "Handle the failure path"),
        "verify / commit / audit",
        pair(
          "文件上传包含临时文件、校验、覆盖回滚与清理；操作还要留下可追溯记录。",
          "Uploads include temporary files, integrity checks, overwrite rollback and cleanup. Operations also leave an audit trail.",
        ),
        [-3, 3.5, -3.4],
        ["temporary file", "integrity", "commit / rollback"],
      ),
    ],
  },
  "umans-transparent-gateway": {
    heading: pair("协议的流向", "A stream across protocols"),
    summary: pair(
      "接住不同客户端，让流式调用沿着同一条链路走完。",
      "Carry different clients through one continuous streaming path.",
    ),
    question: pair(
      "API 能连上只是开始。工具、图片、取消和流式结束，也必须对得上。",
      "Connecting the API is only the beginning. Tools, images, cancellation and stream termination must agree too.",
    ),
    steps: [
      step(
        pair("接住不同协议", "Receive different protocols"),
        "Messages / Responses",
        pair(
          "在入口识别 Messages、Chat Completions 与 Responses 的语义，保留工具与图片载荷。",
          "Recognize Messages, Chat Completions and Responses semantics while preserving tool and image payloads.",
        ),
        [-16, 4.2, -7],
        ["Messages", "Chat Completions", "Responses"],
        true,
      ),
      step(
        pair("并发有进有退", "Give concurrency a lifecycle"),
        "queue / acquire / release",
        pair(
          "按 key 组织并发与队列。连接取消或调用结束时回收占用，队列才能继续前进。",
          "Schedule concurrency and queues per key. Cancellation and completion release capacity so queued requests can proceed.",
        ),
        [-9, 4.3, -3.9],
        ["key queue", "acquire", "release"],
      ),
      step(
        pair("把流完整送达", "Finish the stream"),
        "SSE / done / cancel",
        pair(
          "转换持续输出的事件，而不是等待完整文本；同时处理瞬时重试、结束事件与失败语义。",
          "Translate events as they arrive rather than waiting for complete text, with transient retries, termination and failure semantics.",
        ),
        [-4, 3.7, -1.1],
        ["upstream events", "SSE", "client"],
      ),
    ],
  },
  "dsh-plugin-compat-guardian": {
    heading: pair("持续的维护", "Maintenance as a system"),
    summary: pair(
      "上游继续走，插件也要有跟得上的维护链。",
      "A maintenance loop that follows an evolving upstream.",
    ),
    question: pair(
      "让 Agent 修插件之前，先定义它可以改什么，以及谁来判断改对了。",
      "Before an agent repairs a plugin, define its authority and who verifies the result.",
    ),
    steps: [
      step(
        pair("先约定行为", "Define the behavior"),
        "smoke contract",
        pair(
          "用插件自己的 smoke contract 检查新版本。结论只覆盖实际执行到的行为。",
          "Check the new version against the plugin's smoke contract. A verdict covers only exercised behavior.",
        ),
        [7, 4, -9.5],
        ["DSH version", "plugin contract", "check"],
      ),
      step(
        pair("有范围地修复", "Bound the repair"),
        "budget / diff policy",
        pair(
          "Agent 在预算和改动范围内修复；无关依赖、安装脚本或测试约束的变化需要额外审查。",
          "Repairs have a budget and diff policy. Unrelated dependencies, install scripts or test-contract changes require review.",
        ),
        [7, 6.8, -9.5],
        ["failed check", "bounded repair", "patch"],
      ),
      step(
        pair("独立复验再交付", "Verify independently"),
        "verifier / PR",
        pair(
          "修复者与 verifier 分离。复验过的补丁才进入 PR 流程，发布权限继续单独控制。",
          "Separate the repair agent from the verifier. Verified patches enter the PR flow; publishing authority remains separate.",
        ),
        [7, 9.3, -10],
        ["patch digest", "verifier", "pull request"],
      ),
    ],
  },
  "guess-song": {
    heading: pair("同一间歌房", "One room, many views"),
    summary: pair(
      "朋友们听同一首歌，却不该提前看见同一个答案。",
      "Everyone hears the same song, but receives the right information at the right time.",
    ),
    question: pair(
      "多人猜歌的难点，藏在时序、断线重连，以及每个人收到的字段里。",
      "The hard parts are timing, reconnects and the fields each participant receives.",
    ),
    steps: [
      step(
        pair("房间持有状态", "The room owns state"),
        "Durable Object",
        pair(
          "投歌、播放、猜测与揭晓是房间状态机里的阶段。定时器与状态由服务端持有。",
          "Submission, playback, guessing and reveal are room-state phases. The server owns state and timers.",
        ),
        [-10, 1.4, 10],
        ["submissions", "room state", "timer"],
      ),
      step(
        pair("按身份裁剪视图", "Project for each viewer"),
        "viewer-specific state",
        pair(
          "根据玩法、身份和当前阶段裁剪消息。隐藏在服务端完成；房主可见范围随模式而变。",
          "Project messages by game mode, identity and phase. Server-side visibility rules include mode-specific host behavior.",
        ),
        [-10, 3.7, 9.4],
        ["room", "viewer + mode", "filtered state"],
      ),
      step(
        pair("重新加入同一轮", "Rejoin the same round"),
        "WebSocket / reconnect",
        pair(
          "连接恢复后重新拿到当前轮次与播放位置，避免客户端各自计时、各玩各的。",
          "A reconnected client receives the current round and playback position rather than running an independent clock.",
        ),
        [-7.8, 1.6, 11.3],
        ["reconnect", "snapshot", "playback position"],
      ),
    ],
  },
  "mac-markdown-pad": {
    heading: pair("落笔有回声", "Writing, in sync"),
    summary: pair(
      "源码与预览，跟随同一段正在写的内容。",
      "Source and preview follow the same piece of writing.",
    ),
    question: pair(
      "两侧滚动百分比相同，不代表正在读同一段内容。",
      "Matching scroll percentages does not mean matching content.",
    ),
    steps: [
      step(
        pair("从源码位置出发", "Start at source positions"),
        "source line",
        pair(
          "保留 Markdown 内容对应的源码位置，让同步能知道用户正在读哪一个块。",
          "Preserve source positions so synchronization can identify the content block being read.",
        ),
        [6.3, 2.6, 6.4],
        ["Markdown", "source line", "syntax block"],
      ),
      step(
        pair("给渲染块落锚", "Anchor rendered blocks"),
        "preview anchor",
        pair(
          "为解析后的渲染块提取行锚点；长段落、标题与代码块都沿着内容关系映射。",
          "Extract line anchors for parsed blocks, mapping paragraphs, headings and code through their content relationships.",
        ),
        [7.7, 2.6, 6.4],
        ["parsed block", "line anchor", "preview"],
      ),
      step(
        pair("回到原生使用习惯", "Fit the native workflow"),
        "AppKit / documents",
        pair(
          "文件打开、窗口生命周期、编辑高亮与滚动同步一起构成日常可用的编辑器。",
          "Document opening, window lifecycle, highlighting and synchronized scrolling form one native editing workflow.",
        ),
        [7, 4.8, 5.9],
        ["file", "document", "window"],
      ),
    ],
  },
};

export function validateCatalog(projects, places, catalogStudies = studies) {
  const ids = new Set(projects.map((p) => p.id));
  const locations = new Set(places.map((p) => p.id));
  if (ids.size !== projects.length || locations.size !== places.length)
    throw new Error("Portfolio IDs must be unique");
  for (const p of projects) {
    if (!p.description?.zh || !p.description?.en)
      throw new Error(`Missing copy: ${p.id}`);
    if (p.place && !locations.has(p.place))
      throw new Error(`Unknown place: ${p.id}`);
    for (const id of p.related || [])
      if (!ids.has(id)) throw new Error(`Unknown related project: ${id}`);
    for (const media of p.media || []) {
      if (
        !["image", "video"].includes(media.type) ||
        !/^assets\/[a-zA-Z0-9_./-]+$/.test(media.src) ||
        media.src.includes("..") ||
        !media.alt?.zh ||
        !media.alt?.en
      )
        throw new Error(`Invalid public media: ${p.id}`);
    }
  }
  for (const place of places) {
    if (!ids.has(place.project) || !catalogStudies[place.project]?.steps.length)
      throw new Error(`A scene needs a complete study: ${place.id}`);
  }
  for (const [id, study] of Object.entries(catalogStudies)) {
    if (!ids.has(id)) throw new Error(`Unknown study: ${id}`);
    for (const s of study.steps)
      if (
        !Array.isArray(s.at) ||
        s.at.length !== 3 ||
        s.at.some((v) => !Number.isFinite(v))
      )
        throw new Error(`Invalid annotation position: ${id}`);
    for (const s of study.steps)
      if (
        !s.title?.zh ||
        !s.title?.en ||
        !s.text?.zh ||
        !s.text?.en ||
        !s.tokens?.length
      )
        throw new Error(`Incomplete step: ${id}`);
  }
}
