import * as THREE from "../vendor/three.module.js";

// Pigment follows the object's surface; paper follows the screen. Moving the
// camera therefore changes the drawing without sliding a texture over the UI.
const noiseGLSL = `
float ih(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float inoise(vec2 p) {
  vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(ih(i),ih(i+vec2(1,0)),f.x),mix(ih(i+vec2(0,1)),ih(i+1.),f.x),f.y);
}
float wash(vec2 p) { return inoise(p)*.58+inoise(p*2.03)*.28+inoise(p*4.1)*.14; }
`;

export function inkMaterial(color, texture = 1) {
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
        `#include <worldpos_vertex>
        vec4 iw=vec4(transformed,1.);
        #ifdef USE_INSTANCING
          iw=instanceMatrix*iw;
        #endif
        vInkWorld=(modelMatrix*iw).xyz;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>\nvarying vec3 vInkWorld;\n${noiseGLSL}`,
      )
      .replace(
        "#include <opaque_fragment>",
        `
        float wet=wash(vInkWorld.xz*.63+vInkWorld.yy*.19);
        float drag=wash(vec2(vInkWorld.x*3.6+wet*4.,vInkWorld.y*.46+vInkWorld.z*.6));
        float dry=inoise(vInkWorld.xy*vec2(44.,3.)+vInkWorld.z*2.);
        float lum=dot(outgoingLight,vec3(.2126,.7152,.0722));
        float tone=smoothstep(.04,1.5,lum);
        float levels=mix(floor(tone*5.+wet*.48)/5.,tone,.2);
        float deposit=(1.-levels)*(.70+wet*.48);
        float hatch=smoothstep(.51,.64,drag)*smoothstep(.3,.6,deposit);
        deposit=clamp(deposit+hatch*.19-dry*.065,0.,.98);
        vec3 pigment=mix(vec3(.96,.953,.926),vec3(.037,.044,.052),deposit);
        outgoingLight=mix(outgoingLight,pigment,${texture.toFixed(1)});
        #include <opaque_fragment>`,
      );
  };
  material.customProgramCacheKey = () => `pigment-v2-${texture}`;
  return material;
}

export function createInkPass(renderer) {
  const target = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: true });
  const uniforms = {
    drawing: { value: target.texture },
    texel: { value: new THREE.Vector2(1, 1) },
  };
  const material = new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms,
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
    fragmentShader: `
      uniform sampler2D drawing; uniform vec2 texel; varying vec2 vUv;
      ${noiseGLSL}
      float tone(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
      void main(){
        vec2 pixel=vUv/texel;
        float fiber=inoise(pixel*vec2(.58,.09));
        vec2 warp=vec2(inoise(pixel*.09),inoise(pixel*.09+53.))-.5;
        vec2 uv=vUv+warp*texel*1.3;
        vec3 base=texture2D(drawing,uv).rgb;
        float center=tone(base), low=center, high=center;
        float pool=0.;
        for(int i=0;i<4;i++){
          float a=float(i)*1.5707963;
          float n=tone(texture2D(drawing,uv+vec2(cos(a),sin(a))*texel*1.45).rgb);
          low=min(low,n); high=max(high,n); pool+=n;
        }
        float edge=smoothstep(.018,.19,high-low);
        float density=1.-center;
        density=clamp(density+edge*(center-low)*.7+(fiber-.5)*.022,0.,1.);
        density=smoothstep(.04,1.03,density);
        // A restrained red or celadon route remains legible through the ink.
        float chroma=max(base.r,max(base.g,base.b))-min(base.r,min(base.g,base.b));
        vec3 paper=vec3(.946,.941,.917);
        vec3 result=mix(paper,vec3(.034,.044,.052),density);
        result=mix(result,base,smoothstep(.07,.22,chroma)*.78);
        result-=vec3((ih(pixel)-.5)*.016);
        gl_FragColor=vec4(result,1.);
        #include <colorspace_fragment>
      }`,
  });
  const scene = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;
  scene.add(quad);
  const camera = new THREE.Camera();
  return {
    resize(width, height) {
      target.setSize(width, height);
      uniforms.texel.value.set(1 / width, 1 / height);
    },
    render(world, view) {
      renderer.info.reset();
      renderer.setRenderTarget(target);
      renderer.render(world, view);
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
    },
    dispose() {
      target.dispose();
      quad.geometry.dispose();
      material.dispose();
    },
  };
}
