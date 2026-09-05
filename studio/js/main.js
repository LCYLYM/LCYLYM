import { places, projects, repoURL, textFor } from "./projects.js";
import { studies, validateCatalog } from "./studies.js";
validateCatalog(projects, places);

const $ = (id) => document.getElementById(id);
const query = new URLSearchParams(location.search);
let language = query.get("lang") === "en" ? "en" : "zh";
let selected = null,
  world = null,
  audioContext = null,
  sceneReady = false;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let paused = reducedMotion.matches;
const labels = new Map();
const mechanismLabels = new Map();
let activeStep = 0,
  readingProject = null,
  quality = "auto";
let explanationTimer = 0;
function stopExplanation() {
  clearTimeout(explanationTimer);
  explanationTimer = 0;
}
const copy = {
  studyOpen: ["展开工程手记 ↗", "Read engineering notes ↗"],
  studyClose: ["回到现场 ×", "Return to scene ×"],
  search: ["查找项目", "Find a project"],
  identity: [
    "写代码，也造些有趣的东西。",
    "Software, systems & playful things.",
  ],
  index: ["项目索引 ↗", "Project index ↗"],
  margin: ["山水之间，自有天地", "A landscape of ongoing work"],
  intro: [
    "给 Agent 接上真实的机器，<br>给日常留一点好玩的空间。",
    "Connecting agents to real machines.<br>Leaving room for things that are fun.",
  ],
  intro2: [
    "写工具、做系统，也做游戏。<br>这里是我还在不断生长的作品集。",
    "Tools, systems, and games.<br>A portfolio that keeps growing.",
  ],
  enter: ["沿着山径，看看作品", "Follow the path"],
  back: ["← 回到山水", "← Back to the landscape"],
  walk: ["山间行迹", "THE PATH"],
  gesture: [
    "拖动移步 · 点击山中标记探索 · ← → 切换",
    "Drag to look around · Select a place · ← → to navigate",
  ],
  all: ["做过的、正在做的。", "Made. And still in the making."],
  close: ["返回山水 ×", "Back to landscape ×"],
  indexIntro: [
    "项目大小不同，值得讲的部分也不同。点进源码，看具体的设计与取舍。",
    "Different scopes, different decisions. The source tells the rest of each story.",
  ],
  privateTitle: [
    "还有一些工作，暂时留在山后。",
    "More work, beyond the visible hills.",
  ],
  privateText: [
    "也在做未公开的浏览器自动化、Agent 工作流与本地系统实验。这里先记下方向，等有适合公开的实现，再接入这片山水。",
    "I also work on private browser automation, agent workflows and local-system experiments. More will join this landscape when there is an implementation ready to share.",
  ],
  authorship: [
    "这些项目由我提出需求、设计、集成和持续迭代，也大量使用 AI 编程工具。每个项目的能力与限制，以源码和各自文档为准。",
    "I define, design, integrate and iterate on these projects with extensive help from AI coding tools. Each repository documents its own capabilities and limitations.",
  ],
  loading: ["正在铺开山水…", "Opening the landscape…"],
};
const t = (value) => textFor(value, language);
function externalLink(title, href) {
  const a = document.createElement("a");
  a.textContent = title;
  a.href = href;
  a.target = "_blank";
  a.rel = "noreferrer";
  return a;
}
function drawIndex() {
  $("project-index").replaceChildren();
  const search = $("project-search").value.trim().toLowerCase();
  const matches = projects.filter((p) =>
    `${p.title} ${p.stack} ${t(p.description)}`.toLowerCase().includes(search),
  );
  if (!matches.length)
    $("project-index").textContent =
      language === "zh"
        ? "没有匹配的项目，试试名称或技术栈。"
        : "No matching project. Try a name or technology.";
  matches.forEach((project) => {
    const row = document.createElement("article");
    row.className = "index-row";
    const heading = document.createElement("div"),
      h3 = document.createElement("h3"),
      meta = document.createElement("small");
    h3.append(externalLink(project.title, repoURL(project.id)));
    meta.textContent = `${project.tier} / ${project.stack}`;
    heading.append(h3, meta);
    const desc = document.createElement("p");
    desc.textContent = t(project.description);
    const actions = document.createElement("div");
    actions.className = "index-actions";
    actions.append(
      externalLink(
        language === "zh" ? "源码 ↗" : "Source ↗",
        repoURL(project.id),
      ),
    );
    const read = document.createElement("button");
    read.textContent = language === "zh" ? "项目手记 →" : "Read notes →";
    read.addEventListener("click", () => {
      $("index-dialog").close();
      openStudy(project.id);
    });
    actions.append(read);
    if (
      project.place &&
      studies[project.id] &&
      !document.body.classList.contains("scene-unavailable")
    ) {
      const btn = document.createElement("button");
      btn.textContent = language === "zh" ? "去场景 →" : "Explore →";
      btn.addEventListener("click", () => {
        $("index-dialog").close();
        select(project.place);
      });
      actions.append(btn);
    }
    row.append(heading, desc, actions);
    $("project-index").append(row);
  });
}
function drawNavigation() {
  $("places").replaceChildren();
  $("place-labels").replaceChildren();
  labels.clear();
  places.forEach((place) => {
    const btn = document.createElement("button");
    btn.className = `place-tab${selected === place.id ? " active" : ""}`;
    btn.dataset.place = place.id;
    btn.setAttribute("aria-pressed", String(selected === place.id));
    const name = document.createElement("span"),
      cat = document.createElement("small");
    name.textContent = t(place.name);
    cat.textContent = place.category;
    btn.append(name, cat);
    btn.addEventListener("click", () => select(place.id));
    $("places").append(btn);
    const label = document.createElement("button");
    label.className = "scene-label";
    label.dataset.place = place.id;
    label.setAttribute("aria-label", `${t(place.name)} · ${place.label}`);
    const title = document.createElement("span"),
      sub = document.createElement("small");
    title.textContent = t(place.name);
    sub.textContent = place.label;
    label.append(title, sub);
    label.style.visibility = "hidden";
    label.addEventListener("click", () => select(place.id));
    $("place-labels").append(label);
    labels.set(place.id, label);
  });
}
function drawChapter() {
  const place = places.find((p) => p.id === selected);
  if (!place) return;
  const project = projects.find((p) => p.id === place.project);
  const study = studies[project.id];
  $("chapter-meta").textContent = project.stack;
  $("chapter-project").textContent = project.title;
  $("chapter-title").textContent = t(study.heading);
  $("chapter-subtitle").textContent = t(study.summary);
  $("mechanism-steps").replaceChildren();
  $("mechanism-labels").replaceChildren();
  mechanismLabels.clear();
  study.steps.forEach((step, i) => {
    const btn = element("button", "mechanism-step");
    btn.dataset.step = i;
    btn.append(
      element("small", "", `0${i + 1}`),
      element("span", "", t(step.title)),
    );
    btn.addEventListener("click", (e) => selectStep(i, e.detail === 0));
    $("mechanism-steps").append(btn);
    const label = element("button", "mechanism-label", step.label);
    label.append(element("small", "", t(step.title)));
    label.addEventListener("click", (e) => selectStep(i, e.detail === 0));
    label.style.visibility = "hidden";
    $("mechanism-labels").append(label);
    mechanismLabels.set(i, label);
  });
  updateStep();
  $("source-links").replaceChildren(
    externalLink(
      language === "zh" ? "打开仓库 ↗" : "Repository ↗",
      repoURL(project.id),
    ),
    externalLink(
      language === "zh" ? "看这一段实现 ↗" : "Read the implementation ↗",
      `${repoURL(project.id)}/blob/${project.branch}/${project.source}`,
    ),
  );
  $("experiment-button").textContent =
    language === "zh" ? "播放场景图解 ↻" : "Play scene illustration ↻";
  $("experiment-result").textContent = "";
}
function element(tag, className = "", text = "") {
  const el = document.createElement(tag);
  el.className = className;
  el.textContent = text;
  return el;
}
function updateStep() {
  const place = places.find((p) => p.id === selected);
  if (!place) return;
  const study = studies[place.project],
    step = study.steps[activeStep];
  $("step-code").textContent = step.label;
  $("step-description").textContent = t(step.text);
  document.querySelectorAll(".mechanism-step").forEach((el, i) => {
    el.classList.toggle("active", i === activeStep);
    el.setAttribute("aria-pressed", String(i === activeStep));
  });
  mechanismLabels.forEach((el, i) => {
    el.classList.toggle("active", i === activeStep);
    el.setAttribute("aria-pressed", String(i === activeStep));
  });
}
function selectStep(index, immediate = false) {
  stopExplanation();
  activeStep = index;
  updateStep();
  world?.setStep(index, immediate);
}
function openStudy(id) {
  const project = projects.find((p) => p.id === id);
  if (!project) return;
  readingProject = id;
  const study = studies[id],
    content = $("study-content");
  content.replaceChildren();
  const header = element("header", "study-header"),
    intro = element("div");
  const title = element("h2", "", project.title);
  title.id = "study-title";
  intro.append(
    element("p", "eyebrow", project.stack),
    title,
    element("p", "study-lead", t(project.description)),
  );
  header.append(intro);
  if (study) header.append(element("p", "study-question", t(study.question)));
  content.append(header);
  if (study) {
    const flow = element("div", "study-flow");
    for (const step of study.steps) {
      const section = element("section"),
        tokens = element(
          "div",
          `flow-tokens${step.parallel ? " parallel" : ""}`,
        );
      step.tokens.forEach((token) => tokens.append(element("span", "", token)));
      section.append(
        element("h3", "", t(step.title)),
        tokens,
        element("p", "", t(step.text)),
      );
      flow.append(section);
    }
    content.append(flow);
  }
  for (const media of project.media || []) {
    const figure = element("figure", "study-media");
    const asset = element(media.type === "video" ? "video" : "img");
    asset.src = media.src;
    if (media.type === "video") {
      asset.controls = true;
      asset.preload = "metadata";
      asset.playsInline = true;
      asset.setAttribute("aria-label", t(media.alt));
    } else {
      asset.alt = t(media.alt);
      asset.loading = "lazy";
    }
    figure.append(asset, element("figcaption", "", t(media.alt)));
    content.append(figure);
  }
  const notes = element("div", "study-notes");
  for (const detail of project.details || []) {
    const [title, text] = t(detail),
      section = element("section");
    section.append(element("h3", "", title), element("p", "", text));
    notes.append(section);
  }
  if (notes.children.length) content.append(notes);
  const evidence = element("section", "study-evidence");
  evidence.append(
    element(
      "h3",
      "",
      language === "zh" ? "从这里读实现" : "Start with the implementation",
    ),
  );
  evidence.append(
    externalLink(
      project.source || `${project.id} / README`,
      project.source
        ? `${repoURL(id)}/blob/${project.branch}/${project.source}`
        : repoURL(id),
    ),
  );
  evidence.append(
    element(
      "p",
      "",
      language === "zh"
        ? "项目能力、使用方式与限制随各仓库文档更新。"
        : "Each repository documents its capabilities, usage and limitations.",
    ),
  );
  content.append(evidence);
  if (project.related?.length) {
    const related = element("section", "study-related");
    related.append(
      element("h3", "", language === "zh" ? "继续看相关作品" : "Related work"),
    );
    for (const id of project.related) {
      const p = projects.find((p) => p.id === id),
        button = element("button", "", `${p.title} →`);
      button.addEventListener("click", () => openStudy(id));
      related.append(button, element("p", "", t(p.description)));
    }
    content.append(related);
  }
  content.append(
    element(
      "p",
      "study-reading-note",
      language === "zh"
        ? "由我定义问题、设计、集成和持续迭代，开发中大量使用 AI 编程工具。场景是工程机制的交互图解。"
        : "I define, design, integrate and iterate with extensive use of AI coding tools. The scene is an interactive explanation of the engineering.",
    ),
  );
  if (project.place && study && sceneReady) {
    const enter = element(
      "button",
      "study-home",
      language === "zh" ? "在场景中探索 →" : "Explore in the scene →",
    );
    enter.addEventListener("click", () => {
      $("study-dialog").close();
      select(project.place);
    });
    content.append(enter);
  }
  if (!$("study-dialog").open) $("study-dialog").showModal();
  $("study-dialog").scrollTop = 0;
  syncReading();
}
function syncReading() {
  stopExplanation();
  world?.setReading($("study-dialog").open || $("index-dialog").open);
}
function renderLanguage() {
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  $("mechanism-steps").setAttribute(
    "aria-label",
    language === "zh" ? "工程机制图解" : "Engineering walkthrough",
  );
  $("mechanism-labels").setAttribute(
    "aria-label",
    language === "zh" ? "场景中的机制标注" : "Scene mechanism annotations",
  );
  $("place-labels").setAttribute(
    "aria-label",
    language === "zh" ? "场景中的项目" : "Projects in the landscape",
  );
  document.title =
    language === "zh" ? "生鱼安乐 · 山水之间" : "LCYLYM · A landscape of work";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const c = copy[el.dataset.i18n];
    if (c) el.innerHTML = c[language === "zh" ? 0 : 1];
  });
  $("language").textContent = language === "zh" ? "EN" : "中文";
  $("language").setAttribute(
    "aria-label",
    language === "zh" ? "Switch to English" : "切换为中文",
  );
  $("previous").setAttribute(
    "aria-label",
    language === "zh" ? "上一个项目" : "Previous project",
  );
  $("next").setAttribute(
    "aria-label",
    language === "zh" ? "下一个项目" : "Next project",
  );
  $("landscape").setAttribute(
    "aria-label",
    language === "zh"
      ? "可交互的水墨山水作品集，也可通过项目导航阅读。"
      : "Interactive ink landscape portfolio. Project navigation is also available.",
  );
  $("places").setAttribute(
    "aria-label",
    language === "zh" ? "项目路线" : "Project route",
  );
  drawNavigation();
  drawIndex();
  drawChapter();
  if ($("study-dialog").open) openStudy(readingProject);
  updateQuality();
  updateMotion();
  if (sceneReady) $("scene-status").textContent = "";
}
function select(id, fromHistory = false, immediate = false) {
  stopExplanation();
  if (id && !places.some((p) => p.id === id)) return;
  selected = id;
  activeStep = 0;
  $("intro").hidden = Boolean(id);
  $("chapter").hidden = !id;
  document.body.classList.toggle("focused", Boolean(id));
  document.querySelectorAll(".place-tab").forEach((btn) => {
    const active = btn.dataset.place === id;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
    if (active && innerWidth <= 820)
      btn.scrollIntoView({ block: "nearest", inline: "center" });
  });
  if (id) {
    drawChapter();
    $("chapter").scrollTop = 0;
    $("route-progress").textContent =
      `${places.findIndex((p) => p.id === id) + 1} / ${places.length}`;
  } else {
    $("route-progress").textContent = "SELECTED WORKS";
    $("mechanism-labels").replaceChildren();
    mechanismLabels.clear();
  }
  world?.focus(id, fromHistory || immediate);
  if (!fromHistory) {
    const url = new URL(location);
    url.hash = id || "";
    if (url.href !== location.href) history.pushState(null, "", url);
  }
}
function move(direction) {
  const i = places.findIndex((p) => p.id === selected);
  select(places[(i + direction + places.length) % places.length].id);
}
function updateMotion() {
  $("motion").textContent =
    language === "zh"
      ? paused
        ? "开启动效"
        : "暂停动效"
      : paused
        ? "Motion on"
        : "Pause motion";
  $("motion").setAttribute("aria-pressed", String(paused));
  world?.setPaused(paused);
}
function openIndex() {
  if (!$("index-dialog").open) $("index-dialog").showModal();
  syncReading();
}
function updateQuality() {
  $("quality").setAttribute(
    "aria-label",
    language === "zh" ? "画质模式" : "Rendering quality",
  );
  $("quality").textContent =
    language === "zh"
      ? `画质：${quality === "auto" ? "自动" : "节能"}`
      : `Quality: ${quality === "auto" ? "Auto" : "Eco"}`;
}
function failScene(error) {
  sceneReady = false;
  document.body.classList.add("scene-unavailable");
  drawIndex();
  $("scene-status").textContent =
    language === "zh"
      ? "当前浏览器无法显示 3D 场景。项目索引仍可阅读。"
      : "The 3D scene is unavailable in this browser. The project index is readable.";
  openIndex();
  console.warn("Landscape unavailable:", error.message);
}
function playNote() {
  try {
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
    audioContext
      .resume()
      .then(() => {
        const now = audioContext.currentTime;
        [293.66, 440, 587.33].forEach((f, i) => {
          const oscillator = audioContext.createOscillator(),
            gain = audioContext.createGain();
          oscillator.type = "sine";
          oscillator.frequency.value = f;
          gain.gain.setValueAtTime(0, now + i * 0.06);
          gain.gain.linearRampToValueAtTime(
            0.045 / (i + 1),
            now + i * 0.06 + 0.012,
          );
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
          oscillator.connect(gain).connect(audioContext.destination);
          oscillator.start(now + i * 0.06);
          oscillator.stop(now + 3);
        });
      })
      .catch(() => {});
  } catch {
    /* The visual chimes are usable without audio support. */
  }
}
$("enter").addEventListener("click", () => select("gate"));
$("back").addEventListener("click", () => select(null));
document.querySelector(".identity").addEventListener("click", (e) => {
  e.preventDefault();
  select(null);
});
$("next").addEventListener("click", () => move(1));
$("previous").addEventListener("click", () => move(-1));
$("language").addEventListener("click", () => {
  language = language === "zh" ? "en" : "zh";
  const url = new URL(location);
  if (language === "en") url.searchParams.set("lang", "en");
  else url.searchParams.delete("lang");
  history.replaceState(null, "", url);
  renderLanguage();
});
$("motion").addEventListener("click", () => {
  paused = !paused;
  updateMotion();
});
reducedMotion.addEventListener("change", (e) => {
  paused = e.matches;
  updateMotion();
});
$("index-open").addEventListener("click", openIndex);
$("project-search").addEventListener("input", drawIndex);
$("study-open").addEventListener("click", () =>
  openStudy(places.find((p) => p.id === selected).project),
);
$("study-close").addEventListener("click", () => $("study-dialog").close());
for (const dialog of [$("study-dialog"), $("index-dialog")])
  dialog.addEventListener("close", syncReading);
