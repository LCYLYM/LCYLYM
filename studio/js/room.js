/* room.js — procedural low-poly clay room
   Exposes window.WORLD with references to interactive objects. */
(function () {
  const PAL = {
    floor:        0xc4894c,
    floorDark:    0xb07b40,
    rug:          0xb35030,
    rugTrim:      0xddc4a8,
    wall:         0xe9dcc4,
    wallShade:    0xe1d2b8,
    skirt:        0xd6c6ac,
    desk:         0x8c6a4c,
    deskEdge:     0x7a5a3f,
    deskLeg:      0x6d5238,
    laptopBase:   0x3a3530,
    laptopLid:    0x33302b,
    laptopHinge:  0x26231f,
    screenBezel:  0x201d19,
    screen:       0x141210,
    notebook:     0xc15a37,
    notebookEdge: 0x9c4528,
    pages:        0xf3ecdd,
    mug:          0xd98a57,
    mugInner:     0x3a3530,
    coffee:       0x4a2f1e,
    pot:          0xb86847,
    leaf:         0x7e9b6e,
    leaf2:        0x8fa87b,
    chair:        0x9a7a5c,
    chairLeg:     0x4a4540,
    lampShade:    0xead7b8,
    lampStem:     0x2e2a26,
    book1:        0xc4623f,
    book2:        0x7d8a6a,
    book3:        0xcaa45e,
    window:       0xf6efe0,
    frame:        0xe8dcc8,
  };
  // sanitize accidental non-hex (defensive)
  for (const k in PAL) { if (typeof PAL[k] !== 'number') PAL[k] = 0xcccccc; }

  function mat(color, opts = {}) {
    return new THREE.MeshStandardMaterial(Object.assign({
      color, roughness: 0.92, metalness: 0.0, flatShading: !!opts.flat,
    }, opts.matOpts || {}));
  }
  function box(w, h, d, color, opts = {}) {
    const g = new THREE.BoxGeometry(w, h, d);
    const m = mat(color, opts);
    const mesh = new THREE.Mesh(g, m);
    mesh.castShadow = opts.cast !== false;
    mesh.receiveShadow = opts.receive !== false;
    return mesh;
  }
  function cyl(rt, rb, h, color, seg, opts = {}) {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg || 16);
    const mesh = new THREE.Mesh(g, mat(color, opts));
    mesh.castShadow = opts.cast !== false;
    mesh.receiveShadow = opts.receive !== false;
    return mesh;
  }

  function createFishmarkArt() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 640;
    const staticCanvas = document.createElement('canvas');
    staticCanvas.width = canvas.width;
    staticCanvas.height = canvas.height;
    const ctx = canvas.getContext('2d');
    const staticCtx = staticCanvas.getContext('2d');
    const tex = new THREE.CanvasTexture(canvas);
    const matArt = new THREE.MeshStandardMaterial({
      map: tex,
      emissive: 0xffffff,
      emissiveMap: tex,
      emissiveIntensity: 0.12,
      roughness: 0.74,
      metalness: 0,
    });
    return { canvas, ctx, staticCanvas, staticCtx, tex, mat: matArt };
  }

  function buildRoom(scene) {
    const W = {};
    W.propHitMeshes = [];
    W.languageBooks = [];
    W.plantLeaves = [];

    // ---- Floor ----
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 26),
      mat(PAL.floor, { matOpts: { roughness: 0.96 } })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // subtle plank lines via thin dark strips
    for (let i = -5; i <= 5; i++) {
      const plank = new THREE.Mesh(
        new THREE.PlaneGeometry(26, 0.03),
        mat(PAL.floorDark, { matOpts: { roughness: 1 } })
      );
      plank.rotation.x = -Math.PI / 2;
      plank.position.set(0, 0.002, i * 2.2);
      plank.receiveShadow = false;
      scene.add(plank);
    }

    // ---- Rug ----
    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 7),
      mat(PAL.rug, { matOpts: { roughness: 1 } })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.01, -2.6);
    rug.receiveShadow = true;
    scene.add(rug);
    const rugInner = new THREE.Mesh(
      new THREE.PlaneGeometry(8.2, 6.2),
      mat(0x9c4226, { matOpts: { roughness: 1 } })
    );
    rugInner.rotation.x = -Math.PI / 2;
    rugInner.position.set(0, 0.012, -2.6);
    scene.add(rugInner);

    // ---- Walls ----
    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 14),
      mat(PAL.wall, { matOpts: { roughness: 1 } })
    );
    backWall.position.set(0, 7, -6);
    backWall.receiveShadow = true;
    scene.add(backWall);

    const leftWall = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 14),
      mat(PAL.wallShade, { matOpts: { roughness: 1 } })
    );
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-9, 7, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // skirting boards
    const skirtBack = box(26, 0.4, 0.08, PAL.skirt, { cast: false });
    skirtBack.position.set(0, 0.2, -5.96);
    scene.add(skirtBack);
    const skirtLeft = box(0.08, 0.4, 26, PAL.skirt, { cast: false });
    skirtLeft.position.set(-8.96, 0.2, 0);
    scene.add(skirtLeft);

    // ---- Window on left wall (warm light source visual) ----
    const winGroup = new THREE.Group();
    const frame = box(0.18, 5.2, 4.4, PAL.frame, { cast: false });
    winGroup.add(frame);
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(3.9, 4.7),
      new THREE.MeshStandardMaterial({ color: PAL.window, emissive: 0xf3e3c4, emissiveIntensity: 0.85, roughness: 1 })
    );
    glass.rotation.y = Math.PI / 2;
    glass.position.set(0.1, 0, 0);
    glass.userData = { kind: 'window' };
    winGroup.add(glass);
    W.windowGlass = glass; W.windowGlassMat = glass.material;
    W.propHitMeshes.push(glass);
    // muntins
    const barV = box(0.06, 5.0, 0.08, 0xdccab0, { cast: false });
    barV.position.set(0.12, 0, 0);
    winGroup.add(barV);
    const barH = box(0.06, 0.08, 4.2, 0xdccab0, { cast: false });
    barH.position.set(0.12, 0, 0);
    winGroup.add(barH);
    winGroup.position.set(-8.9, 6.4, -1.5);
    scene.add(winGroup);

    // ---- Desk ----
    const desk = new THREE.Group();
    const top = box(6.4, 0.22, 2.6, PAL.desk);
    top.position.set(0, 2.4, -4.6);
    desk.add(top);
    const edge = box(6.4, 0.05, 2.6, PAL.deskEdge, { cast: false });
    edge.position.set(0, 2.27, -4.6);
    desk.add(edge);
    const legPos = [[-3.0, -3.45], [3.0, -3.45], [-3.0, -5.75], [3.0, -5.75]];
    legPos.forEach((p) => {
      const leg = box(0.22, 2.3, 0.22, PAL.deskLeg);
      leg.position.set(p[0], 1.15, p[1]);
      desk.add(leg);
    });
    scene.add(desk);
    W.deskTop = 2.51; // y of desk surface

    // ---- Laptop (interactive) ----
    const laptop = new THREE.Group();
    laptop.position.set(-0.55, W.deskTop, -4.15);
    const baseH = 0.12, baseW = 2.5, baseD = 1.7;
    const lbase = box(baseW, baseH, baseD, PAL.laptopBase, { flat: false });
    lbase.position.set(0, baseH / 2, 0);
    laptop.add(lbase);
    // keyboard deck inlay
    const deck = new THREE.Mesh(
      new THREE.PlaneGeometry(baseW * 0.86, baseD * 0.66),
      mat(0x2b2823, { matOpts: { roughness: 0.8 } })
    );
    deck.rotation.x = -Math.PI / 2;
    deck.position.set(0, baseH + 0.001, 0.12);
    deck.castShadow = false;
    laptop.add(deck);
    // trackpad
    const pad = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.5),
      mat(0x35312b, { matOpts: { roughness: 0.6 } })
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(0, baseH + 0.002, 0.55);
    pad.castShadow = false;
    laptop.add(pad);

    // Lid pivot at back edge of base
    const lid = new THREE.Group();
    lid.position.set(0, baseH, -baseD / 2 + 0.02);
    const lidLen = 1.62;
    const lidPanel = box(baseW, 0.07, lidLen, PAL.laptopLid, { flat: false });
    lidPanel.position.set(0, 0.035, lidLen / 2); // extends forward from hinge
    lid.add(lidPanel);
    // screen surface (faces +y local, becomes front when opened)
    const screenGeo = new THREE.PlaneGeometry(baseW * 0.9, lidLen * 0.86);
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 1280; screenCanvas.height = 800;
    const sctx = screenCanvas.getContext('2d');
    sctx.fillStyle = '#141210'; sctx.fillRect(0, 0, 1024, 640);
    const screenTex = new THREE.CanvasTexture(screenCanvas);
    const screenMat = new THREE.MeshStandardMaterial({
      map: screenTex, emissive: 0xffffff, emissiveMap: screenTex,
      emissiveIntensity: 0.0, roughness: 0.5, metalness: 0,
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.rotation.x = Math.PI / 2;
    screen.position.set(0, -0.006, lidLen / 2);
    lid.add(screen);
    lid.rotation.x = 0; // closed (flat)
    laptop.add(lid);
    laptop.userData = { kind: 'laptop' };
    lbase.userData = { kind: 'laptop' };
    lidPanel.userData = { kind: 'laptop' };
    scene.add(laptop);

    W.laptop = laptop;
    W.lid = lid;
    W.screen = screen;
    W.screenCanvas = screenCanvas;
    W.screenCtx = sctx;
    W.screenTex = screenTex;
    W.screenMat = screenMat;
    W.laptopHitMeshes = [lbase, lidPanel];

    // ---- Notebook (interactive) — hinged like the laptop, chat on inner page ----
    const notebook = new THREE.Group();
    notebook.position.set(2.25, W.deskTop, -4.15);
    notebook.rotation.y = 0.08;
    const nW = 2.05, nBaseH = 0.12, nBaseD = 1.5, nLidLen = 1.66;

    // lower half: cover + page block resting on the desk
    const nbase = box(nW, nBaseH, nBaseD, PAL.notebook, { flat: false });
    nbase.position.set(0, nBaseH / 2, 0);
    notebook.add(nbase);
    const nPageBlock = box(nW * 0.9, 0.05, nBaseD * 0.9, PAL.pages, { cast: false });
    nPageBlock.position.set(0, nBaseH + 0.02, 0.04);
    notebook.add(nPageBlock);
    // a few page-edge lines on the front for charm
    const nEdge = box(nW * 0.9, 0.04, 0.02, 0xe5dcc8, { cast: false });
    nEdge.position.set(0, nBaseH + 0.0, nBaseD / 2 * 0.9);
    notebook.add(nEdge);

    // upper half: lid hinged at the back edge (mirrors laptop)
    const nlid = new THREE.Group();
    nlid.position.set(0, nBaseH, -nBaseD / 2 + 0.02);
    // outer cover (terracotta) on top when closed
    const nLidCover = box(nW, 0.06, nLidLen, PAL.notebook, { flat: false });
    nLidCover.position.set(0, 0.05, nLidLen / 2);
    nlid.add(nLidCover);
    // a darker spine strip
    const nSpine = box(nW, 0.08, 0.12, PAL.notebookEdge, { cast: false });
    nSpine.position.set(0, 0.02, 0.04);
    nlid.add(nSpine);
    // inner page (cream) carrying the chat canvas — faces down when closed, viewer when open
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = 1000; pageCanvas.height = 1040;
    const pctx = pageCanvas.getContext('2d');
    pctx.fillStyle = '#efe7d6'; pctx.fillRect(0, 0, 1000, 1040);
    const pageTex = new THREE.CanvasTexture(pageCanvas);
    const pageMat = new THREE.MeshStandardMaterial({
      map: pageTex, emissive: 0xffffff, emissiveMap: pageTex,
      emissiveIntensity: 0.055, roughness: 1, metalness: 0,
    });
    const nPage = new THREE.Mesh(new THREE.PlaneGeometry(nW * 0.92, nLidLen * 0.9), pageMat);
    nPage.rotation.x = Math.PI / 2;
    nPage.position.set(0, 0.012, nLidLen / 2);
    nlid.add(nPage);
    nlid.rotation.x = 0; // closed
    notebook.add(nlid);

    notebook.userData = { kind: 'notebook' };
    nbase.userData = { kind: 'notebook' };
    nPageBlock.userData = { kind: 'notebook' };
    nLidCover.userData = { kind: 'notebook' };
    scene.add(notebook);

    W.notebook = notebook;
    W.notebookLid = nlid;
    W.notebookPage = nPage;
    W.pageCanvas = pageCanvas;
    W.pageCtx = pctx;
    W.pageTex = pageTex;
    W.pageMat = pageMat;
    W.notebookHitMeshes = [nbase, nPageBlock, nLidCover];

    // pen on notebook
    const pen = cyl(0.035, 0.035, 1.1, 0x2e2a26, 10);
    pen.rotation.z = Math.PI / 2;
    pen.rotation.y = 0.08;
    pen.position.set(3.0, W.deskTop + 0.02, -4.5);
    scene.add(pen);

    // ---- Mug ----
    const mugG = new THREE.Group();
    const mug = cyl(0.34, 0.3, 0.62, PAL.mug, 20);
    mug.position.y = 0.31;
    mugG.add(mug);
    const coffee = cyl(0.3, 0.3, 0.04, PAL.coffee, 20, { cast: false });
    coffee.position.y = 0.6;
    mugG.add(coffee);
    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.05, 10, 20),
      mat(PAL.mug)
    );
    handle.position.set(0.34, 0.32, 0);
    mugG.add(handle);
    mugG.position.set(-2.7, W.deskTop, -4.1);
    scene.add(mugG);
    mug.userData = { kind: 'mug' };
    handle.userData = { kind: 'mug' };
    W.mug = mugG; W.coffee = coffee;
    W.propHitMeshes.push(mug, handle);

    // ---- Plant ----
    const plantG = new THREE.Group();
    const pot = cyl(0.42, 0.32, 0.6, PAL.pot, 18);
    pot.position.y = 0.3;
    plantG.add(pot);
    const soil = cyl(0.36, 0.36, 0.06, 0x3a2c20, 18, { cast: false });
    soil.position.y = 0.58;
    plantG.add(soil);
    const leafColors = [0x6f8a5b, 0x7e9b6e, 0x648050];
    for (let i = 0; i < 9; i++) {
      const leaf = box(0.2, 1.0 + Math.random() * 0.6, 0.12, leafColors[i % 3], { flat: true, matOpts: { roughness: 1 } });
      const a = (i / 9) * Math.PI * 2;
      leaf.position.set(Math.cos(a) * 0.16, 1.0 + Math.random() * 0.25, Math.sin(a) * 0.16);
      leaf.rotation.z = Math.cos(a) * 0.55;
      leaf.rotation.x = Math.sin(a) * 0.55;
      leaf.userData = { kind: 'plant', baseRZ: leaf.rotation.z, baseRX: leaf.rotation.x, phase: Math.random() * 6.28 };
      W.plantLeaves.push(leaf);
      plantG.add(leaf);
    }
    plantG.position.set(-2.6, W.deskTop, -5.45);
    scene.add(plantG);
    pot.userData = { kind: 'plant' };
    W.plant = plantG;
    W.propHitMeshes.push(pot);

    // ---- Chair ----
    const chair = new THREE.Group();
    const seat = box(1.7, 0.2, 1.6, PAL.chair, { flat: false });
    seat.position.y = 1.35;
    chair.add(seat);
    const backrest = box(1.7, 1.7, 0.2, PAL.chair, { flat: false });
    backrest.position.set(0, 2.2, 0.7);
    chair.add(backrest);
    [[-0.7, 0.7], [0.7, 0.7], [-0.7, -0.7], [0.7, -0.7]].forEach((p) => {
      const leg = cyl(0.07, 0.07, 1.35, PAL.chairLeg, 10);
      leg.position.set(p[0], 0.67, p[1]);
      chair.add(leg);
    });
    chair.position.set(0, 0, -2.4);
    scene.add(chair);

    // ---- Floor lamp (corner warmth) ----
    const lamp = new THREE.Group();
    const stem = cyl(0.05, 0.06, 4.6, PAL.lampStem, 12);
    stem.position.y = 2.3;
    lamp.add(stem);
    const baseDisc = cyl(0.45, 0.5, 0.12, PAL.lampStem, 18);
    baseDisc.position.y = 0.06;
    lamp.add(baseDisc);
    const shade = cyl(0.55, 0.85, 0.95, PAL.lampShade, 22, { matOpts: { emissive: 0xf0d9a8, emissiveIntensity: 0.55 } });
    shade.position.y = 4.7;
    shade.userData = { kind: 'lamp' };
    lamp.add(shade);
    lamp.position.set(-6.6, 0, -4.4);
    scene.add(lamp);
    W.lampPos = new THREE.Vector3(-6.6, 4.7, -4.4);
    W.lampShade = shade; W.lampShadeMat = shade.material;
    W.propHitMeshes.push(shade);

    // ---- Wall shelf w/ books ----
    const shelf = box(4.2, 0.16, 1.0, PAL.desk, { });
    shelf.position.set(-4.4, 6.4, -5.5);
    scene.add(shelf);
    const bookColors = [PAL.book1, PAL.book2, PAL.book3, PAL.book1, PAL.book2];
    let bx = -5.9;
    for (let i = 0; i < 8; i++) {
      const h = 1.0 + Math.random() * 0.6;
      const bk = box(0.28, h, 0.7, bookColors[i % bookColors.length], { flat: false });
      bk.position.set(bx, 6.48 + h / 2, -5.5);
      bk.rotation.y = (Math.random() - 0.5) * 0.05;
      bk.userData = { kind: 'language' };
      scene.add(bk);
      W.languageBooks.push(bk);
      W.propHitMeshes.push(bk);
      bx += 0.33;
    }
    // a couple leaning
    const lean = box(0.28, 1.2, 0.7, PAL.book3, { flat: false });
    lean.position.set(bx + 0.2, 7.0, -5.5);
    lean.rotation.z = 0.22;
    lean.userData = { kind: 'language' };
    scene.add(lean);
    W.languageBooks.push(lean);
    W.propHitMeshes.push(lean);

    const languageHit = box(3.5, 2.0, 0.18, 0xffffff, {
      cast: false,
      receive: false,
      matOpts: { transparent: true, opacity: 0, depthWrite: false },
    });
    languageHit.position.set(-4.55, 7.25, -5.15);
    languageHit.userData = { kind: 'language' };
    scene.add(languageHit);
    W.propHitMeshes.push(languageHit);

    // ---- Framed art on back wall ----
    const artGroup = new THREE.Group();
    artGroup.position.set(3.25, 7.95, -5.56);
    const art = box(2.6, 3.2, 0.12, 0xe8dcc8);
    art.userData = { kind: 'fishmark' };
    artGroup.add(art);
    const fishmark = createFishmarkArt();
    const artInner = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.8), fishmark.mat);
    artInner.position.set(0, 0, 0.07);
    artInner.userData = { kind: 'fishmark' };
    artGroup.add(artInner);
    scene.add(artGroup);
    W.fishmarkFrame = artGroup;
    W.fishmarkArt = Object.assign(fishmark, { mesh: artInner, frameMesh: art });
    W.propHitMeshes.push(art, artInner);

    return W;
  }

  window.buildRoom = buildRoom;
})();
