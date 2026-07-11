// Procedural, stylized food models for the Stage 2 carousel.
// Kept deliberately modular: each is a self-contained <group> so a real .glb
// (useGLTF) can replace any one of them with a one-line swap later.
import * as THREE from 'three';
import { useMemo } from 'react';

function Momo({ seg }) {
  // Pleated steamed dumpling: squashed sphere body + a ring of folds + top knot.
  const folds = useMemo(() => Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2), []);
  return (
    <group>
      <mesh castShadow scale={[1, 0.72, 1]}>
        <sphereGeometry args={[1, seg, seg]} />
        <meshStandardMaterial color="#f3ece0" roughness={0.55} metalness={0.02} />
      </mesh>
      {folds.map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.42, 0.5, Math.sin(a) * 0.42]} rotation={[0, -a, 0.5]} castShadow>
          <coneGeometry args={[0.14, 0.5, 8]} />
          <meshStandardMaterial color="#e7ddcb" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.74, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#d8cab0" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Pizza({ seg }) {
  // Toppings scattered on the top surface within the cheese radius.
  const toppings = useMemo(
    () => Array.from({ length: 11 }, (_, i) => {
      const a = (i / 11) * Math.PI * 2 + i;
      const r = 0.25 + (i % 3) * 0.22;
      return [Math.cos(a) * r, Math.sin(a) * r, i % 2 ? '#8e1f1f' : '#2f7d32'];
    }),
    []
  );
  // Tilted back so the camera looks onto the top of the pizza, not its edge.
  return (
    <group rotation={[-1.0, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[1.15, 1.15, 0.14, seg]} />
        <meshStandardMaterial color="#d8a85e" roughness={0.8} />
      </mesh>
      {/* raised crust ring */}
      <mesh position={[0, 0.06, 0]}>
        <torusGeometry args={[1.08, 0.1, 12, seg]} />
        <meshStandardMaterial color="#c8923f" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[1.02, 1.02, 0.05, seg]} />
        <meshStandardMaterial color="#be3a25" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.98, 0.98, 0.03, seg]} />
        <meshStandardMaterial color="#f4d684" roughness={0.5} />
      </mesh>
      {toppings.map(([x, y], i) => (
        <mesh key={i} position={[x, 0.16, y]}>
          <sphereGeometry args={[0.11, 14, 14]} />
          <meshStandardMaterial color={toppings[i][2]} roughness={0.45} />
        </mesh>
      ))}
    </group>
  );
}

function Wok({ seg }) {
  // Lit steel wok with a tangle of noodles (thin torus knots) — Chowmein.
  return (
    <group>
      <mesh castShadow rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[1.2, seg, seg, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#3c4049" roughness={0.35} metalness={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* bright rim so the bowl reads as a vessel, not a black hole */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.18, 0.05, 12, seg]} />
        <meshStandardMaterial color="#9aa0a8" roughness={0.25} metalness={0.85} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[(i - 1) * 0.26, -0.22 + i * 0.05, (i - 1) * 0.18]} rotation={[i, i * 1.4, 0]}>
          <torusKnotGeometry args={[0.4, 0.07, 90, 8, 2, 3]} />
          <meshStandardMaterial color="#ecc97d" roughness={0.55} />
        </mesh>
      ))}
      {[[0.45, 0.25], [-0.38, -0.18], [0.08, 0.42]].map(([x, z], i) => (
        <mesh key={`v${i}`} position={[x, -0.16, z]}>
          <boxGeometry args={[0.15, 0.1, 0.15]} />
          <meshStandardMaterial color={i % 2 ? '#2e8b35' : '#df5326'} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Burger({ seg }) {
  // Tight, contacting stack so it reads as one burger (no floating gaps).
  const layer = (y, rt, rb, h, color, rough = 0.6) => (
    <mesh position={[0, y, 0]} castShadow>
      <cylinderGeometry args={[rt, rb, h, seg]} />
      <meshStandardMaterial color={color} roughness={rough} />
    </mesh>
  );
  return (
    <group>
      {layer(-0.45, 0.9, 0.78, 0.3, '#d99a4f')}        {/* bottom bun */}
      {layer(-0.2, 0.98, 0.98, 0.22, '#5a3a22')}       {/* patty */}
      {layer(-0.05, 1.04, 1.04, 0.05, '#f4b733', 0.4)} {/* cheese */}
      {/* lettuce ruffle — laid flat around the stack */}
      <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.9, 0.11, 10, 44]} />
        <meshStandardMaterial color="#62ad3f" roughness={0.7} />
      </mesh>
      {/* top bun dome sitting on the lettuce */}
      <mesh position={[0, 0.07, 0]} castShadow scale={[1, 0.78, 1]}>
        <sphereGeometry args={[0.92, seg, seg, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#e3aa5b" roughness={0.6} />
      </mesh>
      {/* sesame on the dome */}
      {Array.from({ length: 9 }).map((_, i) => {
        const a = (i / 9) * Math.PI * 2 + i;
        const r = 0.18 + (i % 3) * 0.12;
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.5 - r * 0.35, Math.sin(a) * r]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#f7e9c8" roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

const MAP = { momo: Momo, pizza: Pizza, wok: Wok, burger: Burger };

export default function FoodModel({ model, seg = 48 }) {
  const Comp = MAP[model] || Momo;
  return <Comp seg={Math.max(16, seg)} />;
}
