// The WebGL layer — a transparent, full-screen R3F canvas stacked over the
// video layers. This whole module is what gets code-split via React.lazy, so
// none of three.js touches the first paint.
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, AdaptiveDpr } from '@react-three/drei';
import * as THREE from 'three';
import SteamerBasket from './objects/SteamerBasket';
import Steam from './objects/Steam';
import MenuCarousel from './objects/MenuCarousel';
import { STAGES, smoothstep, lerp } from './config';
import { expState } from './store';

// Scales itself in/out as scroll enters/leaves its stage window.
function StageGroup({ range, children, ...props }) {
  const ref = useRef();
  useFrame((_, dt) => {
    const { progress } = expState();
    const [s, e] = range;
    const inRange = progress > s - 0.07 && progress < e + 0.07;
    const k = Math.min(1, dt * 6);
    const ns = lerp(ref.current.scale.x, inRange ? 1 : 0, k);
    ref.current.scale.setScalar(ns);
    ref.current.visible = ns > 0.02;
  });
  return <group ref={ref} {...props}>{children}</group>;
}

// Pans the camera between the centered hero and the left-framed menu carousel,
// then dollies out as the checkout video takes over.
function CameraRig() {
  useFrame(({ camera }, dt) => {
    const { progress } = expState();
    const toMenu = smoothstep(0.24, 0.33, progress);      // hero → menu (tight)
    const toEnd = smoothstep(0.62, 0.70, progress);       // menu → checkout
    const k = Math.min(1, dt * 4);

    const camX = lerp(0, 2.6, toMenu);                    // pan right ⇒ subject sits left
    const camZ = lerp(6.2, 6.0, toMenu) + toEnd * 3.6;    // dolly out at the end
    const camY = lerp(0.35, 0.2, toMenu);

    camera.position.x = lerp(camera.position.x, camX, k);
    camera.position.y = lerp(camera.position.y, camY, k);
    camera.position.z = lerp(camera.position.z, camZ, k);
    // Look slightly up in the hero so the steamer sits low and the headline
    // owns the upper third; level out for the menu carousel.
    camera.lookAt(0, lerp(0.55, 0, toMenu), 0);
  });
  return null;
}

export default function Scene3D({ lod }) {
  return (
    <Canvas
      className="sb-canvas"
      dpr={lod.dpr}
      gl={{ antialias: lod.tier !== 'low', alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0.35, 6.2], fov: 42, near: 0.1, far: 100 }}
    >
      <AdaptiveDpr pixelated />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 4]} intensity={1.2} color="#fff0dd" />
      <directionalLight position={[-5, 2, -3]} intensity={0.5} color="#d9a441" />

      {/* Procedural reflections (no network HDR fetch) for the metallic wok. */}
      <Environment resolution={lod.tier === 'low' ? 64 : 128}>
        <Lightformer intensity={2} position={[0, 4, 4]} scale={[8, 4, 1]} color="#fff4e0" />
        <Lightformer intensity={1.2} position={[-4, 1, 2]} scale={[4, 6, 1]} color="#d9a441" />
        <Lightformer intensity={1} position={[4, -1, -2]} scale={[6, 6, 1]} color="#ff7a18" />
      </Environment>

      <StageGroup range={[STAGES.hero.start, STAGES.hero.end]} position={[0, -0.95, 0]}>
        <SteamerBasket segments={lod.segments} />
        <Steam count={lod.steamCount} />
      </StageGroup>

      <StageGroup range={[STAGES.menu.start, STAGES.menu.end]}>
        <MenuCarousel seg={Math.round(lod.segments / 2)} />
      </StageGroup>

      <CameraRig />
      <fog attach="fog" args={[new THREE.Color('#070809'), 12, 26]} />
    </Canvas>
  );
}
