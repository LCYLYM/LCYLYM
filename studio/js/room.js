/* room.js — a procedural dark-lacquer archive workshop with eight real project relics. */
(function () {
  const C = {
    black: 0x050504,
    lacquer: 0x100d0a,
    wood: 0x241810,
    woodEdge: 0x39271a,
    brass: 0x76572f,
    brassBright: 0xa17d48,
    brassDark: 0x312417,
    paper: 0xb9ac91,
    bone: 0xd8cfbb,
    red: 0x922d28,
    redBright: 0xc13d33,
  };

  function randomFactory(seed) {
    let value = seed >>> 0;
    return function () {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function canvasTexture(width, height, painter) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    painter(canvas.getContext('2d'), width, height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = 4;
    return texture;
  }

  function surfaceTexture(kind) {
    const random = randomFactory(kind === 'wood' ? 260823 : 823026);
    return canvasTexture(512, 512, (ctx, width, height) => {
      if (kind === 'wood') {
        ctx.fillStyle = '#21150e';
        ctx.fillRect(0, 0, width, height);
        for (let i = 0; i < 190; i++) {
          const y = random() * height;
          ctx.strokeStyle = `rgba(${44 + random() * 28},${26 + random() * 18},${15 + random() * 12},${.08 + random() * .14})`;
          ctx.lineWidth = .5 + random() * 2.4;
          ctx.beginPath();
          ctx.moveTo(-20, y);
          for (let x = 0; x <= width + 30; x += 24) ctx.lineTo(x, y + Math.sin(x * .025 + random() * 4) * (2 + random() * 5));
          ctx.stroke();
        }
        for (let i = 0; i < 12; i++) {
          const x = random() * width;
          const y = random() * height;
          ctx.strokeStyle = 'rgba(8,5,3,.18)';
          ctx.lineWidth = 3 + random() * 4;
          ctx.beginPath();
          ctx.ellipse(x, y, 12 + random() * 34, 3 + random() * 9, random() * .3, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = '#70542f';
        ctx.fillRect(0, 0, width, height);
        for (let i = 0; i < 6500; i++) {
          const pale = random() > .78;
          ctx.fillStyle = pale
            ? `rgba(176,142,78,${.025 + random() * .08})`
            : `rgba(37,27,17,${.025 + random() * .12})`;
          const size = .5 + random() * 2.4;
          ctx.fillRect(random() * width, random() * height, size, size);
        }
        for (let i = 0; i < 34; i++) {
          ctx.fillStyle = `rgba(41,74,61,${.025 + random() * .055})`;
          ctx.beginPath();
          ctx.ellipse(random() * width, random() * height, 8 + random() * 42, 4 + random() * 20, random() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
  }

  function createMaterials() {
    const woodMap = surfaceTexture('wood');
    woodMap.wrapS = woodMap.wrapT = THREE.RepeatWrapping;
    woodMap.repeat.set(2.5, 2.5);
    const metalMap = surfaceTexture('metal');
    metalMap.wrapS = metalMap.wrapT = THREE.RepeatWrapping;
    metalMap.repeat.set(1.4, 1.4);

    return {
      wood: new THREE.MeshStandardMaterial({ map: woodMap, color: 0x7b5b40, roughness: .72, metalness: .03, bumpMap: woodMap, bumpScale: .025 }),
      lacquer: new THREE.MeshPhysicalMaterial({ map: woodMap, color: 0x453329, roughness: .38, metalness: .09, clearcoat: .34, clearcoatRoughness: .54 }),
      brass: new THREE.MeshStandardMaterial({ map: metalMap, color: C.brassBright, roughness: .31, metalness: .92, bumpMap: metalMap, bumpScale: .012 }),
      brassDark: new THREE.MeshStandardMaterial({ map: metalMap, color: C.brassDark, roughness: .45, metalness: .86, bumpMap: metalMap, bumpScale: .016 }),
      iron: new THREE.MeshStandardMaterial({ color: 0x25221e, roughness: .4, metalness: .78 }),
      paper: new THREE.MeshStandardMaterial({ color: 0xc7b99c, roughness: .96, metalness: 0, side: THREE.DoubleSide }),
      red: new THREE.MeshPhysicalMaterial({ color: C.red, roughness: .46, metalness: .15, clearcoat: .28, clearcoatRoughness: .55, emissive: C.red, emissiveIntensity: .045 }),
      bone: new THREE.MeshStandardMaterial({ color: C.bone, roughness: .86, metalness: 0 }),
      shadow: new THREE.MeshStandardMaterial({ color: 0x0e0e0c, roughness: .9, metalness: .05 }),
      stone: new THREE.MeshStandardMaterial({ color: 0x121311, roughness: .96, metalness: .01 }),
    };
  }

  function box(width, height, depth, material, cast = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    return mesh;
  }

  function cylinder(radiusTop, radiusBottom, height, material, segments = 32) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  function torus(radius, tube, material, tubularSegments = 72) {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 12, tubularSegments), material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  function tube(points, radius, material) {
    const curve = new THREE.CatmullRomCurve3(points);
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, radius, 8, false), material);
    mesh.castShadow = true;
    return mesh;
  }

  function lathe(points, material, segments = 40) {
    const mesh = new THREE.Mesh(new THREE.LatheGeometry(points.map((item) => new THREE.Vector2(item[0], item[1])), segments), material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  function displayTexture(title, lines, accent = '#b13a31') {
    return canvasTexture(1024, 512, (ctx, width, height) => {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#090908');
      gradient.addColorStop(1, '#15120f');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(191,164,112,.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(24, 24, width - 48, height - 48);
      ctx.fillStyle = accent;
      ctx.fillRect(48, 54, 9, 54);
      ctx.fillStyle = '#d8cfbb';
      ctx.font = '600 44px monospace';
      ctx.fillText(title, 82, 98, width - 130);
      ctx.fillStyle = '#8f8878';
      ctx.font = '500 25px monospace';
      lines.forEach((line, index) => ctx.fillText(line, 52, 190 + index * 65, width - 104));
      ctx.fillStyle = accent;
      ctx.fillRect(52, height - 62, width * .34, 3);
    });
  }

  function displayMaterial(texture, intensity = .42) {
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      emissive: 0xffffff,
      emissiveMap: texture,
      emissiveIntensity: intensity,
      roughness: .54,
      metalness: .04,
    });
    material.userData.baseIntensity = intensity;
    return material;
  }

  function plaque(project, index, mats) {
    const group = new THREE.Group();
    const backing = box(1.92, .46, .09, mats.lacquer);
    group.add(backing);
    const texture = canvasTexture(900, 210, (ctx, width, height) => {
      ctx.fillStyle = '#0b0907';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(160,125,71,.55)';
      ctx.lineWidth = 3;
      ctx.strokeRect(12, 12, width - 24, height - 24);
      ctx.fillStyle = '#a8342d';
      ctx.font = '700 28px monospace';
      ctx.fillText(String(index + 1).padStart(2, '0'), 38, 57);
      ctx.fillStyle = '#d8cfbb';
      ctx.font = project.id.length > 20 ? '600 33px monospace' : '600 39px monospace';
      ctx.fillText(project.id, 38, 126, width - 78);
      ctx.fillStyle = '#806f58';
      ctx.font = '500 18px monospace';
      ctx.fillText(project.stack.split(' · ').slice(0, 3).join(' / '), 38, 171, width - 76);
    });
    const frontMaterial = displayMaterial(texture, .15);
    const front = new THREE.Mesh(new THREE.PlaneGeometry(1.82, .36), frontMaterial);
    front.position.z = .051;
    group.add(front);
    return { group, glow: [frontMaterial] };
  }

  function createEnvironmentTexture() {
    const images = [];
    for (let side = 0; side < 6; side++) {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 96;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, side % 2 ? 96 : 0, 96);
      gradient.addColorStop(0, side === 2 ? '#5a4023' : '#090807');
      gradient.addColorStop(.45, side === 4 ? '#78532b' : '#20170f');
      gradient.addColorStop(1, '#030302');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 96, 96);
      images.push(canvas);
    }
    const texture = new THREE.CubeTexture(images);
    texture.encoding = THREE.sRGBEncoding;
    texture.needsUpdate = true;
    return texture;
  }

  function createInkLandscapeTexture() {
    const random = randomFactory(822260);
    return canvasTexture(2048, 1024, (ctx, width, height) => {
      const wash = ctx.createLinearGradient(0, 0, 0, height);
      wash.addColorStop(0, '#070807');
      wash.addColorStop(.45, '#111411');
      wash.addColorStop(1, '#080807');
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, width, height);

      const ridges = [
        { base: 750, color: '#252923', alpha: .68, peaks: 14, height: 420 },
        { base: 820, color: '#181b18', alpha: .9, peaks: 17, height: 320 },
        { base: 910, color: '#101210', alpha: 1, peaks: 19, height: 230 },
      ];
      ridges.forEach((ridge, ridgeIndex) => {
        const points = [];
        for (let i = 0; i <= ridge.peaks; i++) {
          const x = i / ridge.peaks * width;
          const wave = Math.sin(i * 1.31 + ridgeIndex) * ridge.height * .16;
          const spike = Math.pow(random(), 2.2) * ridge.height;
          points.push([x, ridge.base - wave - spike]);
        }
        ctx.save();
        ctx.globalAlpha = ridge.alpha;
        ctx.fillStyle = ridge.color;
        ctx.beginPath();
        ctx.moveTo(0, height);
        points.forEach((point, pointIndex) => {
          if (!pointIndex) ctx.lineTo(point[0], point[1]);
          else {
            const previous = points[pointIndex - 1];
            ctx.quadraticCurveTo((previous[0] + point[0]) / 2, Math.min(previous[1], point[1]) - 28, point[0], point[1]);
          }
        });
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      for (let i = 0; i < 11; i++) {
        const y = 490 + i * 34 + random() * 30;
        const mist = ctx.createLinearGradient(0, y, width, y);
        mist.addColorStop(0, 'rgba(176,173,155,0)');
        mist.addColorStop(.18, `rgba(176,173,155,${.015 + random() * .035})`);
        mist.addColorStop(.56, `rgba(196,190,167,${.02 + random() * .045})`);
        mist.addColorStop(1, 'rgba(176,173,155,0)');
        ctx.fillStyle = mist;
        ctx.fillRect(0, y, width, 10 + random() * 24);
      }

      ctx.strokeStyle = 'rgba(216,207,187,.026)';
      for (let i = 0; i < 240; i++) {
        const x = random() * width;
        const y = random() * height;
        ctx.lineWidth = .4 + random();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 7 - random() * 20, y + 30 + random() * 70);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(161,54,47,.48)';
      ctx.fillRect(width - 168, 154, 72, 72);
      ctx.strokeStyle = 'rgba(216,207,187,.34)';
      ctx.lineWidth = 3;
      ctx.strokeRect(width - 158, 164, 52, 52);
      ctx.font = '700 30px "Songti SC", serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(216,207,187,.62)';
      ctx.fillText('造', width - 132, 202);
    });
  }

  function ornateColumn(height, mats) {
    const group = new THREE.Group();
    const profile = [[.42, 0], [.54, .12], [.48, .28], [.38, .38], [.34, height - .38], [.48, height - .28], [.54, height - .12], [.42, height]];
    group.add(lathe(profile, mats.wood, 28));
    [.29, height - .29].forEach((y) => {
      const collar = torus(.46, .045, mats.brass, 40);
      collar.rotation.x = -Math.PI / 2;
      collar.position.y = y;
      group.add(collar);
    });
    return group;
  }

  function createFishSeal(mats) {
    const shape = new THREE.Shape();
    shape.moveTo(-1.55, .58);
    shape.lineTo(-1.18, 0);
    shape.lineTo(-1.55, -.58);
    shape.lineTo(-.82, -.3);
    shape.bezierCurveTo(-.25, -.78, .6, -.6, 1.02, 0);
    shape.bezierCurveTo(.6, .6, -.25, .78, -.82, .3);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: .18, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .055, bevelThickness: .04 });
    geometry.center();
    const mesh = new THREE.Mesh(geometry, mats.red);
    mesh.scale.setScalar(.72);
    mesh.castShadow = true;
    const eye = cylinder(.065, .065, .08, mats.bone, 18);
    eye.rotation.x = Math.PI / 2;
    eye.position.set(.42, .16, .12);
    mesh.add(eye);
    return mesh;
  }

  function createArchiveEngine(mats) {
    const root = new THREE.Group();
    const backing = box(6.15, 6.45, .32, mats.shadow, false);
    backing.position.z = -.28;
    root.add(backing);

    [-3.14, 3.14].forEach((x) => {
      const post = ornateColumn(6.62, mats);
      post.scale.x = .88;
      post.position.set(x, -3.31, -.06);
      root.add(post);
      const innerRail = box(.07, 5.9, .3, mats.brassDark, false);
      innerRail.position.set(x * .86, 0, .03);
      root.add(innerRail);
    });
    [-3.27, 3.27].forEach((y) => {
      const beam = box(6.95, .4, .5, mats.wood);
      beam.position.set(0, y, -.05);
      root.add(beam);
      const trim = box(6.35, .055, .56, mats.brass, false);
      trim.position.set(0, y + (y > 0 ? -.25 : .25), .01);
      root.add(trim);
    });

    const cornerOffsets = [[-2.72, 2.78], [2.72, 2.78], [-2.72, -2.78], [2.72, -2.78]];
    cornerOffsets.forEach(([x, y]) => {
      for (let step = 0; step < 3; step++) {
        const horizontal = box(.78 - step * .16, .09, .25, step === 2 ? mats.red : mats.brassDark, false);
        horizontal.position.set(x + Math.sign(x) * step * .08, y - Math.sign(y) * step * .14, .14);
        root.add(horizontal);
        const vertical = box(.09, .78 - step * .16, .25, mats.brassDark, false);
        vertical.position.set(x - Math.sign(x) * step * .14, y + Math.sign(y) * step * .08, .14);
        root.add(vertical);
      }
    });

    const drawerCodes = ['SSH · MCP', 'TOUCH · QUOTA', 'CONTEXT · SYNC', 'SONG · STATE', 'MARKDOWN · NATIVE', 'VIDEO · READER', 'BROWSER · AI', 'RELEASE · GUARD'];
    const drawerGlow = [];
    drawerCodes.forEach((code, index) => {
      const side = index % 2 ? 1 : -1;
      const row = Math.floor(index / 2);
      const y = 2.18 - row * 1.28;
      const drawer = box(2.45, .82, .46, mats.lacquer);
      drawer.position.set(side * 1.72, y, .03);
      root.add(drawer);
      const faceTexture = canvasTexture(760, 230, (ctx, width, height) => {
        ctx.fillStyle = '#100d0a';
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = 'rgba(164,134,84,.48)';
        ctx.lineWidth = 3;
        ctx.strokeRect(10, 10, width - 20, height - 20);
        ctx.fillStyle = index === 0 || index === 7 ? '#a83931' : '#b8aa8d';
        ctx.font = '600 33px monospace';
        ctx.fillText(String(index + 1).padStart(2, '0'), 34, 59);
        ctx.fillStyle = '#d4c8ad';
        ctx.font = '600 31px monospace';
        ctx.fillText(code, 34, 135, width - 72);
        ctx.fillStyle = '#6f6554';
        ctx.font = '500 18px monospace';
        ctx.fillText('MADE REAL / VERIFIED', 34, 182);
      });
      const faceMaterial = displayMaterial(faceTexture, .12);
      const face = new THREE.Mesh(new THREE.PlaneGeometry(2.3, .67), faceMaterial);
      face.position.set(side * 1.72, y, .27);
      root.add(face);
      drawerGlow.push(faceMaterial);
      const pull = box(.38, .08, .12, index === 0 || index === 7 ? mats.red : mats.brass, false);
      pull.position.set(side * 1.72, y - .3, .42);
      root.add(pull);
    });

    const centerSpine = box(.42, 5.42, .54, mats.wood);
    centerSpine.position.z = .12;
    root.add(centerSpine);
    const centerRail = box(.085, 5.1, .62, mats.brass, false);
    centerRail.position.z = .18;
    root.add(centerRail);

    const moving = new THREE.Group();
    const carriage = box(2.34, 1.76, .42, mats.lacquer);
    moving.add(carriage);
    const carriageTrim = box(2.03, 1.48, .48, mats.brassDark, false);
    carriageTrim.position.z = .08;
    moving.add(carriageTrim);
    const sealBed = box(1.78, 1.2, .5, mats.shadow, false);
    sealBed.position.z = .17;
    moving.add(sealBed);
    const fish = createFishSeal(mats);
    fish.scale.multiplyScalar(.68);
    fish.position.z = .52;
    moving.add(fish);
    const pin = cylinder(.11, .11, .42, mats.brass, 20);
    pin.rotation.x = Math.PI / 2;
    pin.position.set(0, -.73, .34);
    moving.add(pin);
    moving.position.set(0, .13, .56);
    root.add(moving);

    const wheels = [];
    [-2.73, 2.73].forEach((x, wheelIndex) => {
      const wheel = new THREE.Group();
      wheel.add(torus(.44, .055, mats.brass, 48));
      for (let spokeIndex = 0; spokeIndex < 6; spokeIndex++) {
        const spoke = box(.37, .035, .035, mats.brassDark, false);
        spoke.position.x = .185;
        spoke.rotation.z = spokeIndex / 6 * Math.PI * 2;
        wheel.add(spoke);
      }
      const hub = cylinder(.1, .1, .16, wheelIndex ? mats.red : mats.brass, 20);
      hub.rotation.x = Math.PI / 2;
      hub.position.z = .08;
      wheel.add(hub);
      wheel.position.set(x, 2.82, .38);
      root.add(wheel);
      wheels.push(wheel);
    });

    const header = box(3.8, .68, .22, mats.lacquer);
    header.position.set(0, 3.68, .08);
    root.add(header);
    const titleTexture = canvasTexture(1200, 200, (ctx, width, height) => {
      ctx.fillStyle = '#0a0807';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(151,116,65,.52)';
      ctx.lineWidth = 3;
      ctx.strokeRect(14, 14, width - 28, height - 28);
      ctx.fillStyle = '#c4b89e';
      ctx.font = '500 60px "Songti SC", serif';
      ctx.textAlign = 'center';
      ctx.fillText('开 源 器 物 志', width / 2, 105);
      ctx.fillStyle = '#8b2e29';
      ctx.font = '600 24px monospace';
      ctx.fillText('LCYLYM · THINGS MADE REAL', width / 2, 157);
    });
    const titleMaterial = displayMaterial(titleTexture, .13);
    const titleFace = new THREE.Mesh(new THREE.PlaneGeometry(3.62, .5), titleMaterial);
    titleFace.position.set(0, 3.68, .2);
    root.add(titleFace);
    return { root, moving, wheels, glow: [titleMaterial].concat(drawerGlow) };
  }

  function createSSHConsole(project, index, mats) {
    const root = new THREE.Group();
    const base = box(2.5, .2, 1.45, mats.lacquer);
    base.position.y = .1;
    root.add(base);
    const deck = box(2.24, .055, 1.12, mats.iron);
    deck.position.set(0, .23, .08);
    root.add(deck);
    for (let row = 0; row < 4; row++) {
      for (let key = 0; key < 10; key++) {
        const keyMaterial = row === 3 && key === 9 ? mats.red : mats.brassDark;
        const cap = box(.16, .035, .12, keyMaterial, false);
        cap.position.set(-.84 + key * .19, .276, -.24 + row * .17);
        root.add(cap);
      }
    }
    const screenHousing = box(2.5, 1.35, .16, mats.lacquer);
    screenHousing.position.set(0, 1.03, -.63);
    root.add(screenHousing);
    const screenTexture = displayTexture('SSH / MCP', ['credential  ·  local vault', 'PTY         ·  attached', 'SFTP        ·  verified', 'AUDIT       ·  evidence saved']);
    const screenMaterial = displayMaterial(screenTexture, .62);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.28, 1.13), screenMaterial);
    screen.position.set(0, 1.03, -.54);
    root.add(screen);
    [-1.05, 1.05].forEach((x) => {
      const hinge = cylinder(.07, .07, .28, mats.brass, 18);
      hinge.rotation.z = Math.PI / 2;
      hinge.position.set(x, .35, -.61);
      root.add(hinge);
    });
    root.add(tube([new THREE.Vector3(-1.14, .12, -.55), new THREE.Vector3(-1.5, .3, -.9), new THREE.Vector3(-1.72, .06, -.3)], .035, mats.brassDark));
    const tag = plaque(project, index, mats);
    tag.group.scale.setScalar(.74);
    tag.group.position.set(0, -.24, .78);
    root.add(tag.group);
    return { root, glow: [screenMaterial].concat(tag.glow), update: (t) => { screenMaterial.emissiveIntensity = screenMaterial.userData.baseIntensity + Math.sin(t * 2.2) * .035; } };
  }

  function createQuotaConsole(project, index, mats) {
    const root = new THREE.Group();
    const base = box(2.65, .34, 1.28, mats.lacquer);
    base.position.y = .17;
    root.add(base);
    const displayHousing = box(2.66, 1.02, .17, mats.lacquer);
    displayHousing.position.set(0, .88, -.53);
    root.add(displayHousing);
    const displayTrim = box(2.43, .79, .2, mats.brassDark, false);
    displayTrim.position.set(0, .88, -.435);
    root.add(displayTrim);
    const touchTexture = canvasTexture(1200, 220, (ctx, width, height) => {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);
      const items = [['CODEX', .72, '#a9342d'], ['CLAUDE', .46, '#967645'], ['GEMINI', .84, '#7c8868']];
      items.forEach((item, itemIndex) => {
        const x = 42 + itemIndex * 382;
        ctx.fillStyle = '#7f786b';
        ctx.font = '600 25px monospace';
        ctx.fillText(item[0], x, 56);
        ctx.fillStyle = '#1f1d1a';
        ctx.fillRect(x, 86, 318, 29);
        ctx.fillStyle = item[2];
        ctx.fillRect(x, 86, 318 * item[1], 29);
        ctx.fillStyle = '#d8cfbb';
        ctx.font = '500 22px monospace';
        ctx.fillText(`${Math.round(item[1] * 100)}%`, x, 164);
      });
    });
    const touchMaterial = displayMaterial(touchTexture, .72);
    const touch = new THREE.Mesh(new THREE.PlaneGeometry(2.29, .64), touchMaterial);
    touch.position.set(0, .88, -.326);
    root.add(touch);
    [-.78, 0, .78].forEach((x, dialIndex) => {
      const dial = cylinder(.12, .12, .08, dialIndex === 1 ? mats.red : mats.brass, 24);
      dial.position.set(x, .39, .42);
      root.add(dial);
      const tick = box(.025, .055, .13, mats.bone, false);
      tick.position.set(x, .445, .42);
      tick.rotation.y = dialIndex * .62 - .6;
      root.add(tick);
    });
    [-1.02, 1.02].forEach((x) => {
      const hinge = cylinder(.065, .065, .26, mats.brass, 18);
      hinge.rotation.z = Math.PI / 2;
      hinge.position.set(x, .39, -.48);
      root.add(hinge);
    });
    const tag = plaque(project, index, mats);
    tag.group.scale.setScalar(.74);
    tag.group.position.set(0, -.22, .76);
    root.add(tag.group);
    return { root, glow: [touchMaterial].concat(tag.glow), update: (t) => { touchMaterial.emissiveIntensity = touchMaterial.userData.baseIntensity + Math.sin(t * 1.45) * .05; } };
  }

  function createRecordDrum(project, index, mats) {
    const root = new THREE.Group();
    const backing = box(3.0, 2.25, .22, mats.lacquer);
    root.add(backing);
    const reelGroups = [];
    [-.77, .77].forEach((x, reelIndex) => {
      const reel = new THREE.Group();
      const outer = torus(.58, .065, mats.brass, 56);
      reel.add(outer);
      const hub = cylinder(.13, .13, .14, mats.red, 20);
      hub.rotation.x = Math.PI / 2;
      hub.position.z = .08;
      reel.add(hub);
      for (let spokeIndex = 0; spokeIndex < 6; spokeIndex++) {
        const spoke = box(.48, .035, .035, mats.brassDark, false);
        spoke.position.x = .24;
        spoke.position.z = .06;
        spoke.rotation.z = spokeIndex / 6 * Math.PI * 2;
        reel.add(spoke);
      }
      reel.position.set(x, .22, .17);
      root.add(reel);
      reelGroups.push(reel);
    });
    const paperTexture = displayTexture('CODEX RECORD', ['main thread', 'subagents', 'privacy view'], '#9d302b');
    const paperMaterial = displayMaterial(paperTexture, .26);
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(1.22, .58), paperMaterial);
    paper.position.set(0, -.66, .18);
    root.add(paper);
    const tag = plaque(project, index, mats);
    tag.group.scale.setScalar(.7);
    tag.group.position.set(0, -1.4, .12);
    root.add(tag.group);
    return { root, glow: [paperMaterial].concat(tag.glow), update: (t) => { reelGroups[0].rotation.z = t * .18; reelGroups[1].rotation.z = -t * .12; } };
  }

  function createGramophone(project, index, mats) {
    const root = new THREE.Group();
    const shelf = box(2.8, .22, 1.35, mats.lacquer);
    shelf.position.y = -.74;
    root.add(shelf);
    const platter = cylinder(.65, .65, .12, mats.iron, 48);
    platter.position.set(-.55, -.55, .05);
    root.add(platter);
    const record = cylinder(.54, .54, .035, mats.red, 48);
    record.position.set(-.55, -.46, .05);
    root.add(record);
    const stem = tube([new THREE.Vector3(.35, -.62, 0), new THREE.Vector3(.42, .15, -.05), new THREE.Vector3(.7, .5, .05)], .06, mats.brassDark);
    root.add(stem);
    const hornProfile = [[.08, -.62], [.1, -.25], [.16, .1], [.34, .46], [.72, .78]];
    const horn = lathe(hornProfile, mats.brass, 48);
    horn.rotation.x = Math.PI / 2;
    horn.position.set(.72, .46, .04);
    root.add(horn);
    const tag = plaque(project, index, mats);
    tag.group.scale.setScalar(.7);
    tag.group.position.set(0, -1.18, .2);
    root.add(tag.group);
    return { root, glow: tag.glow, update: (t) => { record.rotation.y = t * .72; } };
  }

  function createOpenBook(project, index, mats) {
    const root = new THREE.Group();
    const stand = box(2.85, .16, .72, mats.lacquer);
    stand.position.y = -1.0;
    root.add(stand);
    const pageTexture = canvasTexture(900, 700, (ctx, width, height) => {
      ctx.fillStyle = '#bbae92';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(84,57,34,.22)';
      for (let y = 76; y < height - 38; y += 47) {
        ctx.beginPath(); ctx.moveTo(42, y); ctx.lineTo(width - 42, y); ctx.stroke();
      }
      ctx.fillStyle = '#8d2f2a';
      ctx.font = '700 42px serif';
      ctx.fillText('# Markdown', 48, 66);
      ctx.fillStyle = '#352c23';
      ctx.font = '500 28px monospace';
      ['source-aware', 'scroll sync', 'native macOS', 'writer first'].forEach((line, lineIndex) => ctx.fillText(line, 55, 150 + lineIndex * 92));
    });
    const pageMaterial = new THREE.MeshStandardMaterial({ map: pageTexture, emissive: 0xffffff, emissiveMap: pageTexture, emissiveIntensity: .09, roughness: .96, side: THREE.DoubleSide });
    pageMaterial.userData.baseIntensity = .09;
    [-1, 1].forEach((side) => {
      const cover = box(1.34, 1.7, .07, mats.red);
      cover.position.set(side * .69, 0, -.06);
      cover.rotation.y = side * -.16;
      root.add(cover);
      const page = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.6), pageMaterial);
      page.position.set(side * .68, 0, .015);
      page.rotation.y = side * -.16;
      root.add(page);
    });
    const spine = cylinder(.08, .08, 1.78, mats.brassDark, 18);
    root.add(spine);
    const tag = plaque(project, index, mats);
    tag.group.scale.setScalar(.67);
    tag.group.position.set(0, -1.35, .08);
    root.add(tag.group);
    return { root, glow: [pageMaterial].concat(tag.glow), update: () => {} };
  }

  function createVideoReels(project, index, mats) {
    const root = new THREE.Group();
    const backing = box(3.15, 2.3, .2, mats.lacquer);
    root.add(backing);
    const reels = [];
    [-.82, .82].forEach((x) => {
      const reel = new THREE.Group();
      reel.add(torus(.61, .07, mats.brass, 64));
      const hub = cylinder(.13, .13, .12, mats.red, 18);
      hub.rotation.x = Math.PI / 2;
      hub.position.z = .08;
      reel.add(hub);
      for (let i = 0; i < 5; i++) {
        const spoke = box(.5, .035, .03, mats.brassDark, false);
        spoke.position.set(.25, 0, .06);
        spoke.rotation.z = i / 5 * Math.PI * 2;
        reel.add(spoke);
      }
      reel.position.set(x, .22, .16);
      root.add(reel);
      reels.push(reel);
    });
    const beltMaterial = new THREE.LineBasicMaterial({ color: C.red, transparent: true, opacity: .62 });
    const beltGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-.82, .82, .2), new THREE.Vector3(.82, .82, .2),
      new THREE.Vector3(.82, -.38, .2), new THREE.Vector3(-.82, -.38, .2), new THREE.Vector3(-.82, .82, .2),
    ]);
    root.add(new THREE.Line(beltGeometry, beltMaterial));
    const timecodeTexture = displayTexture('VIDEO SYNC', ['episode 08', '00:24:19 / 00:47:06', 'reader state · saved']);
    const timecodeMaterial = displayMaterial(timecodeTexture, .28);
    const timecode = new THREE.Mesh(new THREE.PlaneGeometry(1.68, .47), timecodeMaterial);
    timecode.position.set(0, -.7, .18);
    root.add(timecode);
    const tag = plaque(project, index, mats);
    tag.group.scale.setScalar(.66);
    tag.group.position.set(0, -1.38, .1);
    root.add(tag.group);
    return { root, glow: [timecodeMaterial].concat(tag.glow), update: (t) => { reels[0].rotation.z = t * .36; reels[1].rotation.z = -t * .36; } };
  }

  function createTabStack(project, index, mats) {
    const root = new THREE.Group();
    const glow = [];
    const spine = box(.16, 2.52, .2, mats.brassDark);
    spine.position.set(-1.44, -.05, -.18);
    root.add(spine);
    [-.7, .62].forEach((y) => {
      const arm = box(.82, .085, .18, y > 0 ? mats.red : mats.brass, false);
      arm.position.set(-1.02, y, -.1);
      root.add(arm);
    });
    for (let paneIndex = 0; paneIndex < 3; paneIndex++) {
      const pane = new THREE.Group();
      const frame = box(2.12, 1.28, .09, paneIndex === 1 ? mats.brassDark : mats.lacquer);
      pane.add(frame);
      const texture = displayTexture(`TAB ${paneIndex + 1}`, paneIndex === 1 ? ['ON-DEVICE MODEL', 'PROMPT API', 'GROUPED · 14'] : ['research', 'docs', 'reading queue']);
      const screenMaterial = displayMaterial(texture, paneIndex === 1 ? .36 : .18);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.94, 1.1), screenMaterial);
      screen.position.z = .051;
      pane.add(screen);
      pane.position.set((paneIndex - 1) * .34, (paneIndex - 1) * .2, paneIndex * .18);
      root.add(pane);
      glow.push(screenMaterial);
    }
    const tag = plaque(project, index, mats);
    tag.group.scale.setScalar(.65);
    tag.group.position.set(0, -1.28, .15);
    root.add(tag.group);
    return { root, glow: glow.concat(tag.glow), update: (t) => { root.children.slice(3, 6).forEach((pane, paneIndex) => { pane.position.x = (paneIndex - 1) * (.34 + Math.sin(t * .42) * .025); }); } };
  }

  function createGuardianPress(project, index, mats) {
    const root = new THREE.Group();
    const base = box(2.75, .28, 1.35, mats.lacquer);
    base.position.y = -1.02;
    root.add(base);
    const paper = box(1.75, .045, .94, mats.paper, false);
    paper.position.set(0, -.84, .04);
    root.add(paper);
    [-.92, .92].forEach((x) => {
      const column = ornateColumn(2.75, mats);
      column.scale.setScalar(.36);
      column.position.set(x, -1.0, -.16);
      root.add(column);
    });
    const crossbar = box(2.35, .2, .28, mats.brassDark);
    crossbar.position.set(0, .34, -.16);
    root.add(crossbar);
    const stem = cylinder(.09, .09, 1.25, mats.brass, 20);
    stem.position.set(0, -.31, -.1);
    root.add(stem);
    const stamp = box(.72, .28, .72, mats.red);
    stamp.position.set(0, -.88, -.02);
    root.add(stamp);
    const policyTexture = displayTexture('RELEASE GUARD', ['secret scan      PASS', 'private path     PASS', 'artifact policy PASS']);
    const policyMaterial = displayMaterial(policyTexture, .34);
    const policy = new THREE.Mesh(new THREE.PlaneGeometry(1.72, .86), policyMaterial);
    policy.position.set(0, 1.05, -.02);
    root.add(policy);
    const tag = plaque(project, index, mats);
    tag.group.scale.setScalar(.64);
    tag.group.position.set(0, -1.48, .1);
    root.add(tag.group);
    return { root, glow: [policyMaterial].concat(tag.glow), update: (t) => { stamp.position.y = -.78 + Math.sin(t * .7) * .1; } };
  }

  function addProject(world, scene, project, index, built, placement) {
    built.root.scale.setScalar(placement.scale);
    built.root.rotation.y = placement.rotationY || 0;
    built.root.position.set(placement.x, 0, placement.z);
    built.root.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(built.root);
    built.root.position.y += placement.topY - bounds.min.y + .018;
    built.root.updateMatrixWorld(true);
    const settledBounds = new THREE.Box3().setFromObject(built.root);
    built.root.userData.clearance = settledBounds.min.y - placement.topY;
    built.root.userData.bounds = settledBounds.getSize(new THREE.Vector3());
    const scale = placement.scale;
    built.root.userData.baseScale = scale;
    built.root.userData.targetScale = scale;
    built.root.userData.projectId = project.id;
    built.root.traverse((child) => {
      if (!child.isMesh) return;
      child.userData.projectId = project.id;
      world.projectHitMeshes.push(child);
    });
    scene.add(built.root);
    world.projectObjects[project.id] = {
      root: built.root,
      glow: built.glow || [],
      update: built.update || (() => {}),
      baseScale: scale,
      category: project.category,
      index,
    };
  }

  function addHall(scene, world, mats) {
    const floorMaterial = mats.stone.clone();
    floorMaterial.transparent = true;
    floorMaterial.opacity = .2;
    floorMaterial.depthWrite = false;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 36), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = -3.5;
    floor.receiveShadow = true;
    floor.visible = false;
    scene.add(floor);

    const walkMaterial = mats.lacquer.clone();
    walkMaterial.transparent = true;
    walkMaterial.opacity = .28;
    walkMaterial.depthWrite = false;
    const centralWalk = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 32), walkMaterial);
    centralWalk.rotation.x = -Math.PI / 2;
    centralWalk.position.set(0, .013, -3.25);
    centralWalk.receiveShadow = true;
    centralWalk.visible = false;
    scene.add(centralWalk);
    [-2.46, 2.46].forEach((x) => {
      const rail = box(.035, .018, 31.5, mats.brassDark, false);
      rail.position.set(x, .025, -3.25);
      rail.visible = false;
      scene.add(rail);
    });
    for (let x = -10.8; x <= 10.8; x += 2.15) {
      const seam = box(.018, .012, 34, mats.brassDark, false);
      seam.position.set(x, .012, -3.5);
      seam.visible = false;
      scene.add(seam);
    }
    for (let z = 10; z >= -16; z -= 2.25) {
      const seam = box(25, .012, .018, mats.brassDark, false);
      seam.position.set(0, .013, z);
      seam.visible = false;
      scene.add(seam);
    }

    const backWall = box(18.2, 10.7, .52, mats.shadow, false);
    backWall.position.set(0, 5.15, -13.15);
    backWall.visible = false;
    scene.add(backWall);

    const inkTexture = createInkLandscapeTexture();
    const inkMaterial = new THREE.MeshStandardMaterial({ map: inkTexture, emissive: 0x4f5148, emissiveMap: inkTexture, emissiveIntensity: .075, roughness: 1, metalness: 0 });
    const inkWall = new THREE.Mesh(new THREE.PlaneGeometry(17.35, 9.55), inkMaterial);
    inkWall.position.set(0, 5.08, -12.87);
    inkWall.visible = false;
    scene.add(inkWall);

    [-8.45, 8.45].forEach((x) => {
      const side = box(.38, 10.5, 30.5, mats.shadow, false);
      side.position.set(x, 5.2, -3.1);
      side.visible = false;
      scene.add(side);
    });

    [7.3, 1.2, -4.9, -10.9].forEach((z, frameIndex) => {
      if (frameIndex > 1) return;
      [-7.72, 7.72].forEach((x) => {
        const column = ornateColumn(frameIndex === 0 ? 9.05 : 8.72, mats);
        column.position.set(x, 0, z);
        scene.add(column);
      });
      const beam = box(16.05, .48, .58, mats.wood);
      beam.position.set(0, frameIndex === 0 ? 8.98 : 8.66, z);
      scene.add(beam);
      const line = box(15.55, .055, .63, frameIndex === 0 ? mats.red : mats.brassDark, false);
      line.position.set(0, frameIndex === 0 ? 8.69 : 8.37, z);
      scene.add(line);
    });

    [-1, 1].forEach((side) => {
      if (side) return;
      const sideX = side * 8.04;
      [-1.8, -7.6].forEach((z, screenIndex) => {
        const screenBack = box(.12, 6.0, 4.35, mats.lacquer, false);
        screenBack.position.set(sideX, 4.2, z);
        scene.add(screenBack);
        for (let bar = -2; bar <= 2; bar++) {
          const vertical = box(.18, 5.65, .1, bar === 0 && screenIndex === 1 ? mats.red : mats.wood, false);
          vertical.position.set(side * 7.91, 4.2, z + bar * .86);
          scene.add(vertical);
        }
        for (let row = -2; row <= 2; row++) {
          const horizontal = box(.16, .12, 4.05, mats.brassDark, false);
          horizontal.position.set(side * 7.83, 4.2 + row * 1.1, z);
          scene.add(horizontal);
        }
      });
    });

    [-3.15, 3.15].forEach((x, benchIndex) => {
      const plinth = box(3.0, .34, 1.28, mats.shadow);
      plinth.position.set(x, .17, -2.0 + benchIndex * .06);
      scene.add(plinth);
      const bench = box(3.28, .14, 1.58, mats.lacquer);
      bench.position.set(x, .42, -2.0 + benchIndex * .06);
      scene.add(bench);
      const trim = box(3.08, .04, 1.62, benchIndex ? mats.red : mats.brassDark, false);
      trim.position.set(x, .33, -2.0 + benchIndex * .06);
      scene.add(trim);
    });

    const shelfSpecs = [
      [-5.72, 2.58, -5.2, 3.45, 1.15], [5.72, 2.58, -5.2, 3.45, 1.15],
      [-5.15, 4.38, -8.55, 3.45, .9], [5.15, 4.38, -8.55, 3.45, .9],
      [-3.62, 5.36, -10.75, 3.15, .82], [3.62, 5.36, -10.75, 3.15, .82],
    ];
    shelfSpecs.forEach(([x, topY, z, width, depth], shelfIndex) => {
      const shelf = box(width, .2, depth, shelfIndex === 4 || shelfIndex === 5 ? mats.brassDark : mats.lacquer);
      shelf.position.set(x, topY - .1, z);
      shelf.visible = false;
      scene.add(shelf);
      const bracket = box(.16, .8, .55, mats.wood);
      bracket.position.set(x, topY - .5, z - depth * .28);
      bracket.visible = false;
      scene.add(bracket);
      const shelfLine = box(width - .18, .035, depth + .04, shelfIndex === 1 || shelfIndex === 4 ? mats.red : mats.brass, false);
      shelfLine.position.set(x, topY + .018, z);
      shelfLine.visible = false;
      scene.add(shelfLine);
    });

    const engine = createArchiveEngine(mats);
    engine.root.position.set(0, 4.55, -12.55);
    engine.root.scale.setScalar(.93);
    engine.root.visible = false;
    scene.add(engine.root);
    world.engine = engine;

    const redThreadMaterial = mats.red.clone();
    redThreadMaterial.emissiveIntensity = .12;
    [-6.75, -2.58, 2.58, 6.75].forEach((x, index) => {
      const thread = box(.022, 7.2 - index % 2 * .7, .022, redThreadMaterial, false);
      thread.position.set(x, 6.0, -9.6 + index * .16);
      scene.add(thread);
      world.redThreads.push(thread);
    });

    const lanternMaterial = new THREE.MeshStandardMaterial({ color: 0x651b17, emissive: 0xa8322b, emissiveIntensity: .42, roughness: .78, metalness: .01 });
    [-6.25, 6.25].forEach((x) => {
      const cord = box(.018, 1.9, .018, mats.brassDark, false);
      cord.position.set(x, 7.62, -3.95);
      cord.visible = false;
      scene.add(cord);
      const lantern = box(.58, .9, .58, lanternMaterial, false);
      lantern.position.set(x, 6.35, -3.95);
      lantern.visible = false;
      scene.add(lantern);
      const capTop = box(.78, .08, .78, mats.brassDark, false);
      capTop.position.set(x, 6.82, -3.95);
      capTop.visible = false;
      scene.add(capTop);
      const capBottom = capTop.clone();
      capBottom.position.y = 5.88;
      capBottom.visible = false;
      scene.add(capBottom);
    });
  }

  function addAtmosphere(scene, world) {
    const random = randomFactory(260823);
    const dustPositions = new Float32Array(620 * 3);
    for (let i = 0; i < 620; i++) {
      dustPositions[i * 3] = (random() - .5) * 19;
      dustPositions[i * 3 + 1] = random() * 9.5;
      dustPositions[i * 3 + 2] = 10 - random() * 27;
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    world.dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: C.bone, size: .024, transparent: true, opacity: .28, depthWrite: false }));
    scene.add(world.dust);

    const rainCount = 150;
    const positions = new Float32Array(rainCount * 6);
    world.rainSpeeds = new Float32Array(rainCount);
    for (let i = 0; i < rainCount; i++) {
      const offset = i * 6;
      const x = (random() - .5) * 19;
      const y = random() * 10;
      const z = 10 - random() * 26;
      const length = .25 + random() * .65;
      positions[offset] = x;
      positions[offset + 1] = y;
      positions[offset + 2] = z;
      positions[offset + 3] = x - .035;
      positions[offset + 4] = y - length;
      positions[offset + 5] = z + .03;
      world.rainSpeeds[i] = .025 + random() * .05;
    }
    const rainGeometry = new THREE.BufferGeometry();
    rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    world.rain = new THREE.LineSegments(rainGeometry, new THREE.LineBasicMaterial({ color: C.bone, transparent: true, opacity: .12, depthWrite: false }));
    scene.add(world.rain);

    const mistTexture = canvasTexture(256, 128, (ctx, width, height) => {
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 3, width / 2, height / 2, width / 2);
      gradient.addColorStop(0, 'rgba(190,177,150,.2)');
      gradient.addColorStop(.55, 'rgba(130,122,108,.06)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    });
    [[-4.8,.7,2,8],[4.2,.55,-2.5,9],[0,.8,-7,10],[-5.5,1,-11,7]].forEach((item, index) => {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: mistTexture, transparent: true, opacity: .09, depthWrite: false, color: 0xa99f8c }));
      sprite.position.set(item[0], item[1], item[2]);
      sprite.scale.set(item[3], item[3] * .42, 1);
      sprite.userData.baseX = item[0];
      sprite.userData.phase = index * 1.4;
      scene.add(sprite);
      world.mists.push(sprite);
    });
  }

  function setGlow(entry, mode) {
    entry.glow.forEach((material) => {
      const base = material.userData.baseIntensity || 0;
      material.emissiveIntensity = mode === 'active' ? base + .2 : mode === 'hover' ? base + .09 : base;
    });
  }

  function buildArchive(scene, projects) {
    const mats = createMaterials();
    scene.environment = createEnvironmentTexture();
    const world = {
      mats,
      projectHitMeshes: [],
      projectObjects: {},
      projectViews: {},
      mists: [],
      redThreads: [],
      activeProject: null,
      hoveredProject: null,
      views: {
        overview: { pos: [2.65, 4.3, 8.35], look: [-.2, 3.5, -5.7] },
        mobileOverview: { pos: [0, 4.15, 12.8], look: [0, 2.42, -3.5] },
        agent: { pos: [-3.9, 4.05, 5.15], look: [-3.25, 3.15, -5.15] },
        native: { pos: [3.9, 4.0, 5.05], look: [3.2, 3.0, -5.25] },
        browser: { pos: [4.7, 5.1, 1.55], look: [3.9, 4.65, -9.65] },
        about: { pos: [.1, 5.0, 2.55], look: [0, 4.55, -12.05] },
      },
    };

    addHall(scene, world, mats);

    const relics = [
      createSSHConsole(projects[0], 0, mats),
      createQuotaConsole(projects[1], 1, mats),
      createRecordDrum(projects[2], 2, mats),
      createGramophone(projects[3], 3, mats),
      createOpenBook(projects[4], 4, mats),
      createVideoReels(projects[5], 5, mats),
      createTabStack(projects[6], 6, mats),
      createGuardianPress(projects[7], 7, mats),
    ];
    const placements = [
      { x: -3.15, z: -2.0, topY: .5, scale: .94, rotationY: .035 },
      { x: 3.15, z: -1.94, topY: .5, scale: .98, rotationY: -.035 },
      { x: -5.72, z: -5.2, topY: 2.59, scale: .9, rotationY: .08 },
      { x: 5.72, z: -5.2, topY: 2.59, scale: .92, rotationY: -.1 },
      { x: -5.15, z: -8.55, topY: 4.39, scale: .84, rotationY: .06 },
      { x: 5.15, z: -8.55, topY: 4.39, scale: .84, rotationY: -.06 },
      { x: -3.62, z: -10.75, topY: 5.37, scale: .78, rotationY: .035 },
      { x: 3.62, z: -10.75, topY: 5.37, scale: .79, rotationY: -.035 },
    ];
    projects.forEach((project, index) => addProject(world, scene, project, index, relics[index], placements[index]));

    world.projectViews = {
      'ssh-connector-mcp': { pos: [-1.55, 3.3, 4.92], look: [-3.12, 1.5, -1.98] },
      QuotaBar: { pos: [1.75, 3.12, 4.95], look: [3.12, 1.32, -1.92] },
      'codex-record-sync': { pos: [-4.5, 4.6, -.2], look: [-5.7, 3.72, -5.15] },
      'guess-song': { pos: [4.45, 4.45, -.12], look: [5.7, 3.58, -5.15] },
      'mac-markdown-pad': { pos: [-3.72, 5.75, -3.55], look: [-5.12, 5.18, -8.5] },
      lqreadervideosync: { pos: [3.72, 5.72, -3.5], look: [5.12, 5.15, -8.5] },
      'ai-tabs-organizer': { pos: [-2.2, 6.95, -5.45], look: [-3.6, 6.38, -10.72] },
      'ai-release-guardian': { pos: [2.18, 6.85, -5.3], look: [3.6, 6.28, -10.72] },
    };

    addAtmosphere(scene, world);

    world.setActive = function (projectId) {
      world.activeProject = projectId;
      world.redThreads.forEach((thread) => { thread.visible = !projectId; });
      Object.entries(world.projectObjects).forEach(([id, entry]) => {
        if (projectId) entry.root.visible = id === projectId;
        entry.root.userData.targetScale = entry.baseScale * (id === projectId ? 1.045 : 1);
        setGlow(entry, id === projectId ? 'active' : id === world.hoveredProject ? 'hover' : 'base');
      });
    };

    world.setView = function (viewName) {
      world.activeView = viewName;
      Object.values(world.projectObjects).forEach((entry) => {
        entry.root.visible = viewName === 'overview'
          ? entry.index < 2
          : viewName === 'about'
            ? false
            : entry.category === viewName;
      });
    };

    world.setHovered = function (projectId) {
      world.hoveredProject = projectId;
      Object.entries(world.projectObjects).forEach(([id, entry]) => {
        setGlow(entry, id === world.activeProject ? 'active' : id === projectId ? 'hover' : 'base');
      });
    };

    world.update = function (time, motionEnabled) {
      const t = time * .001;
      if (!motionEnabled) return;
      world.engine.moving.position.x = Math.sin(t * .26) * .16;
      world.engine.moving.position.y = .13 + Math.sin(t * .19) * .06;
      world.engine.wheels.forEach((wheel, wheelIndex) => { wheel.rotation.z = t * (wheelIndex ? -.12 : .12); });
      world.engine.root.rotation.y = Math.sin(t * .12) * .009;
      Object.values(world.projectObjects).forEach((entry) => {
        entry.update(t);
        const scale = entry.root.scale.x + (entry.root.userData.targetScale - entry.root.scale.x) * .07;
        entry.root.scale.setScalar(scale);
      });
      world.dust.rotation.y = t * .006;
      const rainAttribute = world.rain.geometry.attributes.position;
      for (let i = 0; i < world.rainSpeeds.length; i++) {
        const offset = i * 6;
        rainAttribute.array[offset + 1] -= world.rainSpeeds[i];
        rainAttribute.array[offset + 4] -= world.rainSpeeds[i];
        if (rainAttribute.array[offset + 1] < -.3) {
          const length = rainAttribute.array[offset + 1] - rainAttribute.array[offset + 4];
          rainAttribute.array[offset + 1] = 10.2;
          rainAttribute.array[offset + 4] = 10.2 - length;
        }
      }
      rainAttribute.needsUpdate = true;
      world.mists.forEach((mist) => { mist.position.x = mist.userData.baseX + Math.sin(t * .1 + mist.userData.phase) * 1.1; });
    };

    world.setView('overview');

    return world;
  }

  window.buildArchive = buildArchive;
})();
