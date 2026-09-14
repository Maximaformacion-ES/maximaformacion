'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Doble hélice de ADN "digital" para el hero de /maxymia (Three.js).
 *
 * Estética: filas de guiones horizontales redondeados. En cada fila, las dos
 * hebras son bloques grandes que avanzan en diagonal (giran), el peldaño
 * entre ambas es una barra continua y el resto de la fila son guiones de
 * relleno cada vez más tenues según se alejan del eje. Nada de esferas ni
 * geometría 3D: cámara ortográfica y una única InstancedMesh (filas × celdas)
 * cuyas matrices y colores se recalculan por frame con la fase de giro.
 *
 * Colores de marca: hebra A azul (--color-mx-blue), hebra B naranja
 * (--color-mx-orange), peldaños en degradado entre ambas y relleno azul
 * atenuado hacia el fondo (--color-mx-bg). La "opacidad" se simula mezclando
 * el color con el del fondo (sin blending, más barato y sin halos).
 *
 * Solo cliente (next/dynamic ssr:false), se pausa fuera de pantalla y con
 * prefers-reduced-motion pinta un frame fijo.
 */

const BG = new THREE.Color('#FFFEFC');
const BLUE = new THREE.Color('#527BE7');
const ORANGE = new THREE.Color('#F7A000');

// Métrica en píxeles CSS (la cámara ortográfica mapea 1 unidad = 1 px).
const ROW_PITCH = 14; // separación vertical entre filas
const BAR_H = 6; // alto del guion
const CELL_W = 22; // paso horizontal de las celdas
const DASH_W = 11; // ancho del guion de relleno
const TURN_ROWS = 46; // filas por vuelta completa de la hélice
const SPEED = 0.2; // rad/s de giro (~31 s por vuelta)

export type DnaHelixStyle =
  /** Peldaños de guiones con huecos y relleno irregular tipo "flujo de datos" (por defecto). */
  | 'dashed'
  /** Peldaños como barras continuas y relleno regular. */
  | 'solid';

