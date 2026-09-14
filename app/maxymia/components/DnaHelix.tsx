'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Doble hélice de ADN dibujada SOLO con partículas (Three.js, Points +
 * shader propio) para el hero de /maxymia. Inspirada en el sketch "dna" de
 * Yoichi Kobayashi, adaptada al fondo claro y a los colores de Máxima:
 * una hebra azul, otra naranja, peldaños a dos tonos y un halo disperso.
 *
 * - Cada partícula es un disco suave; su tamaño crece y su opacidad baja
 *   según se aleja del plano de enfoque de la cámara (profundidad de campo
 *   falsa, barata), y parpadea muy sutilmente.
 * - La hélice va inclinada en diagonal y gira despacio sobre su propio eje.
 * - Solo cliente (next/dynamic ssr:false), se pausa fuera de pantalla y con
 *   prefers-reduced-motion pinta un único fotograma.
 */

// Colores EXACTOS de marca (--color-mx-blue / --color-mx-orange). El shader
// termina con `colorspace_fragment` para que salgan tal cual en pantalla.
const BLUE = new THREE.Color('#527BE7');
const ORANGE = new THREE.Color('#F7A000');

const HEIGHT = 18; // alto de la hélice (unidades); se ve solo una parte
const VISIBLE = 0.6; // fracción del alto que cabe en el lienzo → rebosa arriba y abajo
const RADIUS = 1.8;
const TURNS = 3.2;
const STRAND_PTS = 4200; // partículas por hebra
const RUNGS = 46; // peldaños
const RUNG_PTS = 70; // partículas por peldaño
const HALO_PTS = 1600; // partículas sueltas alrededor
const TILT_Z = THREE.MathUtils.degToRad(-20); // diagonal, como la referencia
const SPEED = 0.18; // rad/s (~35 s por vuelta)
const FOV = 34;

// Gaussiana aproximada (suma de uniformes) para dispersar partículas.
function gauss(): number {
  return (Math.random() + Math.random() + Math.random() - 1.5) * 0.8;
}

const VERT = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uFocus;   // z (en espacio de cámara) del plano enfocado
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float dz = abs(mv.z - uFocus);          // distancia al plano de enfoque
    float blur = 1.0 + dz * 0.35;           // desenfocado → más grande...
    float twinkle = 0.85 + 0.15 * sin(uTime * 1.6 + aSeed * 6.2831);
    vAlpha = 0.9 * twinkle / (1.0 + dz * dz * 0.4); // ...y más tenue
    vColor = aColor;
    gl_PointSize = aSize * blur * uPixelRatio * (140.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
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

class Cloud {
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
  geometry(): THREE.BufferGeometry {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(this.col, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(this.seed, 1));
    return geo;
  }
}

const strandPoint = (t: number, phase: number) => {
  const ang = t * TURNS * Math.PI * 2 + phase;
  return [Math.cos(ang) * RADIUS, -HEIGHT / 2 + t * HEIGHT, Math.sin(ang) * RADIUS] as const;
};

/** Hebras + peldaños: es lo que gira sobre el eje de la hélice. */
function buildHelix(): THREE.BufferGeometry {
  const cloud = new Cloud(STRAND_PTS * 2 + RUNGS * RUNG_PTS);
  const put = cloud.put.bind(cloud);
  const c = new THREE.Color();

  // Hebras: tubo denso de partículas alrededor de la curva.
  for (let s = 0; s < 2; s++) {
    const base = s === 0 ? BLUE : ORANGE;
    for (let k = 0; k < STRAND_PTS; k++) {
      const t = Math.random();
      const [x, y, z] = strandPoint(t, s * Math.PI);
      const spread = 0.1 + Math.random() * 0.08;
      c.copy(base);
      put(x + gauss() * spread, y + gauss() * spread, z + gauss() * spread, c, 0.55 + Math.random() * 1.1);
    }
  }

  // Peldaños: partículas a lo largo del segmento entre hebras, más ralas,
  // azules en la mitad de la hebra azul y naranjas en la otra.
  for (let r = 0; r < RUNGS; r++) {
    const t = (r + 0.5) / RUNGS;
    const [ax, ay, az] = strandPoint(t, 0);
    const [bx, by, bz] = strandPoint(t, Math.PI);
    for (let k = 0; k < RUNG_PTS; k++) {
      const u = Math.random();
      c.copy(u < 0.5 ? BLUE : ORANGE);
      const jit = 0.06;
      put(
        ax + (bx - ax) * u + gauss() * jit,
        ay + (by - ay) * u + gauss() * jit,
        az + (bz - az) * u + gauss() * jit,
        c,
        0.5 + Math.random() * 0.9,
      );
    }
  }

  return cloud.geometry();
}

/** Halo: polvo disperso alrededor de la hélice. NO gira, solo parpadea. */
function buildHalo(): THREE.BufferGeometry {
  const cloud = new Cloud(HALO_PTS);
  const c = new THREE.Color();
  for (let k = 0; k < HALO_PTS; k++) {
    const t = Math.random();
    const s = Math.random() < 0.5 ? 0 : Math.PI;
    const [x, y, z] = strandPoint(t, s);
    c.copy(s === 0 ? BLUE : ORANGE);
    cloud.put(x + gauss() * 1.4, y + gauss() * 1.0, z + gauss() * 1.4, c, 0.4 + Math.random() * 0.8);
  }
  return cloud.geometry();
}

export default function DnaHelix({ className = '' }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    const half = THREE.MathUtils.degToRad(FOV / 2);
    // Distancia para que solo se vea la fracción VISIBLE del alto: la hélice
    // rebosa por arriba y por abajo (el fundido lo pone el contenedor con
    // mask-image en MaxymiaClient).
    const dist = ((HEIGHT * VISIBLE) / 2) / Math.tan(half);
    camera.position.set(0, 0, dist);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
    const pr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pr);
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%' });

    const helixGeo = buildHelix();
    const haloGeo = buildHalo();
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
        // Plano de enfoque: un poco por delante del eje, así la hebra
        // delantera sale nítida y la trasera ligeramente desenfocada.
        uFocus: { value: -dist + RADIUS * 0.6 },
      },
    });
    const helixPts = new THREE.Points(helixGeo, mat);
    const haloPts = new THREE.Points(haloGeo, mat);

    // `tilt`: inclinación fija en diagonal (no se anima). `spin`: SOLO las
    // hebras y los peldaños, girando sobre el eje de la propia hélice (su Y
    // local). El halo cuelga de `tilt`, así que se queda quieto.
    const spin = new THREE.Group();
    spin.add(helixPts);
    const tilt = new THREE.Group();
    tilt.rotation.z = TILT_Z;
    tilt.add(spin, haloPts);
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
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;
      spin.rotation.y += dt * SPEED;
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
      helixGeo.dispose();
      haloGeo.dispose();
      mat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