$("quality").addEventListener("click", () => {
  quality = quality === "auto" ? "eco" : "auto";
  world?.setQuality(quality);
  updateQuality();
});
$("index-close").addEventListener("click", () => $("index-dialog").close());
document.querySelector(".skip").addEventListener("click", (e) => {
  e.preventDefault();
  openIndex();
});
$("index-dialog").addEventListener("click", (e) => {
  if (e.target === $("index-dialog")) {
    const rect = e.target.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    )
      e.target.close();
  }
});
$("experiment-button").addEventListener("click", () => {
  const place = places.find((p) => p.id === selected);
  if (!place) return;
  stopExplanation();
  const id = selected;
  const play = (step) => {
    if (selected !== id) return;
    selectStep(step, paused);
    world?.trigger();
    $("experiment-result").textContent =
      `${language === "zh" ? "机制图解" : "Illustration"} · ${step + 1} / ${studies[place.project].steps.length}`;
    if (!paused && step + 1 < studies[place.project].steps.length)
      explanationTimer = setTimeout(() => play(step + 1), 1800);
  };
  play(paused ? (activeStep + 1) % studies[place.project].steps.length : 0);
  if (selected === "music") playNote();
});
window.addEventListener("keydown", (e) => {
  if (
    $("index-dialog").open ||
    $("study-dialog").open ||
    e.altKey ||
    e.ctrlKey ||
    e.metaKey ||
    /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)
  )
    return;
  if (e.key === "ArrowRight") {
    e.preventDefault();
    const i = places.findIndex((p) => p.id === selected);
    select(places[(i + 1) % places.length].id, false, true);
  }
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    const i = places.findIndex((p) => p.id === selected);
    select(places[(i - 1 + places.length) % places.length].id, false, true);
  }
  if (e.key === "Escape") select(null);
});
window.addEventListener("hashchange", () =>
  select(location.hash.slice(1) || null, true),
);
renderLanguage();
if (query.has("capture")) document.body.classList.add("capture");
try {
  const { createLandscape } = await import("./landscape.js");
  world = createLandscape($("landscape"), {
    onSelect: (id) =>
      id === selected
        ? selectStep(
            (activeStep + 1) %
              studies[places.find((p) => p.id === id).project].steps.length,
          )
        : select(id),
    onError: failScene,
    onFrame: (frame) => {
      frame.labels.forEach(({ id, x, y, visible }) => {
        const el = labels.get(id);
        if (!el) return;
        const inText = innerWidth > 820 && x > innerWidth * 0.6;
        const inHeader = y < 130;
        const inFooter = y > innerHeight - 140;
        el.style.visibility =
          !selected && visible && !inText && !inHeader && !inFooter
            ? "visible"
            : "hidden";
        el.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px) translate(-50%,-100%)`;
      });
      (frame.annotations || []).forEach(({ index, x, y, visible }) => {
        const el = mechanismLabels.get(index);
        if (!el) return;
        // Keep one active annotation readable; other stops live in the step nav.
        const safe =
          innerWidth > 820
            ? x < innerWidth * 0.6 && y > 120 && y < innerHeight - 130
            : y > 130 && y < innerHeight * 0.44;
        el.style.visibility =
          visible && safe && index === activeStep ? "visible" : "hidden";
        el.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px) translate(-50%,-100%)`;
      });
    },
  });
  world.setPaused(paused);
  sceneReady = true;
  $("scene-status").textContent = "";
  const initial = location.hash.slice(1);
  if (places.some((p) => p.id === initial)) select(initial, true);
  // Read-only scene diagnostics and deterministic capture for portfolio assets.
  window.portfolio = {
    getState: () => ({
      language,
      selected,
      activeStep,
      readingProject,
      sceneReady,
      ...world.snapshot(),
    }),
    captureAt: (t) => world.captureAt(t),
  };
} catch (error) {
  failScene(error);
}
