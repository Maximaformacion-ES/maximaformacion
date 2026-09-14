'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BLUE, ORANGE, Cloud, gauss, mountParticleScene } from './particles';

/**
 * Doble hélice de ADN dibujada solo con partículas para el hero de /maxymia.
 * Una hebra azul, otra naranja, peldaños a dos tonos y un halo disperso que no
 * gira. Motor (shader, cámara, bucle) en ./particles.ts, compartido con las
 * figuras de las tarjetas.
 */

const HEIGHT = 18; // alto de la hélice (unidades); se ve solo una parte
const VISIBLE = 0.6; // fracción del alto que cabe en el lienzo → rebosa arriba y abajo
const RADIUS = 1.8;
const TURNS = 3.2;
const STRAND_PTS = 4200;
const RUNGS = 46;
const RUNG_PTS = 70;
const HALO_PTS = 1600;

const strandPoint = (t: number, phase: number) => {
  const ang = t * TURNS * Math.PI * 2 + phase;
  return [Math.cos(ang) * RADIUS, -HEIGHT / 2 + t * HEIGHT, Math.sin(ang) * RADIUS] as const;
};

function buildHelix(): THREE.BufferGeometry {
  const cloud = new Cloud(STRAND_PTS * 2 + RUNGS * RUNG_PTS);
  const c = new THREE.Color();
  for (let s = 0; s < 2; s++) {
    c.copy(s === 0 ? BLUE : ORANGE);
    for (let k = 0; k < STRAND_PTS; k++) {
      const [x, y, z] = strandPoint(Math.random(), s * Math.PI);
      const spread = 0.1 + Math.random() * 0.08;
      cloud.put(x + gauss() * spread, y + gauss() * spread, z + gauss() * spread, c, 0.55 + Math.random() * 1.1);
    }
  }
  for (let r = 0; r < RUNGS; r++) {
    const t = (r + 0.5) / RUNGS;
    const [ax, ay, az] = strandPoint(t, 0);
    const [bx, by, bz] = strandPoint(t, Math.PI);
    for (let k = 0; k < RUNG_PTS; k++) {
      const u = Math.random();
      c.copy(u < 0.5 ? BLUE : ORANGE);
      const jit = 0.06;
      cloud.put(ax + (bx - ax) * u + gauss() * jit, ay + (by - ay) * u + gauss() * jit, az + (bz - az) * u + gauss() * jit, c, 0.5 + Math.random() * 0.9);
    }
  }
  return cloud.geometry();
}

function buildHalo(): THREE.BufferGeometry {
  const cloud = new Cloud(HALO_PTS);
  const c = new THREE.Color();
  for (let k = 0; k < HALO_PTS; k++) {
    const s = Math.random() < 0.5 ? 0 : Math.PI;
    const [x, y, z] = strandPoint(Math.random(), s);
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
    const scene = mountParticleScene(host, {
      spin: buildHelix(),
      still: buildHalo(),
      tiltZ: THREE.MathUtils.degToRad(-20),
      speed: 0.18,
      visibleHeight: HEIGHT * VISIBLE,
    });
    return scene.dispose;
  }, []);
  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
