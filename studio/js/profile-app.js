/* profile-app.js — controller for the immersive, privacy-safe 3D archive. */
(function () {
  const PROJECTS = [
    {
      id: 'ssh-connector-mcp',
      category: 'agent',
      tier: 'Agent 基础设施',
      stack: 'RUST · SSH · MCP · PTY · SFTP',
      zh: '让 Agent 通过 MCP 安全进入真实 SSH 会话：加密凭据、PTY、SFTP 与操作审计形成完整闭环。',
      en: 'A secure MCP bridge into real SSH sessions, with encrypted credentials, PTY, SFTP, and an auditable execution trail.',
    },
    {
      id: 'QuotaBar',
      category: 'native',
      tier: '原生界面实验',
      stack: 'SWIFT · MACOS · TOUCH BAR',
      zh: '把 AI 额度放进 macOS 菜单栏，也放进物理 Touch Bar。一个非常具体、也很个人的界面实验。',
      en: 'AI usage limits in the macOS menu bar and on a physical Touch Bar — a deliberately specific interface experiment.',
    },
    {
      id: 'codex-record-sync',
      category: 'agent',
      tier: '上下文所有权',
      stack: 'PYTHON · CODEX · LOCAL-FIRST',
      zh: '同步主任务、子代理与多会话记录，提供隐私视图和幂等导出，让 Agent 的工作现场真正归自己所有。',
      en: 'Synchronizes main tasks, subagents, and multi-session records with privacy views and idempotent exports.',
    },
    {
      id: 'guess-song',
      category: 'browser',
      token: 'play',
      tier: '实时游乐场',
      stack: 'TYPESCRIPT · CLOUDFLARE · WEBSOCKET',
      zh: '用 Durable Objects、WebSocket 和 viewer-specific state，把群友歌单做成一场可部署的实时盲猜。',
      en: 'A deployable real-time music guessing game built with Durable Objects, WebSocket, and viewer-specific state.',
    },
    {
      id: 'mac-markdown-pad',
      category: 'native',
      tier: '原生桌面产品',
      stack: 'SWIFT · MACOS · MARKDOWN',
      zh: '原生 Markdown 编辑器，做源码感知的滚动同步，也认真处理传统桌面产品的手感。',
      en: 'A native Markdown editor with source-aware scroll synchronization and careful desktop interactions.',
    },
    {
      id: 'lqreadervideosync',
      category: 'browser',
      tier: '真实场景工具',
      stack: 'TYPESCRIPT · PLAYER · BROWSER',
      zh: '从真实 Reader 使用场景长出来的视频同步工具，解决剧集、进度与多格式播放问题。',
      en: 'A browser video sync tool grown from a real Reader workflow, covering episodes, progress, and multiple formats.',
    },
    {
      id: 'ai-tabs-organizer',
      category: 'browser',
      tier: '浏览器端 AI',
      stack: 'JAVASCRIPT · MV3 · GEMINI NANO',
      zh: '把 OpenAI-compatible API 与 Chrome Prompt API / Gemini Nano 接进 MV3 标签页整理流程。',
      en: 'An MV3 tab organizer combining OpenAI-compatible APIs with Chrome Prompt API and Gemini Nano.',
    },
    {
      id: 'ai-release-guardian',
      category: 'agent',
      tier: '发布边界',
      stack: 'PYTHON · ARTIFACTS · POLICY',
      zh: '在 AI 参与开发之后，继续守住发布产物：扫描敏感上下文、配置与不该进入制品的文件。',
      en: 'Keeps AI-era release artifacts clean by checking private context, configuration, and files that should never ship.',
    },
  ];

  const COPY = {
    zh: {
      eyebrow: 'AN ARCHIVE OF THINGS MADE REAL',
      title: '把新东西，接进真实世界。',
      summary: '走进这座档案馆：Agent 基础设施、原生界面与浏览器实验，都以可触碰的器物留在现场。',
      open: '打开仓库',
      inspect: '点击查看卷宗',
      reset: '归位',
    },
    en: {
      eyebrow: 'AN ARCHIVE OF THINGS MADE REAL',
      title: 'New things, wired into reality.',
      summary: 'Enter the archive: agent infrastructure, native interfaces, and browser experiments remain here as tangible instruments.',
      open: 'OPEN REPOSITORY',
      inspect: 'CLICK TO INSPECT',
      reset: 'RESET',
    },
  };

  const captureMode = new URLSearchParams(location.search).has('capture');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  if (captureMode) document.body.classList.add('capture');

  let scene;
  let camera;
  let renderer;
  let world;
  let raycaster;
  let pointer;
  let animationFrame = 0;
  let language = 'zh';
  let selected = null;
  let hoveredId = null;
  let currentView = 'overview';
  let pointerTargetX = 0;
  let pointerTargetY = 0;
  let pointerX = 0;
  let pointerY = 0;
  let dragYaw = 0;
  let dragPitch = 0;
  let dolly = 0;
  let targetDolly = 0;
  let dragging = false;
  let dragDistance = 0;
  let dragStartX = 0;
  let dragStartY = 0;
  let lastDragX = 0;
  let lastDragY = 0;

  const camPosition = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  const camTargetPosition = new THREE.Vector3();
  const camTargetLook = new THREE.Vector3();
  const cameraDirection = new THREE.Vector3();

  function configureRenderer() {
    renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('scene'),
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, captureMode ? 1.4 : 1.8));
    renderer.setClearColor(0x070706, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .93;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.physicallyCorrectLights = false;
  }

  function configureScene() {
    scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x070706, .028);

    camera = new THREE.PerspectiveCamera(innerWidth < 680 ? 57 : 46, innerWidth / innerHeight, .1, 80);

    scene.add(new THREE.HemisphereLight(0xc7b58f, 0x020202, .3));
    scene.add(new THREE.AmbientLight(0x8f8067, .072));

    const key = new THREE.SpotLight(0xd2ae72, 2.75, 34, Math.PI / 5.5, .64, 1.35);
    key.position.set(-5.8, 10.8, 5.8);
    key.target.position.set(-1.6, 2.6, -3.7);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 38;
    key.shadow.bias = -.00025;
    scene.add(key, key.target);

    const coreLight = new THREE.PointLight(0xa97e45, 1.72, 20, 1.65);
    coreLight.position.set(0, 4.35, -4.6);
    scene.add(coreLight);

    const redLeft = new THREE.PointLight(0xa5322c, 1.45, 13, 1.8);
    redLeft.position.set(-6.2, 6.15, -3.9);
    const redRight = redLeft.clone();
    redRight.position.x = 6.2;
    redRight.position.z = -3.9;
    scene.add(redLeft, redRight);

    const archiveSpot = new THREE.SpotLight(0xc49c5d, 2.05, 18, Math.PI / 5.2, .68, 1.5);
    archiveSpot.position.set(0, 9.0, -5.8);
    archiveSpot.target.position.set(0, 4.5, -12.2);
    scene.add(archiveSpot, archiveSpot.target);

    const rightFill = new THREE.SpotLight(0x9a7e57, .78, 23, Math.PI / 4.8, .75, 1.6);
    rightFill.position.set(6.8, 7.3, 3.4);
    rightFill.target.position.set(3.5, 3.4, -5.4);
    scene.add(rightFill, rightFill.target);

    const backLight = new THREE.DirectionalLight(0x8b7652, .54);
    backLight.position.set(0, 7.8, -12.4);
    scene.add(backLight);

    world = window.buildArchive(scene, PROJECTS);
    const openingView = viewFor('overview');
    camPosition.set(...openingView.pos);
    camLook.set(...openingView.look);
    camTargetPosition.copy(camPosition);
    camTargetLook.copy(camLook);
    camera.position.copy(camPosition);
    camera.lookAt(camLook);
  }

  function renderProjectIndex() {
    const index = document.getElementById('project-index');
    index.replaceChildren(...PROJECTS.map((project, projectIndex) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'project-button';
      button.dataset.project = project.id;
      button.innerHTML = `<small>${String(projectIndex + 1).padStart(2, '0')} · ${project.category.toUpperCase()}</small><b>${project.id}</b>`;
      button.addEventListener('click', () => showProject(project));
      button.addEventListener('mouseenter', () => setHovered(project.id));
      button.addEventListener('mouseleave', () => setHovered(null));
      return button;
    }));
  }

  function updateActiveNavigation(viewName) {
    document.querySelectorAll('.view-button').forEach((button) => {
      button.classList.toggle('active', button.dataset.view === viewName);
    });
  }

  function moveCamera(view, options = {}) {
    camTargetPosition.set(...view.pos);
    camTargetLook.set(...view.look);
    if (options.frameRight && innerWidth > 850) camTargetLook.x += 1.05;
    dragYaw = 0;
    dragPitch = 0;
    targetDolly = 0;
  }

  function viewFor(viewName) {
    if (innerWidth < 680 && viewName === 'overview') return world.views.mobileOverview;
    return world.views[viewName] || world.views.overview;
  }

  function goToView(viewName) {
    const view = viewFor(viewName);
    currentView = viewName in world.views ? viewName : 'overview';
    selected = null;
    world.setActive(null);
    world.setView(currentView);
    document.querySelectorAll('.project-button').forEach((button) => button.classList.remove('active'));
    document.getElementById('dossier').classList.remove('open');
    document.body.classList.remove('inspecting');
    updateActiveNavigation(currentView);
    moveCamera(view);
  }

  function showProject(project) {
    selected = project;
    currentView = project.category;
    document.querySelectorAll('.project-button').forEach((button) => {
      button.classList.toggle('active', button.dataset.project === project.id);
    });
    document.getElementById('dossier-index').textContent = `ARCHIVE ${String(PROJECTS.indexOf(project) + 1).padStart(2, '0')} / ${String(PROJECTS.length).padStart(2, '0')}`;
    document.getElementById('dossier-kicker').textContent = project.tier;
    document.getElementById('dossier-title').textContent = project.id;
    document.getElementById('dossier-description').textContent = project[language];
    document.getElementById('dossier-stack').textContent = project.stack;
    const link = document.getElementById('repo-link');
    link.href = `https://github.com/LCYLYM/${project.id}`;
    link.firstChild.textContent = `${COPY[language].open} `;
    document.getElementById('dossier').classList.add('open');
    document.body.classList.add('inspecting');
    world.setView(project.category);
    world.setActive(project.id);
    updateActiveNavigation(project.category);
    moveCamera(world.projectViews[project.id], { frameRight: true });
  }

  function closeDossier(resetCamera) {
    selected = null;
    world.setActive(null);
    document.querySelectorAll('.project-button').forEach((button) => button.classList.remove('active'));
    document.getElementById('dossier').classList.remove('open');
    document.body.classList.remove('inspecting');
    if (resetCamera) goToView('overview');
  }

  function setLanguage(nextLanguage) {
    language = nextLanguage;
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.querySelector('[data-copy="eyebrow"]').textContent = COPY[language].eyebrow;
    document.querySelector('[data-copy="title"]').textContent = COPY[language].title;
    document.querySelector('[data-copy="summary"]').textContent = COPY[language].summary;
    document.getElementById('language').textContent = language === 'zh' ? '中 / EN' : 'EN / 中';
    document.getElementById('reset').textContent = COPY[language].reset;
    document.querySelector('#hover-label small').textContent = COPY[language].inspect;
    if (selected) showProject(selected);
  }

  function setPointerFromEvent(event) {
    pointer.x = event.clientX / innerWidth * 2 - 1;
    pointer.y = -(event.clientY / innerHeight) * 2 + 1;
  }

  function projectAtPointer() {
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(world.projectHitMeshes, false)[0];
    return hit && hit.object.userData.projectId ? hit.object.userData.projectId : null;
  }

  function setHovered(projectId, event) {
    if (hoveredId === projectId && !event) return;
    hoveredId = projectId;
    world.setHovered(projectId);
    document.body.classList.toggle('project-hover', !!projectId);
    const label = document.getElementById('hover-label');
    label.classList.toggle('visible', !!projectId && !!event && !dragging);
    if (projectId && event) {
      document.getElementById('hover-title').textContent = projectId;
      label.style.left = `${Math.min(event.clientX, innerWidth - 190)}px`;
      label.style.top = `${Math.max(72, Math.min(event.clientY, innerHeight - 95))}px`;
    }
  }

  function inspectPointer(event) {
    if (!finePointer || dragging || selected) {
      setHovered(null);
      return;
    }
    setPointerFromEvent(event);
    setHovered(projectAtPointer(), event);
  }

  function handleSceneClick(event) {
    if (dragDistance > 6) return;
    setPointerFromEvent(event);
    const projectId = projectAtPointer();
    if (projectId) showProject(PROJECTS.find((project) => project.id === projectId));
  }

  function bindEvents() {
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2(-2, -2);
    const canvas = document.getElementById('scene');

    addEventListener('resize', () => {
      camera.aspect = innerWidth / innerHeight;
      camera.fov = innerWidth < 680 ? 57 : 46;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, captureMode ? 1.4 : 1.8));
    });

    canvas.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      dragging = true;
      dragDistance = 0;
      dragStartX = lastDragX = event.clientX;
      dragStartY = lastDragY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
      document.body.classList.add('dragging');
      setHovered(null);
    });
    canvas.addEventListener('pointermove', (event) => {
      pointerTargetX = event.clientX / innerWidth * 2 - 1;
      pointerTargetY = event.clientY / innerHeight * 2 - 1;
      if (!dragging) {
        inspectPointer(event);
        return;
      }
      const deltaX = event.clientX - lastDragX;
      const deltaY = event.clientY - lastDragY;
      dragDistance = Math.hypot(event.clientX - dragStartX, event.clientY - dragStartY);
      dragYaw = THREE.MathUtils.clamp(dragYaw - deltaX * .0028, -.48, .48);
      dragPitch = THREE.MathUtils.clamp(dragPitch + deltaY * .0021, -.2, .22);
      lastDragX = event.clientX;
      lastDragY = event.clientY;
    });
    canvas.addEventListener('pointerup', (event) => {
      if (!dragging) return;
      dragging = false;
      document.body.classList.remove('dragging');
      canvas.releasePointerCapture(event.pointerId);
      handleSceneClick(event);
    });
    canvas.addEventListener('pointercancel', () => {
      dragging = false;
      document.body.classList.remove('dragging');
      setHovered(null);
    });
    canvas.addEventListener('pointerleave', () => {
      if (!dragging) setHovered(null);
    });
    canvas.addEventListener('wheel', (event) => {
      targetDolly = THREE.MathUtils.clamp(targetDolly + event.deltaY * .0015, -1.35, 2.2);
    }, { passive: true });

    document.querySelectorAll('.view-button').forEach((button) => {
      button.addEventListener('click', () => goToView(button.dataset.view));
    });
    document.getElementById('seal-reset').addEventListener('click', () => goToView('overview'));
    document.getElementById('reset').addEventListener('click', () => goToView('overview'));
    document.getElementById('dossier-close').addEventListener('click', () => closeDossier(true));
    document.getElementById('language').addEventListener('click', () => setLanguage(language === 'zh' ? 'en' : 'zh'));

    addEventListener('keydown', (event) => {
      if (event.key === 'Escape') goToView('overview');
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        const currentIndex = selected ? PROJECTS.indexOf(selected) : -1;
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = (currentIndex + direction + PROJECTS.length) % PROJECTS.length;
        showProject(PROJECTS[nextIndex]);
      }
    });
  }

  function animate(time) {
    animationFrame = requestAnimationFrame(animate);
    pointerX += (pointerTargetX - pointerX) * .035;
    pointerY += (pointerTargetY - pointerY) * .035;
    dolly += (targetDolly - dolly) * .055;
    camPosition.lerp(camTargetPosition, .038);
    camLook.lerp(camTargetLook, .038);

    const captureOrbit = captureMode && !reducedMotion ? Math.sin(time * .00033) * .34 : 0;
    const position = camPosition.clone();
    const look = camLook.clone();
    cameraDirection.copy(position).sub(look).normalize();
    position.addScaledVector(cameraDirection, dolly);
    position.x += pointerX * .12 + captureOrbit;
    position.y -= pointerY * .06;
    look.x += pointerX * .22 + dragYaw * 6.1;
    look.y -= pointerY * .1 + dragPitch * 4.1;
    camera.position.copy(position);
    camera.lookAt(look);

    const plate = document.querySelector('.environment-plate');
    if (plate) {
      const plateX = -pointerX * 10 - captureOrbit * 2.5;
      const plateY = pointerY * 5;
      plate.style.transform = `scale(1.055) translate3d(${plateX}px, ${plateY}px, 0)`;
    }

    world.update(time, !reducedMotion);
    renderer.render(scene, camera);
  }

  function init() {
    try {
      if (!window.THREE || !window.buildArchive) throw new Error('3D engine failed to load');
      configureRenderer();
      configureScene();
      renderProjectIndex();
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
  addEventListener('beforeunload', () => cancelAnimationFrame(animationFrame));
})();
