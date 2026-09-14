'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BLUE, ORANGE, Cloud, gauss, mountParticleScene, type ParticleSceneHandle } from './particles';

/**
 * Figuras de partículas para las tarjetas "¿Qué es Maxymia?" de la landing.
 * Mismo lenguaje que la hélice del hero (motor en ./particles.ts): puntos
 * suaves azules y naranjas, giro lento, desenfoque de profundidad.
 *
 *  - network:     red de nodos conectados → Mentorías personalizadas.
 *  - seal:        anillos concéntricos con rayos → Certificación profesional.
 *  - atom:        núcleo y tres órbitas → Labs prácticos.
 *  - path:        camino sinuoso con hitos → Rutas de aprendizaje.
 */
export type ParticleShape = 'network' | 'seal' | 'atom' | 'path';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function buildNetwork(): THREE.BufferGeometry {
  const cloud = new Cloud(6000);
  // Nodos sobre una esfera (Fibonacci) + aristas a los vecinos cercanos.
  const N = 26;
  const nodes: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = golden * i;
    nodes.push(V(Math.cos(a) * r, y, Math.sin(a) * r).multiplyScalar(1.15));
  }
  nodes.forEach((p, i) => cloud.puff(p, 110, 0.09, i % 3 === 0 ? ORANGE : BLUE, 0.9, 1.1));
  for (let i = 0; i < N; i++) {
    // conectar con los 3 más cercanos
    const d = nodes.map((q, j) => ({ j, d: q.distanceTo(nodes[i]) })).filter((e) => e.j !== i).sort((a, b) => a.d - b.d).slice(0, 3);
    for (const e of d) if (e.j > i) cloud.segment(nodes[i], nodes[e.j], 70, 0.015, BLUE, 0.4, 0.45);
  }
  return cloud.geometry();
}

function buildSeal(): THREE.BufferGeometry {
  const cloud = new Cloud(7000);
  const c = new THREE.Color();
  const ring = (R: number, n: number, thick: number, color: THREE.Color, size: number) => {
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2;
      cloud.put(Math.cos(a) * R + gauss() * thick, Math.sin(a) * R + gauss() * thick, gauss() * thick, color, size + Math.random() * 0.9);
    }
  };
  ring(1.25, 1500, 0.06, ORANGE, 0.55);
  ring(0.95, 900, 0.045, BLUE, 0.5);
  ring(0.55, 600, 0.04, ORANGE, 0.5);
  // Estrella/insignia central
  for (let k = 0; k < 700; k++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.3;
    cloud.put(Math.cos(a) * r, Math.sin(a) * r, gauss() * 0.05, BLUE, 0.6 + Math.random() * 0.8);
  }
  // Rayos radiales cortos entre anillos
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    c.copy(i % 2 === 0 ? BLUE : ORANGE);
    cloud.segment(V(Math.cos(a) * 1.0, Math.sin(a) * 1.0, 0), V(Math.cos(a) * 1.2, Math.sin(a) * 1.2, 0), 30, 0.012, c, 0.4);
  }
  return cloud.geometry();
}

function buildAtom(): THREE.BufferGeometry {
  const cloud = new Cloud(7000);
  // Núcleo
  for (let k = 0; k < 1500; k++) {
    const p = V(gauss(), gauss(), gauss()).normalize().multiplyScalar(Math.random() * 0.28);
    cloud.put(p.x, p.y, p.z, Math.random() < 0.6 ? ORANGE : BLUE, 0.7 + Math.random() * 0.9);
  }
  // Tres órbitas elípticas inclinadas, con un "electrón" más denso en cada una
  const orbit = (tiltX: number, tiltZ: number, color: THREE.Color, phase: number) => {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(tiltX, 0, tiltZ));
    for (let k = 0; k < 1300; k++) {
      const a = Math.random() * Math.PI * 2;
      const p = V(Math.cos(a) * 1.3, Math.sin(a) * 0.55, 0).applyQuaternion(q);
      cloud.put(p.x + gauss() * 0.025, p.y + gauss() * 0.025, p.z + gauss() * 0.025, color, 0.45 + Math.random() * 0.5);
    }
    const e = V(Math.cos(phase) * 1.3, Math.sin(phase) * 0.55, 0).applyQuaternion(q);
    cloud.puff(e, 160, 0.06, color, 0.9, 1.0);
  };
  orbit(0.5, 0.3, BLUE, 0.4);
  orbit(-0.6, 1.4, ORANGE, 2.2);
  orbit(1.2, -0.9, BLUE, 4.1);
  return cloud.geometry();
}

function buildPath(): THREE.BufferGeometry {
  const cloud = new Cloud(7000);
  // Camino sinuoso ascendente (Catmull-Rom por hitos) con hitos densos.
  const waypoints = [V(-1.3, -1.1, 0.2), V(-0.5, -0.5, -0.4), V(0.4, -0.2, 0.5), V(-0.2, 0.4, -0.3), V(0.9, 0.8, 0.2), V(1.3, 1.2, -0.2)];
  const curve = new THREE.CatmullRomCurve3(waypoints, false, 'catmullrom', 0.5);
  const pts = curve.getPoints(400);
  for (let k = 0; k < 4200; k++) {
    const p = pts[Math.floor(Math.random() * pts.length)];
    cloud.put(p.x + gauss() * 0.04, p.y + gauss() * 0.04, p.z + gauss() * 0.04, BLUE, 0.45 + Math.random() * 0.6);
  }
  waypoints.forEach((w, i) => cloud.puff(w, 220, 0.1, i === waypoints.length - 1 ? ORANGE : (i % 2 ? ORANGE : BLUE), 0.8, 1.0));
  // Ramas cortas alternativas (rutas posibles) muy tenues
  for (let i = 1; i < waypoints.length - 1; i++) {
    const w = waypoints[i];
    const b = V(w.x + (Math.random() - 0.5) * 1.2, w.y + (Math.random() - 0.2) * 0.8, w.z + (Math.random() - 0.5) * 0.8);
    cloud.segment(w, b, 120, 0.03, ORANGE, 0.35, 0.4);
  }
  return cloud.geometry();
}

const BUILDERS: Record<ParticleShape, () => THREE.BufferGeometry> = {
  network: buildNetwork,
  seal: buildSeal,
  atom: buildAtom,
  path: buildPath,
};

/**
 * `active`: la figura está quieta por defecto; con `active` (hover de la
 * tarjeta) las partículas tiemblan suavemente y el conjunto se balancea un
 * poco. No rota nunca.
 */
export default function ParticleFigure({
  shape,
  active = false,
  className = '',
}: {
  shape: ParticleShape;
  active?: boolean;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ParticleSceneHandle | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const scene = mountParticleScene(host, {
      spin: BUILDERS[shape](),
      tiltZ: shape === 'seal' ? 0 : THREE.MathUtils.degToRad(-12),
      tiltX: shape === 'seal' ? THREE.MathUtils.degToRad(35) : THREE.MathUtils.degToRad(10),
      speed: 0,
      idleUntilActive: true,
      wobble: 0.035,
      visibleHeight: 3.2,
      // Figuras ~2.5 unidades de alto (la hélice mide 18): partícula mucho
      // más pequeña para que se vea el grano y no manchas.
      scale: 34,
    });
    sceneRef.current = scene;
    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, [shape]);

  useEffect(() => {
    sceneRef.current?.setActive(active);
  }, [active]);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
