// Stage 2: the four categories ride a circular carousel. Scroll progress within
// the menu stage rotates the rig so each model glides into the front spotlight,
// scaling up while the others recede — no grid, all 3D.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import FoodModel from './FoodModels';
import { CATEGORIES, STAGES, stageProgress, lerp } from '../config';
import { expState } from '../store';

const N = CATEGORIES.length;
const RADIUS = 2.7;
const STEP = (Math.PI * 2) / N;

export default function MenuCarousel({ seg = 48 }) {
  const rig = useRef();
  const items = useRef([]);
  const spot = useRef();

  useFrame((state, dt) => {
    const { progress } = expState();
    const menu = stageProgress(progress, STAGES.menu.start, STAGES.menu.end);
    const k = Math.min(1, dt * 5);
    const targetRot = -menu * STEP * (N - 1);

    if (rig.current) {
      rig.current.rotation.y = lerp(rig.current.rotation.y, targetRot, k);
      const rot = rig.current.rotation.y;
      items.current.forEach((node, i) => {
        if (!node) return;
        const front = Math.cos(STEP * i + rot);          // 1 = dead-center front
        const f = Math.max(0, front);
        // Hard falloff: only the spotlighted item is sizeable; the rest
        // collapse to ~0 so they never clutter or overlap the product lane.
        const s = Math.pow(f, 3) * 1.05;
        node.scale.setScalar(lerp(node.scale.x, s, k));
        node.position.y = lerp(node.position.y, f * 0.25, k);
        node.visible = node.scale.x > 0.04;
        node.rotation.y += dt * 0.35;                    // gentle self-spin
      });
    }
    if (spot.current) spot.current.intensity = 22;
  });

  return (
    <group position={[0, -0.2, 0]}>
      <spotLight
        ref={spot}
        position={[0, 4.5, 5.5]}
        angle={0.5}
        penumbra={0.8}
        intensity={18}
        distance={20}
        color="#ffffff"
      />
      <group ref={rig}>
        {CATEGORIES.map((c, i) => (
          <group
            key={c.key}
            ref={(el) => (items.current[i] = el)}
            position={[Math.sin(STEP * i) * RADIUS, 0, Math.cos(STEP * i) * RADIUS]}
          >
            <FoodModel model={c.model} seg={seg} />
          </group>
        ))}
      </group>
    </group>
  );
}
