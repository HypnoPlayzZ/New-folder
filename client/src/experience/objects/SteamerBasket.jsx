// Stage 1 hero prop: a stylized bamboo steamer basket on a metallic wok.
// - mouse hover tilts the whole rig toward the cursor (lerp-damped)
// - hero-stage scroll lifts the lid on +Y, spins it 45°, and ramps an inner glow
// All animation reads the imperative experience store inside useFrame.
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { expState } from '../store';
import { STAGES, stageProgress, lerp } from '../config';

const BAMBOO = '#caa463';
const BAMBOO_DARK = '#9c7a3e';

// Profile for the domed lid, revolved into a LatheGeometry.
function lidProfile() {
  const pts = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const r = Math.cos(t * Math.PI * 0.5);          // 1 → 0
    const y = 0.42 * Math.sin(t * Math.PI * 0.5);   // dome rise
    pts.push(new THREE.Vector2(r * 1.05, y));
  }
  return pts;
}

function BasketRing({ y, radius, height, segments, color }) {
  return (
    <mesh position={[0, y, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, height, segments, 1, true]} />
      <meshStandardMaterial color={color} roughness={0.78} metalness={0.04} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function SteamerBasket({ segments = 96 }) {
  const rig = useRef();      // whole assembly (mouse tilt)
  const lid = useRef();      // lifts + spins on scroll
  const glow = useRef();     // emissive disc inside
  const glowLight = useRef();
  const lidPts = useMemo(lidProfile, []);
  const seg = Math.max(24, segments);

  useFrame((_, dt) => {
    const { pointer, progress } = expState();
    const hero = stageProgress(progress, STAGES.hero.start, STAGES.hero.end);
    const k = Math.min(1, dt * 6); // frame-rate independent damping

    if (rig.current) {
      // Organic tilt toward cursor.
      rig.current.rotation.x = lerp(rig.current.rotation.x, -pointer.y * 0.22, k);
      rig.current.rotation.y = lerp(rig.current.rotation.y, pointer.x * 0.32 + hero * 0.5, k);
      const breathe = Math.sin(progress * 60) * 0.012;
      rig.current.position.y = lerp(rig.current.position.y, breathe, k);
    }

    if (lid.current) {
      // Lid lifts after ~35% into the hero stage and keeps rising (kept in-frame).
      const lift = Math.max(0, (hero - 0.35) / 0.65);
      lid.current.position.y = lerp(lid.current.position.y, 0.95 + lift * 1.7, k);
      lid.current.rotation.y = lerp(lid.current.rotation.y, lift * (Math.PI / 4), k);
      lid.current.rotation.x = lerp(lid.current.rotation.x, lift * 0.12, k);
      const op = 1 - Math.min(1, lift * 0.15);
      lid.current.children.forEach((c) => { if (c.material) c.material.opacity = op; });

      // Inner radiance revealed as the lid clears the rim.
      const reveal = Math.min(1, lift * 1.6);
      if (glow.current) {
        glow.current.material.emissiveIntensity = 0.4 + reveal * 3.2;
        glow.current.scale.setScalar(0.6 + reveal * 0.5);
      }
      if (glowLight.current) glowLight.current.intensity = reveal * 6;
    }
  });

  return (
    <group ref={rig} position={[0, -0.3, 0]}>
      {/* Metallic wok plate */}
      <mesh position={[0, -0.62, 0]} receiveShadow>
        <cylinderGeometry args={[1.9, 2.15, 0.22, seg]} />
        <meshStandardMaterial color="#23262c" roughness={0.22} metalness={0.95} />
      </mesh>
      <mesh position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <torusGeometry args={[1.7, 0.12, 16, seg]} />
        <meshStandardMaterial color="#34383f" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Inner glow disc + light (revealed under the lid) */}
      <mesh ref={glow} position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.95, 48]} />
        <meshStandardMaterial color="#fff2cf" emissive="#ffb347" emissiveIntensity={0.4} toneMapped={false} />
      </mesh>
      <pointLight ref={glowLight} position={[0, 0.5, 0]} color="#ffcf8a" intensity={0} distance={6} />

      {/* Bamboo basket body — stacked ridged rings */}
      <group>
        <BasketRing y={-0.28} radius={1.16} height={0.34} segments={seg} color={BAMBOO_DARK} />
        <BasketRing y={0.06}  radius={1.12} height={0.34} segments={seg} color={BAMBOO} />
        <BasketRing y={0.40}  radius={1.10} height={0.34} segments={seg} color={BAMBOO_DARK} />
        {/* woven base */}
        <mesh position={[0, -0.42, 0]}>
          <cylinderGeometry args={[1.14, 1.14, 0.06, seg]} />
          <meshStandardMaterial color="#7c5f2e" roughness={0.9} />
        </mesh>
      </group>

      {/* Domed bamboo lid (revolved profile) */}
      <group ref={lid} position={[0, 0.95, 0]}>
        <mesh castShadow>
          <latheGeometry args={[lidPts, seg]} />
          <meshStandardMaterial color={BAMBOO} roughness={0.72} metalness={0.05} transparent side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.44, 0]}>
          <sphereGeometry args={[0.12, 20, 20]} />
          <meshStandardMaterial color={BAMBOO_DARK} roughness={0.6} transparent />
        </mesh>
      </group>
    </group>
  );
}