// Ruido determinista por celda (misma semilla en cada frame → la textura
// no parpadea; cambia solo con la fase, muy despacio).
function hash(r: number, c: number): number {
  const n = Math.sin(r * 127.1 + c * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function roundedRect(w: number, h: number, r: number): THREE.ShapeGeometry {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return new THREE.ShapeGeometry(s, 4);
}

export default function DnaHelix({
  className = '',
  style = 'dashed',
}: {
  className?: string;
  style?: DnaHelixStyle;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%' });

    // Geometría unitaria (1 × 1 px con esquinas redondeadas) que escalamos por
    // instancia; la esquina se estira un poco al escalar en X, es aceptable.
    const geo = roundedRect(1, 1, 0.42);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    let mesh: THREE.InstancedMesh | null = null;
    let rows = 0;
    let cols = 0;
    let W = 1;
    let H = 1;

    const dummy = new THREE.Object3D();
    const col = new THREE.Color();

    const build = () => {
      W = host.clientWidth || 1;
      H = host.clientHeight || 1;
      renderer.setSize(W, H, false);
      camera.left = -W / 2;
      camera.right = W / 2;
      camera.top = H / 2;
      camera.bottom = -H / 2;
      camera.updateProjectionMatrix();

      rows = Math.ceil(H / ROW_PITCH) + 1;
      cols = Math.ceil(W / CELL_W) + 1;
      if (mesh) {
        scene.remove(mesh);
        mesh.dispose();
      }
      mesh = new THREE.InstancedMesh(geo, mat, rows * cols);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(mesh);
    };

    const layout = (phase: number) => {
      if (!mesh) return;
      const R = Math.min(W * 0.34, 240); // radio de la hélice (px)
      const cx = 0;
      let i = 0;
      for (let r = 0; r < rows; r++) {
        const y = H / 2 - r * ROW_PITCH;
        // Desvanecido arriba y abajo para que la hélice se funda con el hero.
        const edge = Math.min(1, Math.min(r, rows - 1 - r) / 6);
        const theta = (r / TURN_ROWS) * Math.PI * 2 + phase;
        const xa = cx + Math.cos(theta) * R;
        const xb = cx - Math.cos(theta) * R;
        const za = Math.sin(theta); // >0: hebra A delante
        const lo = Math.min(xa, xb);
        const hi = Math.max(xa, xb);
        const span = hi - lo;

        for (let c = 0; c < cols; c++) {
          const x = -W / 2 + c * CELL_W;
          const dA = Math.abs(x - xa);
          const dB = Math.abs(x - xb);
          let w = DASH_W;
          let h = BAR_H;
          let a: number; // "opacidad" (0..1) → mezcla con el fondo

          if (dA < CELL_W * 0.55 || dB < CELL_W * 0.55) {
            // Nodo de hebra: bloque grande. La hebra delantera más grande y
            // más saturada; la trasera, un poco más pequeña y apagada.
            const isA = dA <= dB;
            const front = isA ? za > 0 : za < 0;
            w = front ? CELL_W * 1.15 : CELL_W * 0.9;
            h = front ? BAR_H * 1.9 : BAR_H * 1.5;
            col.copy(isA ? BLUE : ORANGE);
            a = front ? 1 : 0.55;
          } else if (x > lo && x < hi && span > CELL_W) {
            // Peldaño a dos tonos: la mitad pegada a la hebra A en azul y la
            // pegada a B en naranja (un degradado real pasa por un gris sucio).
            // 'solid': las celdas se tocan → barra continua.
            // 'dashed': guiones con hueco, más largos cerca de las hebras y
            // más cortos hacia el centro del peldaño (como la referencia).
            col.copy(dA <= dB ? BLUE : ORANGE);
            if (style === 'solid') {
              w = CELL_W + 0.5;
              a = 0.85;
            } else {
              const mid = 1 - Math.min(dA, dB) / (span / 2); // 0 en hebra → 1 en centro
              w = CELL_W - 3 - mid * 6;
              a = 0.8 - mid * 0.15;
            }
          } else {
            // Relleno: guiones azules cortos que se atenúan y encogen al
            // alejarse de las hebras, hasta quedar en puntos casi invisibles.
            const d = Math.min(dA, dB);
            const far = THREE.MathUtils.clamp((d - CELL_W) / (W * 0.42), 0, 1);
            col.copy(BLUE);
            a = 0.42 * Math.pow(1 - far, 3);
            w = DASH_W * (1 - far * 0.6);
            if (style === 'dashed') {
              // Textura irregular: cada celda tiene un "peso" fijo; con la fase
              // el umbral se desplaza despacio, así que algunos guiones se
              // apagan, otros se encienden y unos pocos se hacen más largos,
              // como un flujo de datos. Sin parpadeo (ruido determinista).
              const n = hash(r, c);
              const pulse = 0.5 + 0.5 * Math.sin(phase * 1.7 + n * Math.PI * 2);
              if (n < 0.28) a *= 0.15 + 0.85 * pulse; // se apaga y enciende
              else if (n > 0.9) w *= 1.6 + 0.6 * pulse; // guion largo ocasional
              else a *= 0.6 + 0.4 * pulse;
            }
          }

          a *= edge;
          dummy.position.set(x, y, 0);
          dummy.scale.set(w, h, 1);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          // Mezcla con el fondo en lugar de alpha real.
          col.lerp(BG, 1 - a);
          mesh.setColorAt(i, col);
          i++;
        }
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    };

    let phase = 0;
    build();
    layout(phase);
    renderer.render(scene, camera);

    const ro = new ResizeObserver(() => {
      build();
      layout(phase);
      renderer.render(scene, camera);
    });
    ro.observe(host);

    let raf = 0;
    let visible = true;
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      phase += dt * SPEED;
      layout(phase);
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
      mesh?.dispose();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, [style]);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
