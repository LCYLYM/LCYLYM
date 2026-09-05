import * as THREE from "../vendor/three.module.js";
import { places } from "./projects.js";

const TAU = Math.PI * 2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = THREE.MathUtils.clamp;
function rng(seed = 9872) {
  return () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
const random = rng();
const hash = (x, z) => {
  const v = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
function noise(x, z) {
  const ix = Math.floor(x),
    iz = Math.floor(z),
    fx = x - ix,
    fz = z - iz;
  const u = fx * fx * (3 - 2 * fx),
    v = fz * fz * (3 - 2 * fz);
  return THREE.MathUtils.lerp(
    THREE.MathUtils.lerp(hash(ix, iz), hash(ix + 1, iz), u),
    THREE.MathUtils.lerp(hash(ix, iz + 1), hash(ix + 1, iz + 1), u),
    v,
  );
}
function fbm(x, z) {
  return (
    noise(x, z) * 0.57 +
    noise(x * 2.07, z * 2.07) * 0.27 +
    noise(x * 4.19, z * 4.19) * 0.12 +
    noise(x * 8.2, z * 8.2) * 0.04
  );
}

export function createLandscape(canvas, { onSelect, onFrame, onError }) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
    preserveDrawingBuffer: true,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor("#c5d0c6");
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 350);
  const fog = new THREE.Color("#c4d0c7");
  scene.fog = new THREE.Fog("#c4d0c7", 32, 145);
  scene.add(new THREE.HemisphereLight("#dce8da", "#263e32", 1.7));
  const sunlight = new THREE.DirectionalLight("#fff5d7", 2.7);
  sunlight.position.set(-20, 38, 24);
  sunlight.target.position.set(-3, 0, 0);
  scene.add(sunlight, sunlight.target);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(2048, 2048);
  Object.assign(sunlight.shadow.camera, {
    left: -43,
    right: 43,
    top: 38,
    bottom: -38,
    near: 1,
    far: 120,
  });
  sunlight.shadow.bias = -0.0002;
  sunlight.shadow.normalBias = 0.055;
  const makeMat = (color, texture = 1) => {
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec3 vInkWorld;",
        )
        .replace(
          "#include <worldpos_vertex>",
          `#include <worldpos_vertex>\nvec4 inkWorld=vec4(transformed,1.);\n#ifdef USE_INSTANCING\ninkWorld=instanceMatrix*inkWorld;\n#endif\nvInkWorld=(modelMatrix*inkWorld).xyz;`,
        );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `#include <common>\nvarying vec3 vInkWorld;\nfloat inkHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\nfloat inkNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(inkHash(i),inkHash(i+vec2(1,0)),f.x),mix(inkHash(i+vec2(0,1)),inkHash(i+1.),f.x),f.y);}`,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `#include <color_fragment>\nfloat wash=inkNoise(vInkWorld.xz*1.4+vInkWorld.yy*.16);\nfloat fibers=inkNoise(vInkWorld.xy*vec2(16.,1.8)+wash*4.);\nfloat granule=inkHash(gl_FragCoord.xy);\ndiffuseColor.rgb*=mix(1.,.54+wash*.36+fibers*.27+granule*.13,${texture.toFixed(1)});`,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        `outgoingLight=floor(outgoingLight*24.+granule*.55)/24.;\n#include <opaque_fragment>`,
      );
    };
    material.customProgramCacheKey = () => `ink-${texture}`;
    return material;
  };
  const mat = {
    stone: makeMat("#828985"),
    pale: makeMat("#c9ccbf"),
    dark: makeMat("#222a27"),
    roof: makeMat("#343c37"),
    wood: makeMat("#535b51"),
    pine: makeMat("#161e1b"),
    foliage: makeMat("#252d29"),
    moss: makeMat("#666e60"),
    paper: makeMat("#eaead6"),
    red: makeMat("#ae4b34", 0),
    signal: new THREE.MeshBasicMaterial({ color: "#d0764c" }),
    jade: new THREE.MeshBasicMaterial({ color: "#8bbcb1" }),
  };
  const motions = {},
    anchors = {},
    cached = new Map();
  const geo = (key, build) => {
    if (!cached.has(key)) cached.set(key, build());
    return cached.get(key);
  };
  const cube = geo("cube", () => new THREE.BoxGeometry(1, 1, 1));
  const sphere = geo("sphere", () => new THREE.SphereGeometry(1, 12, 8));
  function mesh(g, m, parent, pos, scale) {
    const o = new THREE.Mesh(g, m);
    o.castShadow = !m.transparent;
    o.receiveShadow = true;
    if (pos) o.position.set(...pos);
    if (scale) o.scale.set(...scale);
    parent.add(o);
    return o;
  }
  const box = (parent, pos, scale, material = mat.wood) =>
    mesh(cube, material, parent, pos, scale);
  function inscription(parent, text, position, size = 1.2, color = "#d8d9c7") {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 96;
    const ctx = c.getContext("2d");
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "36px monospace";
    ctx.fillText(text, 256, 48);
    const texture = new THREE.CanvasTexture(c);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    return mesh(
      new THREE.PlaneGeometry(size, (size * 96) / 512),
      material,
      parent,
      position,
    );
  }
  function line(parent, points, color = "#668479", opacity = 0.6) {
    const g = new THREE.BufferGeometry().setFromPoints(
      points.map((p) => (Array.isArray(p) ? V(...p) : p)),
    );
    const o = new THREE.Line(
      g,
      new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
    );
    parent.add(o);
    return o;
  }
  function beam(parent, a, b, radius, material = mat.wood, end = radius) {
    const from = V(...a),
      to = V(...b),
      delta = to.clone().sub(from);
    const o = mesh(
      new THREE.CylinderGeometry(end, radius, delta.length(), 8),
      material,
      parent,
    );
    o.position.copy(from.add(to).multiplyScalar(0.5));
    o.quaternion.setFromUnitVectors(V(0, 1, 0), delta.normalize());
    return o;
  }
  function batch(parent, geometry, material, transforms) {
    const inst = new THREE.InstancedMesh(geometry, material, transforms.length);
    const dummy = new THREE.Object3D();
    transforms.forEach((t, i) => {
      dummy.position.set(...t.p);
      dummy.scale.set(...t.s);
      dummy.rotation.set(...(t.r || [0, 0, 0]));
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    });
    inst.castShadow = true;
    inst.receiveShadow = true;
    inst.computeBoundingSphere();
    parent.add(inst);
    return inst;
  }
  function stone(parent, x, y, z, sx, sy, sz, seed = 0) {
    const g = new THREE.SphereGeometry(1, 28, 22),
      a = g.attributes.position;
    for (let i = 0; i < a.count; i++) {
      const px = a.getX(i),
        py = a.getY(i),
        pz = a.getZ(i);
      const f = 0.81 + fbm(px * 3 + seed, pz * 3 + py * 2) * 0.4;
      a.setXYZ(
        i,
        px * sx * f,
        py * sy * (0.88 + noise(px * 4 + seed, pz * 3) * 0.22),
        pz * sz * f,
      );
    }
    g.computeVertexNormals();
    return mesh(g, mat.stone, parent, [x, y, z]);
  }
  function island(parent, x, z, rx, rz, top, seed) {
    // A continuous closed radial landform: level walking surface, stratified cliff and tapered foot.
    const rings = 24,
      segments = 112,
      verts = [],
      indices = [];
    for (let j = 0; j <= rings; j++) {
      const t = j / rings;
      let radius, y;
      if (t < 0.35) {
        radius = t / 0.35;
        y = top + Math.sin(radius * Math.PI) * 0.14;
      } else {
        const f = (t - 0.35) / 0.65;
        radius = 1 - f * 0.52;
        y = top - f * (top + 4.8);
      }
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * TAU,
          shape =
            1 + 0.08 * Math.sin(a * 5 + seed) + 0.045 * Math.sin(a * 13 + seed);
        const crag =
          t < 0.35
            ? 1
            : 1 + (noise(Math.cos(a) * 6 + seed, t * 15) - 0.5) * 0.17;
        verts.push(
          x + Math.cos(a) * rx * radius * shape * crag,
          y + (t < 0.35 ? 0 : Math.sin(a * 9 + t * 20) * 0.18),
          z + Math.sin(a) * rz * radius * shape * crag,
        );
      }
    }
    for (let j = 0; j < rings; j++)
      for (let i = 0; i < segments; i++) {
        const a = j * (segments + 1) + i,
          b = a + segments + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    mesh(g, mat.stone, parent);
    // Mineral strata are irregular continuous contour strokes, not polygon edges.
    for (let layer = 0; layer < 15; layer++) {
      const t = 0.36 + layer * 0.034,
        f = (t - 0.35) / 0.65,
        points = [];
      for (let i = 0; i <= 140; i++) {
        const a = (i / 140) * TAU,
          r =
            (1 - f * 0.52) *
            (1 +
              0.08 * Math.sin(a * 5 + seed) +
              0.045 * Math.sin(a * 13 + seed));
        points.push([
          x + Math.cos(a) * rx * r * 1.008,
          top - f * (top + 4.8) + 0.08 * Math.sin(a * 10),
          z + Math.sin(a) * rz * r * 1.008,
        ]);
      }
      line(parent, points, "#293d37", 0.18);
    }
  }
  function mountain(x, z, radius, height, seed) {
    const g = new THREE.PlaneGeometry(radius * 2, radius * 2, 100, 100);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    const seeds = rng(seed),
      peaks = Array.from({ length: 7 }, () => ({
        x: (seeds() - 0.5) * radius,
        z: (seeds() - 0.5) * radius * 0.7,
        w: radius * (0.14 + seeds() * 0.12),
        h: 0.45 + seeds() * 0.55,
      }));
    for (let i = 0; i < p.count; i++) {
      const xx = p.getX(i),
        zz = p.getZ(i);
      let peak = 0;
      for (const v of peaks) {
        const d = Math.hypot(xx - v.x, zz - v.z) / v.w;
        peak = Math.max(peak, Math.exp(-d * d * 0.6) * v.h);
      }
      const ridge = 0.7 + fbm(xx * 0.35 + seed, zz * 0.31) * 0.45;
      const cleft =
        0.9 + Math.sin(xx * 1.1 + noise(xx * 0.14, zz * 0.13) * 8) * 0.1;
      p.setY(i, peak * height * ridge * cleft - 5);
    }
    g.computeVertexNormals();
    mesh(g, mat.stone, scene, [x, 0, z]);
  }
  function tube(parent, points, radius, material) {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => V(...p)));
    const g = new THREE.TubeGeometry(curve, 24, radius, 7, false),
      p = g.attributes.position;
    for (let i = 0; i < 25; i++) {
      const center = curve.getPointAt(i / 24),
        s = Math.max(0.09, 1 - (i / 24) * 0.86);
      for (let j = 0; j <= 7; j++) {
        const n = i * 8 + j;
        p.setXYZ(
          n,
          center.x + (p.getX(n) - center.x) * s,
          center.y + (p.getY(n) - center.y) * s,
          center.z + (p.getZ(n) - center.z) * s,
        );
      }
    }
    g.computeVertexNormals();
    return mesh(g, material, parent);
  }
  function pine(x, y, z, height, seed, lean = 1) {
    const localRng = rng(seed),
      g = new THREE.Group();
    scene.add(g);
    g.position.set(x, y, z);
    tube(
      g,
      [
        [0, 0, 0],
        [-height * 0.05, height * 0.25, 0.1],
        [height * 0.11 * lean, height * 0.53, -0.2],
        [height * 0.21 * lean, height * 0.8, 0.2],
        [height * 0.29 * lean, height, 0],
      ],
      height * 0.042,
      mat.pine,
    );
    const leaves = [];
    for (let j = 0; j < 9; j++) {
      const t = 0.36 + j * 0.07,
        a = j * 2.37 + seed,
        reach = height * (0.38 - t * 0.17),
        start = [height * 0.2 * t * lean, height * t, 0];
      const tip = [
        start[0] + Math.cos(a) * reach,
        start[1] + height * 0.1,
        Math.sin(a) * reach,
      ];
      tube(
        g,
        [
          start,
          [
            start[0] + Math.cos(a) * reach * 0.3,
            start[1] - 0.2,
            Math.sin(a) * reach * 0.3,
          ],
          [tip[0] * 0.9, tip[1] - 0.3, tip[2] * 0.9],
          tip,
        ],
        height * 0.018,
        mat.pine,
      );
      for (let k = 0; k < 85; k++) {
        const th = localRng() * TAU,
          r = Math.sqrt(localRng()) * reach * 0.57;
        leaves.push({
          p: [
            tip[0] + Math.cos(th) * r,
            tip[1] + (localRng() - 0.5) * height * 0.038 - r * 0.1,
            tip[2] + Math.sin(th) * r * 0.62,
          ],
          s: [
            height * (0.024 + localRng() * 0.028),
            height * (0.008 + localRng() * 0.014),
            height * (0.02 + localRng() * 0.025),
          ],
          r: [localRng() * 0.3, localRng() * TAU, localRng() * 0.15],
        });
      }
    }
    batch(
      g,
      geo("foliage", () => new THREE.IcosahedronGeometry(1, 1)),
      mat.foliage,
      leaves,
    );
    return g;
  }
  function roof(parent, width, depth, height, y, material = mat.roof) {
    const nx = 48,
      nz = 24,
      vertices = [],
      idx = [];
    const roofY = (x, z) =>
      y +
      height * Math.pow(1 - Math.abs(z), 1.8) +
      Math.pow(Math.abs(x), 7) * 0.65 +
      Math.pow(Math.abs(z), 7) * 0.35;
    for (let j = 0; j <= nz; j++)
      for (let i = 0; i <= nx; i++) {
        const x = (i / nx) * 2 - 1,
          z = (j / nz) * 2 - 1;
        vertices.push(x * width * 0.5, roofY(x, z), z * depth * 0.5);
      }
    for (let j = 0; j < nz; j++)
      for (let i = 0; i < nx; i++) {
        const a = j * (nx + 1) + i,
          b = a + nx + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    mesh(g, material, parent);
    // Tile ribs follow the curved roof surface and have real thickness.
    for (let i = 0; i <= Math.round(width / 0.16); i++) {
      const x = (i / Math.round(width / 0.16)) * 2 - 1;
      const pts = [];
      for (let j = 0; j <= 32; j++) {
        const z = (j / 32) * 2 - 1;
        pts.push([x * width * 0.5, roofY(x, z) + 0.035, z * depth * 0.5]);
      }
      const c = new THREE.CatmullRomCurve3(pts.map((p) => V(...p)));
      mesh(new THREE.TubeGeometry(c, 32, 0.027, 4, false), mat.dark, parent);
    }
    for (const side of [-1, 1]) {
      const pts = [];
      for (let i = 0; i <= 48; i++) {
        const x = (i / 48) * 2 - 1;
        pts.push([x * width * 0.5, roofY(x, side) - 0.04, side * depth * 0.5]);
      }
      line(parent, pts, "#1e302b", 0.9);
    }
    beam(
      parent,
      [-width * 0.53, y + height + 0.1, 0],
      [width * 0.53, y + height + 0.1, 0],
      0.1,
      mat.dark,
    );
    for (const s of [-1, 1])
      tube(
        parent,
        [
          [s * width * 0.45, y + height + 0.1, 0],
          [s * width * 0.55, y + height + 0.22, 0],
          [s * width * 0.6, y + height + 0.65, 0],
        ],
        0.1,
        mat.dark,
      );
  }
  function pavilion(parent, width, depth, y, h, roofHeight = 1.4) {
    box(parent, [0, y - 0.15, 0], [width, 0.3, depth], mat.pale);
    for (const x of [-1, 1])
      for (const z of [-1, 1]) {
        beam(
          parent,
          [x * width * 0.39, y, z * depth * 0.34],
          [x * width * 0.39, y + h, z * depth * 0.34],
          0.11,
          mat.wood,
        );
        box(
          parent,
          [x * width * 0.39, y + 0.13, z * depth * 0.34],
          [0.4, 0.26, 0.4],
          mat.stone,
        );
      }
    for (const z of [-1, 1]) {
      beam(
        parent,
        [-width * 0.42, y + h - 0.15, z * depth * 0.34],
        [width * 0.42, y + h - 0.15, z * depth * 0.34],
        0.09,
        mat.dark,
      );
      for (let i = -2; i <= 2; i++)
        box(
          parent,
          [i * width * 0.15, y + h - 0.36, z * depth * 0.34],
          [0.09, 0.4, 0.28],
          mat.wood,
        );
    }
    roof(parent, width * 1.28, depth * 1.4, roofHeight, y + h);
  }
  function node(id, at) {
    const g = new THREE.Group();
    g.position.set(...at);
    g.userData.place = id;
    scene.add(g);
    return g;
  }
  function signalPath(parent, coords, count, color = mat.signal, speed = 0.08) {
    const curve = new THREE.CatmullRomCurve3(coords.map((p) => V(...p)));
    line(parent, curve.getPoints(80), "#a8b6a3", 0.3);
    const balls = [];
    for (let i = 0; i < count; i++) {
      const point = mesh(sphere, color, parent, null, [0.075, 0.075, 0.075]);
      point.userData.animated = true;
      balls.push(point);
    }
    return (time) => {
      balls.forEach((b, i) =>
        b.position.copy(curve.getPointAt((time * speed + i / count) % 1)),
      );
    };
  }

  // Distant topography remains geometry and responds to camera movement.
  [
    [-62, -85, 40, 44, 1],
    [-18, -93, 31, 52, 7],
    [23, -93, 37, 48, 11],
    [60, -84, 36, 44, 19],
    [-50, -48, 25, 29, 25],
    [-9, -57, 23, 35, 41],
    [32, -49, 25, 32, 59],
    [-37, -21, 16, 18, 70],
    [21, -29, 17, 23, 97],
  ].forEach((p) => mountain(...p));
  // A pale circular sun, distant enough to behave as part of the landscape.
  const sun = mesh(
    new THREE.CircleGeometry(10, 96),
    new THREE.MeshBasicMaterial({
      color: "#e2e5d5",
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    }),
    scene,
    [-18, 31, -83],
  );
  sun.lookAt(24, 18, 42);
  // The lake is a true horizontal plane. Its surface uses world-space ink ripples.
  const waterUniforms = {
    uTime: { value: 0 },
    uRipple: { value: -100 },
    uFog: { value: fog },
  };
  const waterMat = new THREE.ShaderMaterial({
    uniforms: waterUniforms,
    vertexShader: `varying vec3 vP;void main(){vec4 w=modelMatrix*vec4(position,1.);vP=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader: `
    uniform float uTime;uniform float uRipple;uniform vec3 uFog;varying vec3 vP;
    void main(){float wave=sin(vP.x*.42+vP.z*.72+uTime*.15)+sin(vP.x*1.6-vP.z*.3+uTime*.18)*.34;float line=pow(abs(sin(vP.z*2.4+wave*.6)),26.);vec3 col=mix(vec3(.22,.26,.25),vec3(.38,.43,.39),line*.18+.22);float dist=length(vP.xz-vec2(-10.,10.));float age=uTime-uRipple;float ring=exp(-pow((dist-age*3.)*3.,2.))*step(0.,age)*step(age,8.);col+=vec3(.15,.08,.03)*ring;float fog=1.-exp(-pow(length(cameraPosition-vP)*.009,1.8));col=mix(col,uFog,fog);gl_FragColor=vec4(col,1.);\n#include <colorspace_fragment>\n}`,
    side: THREE.DoubleSide,
  });
  const lake = mesh(
    new THREE.PlaneGeometry(600, 600),
    waterMat,
    scene,
    [0, -1.4, 0],
  );
  lake.rotation.x = -Math.PI / 2;

  const land = new THREE.Group();
  scene.add(land);
  island(land, -3, 0, 6.4, 5.2, 1.8, 4);
  island(land, -16, -7, 7.5, 4.3, 1.25, 9);
  island(land, 7, -11, 5.4, 5.8, 2.3, 12);
  island(land, -10, 10, 5.8, 3.6, 0.65, 19);
  island(land, 7, 6, 5.3, 4.6, 1.2, 28);
  for (let i = 0; i < 42; i++) {
    const a = random() * TAU,
      r = 14 + random() * 7;
    stone(
      land,
      Math.cos(a) * r,
      -0.7,
      Math.sin(a) * r,
      1 + random() * 1.8,
      0.8 + random() * 1.2,
      1 + random(),
      i,
    );
  }
  // The SSH moon gate is dressed masonry rather than a solid torus primitive.
  const gate = node("gate", [-3, 1.9, 0]);
  const ring = new THREE.Group();
  gate.add(ring);
  ring.position.y = 3.7;
  mesh(new THREE.TorusGeometry(3.65, 0.34, 12, 128), mat.stone, ring);
  for (let i = 0; i < 68; i++) {
    const a = (i / 68) * TAU;
    const block = box(
      ring,
      [Math.cos(a) * 3.65, Math.sin(a) * 3.65, 0],
      [0.31, 0.57, 0.73],
      mat.stone,
    );
    block.rotation.z = a;
  }
  mesh(new THREE.TorusGeometry(3.29, 0.024, 5, 128), mat.dark, ring, null);
  const circuit = mesh(
    new THREE.TorusGeometry(3.25, 0.015, 5, 128),
    mat.jade,
    ring,
    [0, 0, 0.39],
  );
  ["MCP", "host_id", "exec", "PTY", "SFTP", "audit"].forEach((name, i) => {
    const angle = Math.PI * 0.86 - i * Math.PI * 0.145;
    const text = inscription(
      ring,
      name,
      [Math.cos(angle) * 3.66, Math.sin(angle) * 3.66, 0.405],
      1.35,
    );
    text.rotation.z = angle - Math.PI / 2;
  });
  for (const side of [-1, 1]) {
    box(gate, [side * 3.23, 0.15, 0], [1.5, 0.3, 1.65], mat.dark);
    box(gate, [side * 3.23, 0.38, 0], [1.1, 0.24, 1.2], mat.stone);
  }
  for (let i = 0; i < 14; i++) {
    const z = 4.8 - i * 0.63;
    box(
      gate,
      [0, -0.25 + Math.min(i, 4) * 0.055, z],
      [2.2, 0.16, 0.57],
      mat.pale,
    );
  }
  // Slender inner geometry visualizes execution channels.
  const internal = new THREE.Group();
  gate.add(internal);
  internal.position.set(0, 3.7, 0);
  for (let i = 0; i < 3; i++) {
    const r = mesh(
      new THREE.TorusGeometry(1.6 + i * 0.3, 0.013, 4, 96),
      i === 0 ? mat.signal : mat.dark,
      internal,
    );
    r.rotation.set(0.3 + i * 0.4, 0.2 + i * 0.5, 0);
  }
  const gateFlow = signalPath(
    gate,
    [
      [0, 0.12, 5.5],
      [0, 0.15, 2.3],
      [0, 1.3, 0.6],
      [0, 3.7, 0.1],
      [0, 4.1, -2],
      [0, 2.1, -5],
    ],
    9,
    mat.signal,
    0.09,
  );
  motions.gate = (t, pulse) => {
    internal.rotation.y = t * 0.08 + pulse * 0.2;
    internal.rotation.z = Math.sin(t * 0.1) * 0.12;
    gateFlow(t + pulse * 5);
    circuit.material.color.set(pulse > 0 ? "#d7a873" : "#789c8e");
  };

  const bridge = node("bridge", [-16, 1.4, -7]);
  pavilion(bridge, 4.2, 3.7, 0, 2.9, 1.25);
  inscription(bridge, "MESSAGES / SSE / RESPONSES", [0, 2.52, 1.31], 3.3);
  // Curved walkway links the banks, with individual rail posts and deck planks.
  const deck = [];
  for (let i = 0; i < 34; i++) {
    const t = i / 33,
      x = -12 + t * 9,
      z = -6 + t * 5.5,
      y = 1.45 + Math.sin(t * Math.PI) * 1.6;
    const plank = box(scene, [x, y, z], [0.38, 0.16, 2.1], mat.wood);
    plank.rotation.y = -0.54;
    deck.push([x, y + 0.23, z]);
    if (i % 3 === 0)
      for (const s of [-1, 1])
        beam(
          scene,
          [x - s * 0.46, y, z + s * 0.82],
          [x - s * 0.46, y + 0.85, z + s * 0.82],
          0.055,
          mat.dark,
        );
  }
  for (const s of [-1, 1]) {
    const pts = deck.map((p) => [
      p[0] - s * 0.46,
      p[1] + 0.57,
      p[2] + s * 0.82,
    ]);
    mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(pts.map((p) => V(...p))),
        64,
        0.04,
        6,
      ),
      mat.wood,
      scene,
    );
  }
  const bridgeFlow = signalPath(
    scene,
    deck.map((p) => [p[0], p[1] + 0.13, p[2]]),
    12,
    mat.jade,
    0.045,
  );
  motions.bridge = (t, pulse) => bridgeFlow(t + pulse * 4);
  // Waterfalls, made of a narrow flowing mesh and fine longitudinal strokes.
  const falls = [];
  for (const [x, z, h] of [
    [-17, -4.2, 1.3],
    [8, -6, 2.3],
  ]) {
    for (let j = 0; j < 26; j++) {
      const pts = [];
      for (let k = 0; k < 22; k++)
        pts.push([
          x + j * 0.032 + Math.sin(k * 0.17 + j) * 0.025,
          h - k * 0.17,
          z + Math.sin(k * 0.2) * 0.14,
        ]);
      falls.push(line(scene, pts, j % 5 === 0 ? "#c4ddce" : "#91b3a1", 0.24));
    }
  }

  const pagoda = node("pagoda", [7, 2.5, -11]);
  const lanterns = [];
  for (let level = 0; level < 3; level++) {
    const w = 5.6 - level * 1.05,
      y = level * 2.65;
    pavilion(pagoda, w, w * 0.79, y, 1.72, 0.95);
    for (const s of [-1, 1])
      lanterns.push(
        mesh(
          sphere,
          mat.signal.clone(),
          pagoda,
          [s * w * 0.31, y + 1.0, w * 0.29],
          [0.09, 0.18, 0.09],
        ),
      );
  }
  ["CHECK", "REPAIR", "VERIFY"].forEach((name, i) =>
    inscription(
      pagoda,
      name,
      [0, i * 2.65 + 1.2, (5.6 - i * 1.05) * 0.27],
      2.3,
    ),
  );
  beam(pagoda, [0, 8.2, 0], [0, 9.5, 0], 0.05, mat.dark);
  mesh(sphere, mat.red, pagoda, [0, 9.2, 0], [0.14, 0.14, 0.14]);
  const papers = [];
  for (let i = 0; i < 5; i++) {
    const p = box(
      pagoda,
      [-1.8 + i * 0.8, 1.3, 0],
      [0.58, 0.8, 0.025],
      mat.paper,
    );
    p.rotation.y = -0.15 + i * 0.07;
    papers.push(p);
  }
  motions.pagoda = (t, pulse) => {
    lanterns.forEach((l, i) => {
      const active =
        Math.floor((t + pulse * 3) * 0.9) % 3 === Math.floor(i / 2);
      const s = active ? 1.35 : 1;
      l.scale.set(0.09 * s, 0.18 * s, 0.09 * s);
      l.material.color.set(active ? "#deaa69" : "#567d6d");
    });
    papers.forEach((p, i) => {
      p.position.y = 1.3 + Math.sin(t * 0.8 + i) * 0.08;
      p.rotation.z = Math.sin(t * 0.45 + i) * 0.035;
    });
  };

  const music = node("music", [-10, 0.8, 10]);
  mesh(
    new THREE.CylinderGeometry(3, 3.25, 0.35, 80),
    mat.pale,
    music,
    [0, -0.03, 0],
  );
  const musicRings = [];
  for (let r = 0; r < 4; r++) {
    const o = mesh(
      new THREE.TorusGeometry(1.2 + r * 0.48, 0.016, 4, 100),
      mat.dark,
      music,
      [0, 0.16, 0],
    );
    o.rotation.x = Math.PI / 2;
    musicRings.push(o);
  }
  // Suspended chimes make the sound interaction visible even with audio muted.
  for (const s of [-1, 1])
    beam(music, [s * 2.1, 0.15, -0.6], [s * 2.1, 3.5, -0.6], 0.095, mat.wood);
  tube(
    music,
    [
      [-2.5, 3.6, -0.6],
      [-1.2, 3.38, -0.6],
      [1.2, 3.38, -0.6],
      [2.5, 3.6, -0.6],
    ],
    0.11,
    mat.dark,
  );
  const chimes = [];
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.51,
      h = 0.7 + Math.sin(i * 0.9) * 0.22;
    line(
      music,
      [
        [x, 3.4, -0.6],
        [x, 2.8, -0.6],
      ],
      "#293e36",
      0.6,
    );
    const pivot = new THREE.Group();
    pivot.position.set(x, 2.85, -0.6);
    music.add(pivot);
    mesh(
      new THREE.CylinderGeometry(0.095, 0.11, h, 12),
      i === 3 ? mat.red : mat.pale,
      pivot,
      [0, -h * 0.5, 0],
    );
    chimes.push(pivot);
  }
  motions.music = (t, pulse) => {
    chimes.forEach(
      (c, i) =>
        (c.rotation.z = Math.sin(t * 1.1 + i * 0.7) * (0.025 + pulse * 0.24)),
    );
  };
  // Native applications: an open writing pavilion with paired curved pages.
  const desk = node("desk", [7, 1.35, 6]);
  pavilion(desk, 5.1, 3.8, 0, 3.1, 1.25);
  box(desk, [0, 0.9, 0.35], [2.9, 0.16, 1.7], mat.dark);
  for (const x of [-1, 1])
    for (const z of [-0.3, 1]) box(desk, [x, 0.44, z], [0.11, 0.9, 0.11]);
  const pages = [];
  for (const s of [-1, 1]) {
    const g = new THREE.PlaneGeometry(1.2, 1.2, 20, 16),
      p = g.attributes.position;
    for (let i = 0; i < p.count; i++)
      p.setZ(i, 0.17 * Math.pow(p.getX(i) / 0.6, 2));
    g.computeVertexNormals();
    const page = mesh(g, mat.paper, desk, [s * 0.62, 1.04, 0.35]);
    page.rotation.x = -Math.PI * 0.48;
    pages.push(page);
    for (let j = 0; j < 9; j++)
      line(
        page,
        [
          [-0.45, 0.45 - j * 0.1, 0.05],
          [0.4 - (j % 3) * 0.13, 0.45 - j * 0.1, 0.05],
        ],
        "#68746b",
        0.36,
      );
  }
  const anchorLines = [];
  for (const s of [-1, 1]) {
    const l = box(desk, [s * 0.62, 1.067, 0.25], [1, 0.009, 0.025], mat.signal);
    anchorLines.push(l);
  }
  const quota = box(desk, [1.62, 0.99, 0.35], [0.13, 0.04, 1.1], mat.dark);
  for (let i = 0; i < 9; i++)
    box(
      quota,
      [0, 0.65, -3.3 + i * 0.8],
      [0.5, 0.45, 0.48],
      i < 5 ? mat.jade : mat.stone,
    );
  motions.desk = (t, pulse) => {
    anchorLines.forEach(
      (l) => (l.position.z = 0.3 + Math.sin(t * 0.45 + pulse) * 0.4),
    );
    pages.forEach((p, i) => (p.rotation.z = Math.sin(t * 0.33 + i) * 0.007));
  };

  // Ink-pine silhouettes establish three distinct depth planes.
  pine(-21, 1, -10, 10, 171, -1);
  pine(-19, 1, -4, 7, 36, -1);
  pine(10, 2, -15, 8, 52, 1);
  pine(-7, 1.8, -4, 5.8, 93, -1);
  pine(11, 1, 7, 5.7, 123, 1);
  pine(-15, 0.6, 11, 4.8, 189, -1);
  pine(-20, -1, 17, 17, 581, 1);
  pine(35, -2, -3, 15, 767, -1);
  // Slender meadow strokes avoid the rounded bushes of a toy diorama.
  const grasses = [];
  for (let i = 0; i < 420; i++) {
    const a = random() * TAU,
      rr = 2 + random() * 3,
      x = -3 + Math.cos(a) * rr,
      z = Math.sin(a) * rr;
    grasses.push({
      p: [x, 1.98, z],
      s: [0.018, 0.16 + random() * 0.25, 0.018],
      r: [random() * 0.3, 0, (random() - 0.5) * 0.5],
    });
  }
  batch(scene, cube, mat.moss, grasses);
  // A few folded birds animate as silhouettes in the open sky.
  const birds = [];
  for (let i = 0; i < 5; i++) {
    const bird = new THREE.Group();
    scene.add(bird);
    const wings = [];
    for (const s of [-1, 1]) {
      const g = new THREE.BufferGeometry();
      g.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
          [0, 0, 0, s * 0.42, 0.09, -0.1, s * 0.24, 0, 0.12],
          3,
        ),
      );
      const wing = mesh(g, mat.dark, bird);
      wings.push(wing);
    }
    birds.push({ bird, wings, phase: i * 1.8 });
  }
  places.forEach((p) => (anchors[p.id] = V(...p.anchor)));
  // Merge fixed pieces within each scene node. Animated meshes and hit-test
  // ownership remain separate; detailed tilework no longer costs a draw per rib.
  const animatedMeshes = new Set([
    ...pages,
    ...anchorLines,
    circuit,
    ...lanterns,
    ...papers,
    ...birds.flatMap((b) => b.wings),
  ]);
  const parents = [];
  scene.traverse((o) => {
    if (o.children.length) parents.push(o);
  });
  for (const parent of parents) {
    const groups = new Map();
    for (const child of parent.children) {
      if (
        !child.isMesh ||
        child.isInstancedMesh ||
        child.userData.animated ||
        animatedMeshes.has(child) ||
        child.material.transparent ||
        Array.isArray(child.material)
      )
        continue;
      const key = child.material.uuid;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(child);
    }
    for (const group of groups.values()) {
      if (group.length < 3) continue;
      const positions = [],
        normals = [],
        uvs = [],
        indices = [];
      let cursor = 0;
      const v = V(0, 0, 0),
        n = V(0, 0, 0),
        normalMatrix = new THREE.Matrix3();
      for (const child of group) {
        child.updateMatrix();
        normalMatrix.getNormalMatrix(child.matrix);
        const attributes = child.geometry.attributes,
          p = attributes.position,
          no = attributes.normal,
          uv = attributes.uv;
        for (let i = 0; i < p.count; i++) {
          v.fromBufferAttribute(p, i).applyMatrix4(child.matrix);
          positions.push(v.x, v.y, v.z);
          if (no)
            n.fromBufferAttribute(no, i).applyMatrix3(normalMatrix).normalize();
          else n.set(0, 1, 0);
          normals.push(n.x, n.y, n.z);
          uvs.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0);
        }
        const index = child.geometry.index;
        if (index)
          for (let i = 0; i < index.count; i++)
            indices.push(cursor + index.getX(i));
        else for (let i = 0; i < p.count; i++) indices.push(cursor + i);
        cursor += p.count;
        parent.remove(child);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3),
      );
      geometry.setAttribute(
        "normal",
        new THREE.Float32BufferAttribute(normals, 3),
      );
      geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      geometry.setIndex(indices);
      geometry.computeBoundingSphere();
      mesh(geometry, group[0].material, parent);
    }
  }
  const raycaster = new THREE.Raycaster(),
    pointer = new THREE.Vector2(),
    projected = V(0, 0, 0);
  let width = 1,
    height = 1,
    mobile = false,
    selected = null,
    paused = matchMedia("(prefers-reduced-motion: reduce)").matches,
    hidden = document.hidden;
  let time = 0,
    last = performance.now(),
    raf = 0,
    drag = null,
    offset = { x: 0, y: 0 },
    wantedOffset = { x: 0, y: 0 },
    pulseStart = -100,
    transition = null;
  const overview = { camera: [21, 11.8, 38], target: [4, 4.2, 0] };
  let currentPos = V(...overview.camera),
    currentTarget = V(...overview.target);
  function pose(id) {
    const p = places.find((p) => p.id === id);
    let pos = V(...(p ? p.camera : overview.camera)),
      target = V(...(p ? p.target : overview.target));
    if (mobile) {
      pos = target.clone().add(pos.clone().sub(target).multiplyScalar(1.5));
      target.y += p ? -5 : 3.5;
      target.x -= p ? 3 : 1.5;
    }
    return { pos, target };
  }
  function focus(id, immediate = false) {
    selected = id;
    const p = pose(id),
      place = places.find((p) => p.id === id);
    offset = { x: 0, y: 0 };
    wantedOffset = { x: 0, y: 0 };
    transition = {
      start: performance.now(),
      duration: paused || immediate ? 0 : 1550,
      from: currentPos.clone(),
      to: p.pos,
      fromTarget: currentTarget.clone(),
      toTarget: p.target,
      arc: V(...(place ? place.arc : [0, 5, 4])),
    };
  }
  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    mobile = width <= 820;
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.65));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = mobile ? 44 : 39;
    camera.updateProjectionMatrix();
    focus(selected, true);
  }
  function projectLabels() {
    return places.map((p) => {
      projected.copy(anchors[p.id]).project(camera);
      return {
        id: p.id,
        x: (projected.x * 0.5 + 0.5) * width,
        y: (-0.5 * projected.y + 0.5) * height,
        visible:
          projected.z < 1 &&
          projected.z > -1 &&
          Math.abs(projected.x) < 0.94 &&
          Math.abs(projected.y) < 0.83 &&
          (!selected || selected === p.id),
      };
    });
  }
  function render(now) {
    raf = requestAnimationFrame(render);
    if (hidden) return;
    const dt = clamp((now - last) / 1000, 0, 0.04);
    last = now;
    if (!paused) time += dt;
    if (transition) {
      const f =
          transition.duration === 0
            ? 1
            : clamp((now - transition.start) / transition.duration, 0, 1),
        e = f * f * f * (f * (f * 6 - 15) + 10);
      currentPos
        .lerpVectors(transition.from, transition.to, e)
        .addScaledVector(transition.arc, Math.sin(Math.PI * e));
      currentTarget.lerpVectors(transition.fromTarget, transition.toTarget, e);
      if (f === 1) transition = null;
    }
    const ease = paused ? 1 : 1 - Math.exp(-dt * 6);
    offset.x += (wantedOffset.x - offset.x) * ease;
    offset.y += (wantedOffset.y - offset.y) * ease;
    const relative = currentPos.clone().sub(currentTarget);
    relative.applyAxisAngle(V(0, 1, 0), offset.x);
    camera.position.copy(currentTarget).add(relative);
    camera.position.y += offset.y;
    camera.lookAt(currentTarget);
    camera.updateMatrixWorld();
    const pulse = Math.max(0, 1 - (time - pulseStart) / 5);
    Object.entries(motions).forEach(([id, animate]) =>
      animate(time, selected === id ? pulse : 0),
    );
    waterUniforms.uTime.value = time;
    birds.forEach(({ bird, wings, phase }, i) => {
      bird.position.set(
        -15 + Math.sin(time * 0.018 + phase) * 21,
        19 + i * 0.45 + Math.sin(time * 0.12 + phase),
        -28 + Math.cos(time * 0.018 + phase) * 8,
      );
      bird.rotation.y = -time * 0.018 - phase;
      wings.forEach(
        (w, j) =>
          (w.rotation.z = Math.sin(time * 2 + phase) * 0.22 * (j ? 1 : -1)),
      );
    });
    falls.forEach(
      (l, i) =>
        (l.material.opacity = 0.13 + Math.sin(time * 0.7 + i * 0.6) * 0.05),
    );
    renderer.render(scene, camera);
    onFrame?.({
      labels: projectLabels(),
      time,
      drawCalls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
    });
  }
  function pointerDown(e) {
    if (e.button !== 0) return;
    drag = {
      x: e.clientX,
      y: e.clientY,
      baseX: wantedOffset.x,
      baseY: wantedOffset.y,
      moved: false,
    };
    canvas.setPointerCapture(e.pointerId);
    document.body.classList.add("dragging");
  }
  function pointerMove(e) {
    if (!drag) return;
    const dx = e.clientX - drag.x,
      dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 7) drag.moved = true;
    wantedOffset.x = clamp(drag.baseX - dx * 0.002, -0.4, 0.4);
    wantedOffset.y = clamp(drag.baseY + dy * 0.016, -3, 4);
  }
  function pointerUp(e) {
    if (!drag) return;
    const didMove = drag.moved;
    drag = null;
    document.body.classList.remove("dragging");
    if (didMove) return;
    pointer.set((e.clientX / width) * 2 - 1, (-e.clientY / height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(scene.children, true);
    if (hits.length) {
      let o = hits[0].object;
      while (o && !o.userData.place) o = o.parent;
      if (o) onSelect(o.userData.place);
    }
  }
  function cancel() {
    drag = null;
    document.body.classList.remove("dragging");
  }
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", cancel);
  const visibility = () => {
    hidden = document.hidden;
    last = performance.now();
  };
  document.addEventListener("visibilitychange", visibility);
  const lost = (e) => {
    e.preventDefault();
    cancelAnimationFrame(raf);
    onError?.(new Error("WebGL context lost"));
  };
  canvas.addEventListener("webglcontextlost", lost);
  window.addEventListener("resize", resize);
  resize();
  raf = requestAnimationFrame(render);
  return {
    focus,
    setPaused(value) {
      paused = value;
      return paused;
    },
    get paused() {
      return paused;
    },
    trigger() {
      pulseStart = time;
      waterUniforms.uRipple.value = time;
      return time;
    },
    snapshot() {
      return {
        place: selected,
        time,
        paused,
        camera: camera.position.toArray(),
        target: currentTarget.toArray(),
        calls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
      };
    },
    captureAt(t) {
      cancelAnimationFrame(raf);
      paused = true;
      time = t;
      offset.x = Math.sin((t * TAU) / 4) * 0.065;
      wantedOffset.x = offset.x;
      last = performance.now();
      render(last);
      cancelAnimationFrame(raf);
    },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointercancel", cancel);
      canvas.removeEventListener("webglcontextlost", lost);
      const geometries = new Set(),
        materials = new Set();
      scene.traverse((o) => {
        if (o.geometry) geometries.add(o.geometry);
        if (o.material)
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
            materials.add(m),
          );
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
      renderer.dispose();
    },
  };
}
