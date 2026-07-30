/* LCYLYM profile studio — static, privacy-safe 3D portfolio controller. */
(function () {
  const PROJECTS = [
    {
      id: 'ssh-connector-mcp',
      category: 'agent',
      tier: 'Agent infrastructure',
      stack: 'RUST · SSH · MCP · PTY · SFTP',
      zh: '让 Agent 通过 MCP 安全进入真实 SSH 会话：加密凭据、PTY、SFTP 与操作审计形成完整闭环。',
      en: 'A secure MCP bridge into real SSH sessions, with encrypted credentials, PTY, SFTP, and an auditable execution trail.',
    },
    {
      id: 'QuotaBar',
      category: 'native',
      tier: 'Native oddity',
      stack: 'SWIFT · MACOS · TOUCH BAR',
      zh: '把 AI 额度放进 macOS 菜单栏，也放进物理 Touch Bar。一个非常具体、也很个人的界面实验。',
      en: 'AI usage limits in the macOS menu bar and on a physical Touch Bar — a deliberately specific interface experiment.',
    },
    {
      id: 'codex-record-sync',
      category: 'agent',
      tier: 'Context ownership',
      stack: 'PYTHON · CODEX · LOCAL-FIRST',
      zh: '同步主任务、子代理与多会话记录，提供隐私视图和幂等导出，让 Agent 的工作现场真正归自己所有。',
      en: 'Synchronizes main tasks, subagents, and multi-session records with privacy views and idempotent exports.',
    },
    {
      id: 'guess-song',
      category: 'play',
      tier: 'Realtime playground',
      stack: 'TYPESCRIPT · CLOUDFLARE · WEBSOCKET',
      zh: '用 Durable Objects、WebSocket 和 viewer-specific state，把群友歌单做成一场可部署的实时盲猜。',
      en: 'A deployable real-time music guessing game built with Durable Objects, WebSocket, and viewer-specific state.',
    },
    {
      id: 'mac-markdown-pad',
      category: 'native',
      tier: 'Native product',
      stack: 'SWIFT · MACOS · MARKDOWN',
      zh: '原生 Markdown 编辑器，做源码感知的滚动同步，也认真处理传统桌面产品的手感。',
      en: 'A native Markdown editor with source-aware scroll synchronization and careful desktop interactions.',
    },
    {
      id: 'lqreadervideosync',
      category: 'play',
      tier: 'Reader tool',
      stack: 'TYPESCRIPT · PLAYER · BROWSER',
      zh: '从真实 Reader 使用场景长出来的视频同步工具，解决剧集、进度与多格式播放问题。',
      en: 'A browser video sync tool grown from a real Reader workflow, covering episodes, progress, and multiple formats.',
    },
    {
      id: 'ai-tabs-organizer',
      category: 'play',
      tier: 'Browser AI',
      stack: 'JAVASCRIPT · MV3 · GEMINI NANO',
      zh: '把 OpenAI-compatible API 与 Chrome Prompt API / Gemini Nano 接进 MV3 标签页整理流程。',
      en: 'An MV3 tab organizer combining OpenAI-compatible APIs with Chrome Prompt API and Gemini Nano.',
    },
    {
      id: 'ai-release-guardian',
      category: 'agent',
      tier: 'Release safety',
      stack: 'PYTHON · ARTIFACTS · POLICY',
      zh: '在 AI 参与开发之后，继续守住发布产物：扫描敏感上下文、配置与不该进入制品的文件。',
      en: 'Keeps AI-era release artifacts clean by checking private context, configuration, and files that should never ship.',
    },
  ];

  const COPY = {
    zh: {
      eyebrow: 'BUILT AROUND THE MODEL · AND OUTSIDE IT',
      title: '把新东西<br>接进真实世界。',
      summary: 'Agent 会连 SSH、保存工作现场；AI 额度住进 Touch Bar；群友的歌单变成一场实时游戏。',
      open: '打开仓库',
    },
    en: {
      eyebrow: 'BUILT AROUND THE MODEL · AND OUTSIDE IT',
      title: 'New things,<br>wired into reality.',
      summary: 'Agents enter SSH sessions and keep their working context. AI quotas live on the Touch Bar. A group playlist turns into a real-time game.',
      open: 'OPEN REPOSITORY',
    },
  };

  const captureMode = new URLSearchParams(location.search).has('capture');
  if (captureMode) document.body.classList.add('capture');

  let language = 'zh';
  let scene;
  let camera;
  let renderer;
  let world;
  let raycaster;
  let pointer;
  let selected = null;
  let cameraMode = 'room';
  let frame = 0;
  let lastScreenDraw = 0;
  let pointerTargetX = 0;
  let pointerTargetY = 0;
  let pointerX = 0;
  let pointerY = 0;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CAMERA = {
    room: { pos: [6.2, 4.8, 7.4], look: [0, 2.8, -3.8] },
    agent: { pos: [-.1, 4.4, 2.0], look: [-.55, 3.1, -4.65] },
    native: { pos: [4.3, 4.6, 1.6], look: [2.15, 3.1, -4.65] },
    play: { pos: [3.8, 5.1, 7.0], look: [-3.0, 5.8, -5.2] },
  };
  const camPos = new THREE.Vector3(...CAMERA.room.pos);
  const camLook = new THREE.Vector3(...CAMERA.room.look);
  const camTargetPos = camPos.clone();
  const camTargetLook = camLook.clone();

  function createRenderer() {
    const canvas = document.getElementById('scene');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, captureMode ? 1.5 : 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = .98;
    renderer.outputEncoding = THREE.sRGBEncoding;
  }

  function createWorld() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe1d4c0);
    scene.fog = new THREE.Fog(0xe1d4c0, 18, 38);

    camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, .1, 100);
    camera.position.copy(camPos);
    camera.lookAt(camLook);

    scene.add(new THREE.HemisphereLight(0xffe9c8, 0x6e5234, .5));
    scene.add(new THREE.AmbientLight(0xffdcae, .2));

    const sun = new THREE.DirectionalLight(0xffd49a, 1.15);
    sun.position.set(-10, 9, 2);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 40;
    sun.shadow.camera.left = -14;
    sun.shadow.camera.right = 14;
    sun.shadow.camera.top = 14;
    sun.shadow.camera.bottom = -14;
    sun.shadow.bias = -.0004;
    sun.shadow.radius = 4;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xffd9a8, .2);
    fill.position.set(6, 5, 7);
    scene.add(fill);

    world = window.buildRoom(scene);
    world.lid.rotation.x = -1.82;
    world.notebookLid.rotation.x = -1.76;
    world.screenMat.emissiveIntensity = .34;
    world.pageMat.emissiveIntensity = .14;

    const lamp = new THREE.PointLight(0xffcf8a, .72, 14, 2);
    lamp.position.copy(world.lampPos);
    scene.add(lamp);

    drawFishmark();
    drawScreens(0);
  }

  function drawFishmark() {
    const { canvas, ctx, staticCanvas, staticCtx, tex } = world.fishmarkArt;
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#201b17';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,244,216,.13)';
    ctx.lineWidth = 2;
    for (let y = 44; y < h; y += 44) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.fillStyle = '#d66d43';
    ctx.beginPath();
    ctx.ellipse(w * .48, h * .39, 118, 68, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * .22, h * .39);
    ctx.lineTo(w * .06, h * .27);
    ctx.lineTo(w * .06, h * .51);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff4d8';
    ctx.beginPath();
    ctx.arc(w * .62, h * .36, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '700 50px Georgia, serif';
    ctx.fillText('LCYLYM', 42, h * .67);
    ctx.fillStyle = '#c9f27c';
    ctx.font = '600 18px monospace';
    ctx.fillText('WEIRD IDEA → REAL TOOL', 44, h * .74);
    ctx.fillStyle = 'rgba(255,244,216,.56)';
    ctx.font = '500 15px monospace';
    ctx.fillText('AGENT SYSTEMS / NATIVE ODDITIES', 44, h * .82);
    staticCtx.clearRect(0, 0, w, h);
    staticCtx.drawImage(canvas, 0, 0);
    tex.needsUpdate = true;
  }

  function drawScreens(time) {
    const c = world.screenCanvas;
    const ctx = world.screenCtx;
    const w = c.width;
    const h = c.height;
    ctx.fillStyle = '#13110f';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#24201c';
    ctx.fillRect(0, 0, w, 76);
    ctx.fillStyle = '#d66d43';
    ctx.beginPath(); ctx.arc(34, 37, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e5b763';
    ctx.beginPath(); ctx.arc(62, 37, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#91a873';
    ctx.beginPath(); ctx.arc(90, 37, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#9c9182';
    ctx.font = '500 23px monospace';
    ctx.fillText('agent-control-plane', 126, 46);
    ctx.fillStyle = '#c9f27c';
    ctx.font = '600 29px monospace';
    ctx.fillText('$ ssh-mcp connect production', 48, 142);
    ctx.fillStyle = '#efe7d7';
    ctx.font = '500 25px monospace';
    const lines = [
      '✓ credentials unlocked locally',
      '✓ policy checked before execution',
      '✓ PTY session attached',
      '✓ evidence saved to audit trail',
    ];
    lines.forEach((line, index) => {
      ctx.globalAlpha = index <= Math.floor(time / 900) % 5 ? 1 : .22;
      ctx.fillText(line, 66, 224 + index * 66);
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#d98661';
    ctx.fillRect(48, 520, Math.max(70, ((time / 22) % (w - 96))), 5);
    ctx.fillStyle = '#7f7568';
    ctx.font = '500 20px monospace';
    ctx.fillText('tool.called → evidence.saved → verdict.pass', 48, 582);
    world.screenTex.needsUpdate = true;

    const pc = world.pageCanvas;
    const pctx = world.pageCtx;
    const pw = pc.width;
    const ph = pc.height;
    pctx.fillStyle = '#f3ead8';
    pctx.fillRect(0, 0, pw, ph);
    pctx.fillStyle = '#c65f39';
    pctx.font = '700 38px Georgia, serif';
    pctx.fillText('QuotaBar', 68, 90);
    pctx.fillStyle = '#57483c';
    pctx.font = '600 22px monospace';
    pctx.fillText('AI LIMITS / PHYSICAL INTERFACE', 68, 132);
    const quotas = [
      ['CODEX', 68, '#c65f39'],
      ['CLAUDE', 42, '#7e9b6e'],
      ['GEMINI', 83, '#caa45e'],
    ];
    quotas.forEach(([name, value, color], index) => {
      const y = 240 + index * 190;
      pctx.fillStyle = '#57483c';
      pctx.font = '700 28px monospace';
      pctx.fillText(name, 70, y);
      pctx.textAlign = 'right';
      pctx.fillText(`${value}%`, pw - 70, y);
      pctx.textAlign = 'left';
      pctx.fillStyle = '#ded2bd';
      pctx.fillRect(70, y + 34, pw - 140, 22);
      pctx.fillStyle = color;
      pctx.fillRect(70, y + 34, (pw - 140) * value / 100, 22);
    });
    pctx.fillStyle = '#8b7b6b';
    pctx.font = '500 20px monospace';
    pctx.fillText('MENU BAR + TOUCH BAR', 70, ph - 78);
    world.pageTex.needsUpdate = true;
  }

  function renderProjectRail() {
    const rail = document.getElementById('project-rail');
    rail.replaceChildren(...PROJECTS.map((project) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'project-button';
      button.dataset.project = project.id;
      button.innerHTML = `<small>${project.tier}</small><b>${project.id}</b>`;
      button.addEventListener('click', () => showProject(project));
      return button;
    }));
  }

  function showProject(project) {
    selected = project;
    document.querySelectorAll('.project-button').forEach((button) => button.classList.toggle('active', button.dataset.project === project.id));
    document.getElementById('drawer-kicker').textContent = project.tier;
    document.getElementById('drawer-title').textContent = project.id;
    document.getElementById('drawer-description').textContent = project[language];
    document.getElementById('drawer-stack').textContent = project.stack;
    const link = document.getElementById('repo-link');
    link.href = `https://github.com/LCYLYM/${project.id}`;
    link.firstChild.textContent = `${COPY[language].open} `;
    document.getElementById('drawer').classList.add('open');
    setCamera(project.category);
  }

  function hideProject() {
    selected = null;
    document.querySelectorAll('.project-button').forEach((button) => button.classList.remove('active'));
    document.getElementById('drawer').classList.remove('open');
    setCamera('room');
  }

  function setCamera(mode) {
    cameraMode = CAMERA[mode] ? mode : 'room';
    camTargetPos.set(...CAMERA[cameraMode].pos);
    camTargetLook.set(...CAMERA[cameraMode].look);
  }

  function setLanguage(next) {
    language = next;
    document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en';
    document.querySelector('[data-copy="eyebrow"]').textContent = COPY[next].eyebrow;
    document.querySelector('[data-copy="title"]').innerHTML = COPY[next].title;
    document.querySelector('[data-copy="summary"]').textContent = COPY[next].summary;
    document.getElementById('language').textContent = next === 'zh' ? '中 / EN' : 'EN / 中';
    if (selected) showProject(selected);
  }

  function projectHotspots() {
    const points = [
      ['hotspot-agent', new THREE.Vector3(-.7, 3.85, -4.2), 'agent'],
      ['hotspot-native', new THREE.Vector3(2.15, 3.75, -4.25), 'native'],
      ['hotspot-play', new THREE.Vector3(-4.6, 7.45, -5.15), 'play'],
    ];
    points.forEach(([id, worldPosition]) => {
      const projected = worldPosition.clone().project(camera);
      const x = (projected.x * .5 + .5) * innerWidth;
      const y = (-projected.y * .5 + .5) * innerHeight;
      const element = document.getElementById(id);
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      element.style.opacity = projected.z > 1 || selected ? '0' : '1';
      element.style.pointerEvents = selected ? 'none' : 'auto';
    });
  }

  function handleCanvasClick(event) {
    pointer.x = event.clientX / innerWidth * 2 - 1;
    pointer.y = -(event.clientY / innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(world.propHitMeshes.concat(world.laptopHitMeshes, world.notebookHitMeshes), true);
    const kind = hits.find((hit) => hit.object.userData && hit.object.userData.kind)?.object.userData.kind;
    if (kind === 'laptop') showProject(PROJECTS.find((project) => project.id === 'ssh-connector-mcp'));
    if (kind === 'notebook') showProject(PROJECTS.find((project) => project.id === 'QuotaBar'));
    if (kind === 'language') showProject(PROJECTS.find((project) => project.id === 'guess-song'));
    if (kind === 'fishmark') hideProject();
  }

  function bindEvents() {
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2(-2, -2);
    addEventListener('resize', () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, captureMode ? 1.5 : 2));
    });
    addEventListener('pointermove', (event) => {
      if (captureMode || reducedMotion) return;
      pointerTargetX = event.clientX / innerWidth * 2 - 1;
      pointerTargetY = event.clientY / innerHeight * 2 - 1;
    });
    document.getElementById('scene').addEventListener('click', handleCanvasClick);
    document.getElementById('drawer-close').addEventListener('click', hideProject);
    document.getElementById('reset').addEventListener('click', hideProject);
    document.getElementById('language').addEventListener('click', () => setLanguage(language === 'zh' ? 'en' : 'zh'));
    document.getElementById('hotspot-agent').addEventListener('click', () => showProject(PROJECTS[0]));
    document.getElementById('hotspot-native').addEventListener('click', () => showProject(PROJECTS[1]));
    document.getElementById('hotspot-play').addEventListener('click', () => showProject(PROJECTS[3]));
    addEventListener('keydown', (event) => {
      if (event.key === 'Escape') hideProject();
    });
  }

  function animate(time) {
    frame = requestAnimationFrame(animate);
    pointerX += (pointerTargetX - pointerX) * .025;
    pointerY += (pointerTargetY - pointerY) * .025;

    camPos.lerp(camTargetPos, .035);
    camLook.lerp(camTargetLook, .035);
    const orbit = captureMode && !reducedMotion ? Math.sin(time * .00055) * .11 : 0;
    camera.position.set(camPos.x + pointerX * .18 + orbit, camPos.y - pointerY * .08, camPos.z);
    camera.lookAt(camLook.x + pointerX * .08, camLook.y - pointerY * .05, camLook.z);

    if (world && time - lastScreenDraw > 140) {
      drawScreens(time);
      lastScreenDraw = time;
    }
    if (world && world.plantLeaves && !reducedMotion) {
      world.plantLeaves.forEach((leaf, index) => { leaf.rotation.z += Math.sin(time * .001 + index) * .00008; });
    }
    projectHotspots();
    renderer.render(scene, camera);
  }

  function init() {
    try {
      if (!window.THREE || !window.buildRoom) throw new Error('3D engine failed to load');
      createRenderer();
      createWorld();
      renderProjectRail();
      bindEvents();
      setLanguage('zh');
      animate(0);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        document.getElementById('loader').classList.add('done');
        window.STUDIO_CAPTURE_READY = true;
      }));
    } catch (error) {
      document.querySelector('.loader-copy').textContent = `WEBGL UNAVAILABLE · ${error.message}`;
      console.error(error);
    }
  }

  addEventListener('DOMContentLoaded', init);
  addEventListener('beforeunload', () => cancelAnimationFrame(frame));
})();
