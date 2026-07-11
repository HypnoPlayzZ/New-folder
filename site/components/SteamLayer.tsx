"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 240;

/** Soft radial sprite drawn once on a canvas — no texture asset needed. */
function makeSprite(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(239,230,216,0.55)");
  g.addColorStop(0.4, "rgba(239,230,216,0.18)");
  g.addColorStop(1, "rgba(239,230,216,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function Steam() {
  const points = useRef<THREE.Points>(null);
  const sprite = useMemo(makeSprite, []);

  // x, y, z plus per-particle speed and sway phase
  const { positions, meta } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const meta = new Float32Array(COUNT * 2);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 1] = Math.random() * 10 - 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
      meta[i * 2] = 0.15 + Math.random() * 0.45; // rise speed
      meta[i * 2 + 1] = Math.random() * Math.PI * 2; // sway phase
    }
    return { positions, meta };
  }, []);

  useFrame((state, delta) => {
    const geo = points.current?.geometry;
    if (!geo) return;
    const pos = geo.attributes.position.array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 1] += meta[i * 2] * delta;
      pos[i * 3] += Math.sin(t * 0.4 + meta[i * 2 + 1]) * delta * 0.12;
      if (pos[i * 3 + 1] > 5.4) {
        pos[i * 3 + 1] = -5.4;
        pos[i * 3] = (Math.random() - 0.5) * 7;
      }
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        size={1.35}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.32}
      />
    </points>
  );
}

/**
 * WebGL steam drifting up through the hero, extending the footage's steam
 * into the page. Mounted only while the hero is on screen (see Hero.tsx).
 */
export default function SteamLayer() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <Steam />
    </Canvas>
  );
}
