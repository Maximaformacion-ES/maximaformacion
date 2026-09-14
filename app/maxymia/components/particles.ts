import * as THREE from 'three';

/**
 * Motor de partículas compartido por la hélice de ADN (DnaHelix) y las
 * figuras de las tarjetas (ParticleFigure) de /maxymia: mismo shader (disco
 * suave, tamaño/opacidad según distancia al plano de enfoque, parpadeo), mismos
 * colores de marca exactos y mismo ciclo de vida (solo cliente, pausa fuera de
 * pantalla, un único fotograma con prefers-reduced-motion).
 */

export const BLUE = new THREE.Color('#527BE7');
export const ORANGE = new THREE.Color('#F7A000');

/** Gaussiana aproximada (suma de uniformes) para dispersar partículas. */
export function gauss(): number {
  return (Math.random() + Math.random() + Math.random() - 1.5) * 0.8;
}

export const VERT = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uFocus;   // z (en espacio de cámara) del plano enfocado
  uniform float uScale;   // factor de tamaño global (px)
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float dz = abs(mv.z - uFocus);
    float blur = 1.0 + dz * 0.35;
    float twinkle = 0.85 + 0.15 * sin(uTime * 1.6 + aSeed * 6.2831);
    vAlpha = 0.9 * twinkle / (1.0 + dz * dz * 0.4);
    vColor = aColor;
    gl_PointSize = aSize * blur * uPixelRatio * (uScale / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

export const FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.25, d) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
    #include <colorspace_fragment>
  }
`;

/** Acumulador de partículas → BufferGeometry con los atributos del shader. */
export class Cloud {
  pos: Float32Array;
  col: Float32Array;
  size: Float32Array;
  seed: Float32Array;
  i = 0;
  constructor(n: number) {
    this.pos = new Float32Array(n * 3);
    this.col = new Float32Array(n * 3);
    this.size = new Float32Array(n);
    this.seed = new Float32Array(n);
  }
  put(x: number, y: number, z: number, color: THREE.Color, s: number) {
    if (this.i >= this.size.length) return;
    const i = this.i++;
    this.pos[i * 3] = x;
    this.pos[i * 3 + 1] = y;
    this.pos[i * 3 + 2] = z;
    this.col[i * 3] = color.r;
    this.col[i * 3 + 1] = color.g;
    this.col[i * 3 + 2] = color.b;
    this.size[i] = s;
    this.seed[i] = Math.random();
  }
  /** Nube de puntos alrededor de `p` (radio `spread`). */
  puff(p: THREE.Vector3, n: number, spread: number, color: THREE.Color, size: number, sizeJitter = 0.8) {
    for (let k = 0; k < n; k++) {
      this.put(p.x + gauss() * spread, p.y + gauss() * spread, p.z + gauss() * spread, color, size + Math.random() * sizeJitter);
    }
  }
  /** Partículas a lo largo del segmento a→b con dispersión `jit`. */
  segment(a: THREE.Vector3, b: THREE.Vector3, n: number, jit: number, color: THREE.Color, size: number, sizeJitter = 0.6) {
    for (let k = 0; k < n; k++) {
      const u = Math.random();
      this.put(
        a.x + (b.x - a.x) * u + gauss() * jit,
        a.y + (b.y - a.y) * u + gauss() * jit,
        a.z + (b.z - a.z) * u + gauss() * jit,
        color,
        size + Math.random() * sizeJitter,
      );
    }
  }
  geometry(): THREE.BufferGeometry {
    const geo = new THREE.BufferGeometry();
    const n = this.i;
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos.subarray(0, n * 3), 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(this.col.subarray(0, n * 3), 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(this.size.subarray(0, n), 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(this.seed.subarray(0, n), 1));
    return geo;
  }
}

export interface ParticleSceneOptions {
  /** Geometría que gira sobre su eje Y local. */
  spin: THREE.BufferGeometry;
  /** Geometría fija (halo, polvo). */
  still?: THREE.BufferGeometry;
  /** Inclinación fija del conjunto (rad). */
  tiltZ?: number;
  tiltX?: number;
  /** Velocidad de giro (rad/s). */
  speed?: number;
  /** Alto visible del mundo (unidades) que debe caber en el lienzo. */
  visibleHeight: number;
  /** Desplazamiento horizontal del centro de la figura (unidades). */
  offsetX?: number;
  /** Factor de tamaño de partícula. */
  scale?: number;
  fov?: number;
}

/**
 * Monta la escena en `host` y devuelve la función de limpieza. Encapsula
 * renderer, cámara, bucle (pausado fuera de pantalla) y reduced-motion.
 */
export function mountParticleScene(host: HTMLElement, o: ParticleSceneOptions): () => void {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fov = o.fov ?? 34;
  const half = THREE.MathUtils.degToRad(fov / 2);
  const dist = (o.visibleHeight / 2) / Math.tan(half);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
  camera.position.set(o.offsetX ?? 0, 0, dist);
  camera.lookAt(o.offsetX ?? 0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
  const pr = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(pr);
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%' });

  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: pr },
      uFocus: { value: -dist + 0.6 },
      uScale: { value: o.scale ?? 140 },
    },
  });

  const spin = new THREE.Group();
  spin.add(new THREE.Points(o.spin, mat));
  const tilt = new THREE.Group();
  tilt.rotation.z = o.tiltZ ?? 0;
  tilt.rotation.x = o.tiltX ?? 0;
  tilt.add(spin);
  if (o.still) tilt.add(new THREE.Points(o.still, mat));
  scene.add(tilt);

  const resize = () => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  let raf = 0;
  let visible = true;
  let last = performance.now();
  let time = 0;
  const speed = o.speed ?? 0.18;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (!visible) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    time += dt;
    spin.rotation.y += dt * speed;
    mat.uniforms.uTime.value = time;
    renderer.render(scene, camera);
  };
  if (!reduceMotion) raf = requestAnimationFrame(loop);

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) last = performance.now();
  });
  io.observe(host);

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    o.spin.dispose();
    o.still?.dispose();
    mat.dispose();
    renderer.dispose();
    if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
  };
}
